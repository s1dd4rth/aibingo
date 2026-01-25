'use server';

import { prisma } from '@/lib/prisma';
import { generateSessionCode, generateRandomCardLayout } from '@/lib/bingo';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Create a new session (facilitator only)
 */
export async function createSession(facilitatorEmail: string) {
    try {
        const code = generateSessionCode();

        const session = await prisma.session.create({
            data: {
                code,
                facilitatorEmail,
                unlockedComponents: '', // Start with nothing unlocked
            },
        });

        return { success: true, session };
    } catch (error) {
        console.error('Failed to create session:', error);
        return { success: false, error: 'Failed to create session' };
    }
}

/**
 * Join a session with a code
 */
export async function joinSession(sessionCode: string, participantId: string) {
    try {
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
 * Get session state for facilitator dashboard
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
