'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    bingoLines: number;
    isCompleted: boolean;
}

export interface LeaderboardData {
    entries: LeaderboardEntry[];
    sessionCode: string | null;
}

export async function getLeaderboard(): Promise<LeaderboardData> {
    const currentUserId = await getSession();
    // Default to empty filter that matches nothing if no session found
    let sessionFilter: any = { id: 'no-match' };
    let currentSessionCode: string | null = null;
    let hasAccess = false;

    if (currentUserId) {
        const user = await prisma.participant.findUnique({
            where: { id: currentUserId },
            select: { email: true, passcode: true, sessionId: true }
        });

        if (user) {
            // 1. Check if user is a participant in a session
            if (user.sessionId) {
                sessionFilter = { sessionId: user.sessionId };
                const session = await prisma.session.findUnique({
                    where: { id: user.sessionId },
                    select: { code: true }
                });
                currentSessionCode = session?.code || null;
                hasAccess = true;
            }
            // 2. Check if user is a facilitator (owner of a session)
            else {
                const facilitatorSession = await prisma.session.findFirst({
                    where: { facilitatorEmail: user.email },
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, code: true }
                });

                if (facilitatorSession) {
                    sessionFilter = { sessionId: facilitatorSession.id };
                    currentSessionCode = facilitatorSession.code;
                    hasAccess = true;
                }
            }
        }
    }

    if (!hasAccess) {
        return { entries: [], sessionCode: null };
    }

    // 2. Fetch Users
    const users = await prisma.participant.findMany({
        where: sessionFilter,
        select: {
            email: true,
            name: true,
            completedComponents: true,
            bingoLines: true,
            isCompleted: true
        },
        orderBy: [
            { bingoLines: 'desc' },
            { isCompleted: 'desc' }
        ],
        take: 100
    });

    // 3. Compute scores
    const leaderboard = users.map(user => {
        const completed = user.completedComponents
            ? user.completedComponents.split(',').filter(Boolean)
            : [];
        return {
            rawName: user.name || user.email,
            score: completed.length,
            bingoLines: user.bingoLines,
            isCompleted: user.isCompleted
        };
    });

    // 4. Sort by bingo lines first, then by score
    leaderboard.sort((a, b) => {
        if (b.bingoLines !== a.bingoLines) {
            return b.bingoLines - a.bingoLines;
        }
        return b.score - a.score;
    });

    // 5. Mask emails
    const entries = leaderboard.map((entry, index) => {
        let displayName = entry.rawName;
        // Don't mask if it looks like a real name (no @)
        // If it is an email, mask it
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
            bingoLines: entry.bingoLines,
            isCompleted: entry.isCompleted
        };
    });

    return { entries, sessionCode: currentSessionCode };
}
