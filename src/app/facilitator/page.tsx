'use client';

import { useState, useEffect } from 'react';
import { createSession, getSessionState, unlockNextComponent } from '@/actions/session';
import { GAME_COMPONENTS } from '@/lib/game-config';
import { Trophy, Users, Unlock, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';

interface SessionState {
    session: {
        id: string;
        code: string;
        facilitatorEmail: string;
        unlockedComponents: string[];
        participantCount: number;
    };
    participants: Array<{
        id: string;
        name: string | null;
        email: string;
        bingoLines: number;
        completedComponents: string;
    }>;
}

export default function FacilitatorPage() {
    const [sessionState, setSessionState] = useState<SessionState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // All components in pedagogical order (flat array)
    const allComponents = GAME_COMPONENTS;

    const handleCreateSession = async () => {
        setLoading(true);
        setError(null);

        // Get current user email (you'll need to pass this from auth)
        const facilitatorEmail = 'facilitator@example.com'; // TODO: Get from auth

        const result = await createSession(facilitatorEmail);

        if (result.success && result.session) {
            // Load session state
            const state = await getSessionState(result.session.id);
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
            const state = await getSessionState(sessionState.session.id);
            if ('session' in state) {
                setSessionState(state as SessionState);
            }
        } else {
            setError(result.error || 'Failed to unlock component');
        }

        setLoading(false);
    };

    // Poll for updates every 5 seconds
    useEffect(() => {
        if (!sessionState) return;

        const interval = setInterval(async () => {
            const state = await getSessionState(sessionState.session.id);
            if ('session' in state) {
                setSessionState(state as SessionState);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [sessionState]);

    if (!sessionState) {
        return (
            <div className="min-h-screen bg-black text-white p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold">Facilitator Dashboard</h1>
                        <p className="text-gray-400">
                            Create a session to start teaching AI concepts with bingo!
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleCreateSession}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        {loading ? 'Creating Session...' : 'Create New Session'}
                    </button>
                </div>
            </div>
        );
    }

    const unlockedSet = new Set(sessionState.session.unlockedComponents);
    const nextToUnlock = allComponents.find(c => !unlockedSet.has(c.id));

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold">Facilitator Dashboard</h1>
                        <p className="text-gray-400 mt-2">Control the learning flow for your session</p>
                    </div>
                    <Link
                        href="/leaderboard"
                        className="flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Trophy className="w-5 h-5" />
                        View Leaderboard
                    </Link>
                </div>

                {/* Session Info */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">Session Code</div>
                            <div className="text-4xl font-black tracking-widest text-purple-400">
                                {sessionState.session.code}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400 mb-1">Participants</div>
                            <div className="flex items-center gap-2 text-2xl font-bold">
                                <Users className="w-6 h-6 text-blue-400" />
                                {sessionState.session.participantCount}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Learning Progress</h2>
                        <div className="text-gray-400">
                            {sessionState.session.unlockedComponents.length} / {allComponents.length} unlocked
                        </div>
                    </div>

                    {/* Next to Unlock */}
                    {nextToUnlock && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-purple-400 mb-1">Next Component</div>
                                    <div className="text-xl font-bold">{nextToUnlock.name}</div>
                                    <div className="text-sm text-gray-400 mt-1">{nextToUnlock.period}</div>
                                </div>
                                <button
                                    onClick={() => handleUnlockNext(nextToUnlock.id)}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    <Unlock className="w-5 h-5" />
                                    Unlock for All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Component List */}
                    <div className="space-y-2">
                        {allComponents.map((component) => {
                            const isUnlocked = unlockedSet.has(component.id);
                            return (
                                <div
                                    key={component.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${isUnlocked
                                        ? 'bg-green-500/10 border border-green-500/20'
                                        : 'bg-white/5 border border-white/10'
                                        }`}
                                >
                                    {isUnlocked ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium">{component.name}</div>
                                        <div className="text-sm text-gray-400">{component.period}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Participant List */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                    <h2 className="text-2xl font-bold mb-4">Participants</h2>
                    <div className="space-y-2">
                        {sessionState.participants.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No participants yet. Share the session code!
                            </div>
                        ) : (
                            sessionState.participants.map((participant) => {
                                const completedCount = participant.completedComponents
                                    ? participant.completedComponents.split(',').filter(Boolean).length
                                    : 0;

                                return (
                                    <div
                                        key={participant.id}
                                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {participant.name || participant.email.split('@')[0]}
                                            </div>
                                            <div className="text-sm text-gray-400">{participant.email}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-400">Bingo Lines</div>
                                            <div className="text-xl font-bold text-yellow-400">
                                                {participant.bingoLines}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {completedCount} / {allComponents.length} completed
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
