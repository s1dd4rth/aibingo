'use client';

import { useState } from 'react';
import { joinSession } from '@/actions/session';
import { Users, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SessionJoin({ currentSession, participantId }: { currentSession?: string; participantId?: string }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // If "magic-link-user" is the default dummy pass, show as None/Global
    const isInSession = currentSession && currentSession !== 'magic-link-user';

    async function handleJoin() {
        if (!code.trim() || !participantId) return;

        setIsLoading(true);
        setError(null);

        const result = await joinSession(code.toUpperCase(), participantId);

        if (result.success) {
            router.refresh();
        } else {
            setError(result.error || 'Failed to join session');
        }

        setIsLoading(false);
    }

    return (
        <div className="glass p-6 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">Live Workshop Session</h3>
                    <p className="text-gray-400 text-sm">
                        {isInSession
                            ? `Connected to session: ${currentSession}`
                            : "Enter a session code to join a facilitated workshop"}
                    </p>
                </div>
            </div>

            {!isInSession && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Session Code (e.g., ABC123)"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="bg-black/30 flex-1 border border-white/10 rounded-lg px-4 py-2 text-white uppercase font-mono tracking-wider focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            onClick={handleJoin}
                            disabled={isLoading || !code || code.length !== 6}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? '...' : <><LogIn className="w-4 h-4" /> Join</>}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="text-xs text-gray-500">
                        Don't have a code? Ask your facilitator or{' '}
                        <Link href="/facilitator" className="text-purple-400 hover:text-purple-300 underline">
                            create your own session
                        </Link>
                    </div>
                </div>
            )}

            {isInSession && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-mono">
                            ● CONNECTED
                        </div>
                    </div>
                    <Link
                        href="/leaderboard"
                        className="text-sm text-yellow-400 hover:text-yellow-300 underline flex items-center gap-1"
                    >
                        <span className="opacity-70">🏆</span> View Leaderboard
                    </Link>
                </div>
            )}
        </div>
    );
}
