'use server';

import { prisma } from '@/lib/prisma';
import { generateSessionCode, generateRandomCardLayout } from '@/lib/bingo';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/rate-limiter';

/**
 * Create a new session (facilitator only)
 */
export async function createSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');

        if (!sessionCookie) {
            return { success: false, error: 'Not authenticated' };
        }

        const participant = await prisma.participant.findUnique({
            where: { id: sessionCookie.value },
        });

        if (!participant) {
            return { success: false, error: 'User not found' };
        }

        // Rate limit check: 5 sessions per hour
        const rateLimit = await checkRateLimit(participant.id, 'createSession');
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: `Rate limit exceeded. You can create a new session in ${rateLimit.retryAfter} seconds.`,
            };
        }

        const facilitatorEmail = participant.email;

        // Check for existing active session
        const existingSession = await prisma.session.findFirst({
            where: { facilitatorEmail },
        });

        if (existingSession) {
            return { success: true, session: existingSession, message: 'Existing session resumed' };
        }

        const code = generateSessionCode();

        const session = await prisma.session.create({
            data: {
                code,
                facilitatorEmail,
                unlockedComponents: '', // Start with nothing unlocked
            },
        });

        revalidatePath('/facilitator');

        return { success: true, session };
    } catch (error) {
        console.error('Failed to create session:', error);
        return { success: false, error: 'Failed to create session' };
    }
}

/**
 * Leave the current session (participant)
 */
export async function leaveSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');

        if (!sessionCookie) {
            return { success: false, error: 'Not authenticated' };
        }

        await prisma.participant.update({
            where: { id: sessionCookie.value },
            data: {
                sessionId: null,
                passcode: '',
                cardLayout: '',
                completedComponents: '',
                bingoLines: 0,
            },
        });

        revalidatePath('/game');
        revalidatePath('/leaderboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to leave session:', error);
        return { success: false, error: 'Failed to leave session' };
    }
}

/**
 * Get the current active session for a facilitator
 */
export async function getFacilitatorSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');

        if (!sessionCookie) {
            return { error: 'Not authenticated' };
        }

        const participant = await prisma.participant.findUnique({
            where: { id: sessionCookie.value },
        });

        if (!participant) {
            return { error: 'User not found' };
        }

        // Find the most recent session created by this facilitator
        const session = await prisma.session.findFirst({
            where: { facilitatorEmail: participant.email },
            orderBy: { createdAt: 'desc' }, // Get the latest one if multiple (though UI should mostly handle one)
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        bingoLines: true,
                        completedComponents: true,
                    },
                    orderBy: {
                        bingoLines: 'desc',
                    }
                },
            },
        });

        if (!session) {
            return { error: 'No active session found' };
        }

        // Parse unlocked components
        const unlockedComponents = session.unlockedComponents
            ? session.unlockedComponents.split(',')
            : [];

        return {
            session: {
                id: session.id,
                code: session.code,
                facilitatorEmail: session.facilitatorEmail,
                unlockedComponents,
                participantCount: session.participants.length,
            },
            participants: session.participants,
        };

    } catch (error) {
        console.error('Failed to get facilitator session:', error);
        return { error: 'Failed to load session' };
    }
}

/**
 * Delete/Terminate a session
 */
export async function deleteSession(sessionId: string) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');
        if (!sessionCookie) return { success: false, error: 'Not authenticated' };

        const participant = await prisma.participant.findUnique({
            where: { id: sessionCookie.value }
        });
        if (!participant) return { success: false, error: 'User not found' };

        // Verify ownership
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session || session.facilitatorEmail !== participant.email) {
            return { success: false, error: 'Unauthorized to delete this session' };
        }

        await prisma.session.delete({
            where: { id: sessionId },
        });

        revalidatePath('/facilitator');
        return { success: true };

    } catch (error) {
        console.error('Failed to delete session:', error);
        return { success: false, error: 'Failed to delete session' };
    }
}

/**
 * Join a session with a code
 */
export async function joinSession(sessionCode: string, participantId: string) {
    try {
        // Rate limit check: 10 joins per minute
        const rateLimit = await checkRateLimit(participantId, 'joinSession');
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: `Too many join attempts. Please wait ${rateLimit.retryAfter} seconds.`,
            };
        }

        // Find the session
        const session = await prisma.session.findUnique({
            where: { code: sessionCode.toUpperCase() },
        });

        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        // Generate random card layout for this participant
        const cardLayout = generateRandomCardLayout();

        // Update participant with session and card layout
        await prisma.participant.update({
            where: { id: participantId },
            data: {
                sessionId: session.id,
                passcode: sessionCode.toUpperCase(),
                cardLayout: cardLayout.join(','),
                completedComponents: '',
                bingoLines: 0,
            },
        });

        revalidatePath('/game');
        return { success: true, session };
    } catch (error) {
        console.error('Failed to join session:', error);
        return { success: false, error: 'Failed to join session' };
    }
}

/**
 * Unlock the next component for all participants in a session
 */
export async function unlockNextComponent(sessionId: string, componentId: string) {
    try {
        // Get facilitator ID for rate limiting
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');
        if (!sessionCookie) {
            return { success: false, error: 'Not authenticated' };
        }

        // Rate limit check: 10 unlocks per minute
        const rateLimit = await checkRateLimit(sessionCookie.value, 'unlockComponent');
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: `Slow down! You can unlock more components in ${rateLimit.retryAfter} seconds.`,
            };
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return { success: false, error: 'Session not found' };
        }

        // Add component to unlocked list
        const unlocked = session.unlockedComponents
            ? session.unlockedComponents.split(',')
            : [];

        if (!unlocked.includes(componentId)) {
            unlocked.push(componentId);
        }

        await prisma.session.update({
            where: { id: sessionId },
            data: {
                unlockedComponents: unlocked.join(','),
            },
        });

        revalidatePath('/facilitator');
        revalidatePath('/game');

        return { success: true };
    } catch (error) {
        console.error('Failed to unlock component:', error);
        return { success: false, error: 'Failed to unlock component' };
    }
}

/**
 * Get session state for facilitator dashboard (Legacy - kept for compatibility if needed, but getFacilitatorSession is preferred)
 */
export async function getSessionState(sessionId: string) {
    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        bingoLines: true,
                        completedComponents: true,
                    },
                },
            },
        });

        if (!session) {
            return { error: 'Session not found' };
        }

        const unlockedComponents = session.unlockedComponents
            ? session.unlockedComponents.split(',')
            : [];

        return {
            session: {
                id: session.id,
                code: session.code,
                facilitatorEmail: session.facilitatorEmail,
                unlockedComponents,
                participantCount: session.participants.length,
            },
            participants: session.participants,
        };
    } catch (error) {
        console.error('Failed to get session state:', error);
        return { error: 'Failed to load session' };
    }
}

/**
 * Get current user's session
 */
export async function getCurrentSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');

        if (!sessionCookie) {
            return { error: 'Not logged in' };
        }

        const participant = await prisma.participant.findUnique({
            where: { id: sessionCookie.value },
            include: {
                session: true,
            },
        });

        if (!participant) {
            return { error: 'Participant not found' };
        }

        if (!participant.session) {
            return { error: 'Not in a session' };
        }

        const unlockedComponents = participant.session.unlockedComponents
            ? participant.session.unlockedComponents.split(',')
            : [];

        return {
            session: {
                id: participant.session.id,
                code: participant.session.code,
                unlockedComponents,
            },
            participant: {
                id: participant.id,
                name: participant.name,
                cardLayout: participant.cardLayout ? participant.cardLayout.split(',') : [],
                completedComponents: participant.completedComponents
                    ? participant.completedComponents.split(',')
                    : [],
                bingoLines: participant.bingoLines,
            },
        };
    } catch (error) {
        console.error('Failed to get current session:', error);
        return { error: 'Failed to load session' };
    }
}
