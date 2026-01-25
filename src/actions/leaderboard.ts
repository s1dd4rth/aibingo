'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    isCompleted: boolean;
}

export interface LeaderboardData {
    entries: LeaderboardEntry[];
    sessionCode: string | null;
}

export async function getLeaderboard(): Promise<LeaderboardData> {
    const currentUserId = await getSession();
    let sessionFilter = {};
    let currentSessionCode: string | null = null;

    // 1. Determine Session Context
    if (currentUserId) {
        const user = await prisma.participant.findUnique({
            where: { id: currentUserId },
            select: { passcode: true }
        });

        // Treat 'magic-link-user' as no session
        if (user?.passcode && user.passcode !== 'magic-link-user') {
            sessionFilter = { passcode: user.passcode };
            currentSessionCode = user.passcode;
        }
    }

    // 2. Fetch Users
    const users = await prisma.participant.findMany({
        where: sessionFilter,
        select: {
            email: true,
            name: true,
            unlockedComponentIds: true,
            isCompleted: true
        },
        orderBy: { isCompleted: 'desc' },
        take: 100
    });

    // 3. Compute scores
    const leaderboard = users.map(user => {
        const ids = user.unlockedComponentIds ? user.unlockedComponentIds.split(',').filter(Boolean) : [];
        return {
            rawName: user.name || user.email,
            score: ids.length,
            isCompleted: user.isCompleted
        };
    });

    // 4. Sort
    leaderboard.sort((a, b) => b.score - a.score);

    // 5. Mask
    const entries = leaderboard.map((entry, index) => {
        let displayName = entry.rawName;
        if (displayName.includes('@')) {
            const [local, domain] = displayName.split('@');
            if (local.length > 2) {
                displayName = `${local.substring(0, 2)}***@${domain}`;
            } else {
                displayName = `***@${domain}`;
            }
        }

        return {
            rank: index + 1,
            name: displayName,
            score: entry.score,
            isCompleted: entry.isCompleted
        };
    });

    return { entries, sessionCode: currentSessionCode };
}
