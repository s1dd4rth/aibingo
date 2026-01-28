'use server';

import { prisma } from '@/lib/prisma';
import { checkBingoLines } from '@/lib/bingo';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limiter';

/**
 * Mark a component as complete for the current participant
 * Calculates bingo lines and updates score
 */
export async function markComponentComplete(componentId: string) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');

        if (!sessionCookie) {
            return { success: false, error: 'Not logged in' };
        }

        // Rate limit check: 30 completions per minute
        const rateLimit = await checkRateLimit(sessionCookie.value, 'markComplete');
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: `Slow down! You can mark more components complete in ${rateLimit.retryAfter} seconds.`,
            };
        }

        const participant = await prisma.participant.findUnique({
            where: { id: sessionCookie.value },
            include: { session: true },
        });

        if (!participant) {
            return { success: false, error: 'Participant not found' };
        }

        // Get current completed components
        const completed = participant.completedComponents
            ? participant.completedComponents.split(',')
            : [];

        // Add new component if not already completed
        if (!completed.includes(componentId)) {
            completed.push(componentId);
        }

        // Get card layout
        const cardLayout = participant.cardLayout
            ? participant.cardLayout.split(',')
            : [];

        // Calculate bingo lines
        const bingoLines = checkBingoLines(cardLayout, completed);

        // Update participant
        await prisma.participant.update({
            where: { id: participant.id },
            data: {
                completedComponents: completed.join(','),
                bingoLines,
                isCompleted: completed.length === 20, // Full card complete
            },
        });

        revalidatePath('/game');
        revalidatePath('/leaderboard');

        return {
            success: true,
            bingoLines,
            completedCount: completed.length,
            isFullCard: completed.length === 20,
        };
    } catch (error) {
        console.error('Failed to mark component complete:', error);
        return { success: false, error: 'Failed to update progress' };
    }
}

/**
 * Get game state for the current participant
 */
export async function getGameState() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('ai_bingo_session');

        if (!sessionCookie) {
            return { error: 'Not logged in' };
        }

        const participant = await prisma.participant.findUnique({
            where: { id: sessionCookie.value },
            include: { session: true },
        });

        if (!participant) {
            return { error: 'Participant not found' };
        }

        // Get unlocked components from session
        const unlockedComponents = participant.session?.unlockedComponents
            ? participant.session.unlockedComponents.split(',')
            : [];

        // Get card layout
        const cardLayout = participant.cardLayout
            ? participant.cardLayout.split(',')
            : [];

        // Get completed components
        const completedComponents = participant.completedComponents
            ? participant.completedComponents.split(',')
            : [];

        return {
            participant: {
                id: participant.id,
                name: participant.name || participant.email.split('@')[0],
                email: participant.email,
                passcode: participant.passcode,
                cardLayout,
                completedComponents,
                bingoLines: participant.bingoLines,
                isCompleted: participant.isCompleted,
            },
            session: participant.session ? {
                id: participant.session.id,
                code: participant.session.code,
                unlockedComponents,
            } : null,
            config: {
                // This will be used by BingoGrid to render the components
                totalComponents: 20,
            },
        };
    } catch (error) {
        console.error('Failed to get game state:', error);
        return { error: 'Failed to load game state' };
    }
}
