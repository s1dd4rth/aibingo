'use client';

import { useState, useEffect } from 'react';
import { createSession, unlockNextComponent, getFacilitatorSession, deleteSession, toggleBonusCards, unlockBonusComponent } from '@/actions/session';
import { GAME_COMPONENTS, BONUS_COMPONENTS } from '@/lib/game-config';
import BrandHeader from '@/components/BrandHeader';
import { Trophy, Users, Unlock, CheckCircle2, Lock, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface SessionState {
    session: {
        id: string;
        code: string;
        facilitatorEmail: string;
        unlockedComponents: string[];
        unlockedBonusCards: string[];
        bonusEnabled: boolean;
        participantCount: number;
    };
    participants: Array<{
        id: string;
        name: string | null;
        email: string;
        bingoLines: number;
        bonusPoints: number;
        completedComponents: string;
    }>;
}

export default function FacilitatorPage() {
    const [sessionState, setSessionState] = useState<SessionState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTerminationConfirm, setShowTerminationConfirm] = useState(false);

    // All components in pedagogical order (flat array)
    const allComponents = GAME_COMPONENTS;

    // Load session from server on mount
    useEffect(() => {
        const loadSession = async () => {
            const result = await getFacilitatorSession();
            if ('session' in result) {
                setSessionState(result as SessionState);
            } else if (result.error !== 'No active session found') {
                if (result.error !== 'Not authenticated' && result.error !== 'User not found') {
                    // console.error(result.error);
                }
            }
            setLoading(false);
        };
        loadSession();
    }, []);

    const handleCreateSession = async () => {
        setLoading(true);
        setError(null);

        const result = await createSession();

        if (result.success && result.session) {
            // Refresh to get full state
            const state = await getFacilitatorSession();
            if ('session' in state) {
                setSessionState(state as SessionState);
            }
        } else {
            setError(result.error || 'Failed to create session');
        }

        setLoading(false);
    };

    const handleUnlockNext = async (componentId: string) => {
        if (!sessionState) return;

        setLoading(true);
        const result = await unlockNextComponent(sessionState.session.id, componentId);

        if (result.success) {
            // Refresh session state
            const state = await getFacilitatorSession();
            if ('session' in state) {
                setSessionState(state as SessionState);
            }
        } else {
            setError(result.error || 'Failed to unlock component');
        }

        setLoading(false);
    };

    const handleEndSession = async (confirmed: boolean) => {
        if (!confirmed) {
            setShowTerminationConfirm(false);
            return;
        }

        if (!sessionState) return;

        setLoading(true);
        const result = await deleteSession(sessionState.session.id);

        if (result.success) {
            setShowTerminationConfirm(false);
            setSessionState(null);
        } else {
            setError(result.error || 'Failed to delete session');
        }
        setLoading(false);
    };

    const handleToggleBonus = async () => {
        if (!sessionState) return;

        setLoading(true);
        const newState = !sessionState.session.bonusEnabled;
        const result = await toggleBonusCards(sessionState.session.id, newState);

        if (result.success) {
            // Refresh session state
            const state = await getFacilitatorSession();
            if ('session' in state) {
                setSessionState(state as SessionState);
            }
        } else {
            setError(result.error || 'Failed to toggle bonus cards');
        }

        setLoading(false);
    };

    const handleUnlockBonus = async (componentId: string) => {
        if (!sessionState) return;

        setLoading(true);
        const result = await unlockBonusComponent(sessionState.session.id, componentId);

        if (result.success) {
            // Refresh session state
            const state = await getFacilitatorSession();
            if ('session' in state) {
                setSessionState(state as SessionState);
            }
        } else {
            setError(result.error || 'Failed to unlock bonus component');
        }

        setLoading(false);
    };


    // Real-time subscription for session and participant updates
    useEffect(() => {
        if (!sessionState) return;

        // Import Supabase helpers dynamically (client-side only)
        let unsubscribeSession: (() => void) | undefined;
        let unsubscribeParticipants: (() => void) | undefined;

        const setupRealtime = async () => {
            const { subscribeToSession, subscribeToParticipants } = await import('@/lib/supabase');

            // Subscribe to session changes (unlocked components, etc.)
            unsubscribeSession = subscribeToSession(sessionState.session.id, async (payload) => {
                console.log('Session updated:', payload);
                // Refresh full state when session changes
                const state = await getFacilitatorSession();
                if ('session' in state) {
                    setSessionState(state as SessionState);
                }
            });

            // Subscribe to participant changes (joins, completions, etc.)
            unsubscribeParticipants = subscribeToParticipants(sessionState.session.id, async (payload) => {
                console.log('Participants updated:', payload);
                // Refresh full state when participants change
                const state = await getFacilitatorSession();
                if ('session' in state) {
                    setSessionState(state as SessionState);
                }
            });
        };

        setupRealtime();

        return () => {
            // Cleanup subscriptions
            if (unsubscribeSession) unsubscribeSession();
            if (unsubscribeParticipants) unsubscribeParticipants();
        };
    }, [sessionState?.session.id]); // Only re-subscribe if session ID changes

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 font-sans flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
                        INITIALIZING_SYSTEM_LINK...
                    </p>
                </div>
            </div>
        );
    }

    if (!sessionState) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 font-sans flex items-center justify-center">
                <div className="max-w-2xl w-full text-center space-y-8 schematic-card p-12 bg-card">
                    <div className="space-y-4">
                        <div className="inline-block p-4 border-2 border-primary bg-primary/10">
                            <Trophy className="w-12 h-12 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold uppercase tracking-tighter">Facilitator_Console</h1>
                        <p className="text-muted-foreground font-mono">
                            INITIALIZE_NEW_SESSION_TO_BEGIN
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive p-4 text-destructive font-mono text-sm">
                            ERROR: {error}
                        </div>
                    )}

                    <button
                        onClick={handleCreateSession}
                        disabled={loading}
                        className="w-full schematic-btn py-4 text-lg"
                    >
                        CREATE_NEW_SESSION
                    </button>

                    <p className="text-xs text-muted-foreground font-mono mt-8">
                        * Authorized Personnel Only. Session will be linked to your ID.
                    </p>
                </div>
            </div>
        );
    }

    // Filter out 'thinking-models' as it was removed from the participant bingo card to fit the 5x4 grid
    const activeComponents = allComponents.filter(c => c.id !== 'thinking-models');

    // Calculate progress based on active components (20 total)
    const unlockedSet = new Set(sessionState.session.unlockedComponents);
    const nextToUnlock = activeComponents.find(c => !unlockedSet.has(c.id));

    return (
        <div className="min-h-screen bg-background text-foreground font-sans relative">
            <BrandHeader
                title="FACILITATOR_CONTROL"
                rightElement={
                    <div className="flex items-center gap-3">
                        <Link
                            href="/leaderboard"
                            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary px-4 py-2 uppercase font-bold text-xs"
                        >
                            <Trophy className="w-4 h-4" />
                            Leaderboard
                        </Link>
                        <button
                            onClick={() => setShowTerminationConfirm(true)}
                            className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive px-4 py-2 uppercase font-bold text-xs"
                        >
                            TERMINATE_SESSION
                        </button>
                    </div>
                }
            />

            <div className="p-8 max-w-6xl mx-auto space-y-8">

                {/* Session Info */}
                <div className="schematic-card p-6 bg-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 font-mono uppercase">Session_Code</div>
                            <div className="text-4xl font-black tracking-widest text-primary font-mono border-2 border-primary inline-block px-4 py-2 bg-primary/5">
                                {sessionState.session.code}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1 font-mono uppercase">Active_Unit_Count</div>
                            <div className="flex items-center justify-end gap-2 text-2xl font-bold font-mono">
                                <Users className="w-6 h-6 text-accent" />
                                {sessionState.session.participantCount}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="schematic-card p-6 bg-card space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h2 className="text-2xl font-bold uppercase tracking-tight">System_Progression</h2>
                        <div className="text-muted-foreground font-mono">
                            [{sessionState.session.unlockedComponents.length} / {activeComponents.length}] UNLOCKED
                        </div>
                    </div>

                    {/* Next to Unlock */}
                    {nextToUnlock && (
                        <div className="bg-muted/10 border border-muted-foreground/20 p-4 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 bg-primary text-primary-foreground text-[10px] uppercase font-bold">Next_Action</div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <div className="text-xs text-primary mb-1 uppercase font-mono">Pending_Component</div>
                                    <div className="text-xl font-bold uppercase">{nextToUnlock.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1 font-mono">{nextToUnlock.period}</div>
                                </div>
                                <button
                                    onClick={() => handleUnlockNext(nextToUnlock.id)}
                                    disabled={loading}
                                    className="schematic-btn py-3 px-6 flex items-center gap-2"
                                >
                                    <Unlock className="w-4 h-4" />
                                    UNLOCK_COMPONENT
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Component List */}
                    <div className="space-y-2 grid grid-cols-2 gap-4">
                        {allComponents.map((component) => {
                            const isUnlocked = unlockedSet.has(component.id);
                            return (
                                <div
                                    key={component.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 border",
                                        isUnlocked
                                            ? 'bg-green-500/10 border-green-500'
                                            : 'bg-muted/5 border-border opacity-60'
                                    )}
                                >
                                    {isUnlocked ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm uppercase truncate">{component.name}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{component.period}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bonus Cards (2026 Trends) */}
                <div className="schematic-card p-6 bg-card space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                            <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                                <Star className="w-6 h-6 text-yellow-500" />
                                Bonus_Cards_2026
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1 font-mono">
                                // Optional Advanced Challenges (+50pts each)
                            </p>
                        </div>
                        <button
                            onClick={handleToggleBonus}
                            disabled={loading}
                            className={cn(
                                "px-4 py-2 border uppercase font-bold text-xs flex items-center gap-2",
                                sessionState.session.bonusEnabled
                                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20'
                                    : 'bg-muted/10 border-border text-muted-foreground hover:bg-muted/20'
                            )}
                        >
                            {sessionState.session.bonusEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                    </div>

                    {sessionState.session.bonusEnabled ? (
                        <>
                            <div className="text-xs text-muted-foreground font-mono uppercase mb-4 p-3 border border-yellow-500/30 bg-yellow-500/5">
                                ⚠️ Participants must complete 10 core tiles to see bonus cards
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {BONUS_COMPONENTS.map((component) => {
                                    const isUnlocked = sessionState.session.unlockedBonusCards.includes(component.id);
                                    return (
                                        <div
                                            key={component.id}
                                            className={cn(
                                                "flex items-center gap-3 p-3 border",
                                                isUnlocked
                                                    ? 'bg-yellow-500/10 border-yellow-500'
                                                    : 'bg-muted/5 border-border'
                                            )}
                                        >
                                            {isUnlocked ? (
                                                <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                            ) : (
                                                <button
                                                    onClick={() => handleUnlockBonus(component.id)}
                                                    disabled={loading}
                                                    className="p-1 hover:bg-yellow-500/10 border border-yellow-500/30 rounded disabled:opacity-50"
                                                >
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                </button>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm uppercase truncate">{component.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{component.description}</div>
                                            </div>
                                            <div className="text-xs font-mono text-yellow-500">+{component.bonusPoints}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground py-8 font-mono border border-dashed border-border uppercase">
                            Bonus_Cards_Disabled
                        </div>
                    )}
                </div>

                {/* Participant List */}

                <div className="schematic-card p-6 bg-card">
                    <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight border-b border-border pb-4">Participant_Log</h2>
                    <div className="space-y-2">
                        {sessionState.participants.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 font-mono border border-dashed border-border uppercase">
                                Waiting_For_Connections...
                            </div>
                        ) : (
                            sessionState.participants.map((participant) => {
                                const completedCount = participant.completedComponents
                                    ? participant.completedComponents.split(',').filter(Boolean).length
                                    : 0;

                                return (
                                    <div
                                        key={participant.id}
                                        className="flex items-center justify-between p-3 border border-border hover:border-primary transition-colors bg-background"
                                    >
                                        <div>
                                            <div className="font-bold uppercase text-sm">
                                                {participant.name || participant.email.split('@')[0]}
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono">{participant.email}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold">Bingo_Lines</div>
                                            <div className="text-xl font-bold text-primary font-mono">
                                                {participant.bingoLines}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                {completedCount}/{allComponents.length} DONE
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Termination Confirmation Modal */}
            {showTerminationConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="schematic-card bg-card p-6 max-w-md w-full border-destructive shadow-[8px_8px_0px_0px_rgba(239,68,68,0.5)]">
                        <h3 className="text-xl font-bold text-destructive uppercase tracking-tight mb-2">
                            ⚠️ Confirm_Termination
                        </h3>
                        <p className="text-muted-foreground font-mono mb-6">
                            Are you sure you want to terminate this session? Users will be disconnected immediately and all progress data will be archived.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleEndSession(true)}
                                disabled={loading}
                                className="flex-1 bg-destructive text-destructive-foreground font-bold uppercase py-3 border border-destructive hover:bg-destructive/90 transition-colors"
                            >
                                {loading ? 'Terminating...' : 'YES_TERMINATE'}
                            </button>
                            <button
                                onClick={() => handleEndSession(false)}
                                disabled={loading}
                                className="flex-1 bg-background text-foreground font-bold uppercase py-3 border border-border hover:border-primary transition-colors"
                            >
                                CANCEL_ACTION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
