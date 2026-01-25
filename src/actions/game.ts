'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { GAME_COMPONENTS } from '@/lib/game-config';
import { revalidatePath } from 'next/cache';

export async function getGameState() {
    const userId = await getSession();

    if (!userId) {
        return { error: 'Unauthorized' };
    }

    const participant = await prisma.participant.findUnique({
        where: { id: userId },
    });

    if (!participant) {
        return { error: 'User not found' };
    }

    return {
        participant,
        config: GAME_COMPONENTS,
    };
}

export async function completeComponent(componentId: string) {
    const userId = await getSession();
    if (!userId) return { error: 'Unauthorized' };

    try {
        const participant = await prisma.participant.findUnique({
            where: { id: userId },
        });

        if (!participant) return { error: 'User not found' };

        // Check if component exists
        const component = GAME_COMPONENTS.find(c => c.id === componentId);
        if (!component) return { error: 'Invalid component' };

        // Check if already unlocked
        const currentIds = participant.unlockedComponentIds ? participant.unlockedComponentIds.split(',').filter(Boolean) : [];

        if (currentIds.includes(componentId)) {
            return { success: true, alreadyUnlocked: true };
        }

        const newUnlocked = [...currentIds, componentId];

        // Check for Bingo / Completion
        // Requirements say "complete stack" for the game end?
        // "This is will continue till they learn the complete stack."
        // So isCompleted = all 20 components?
        const isCompleted = newUnlocked.length === GAME_COMPONENTS.length;

        await prisma.participant.update({
            where: { id: userId },
            data: {
                unlockedComponentIds: newUnlocked.join(','),
                isCompleted,
            }
        });

        // Revalidate the game path so the UI updates
        revalidatePath('/game');

        return { success: true, isCompleted };

    } catch (error) {
        console.error('Completion error:', error);
        return { error: 'Failed to update progress' };
    }

}

export async function joinSession(sessionCode: string) {
    const userId = await getSession();
    if (!userId) return { error: 'Unauthorized' };

    if (!sessionCode || sessionCode.trim().length === 0) {
        return { error: 'Invalid Code' };
    }

    try {
        await prisma.participant.update({
            where: { id: userId },
            data: {
                // We repurpose 'passcode' as 'sessionCode' to avoid schema migration
                passcode: sessionCode.trim().toUpperCase(),
            }
        });

        revalidatePath('/game');
        revalidatePath('/leaderboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to join session' };
    }
}
