'use client';

import { useState, useEffect } from 'react';
import { GAME_COMPONENTS } from '@/lib/game-config';
import { markComponentComplete } from '@/actions/game';
import BingoCard from './BingoCard';
import DetailDrawer from './DetailDrawer';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BingoGridProps {
    participant: {
        id: string;
        cardLayout: string[];
        completedComponents: string[];
        bingoLines: number;
    };
    session?: {
        id: string;
        unlockedComponents: string[];
    } | null;
}

export default function BingoGrid({ participant, session }: BingoGridProps) {
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const router = useRouter();

    // Real-time subscription to session updates (for unlocked components)
    useEffect(() => {
        if (!session?.id) return;

        let unsubscribe: (() => void) | undefined;

        const setupRealtime = async () => {
            const { subscribeToSession } = await import('@/lib/supabase');

            console.log('🔌 Setting up Realtime for session:', session.id);

            // Subscribe to session changes (facilitator unlocking components)
            unsubscribe = subscribeToSession(session.id, async (payload) => {
                console.log('⚡ Session updated (participant view):', payload);
                // Refresh the page to get latest unlocked components
                router.refresh();
            });
        };

        setupRealtime();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [session?.id, router]);

    // Get all components as a map for quick lookup
    const componentMap = new Map(
        GAME_COMPONENTS.map(c => [c.id, c])
    );

    // Use cardLayout to determine order, fallback to all components if no layout
    const cardOrder = participant.cardLayout.length > 0
        ? participant.cardLayout
        : GAME_COMPONENTS.map(c => c.id);

    // Get unlocked components from session, or use completed for backward compatibility
    const unlockedIds = session?.unlockedComponents || participant.completedComponents;
    const completedIds = participant.completedComponents;

    const getStatus = (componentId: string): 'locked' | 'unlocked' | 'completed' => {
        if (completedIds.includes(componentId)) return 'completed';
        if (unlockedIds.includes(componentId)) return 'unlocked';
        return 'locked';
    };

    const handleComplete = async (componentId: string) => {
        if (isCompleting) return;

        setIsCompleting(true);
        const result = await markComponentComplete(componentId);

        if (result.success) {
            router.refresh(); // Refresh to get updated state
            setSelectedComponentId(null);

            // Show celebration if bingo line was completed
            if (result.bingoLines && result.bingoLines > participant.bingoLines) {
                // TODO: Add confetti or celebration animation
                console.log('🎯 BINGO! New line completed!');
            }
        }

        setIsCompleting(false);
    };

    const selectedComponent = selectedComponentId
        ? componentMap.get(selectedComponentId)
        : null;

    return (
        <>
            {/* Bingo Lines Indicator */}
            {participant.bingoLines > 0 && (
                <div className="schematic-card p-4 bg-primary/10 border-primary mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary text-primary-foreground px-3 py-1 font-bold text-2xl font-mono">
                            {participant.bingoLines}
                        </div>
                        <div>
                            <div className="text-xl font-bold text-primary uppercase tracking-tight">
                                Bingo Line{participant.bingoLines !== 1 ? 's' : ''} ACQUIRED
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                                PROGRESS: {completedIds.length} / 20 MODULES
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bingo Grid - 5 columns x 4 rows */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {cardOrder.map((componentId, index) => {
                    const component = componentMap.get(componentId);
                    if (!component) return null;

                    const status = getStatus(componentId);

                    return (
                        <BingoCard
                            key={componentId}
                            component={component}
                            status={status}
                            onUnlock={() => setSelectedComponentId(componentId)}
                            onComplete={() => handleComplete(componentId)}
                            index={index}
                            aria-label={`Bingo card for ${component.name}, status: ${status}`}
                        />
                    );
                })}
            </div>

            {/* Detail Drawer */}
            {selectedComponent && (
                <DetailDrawer
                    component={selectedComponent}
                    status={getStatus(selectedComponent.id)}
                    onClose={() => setSelectedComponentId(null)}
                    onComplete={() => handleComplete(selectedComponent.id)}
                    isCompleting={isCompleting}
                />
            )}

            {/* Full Card Completion Celebration */}
            {completedIds.length === 20 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-8 py-4 border-2 border-primary-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 flex items-center gap-2 font-bold uppercase tracking-widest text-xl"
                >
                    🎉 SYSTEM_MASTERY_ACHIEVED
                </motion.div>
            )}

            {/* Session Info */}
            {session && (
                <div className="mt-6 text-center text-sm text-gray-500">
                    {unlockedIds.length} / 20 components unlocked by facilitator
                </div>
            )}
        </>
    );
}
