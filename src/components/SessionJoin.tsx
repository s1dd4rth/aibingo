'use client';

import { useState } from 'react';
import { joinSession } from '@/actions/game';
import { Users, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function SessionJoin({ currentSession }: { currentSession?: string }) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // If "magic-link-user" is the default dummy pass, show as None/Global
    const isLoggedIn = currentSession && currentSession !== 'magic-link-user';

    async function handleJoin() {
        if (!code.trim()) return;
        setIsLoading(true);
        await joinSession(code);
        setIsLoading(false);
    }

    function generateCode() {
        // Generate random 6-char code like 'A7X29B'
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setCode(randomCode);
    }

    return (
        <div className="glass p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Live Workshop</h3>
                    <p className="text-gray-400 text-sm">
                        {isLoggedIn
                            ? `You are playing in session: ${currentSession}`
                            : "Join (or create) a leaderboard room."}
                    </p>
                </div>
            </div>

            {!isLoggedIn && (
                <div className="flex gap-2 w-full md:w-auto items-center">
                    <div className="relative flex-1 md:w-48">
                        <input
                            type="text"
                            placeholder="Room Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="bg-black/30 w-full border border-white/10 rounded-lg px-4 py-2 pr-12 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            onClick={generateCode}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-purple-300"
                            title="Generate Random Code"
                        >
                            GENERATE
                        </button>
                    </div>

                    <button
                        onClick={handleJoin}
                        disabled={isLoading || !code}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? '...' : <><LogIn className="w-4 h-4" /> Join</>}
                    </button>
                </div>
            )}

            {isLoggedIn && (
                <div className="flex items-center gap-3">
                    <Link href="/leaderboard" className="text-sm text-yellow-400 hover:text-yellow-300 underline flex items-center gap-1">
                        <span className="opacity-70">🏆</span> View Leaderboard
                    </Link>
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-mono">
                        ● ONLINE
                    </div>
                </div>
            )}
        </div>
    );
}
