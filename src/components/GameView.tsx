'use client';

import { useState, useEffect } from 'react';
import BingoGrid from './BingoGrid';
import BonusGrid from './BonusGrid';
import { useRouter } from 'next/navigation';

interface GameViewProps {
    initialParticipant: any;
    initialSession: any;
}

export default function GameView({ initialParticipant, initialSession }: GameViewProps) {
    const [participant, setParticipant] = useState(initialParticipant);
    const [session, setSession] = useState(initialSession);
    const router = useRouter();

    // Sync state with props if they change (e.g. via router.refresh())
    useEffect(() => {
        setParticipant(initialParticipant);
    }, [initialParticipant]);

    useEffect(() => {
        setSession(initialSession);
    }, [initialSession]);

    // Real-time subscriptions
    useEffect(() => {
        if (!session?.id) return;

        let unsubscribeSession: (() => void) | undefined;
        let unsubscribeParticipant: (() => void) | undefined;

        const setupRealtime = async () => {
            const { subscribeToSession, subscribeToParticipants } = await import('@/lib/supabase');

            console.log('🔌 Setting up Realtime for GameView:', session.id);

            // 1. Session Updates (Unlocks)
            unsubscribeSession = subscribeToSession(session.id, (payload) => {
                console.log('⚡ Session updated:', payload);
                if (payload.eventType === 'UPDATE') {
                    setSession((prev: any) => ({
                        ...prev,
                        ...payload.new,
                        // Ensure arrays are split if they come as strings (unlikely from payload directly, but usually text in PG)
                        // Prisma usually handles split. Payload returns raw DB values.
                        // Assuming raw DB is comma-separated string for these fields as per schema.
                        unlockedComponents: payload.new.unlockedComponents ? payload.new.unlockedComponents.split(',') : [],
                        unlockedBonusCards: payload.new.unlockedBonusCards ? payload.new.unlockedBonusCards.split(',') : [],
                        bonusEnabled: payload.new.bonusEnabled,
                    }));
                    router.refresh(); // Keep server state in sync
                }
            });

            // 2. Participant Updates (Completion from other tabs/devices)
            unsubscribeParticipant = subscribeToParticipants(session.id, (payload) => {
                // Filter for THIS participant
                if (payload.new && payload.new.id === participant.id) {
                    console.log('⚡ Participant updated:', payload);
                    setParticipant((prev: any) => ({
                        ...prev,
                        ...payload.new,
                        // Parse fields that are CSV strings in DB
                        completedComponents: payload.new.completedComponents ? payload.new.completedComponents.split(',') : [],
                        completedBonusCards: payload.new.completedBonusCards ? payload.new.completedBonusCards.split(',') : [],
                        cardLayout: payload.new.cardLayout ? payload.new.cardLayout.split(',') : [],
                        bingoLines: payload.new.bingoLines,
                        bonusPoints: payload.new.bonusPoints,
                    }));
                    router.refresh();
                }
            });
        };

        setupRealtime();

        return () => {
            if (unsubscribeSession) unsubscribeSession();
            if (unsubscribeParticipant) unsubscribeParticipant();
        };
    }, [session?.id, participant.id, router]);

    return (
        <div className="space-y-8">
            <BingoGrid participant={participant} session={session} />
            <BonusGrid participant={participant} session={session} />
        </div>
    );
}
