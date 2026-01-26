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
            "min-h-screen bg-black text-white transition-all duration-700 font-sans",
            isPresenter ? "p-8 md:p-12 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black" : "p-4 md:p-8 bg-black"
        )}>
            {/* Background noise texture */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay" />

            <div className={cn("w-full relative z-10 transition-all duration-500", isPresenter ? "max-w-7xl" : "max-w-4xl mx-auto space-y-8")}>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {!isPresenter && (
                        <Link
                            href="/game"
                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Back to Game
                        </Link>
                    )}

                    <div className={cn("flex flex-col items-center gap-1", isPresenter && "mx-auto scale-125 mb-16")}>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                            </div>
                            <h1 className="text-3xl font-black italic uppercase tracking-wider bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                                {sessionCode ? `Session ${sessionCode}` : 'Leaderboard'}
                            </h1>
                        </div>
                        {isPresenter && <div className="text-zinc-500 text-sm tracking-widest uppercase font-medium mt-2">Live Standings</div>}
                    </div>

                    <button
                        onClick={() => setIsPresenter(!isPresenter)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-2 text-sm bg-purple-500/5 hover:bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 transition-all"
                    >
                        {isPresenter ? <Minimize2 className="w-4 h-4" /> : <MonitorPlay className="w-4 h-4" />}
                        {isPresenter ? "Exit" : "Present"}
                    </button>
                </div>

                {/* Presenter Instructions */}
                {isPresenter && sessionCode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16 relative"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/20 rounded-full blur-[120px] -z-10" />
                        <p className="text-zinc-400 text-xl mb-4 font-light">Join the game at <span className="text-white font-mono font-bold">aibingo.game</span></p>
                        <div className="inline-block relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-30" />
                            <p className="relative text-8xl font-black text-white tracking-[0.2em] px-12 py-4 bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10">
                                {sessionCode}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Table */}
                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {entries.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5"
                            >
                                <p className="text-zinc-500 text-xl">Waiting for players to join...</p>
                            </motion.div>
                        ) : (
                            entries.map((entry, index) => (
                                <motion.div
                                    key={entry.rank} // Ideally use ID if stable, but rank changes so framer layoutId might be better if we had IDs
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                                        entry.rank === 1 ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30" :
                                            entry.rank === 2 ? "bg-gradient-to-r from-zinc-400/10 to-transparent border-white/10" :
                                                entry.rank === 3 ? "bg-gradient-to-r from-orange-700/10 to-transparent border-orange-500/20" :
                                                    "bg-zinc-900/40 border-white/5 hover:bg-zinc-800/40"
                                    )}
                                >
                                    {/* Rank */}
                                    <div className={cn(
                                        "w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl shadow-lg",
                                        entry.rank === 1 ? "bg-yellow-500 text-black shadow-yellow-500/20" :
                                            entry.rank === 2 ? "bg-zinc-300 text-black shadow-white/10" :
                                                entry.rank === 3 ? "bg-orange-600 text-white shadow-orange-600/20" :
                                                    "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {entry.rank}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <div className={cn("font-bold truncate text-lg", isPresenter && "text-2xl")}>
                                            {entry.name}
                                        </div>
                                        <div className="text-xs text-zinc-500 font-mono mt-0.5 max-w-[200px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${(entry.score / 20) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 md:gap-12 mr-4">
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Bingo Lines</span>
                                            <div className="text-2xl font-black text-yellow-400 flex items-center justify-end gap-2">
                                                {entry.bingoLines} <span className="text-lg">🎯</span>
                                            </div>
                                        </div>

                                        <div className="text-right w-24 hidden md:block">
                                            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Tiles</span>
                                            <div className="text-xl font-bold text-zinc-300">
                                                <span className="text-blue-400">{entry.score}</span><span className="text-zinc-600">/20</span>
                                            </div>
                                        </div>

                                        <div className="w-8 flex justify-center">
                                            {entry.isCompleted ? (
                                                <div className="bg-green-500/20 p-2 rounded-full border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                </div>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
