'use client';

import { useState } from 'react';
import { BONUS_COMPONENTS, GameComponent } from '@/lib/game-config';
import { markComponentComplete } from '@/actions/game';
import DetailDrawer from './DetailDrawer';

interface BonusGridProps {
    participant: {
        id: string;
        completedComponents: string[];
        completedBonusCards: string[];
        bonusPoints: number;
        bingoLines: number; // Added for celebration context if needed
    };
    session: {
        id: string;
        unlockedBonusCards: string[];
        bonusEnabled: boolean;
    } | null;
}

export default function BonusGrid({ participant, session }: BonusGridProps) {
    const [selectedComponent, setSelectedComponent] = useState<GameComponent | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Check if bonus is unlocked
    const coreProgress = participant.completedComponents.length;
    const bonusUnlocked = session?.bonusEnabled && coreProgress >= 10;

    const handleMarkComplete = async (componentId: string) => {
        setIsCompleting(true);
        setMessage(null);

        const result = await markComponentComplete(componentId);

        if (result.success && 'message' in result) {
            setMessage(result.message as string);
            setTimeout(() => setMessage(null), 3000);
            setSelectedComponent(null); // Close drawer on success
        }

        setIsCompleting(false);
    };

    if (!session) return null;
    if (!session.bonusEnabled) return null;

    return (
        <div className="mt-8 border-t-2 border-[#00ff00] pt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xl font-bold text-[#00ff00]">
                    🎁 BONUS CHALLENGES (2026 TRENDS)
                </h3>
                <div className="font-mono text-sm text-[#00ff00]">
                    {participant.bonusPoints} PTS
                </div>
            </div>

            {/* Challenge Message - Show when enabled but not enough core tiles */}
            {!bonusUnlocked && (
                <div className="p-6 border-2 border-yellow-500 bg-yellow-500/10 font-mono text-center">
                    <div className="text-xl text-yellow-500 mb-2">🏆 COMPLETE THE CHALLENGE TO UNLOCK BONUS</div>
                    <div className="text-sm text-yellow-300">
                        Progress: {coreProgress}/10 core tiles completed
                    </div>
                </div>
            )}

            {/* Success Message */}
            {message && (
                <div className="mb-4 p-2 border-2 border-[#00ff00] bg-[#00ff00]/10 font-mono text-[#00ff00] text-center animate-pulse">
                    {message}
                </div>
            )}

            {/* Bonus Grid (4 cols x 2 rows) - Only show when unlocked */}
            {bonusUnlocked && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BONUS_COMPONENTS.map((component) => {
                        const isUnlocked = session.unlockedBonusCards.includes(component.id);
                        const isCompleted = participant.completedBonusCards.includes(component.id);

                        return (
                            <button
                                key={component.id}
                                onClick={() => isUnlocked && !isCompleted && setSelectedComponent(component)}
                                disabled={!isUnlocked || isCompleted}
                                className={`
                                    relative p-4 border-2 font-mono text-left transition-all group
                                    ${isCompleted
                                        ? 'border-[#00ff00] bg-[#00ff00]/20 text-[#00ff00]'
                                        : isUnlocked
                                            ? 'border-[#00ff00] bg-black hover:bg-[#00ff00]/10 text-white cursor-pointer'
                                            : 'border-gray-600 bg-black/50 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                {/* Status Icon */}
                                <div className="absolute top-2 right-2 text-lg">
                                    {isCompleted ? '✓' : isUnlocked ? '🎁' : '🔒'}
                                </div>

                                {/* Component Name */}
                                <div className="text-xs font-bold mb-1">{component.name}</div>

                                {/* Description */}
                                <div className="text-[10px] opacity-70 line-clamp-2 group-hover:opacity-100 transition-opacity">
                                    {component.description}
                                </div>

                                {/* Points */}
                                <div className="mt-2 text-[10px] font-bold text-[#00ff00]">
                                    +{component.bonusPoints} PTS
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Achievement Progress */}
            {bonusUnlocked && (
                <div className="mt-4 p-3 border-2 border-[#00ff00]/30 bg-black/30 font-mono text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[#00ff00]">
                            BONUS PROGRESS: {participant.completedBonusCards.length}/8
                        </span>
                        {participant.completedBonusCards.length === 8 && (
                            <span className="text-yellow-500 animate-pulse">
                                🎓 MASTER ACHIEVEMENT UNLOCKED!
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Drawer for Bonus Cards */}
            {selectedComponent && (
                <DetailDrawer
                    component={selectedComponent}
                    status={
                        participant.completedBonusCards.includes(selectedComponent.id)
                            ? 'completed'
                            : 'unlocked'
                    }
                    onClose={() => setSelectedComponent(null)}
                    onComplete={() => handleMarkComplete(selectedComponent.id)}
                    isCompleting={isCompleting}
                />
            )}
        </div>
    );
}
