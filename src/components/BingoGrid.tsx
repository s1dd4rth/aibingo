'use client';

import { useState } from 'react';
import { GameComponent } from '@/lib/game-config';
import { Participant } from '@prisma/client';
import BingoCard from './BingoCard';
import DetailDrawer from './DetailDrawer';
import { motion } from 'framer-motion';

interface BingoGridProps {
    participant: Participant;
    config: GameComponent[];
}

export default function BingoGrid({ participant, config }: BingoGridProps) {
    const [selectedComponent, setSelectedComponent] = useState<GameComponent | null>(null);

    // Local state for optimistic updates
    const [completedIds, setCompletedIds] = useState<string[]>(
        participant.unlockedComponentIds ? participant.unlockedComponentIds.split(',').filter(Boolean) : []
    );

    const handleComplete = (id: string) => {
        setCompletedIds((prev) => [...prev, id]);
    };

    const getStatus = (component: GameComponent, index: number) => {
        if (completedIds.includes(component.id)) return 'completed';

        // Linear progression logic:
        // If it's the first one, or the previous one is completed, it's unlocked.
        if (index === 0) return 'unlocked';
        const prevComponent = config[index - 1];
        if (completedIds.includes(prevComponent.id)) return 'unlocked';

        return 'locked';
    };

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {config.map((component, index) => {
                    const status = getStatus(component, index);
                    return (
                        <BingoCard
                            key={component.id}
                            component={component}
                            status={status}
                            onClick={() => setSelectedComponent(component)}
                            index={index}
                        />
                    );
                })}
            </div>

            {selectedComponent && (
                <DetailDrawer
                    component={selectedComponent}
                    status={getStatus(selectedComponent, config.findIndex(c => c.id === selectedComponent.id))}
                    onClose={() => setSelectedComponent(null)}
                    onComplete={handleComplete}
                />
            )}

            {/* "Bingo" Completion Celebration could go here (confetti etc) */}
            {completedIds.length === config.length && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-8 py-4 rounded-full font-bold shadow-2xl z-50 flex items-center gap-2"
                >
                    🎉 Quest Completed! You are an AI Master!
                </motion.div>
            )}
        </>
    );
}
