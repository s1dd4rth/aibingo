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

    // Polling fallback (Robustness)
    useEffect(() => {
        if (!session?.id) return;

        const pollInterval = setInterval(async () => {
            // Import dynamically to avoid server-action issues in client bundle if not handled right, 
            // but actually we can just import it at top level if it's a server action.
            // Using dynamic import for the action might be cleaner or just standard import.
            // Standard import at top is fine for Next.js server actions.

            // We need to import getSessionStatus.
            // Since I can't add top-level import easily with replace_file (it's messy), 
            // I'll assume I can add it or use a dynamic import here?
            // Next.js Server Actions can be imported.

            try {
                const { getSessionStatus } = await import('@/actions/session');
                const result = await getSessionStatus();

                if (result.success && result.data) {
                    const newData = result.data;

                    // Update Session State
                    setSession((prev: any) => {
                        // Check if actual changes to avoid re-renders? 
                        // React state updates bail out if value is same reference, but here we create new object.
                        // JSON.stringify check is cheap for small data.
                        const prevUnlocked = JSON.stringify(prev.unlockedComponents);
                        const newUnlocked = JSON.stringify(newData.unlockedComponents);

                        const prevBonus = JSON.stringify(prev.unlockedBonusCards);
                        const newBonus = JSON.stringify(newData.unlockedBonusCards);

                        if (prevUnlocked !== newUnlocked || prevBonus !== newBonus || prev.bonusEnabled !== newData.bonusEnabled) {
                            console.log('🔄 Polling sync: Session updated');
                            return {
                                ...prev,
                                unlockedComponents: newData.unlockedComponents,
                                unlockedBonusCards: newData.unlockedBonusCards,
                                bonusEnabled: newData.bonusEnabled
                            };
                        }
                        return prev;
                    });

                    // Update Participant State
                    setParticipant((prev: any) => {
                        const prevCompleted = JSON.stringify(prev.completedComponents);
                        const newCompleted = JSON.stringify(newData.participant.completedComponents);

                        const prevBonusCompleted = JSON.stringify(prev.completedBonusCards);
                        const newBonusCompleted = JSON.stringify(newData.participant.completedBonusCards);

                        if (prevCompleted !== newCompleted || prevBonusCompleted !== newBonusCompleted || prev.bonusPoints !== newData.participant.bonusPoints) {
                            console.log('🔄 Polling sync: Participant updated');
                            return {
                                ...prev,
                                completedComponents: newData.participant.completedComponents,
                                completedBonusCards: newData.participant.completedBonusCards,
                                bingoLines: newData.participant.bingoLines,
                                bonusPoints: newData.participant.bonusPoints
                            };
                        }
                        return prev;
                    });
                }
            } catch (err) {
                // Silent fail on poll
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [session?.id]);

    // Real-time subscriptions
    useEffect(() => {
        if (!session?.id) return;

        let unsubscribeSession: (() => void) | undefined;
        let unsubscribeParticipant: (() => void) | undefined;

        const setupRealtime = async () => {
            // ... existing setup ...
            const { subscribeToSession, subscribeToParticipants } = await import('@/lib/supabase');

            console.log('🔌 Setting up Realtime for GameView:', session.id);

            // 1. Session Updates (Unlocks)
            unsubscribeSession = subscribeToSession(session.id, (payload) => {
                console.log('⚡ Session updated:', payload);
                // Keep polling active, but also update immediately
                // ... (Logic handled by existing callbacks) ...
                // Note: If payload comes, we trust it.
                if (payload.eventType === 'UPDATE') {
                    // ... existing logic ...
                    // We duplicate logic here because we are replacing the block.
                    setSession((prev: any) => ({
                        ...prev,
                        ...payload.new,
                        unlockedComponents: payload.new.unlockedComponents ? payload.new.unlockedComponents.split(',') : [],
                        unlockedBonusCards: payload.new.unlockedBonusCards ? payload.new.unlockedBonusCards.split(',') : [],
                        bonusEnabled: payload.new.bonusEnabled,
                    }));
                    router.refresh();
                }
            });

            // 2. Participant Updates
            unsubscribeParticipant = subscribeToParticipants(session.id, (payload) => {
                if (payload.new && payload.new.id === participant.id) {
                    console.log('⚡ Participant updated:', payload);
                    setParticipant((prev: any) => ({
                        ...prev,
                        ...payload.new,
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
