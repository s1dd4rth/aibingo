'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, LeaderboardData } from '@/actions/leaderboard';
import { Trophy, ArrowLeft, CheckCircle2, MonitorPlay, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeaderboardView({ initialData }: { initialData: LeaderboardData }) {
    const [data, setData] = useState(initialData);
    const [isPresenter, setIsPresenter] = useState(false);

    // Polling Logic
    useEffect(() => {
        const interval = setInterval(async () => {
            const fresh = await getLeaderboard();
            setData(fresh);
        }, 5000); // 5s refresh
        return () => clearInterval(interval);
    }, []);

    const { entries, sessionCode } = data;

    return (
        <div className={cn(
            "min-h-screen bg-black text-white transition-all duration-500",
            isPresenter ? "p-8 md:p-12 flex flex-col items-center justify-center bg-zinc-950" : "p-4 md:p-8"
        )}>
            <div className={cn("w-full transition-all duration-500", isPresenter ? "max-w-7xl" : "max-w-4xl mx-auto space-y-8")}>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {!isPresenter && (
                        <Link
                            href="/game"
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Game
                        </Link>
                    )}

                    <div className={cn("flex items-center gap-3", isPresenter && "mx-auto scale-150 mb-12")}>
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-600 bg-clip-text text-transparent">
                            {sessionCode ? `Session: ${sessionCode}` : 'AI Bingo Champions'}
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsPresenter(!isPresenter)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-2 text-sm bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20 transition-colors"
                        title="Toggle Presenter Mode"
                    >
                        {isPresenter ? <Minimize2 className="w-4 h-4" /> : <MonitorPlay className="w-4 h-4" />}
                        {isPresenter ? "Exit Presenter" : "Present"}
                    </button>
                </div>

                {/* Presenter Instructions */}
                {isPresenter && sessionCode && (
                    <div className="text-center mb-12 animate-pulse">
                        <p className="text-gray-400 text-xl mb-2">Join at <span className="text-white font-mono">aibingo.game</span></p>
                        <p className="text-5xl font-black text-white tracking-widest">{sessionCode}</p>
                    </div>
                )}

                {/* Table */}
                <div className={cn(
                    "glass rounded-2xl overflow-hidden border border-white/10 transition-all",
                    isPresenter && "shadow-2xl shadow-yellow-500/10 border-yellow-500/20"
                )}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="p-4 text-sm font-medium text-gray-400 w-16 text-center">#</th>
                                    <th className="p-4 text-sm font-medium text-gray-400">Player</th>
                                    <th className="p-4 text-sm font-medium text-gray-400 text-right">Progress</th>
                                    <th className="p-4 text-sm font-medium text-gray-400 text-right w-24">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            No players yet.
                                            {sessionCode && " Waiting for participants..."}
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry) => (
                                        <tr key={entry.rank} className={cn(
                                            "hover:bg-white/5 transition-colors",
                                            isPresenter && entry.rank <= 3 && "bg-yellow-500/5"
                                        )}>
                                            <td className="p-4 text-center font-mono text-gray-400 text-lg">
                                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                                            </td>
                                            <td className={cn("p-4 font-medium text-gray-200", isPresenter && "text-xl")}>
                                                {entry.name}
                                            </td>
                                            <td className="p-4 text-right font-mono text-blue-300">
                                                {entry.score} / 20
                                            </td>
                                            <td className="p-4 text-right">
                                                {entry.isCompleted ? (
                                                    <span className="inline-flex items-center gap-1 text-green-400 text-xs font-bold uppercase tracking-wider">
                                                        <CheckCircle2 className="w-4 h-4" /> Done
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">Playing...</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
