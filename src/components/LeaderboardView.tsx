'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, LeaderboardData } from '@/actions/leaderboard';
import { Trophy, ArrowLeft, CheckCircle2, MonitorPlay, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import BrandHeader from './BrandHeader';

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
            "min-h-screen bg-background text-foreground transition-all duration-700 font-sans",
            isPresenter ? "p-8 md:p-12 flex flex-col items-center justify-center" : "p-4 md:p-8"
        )}>
            <div className={cn("w-full relative z-10 transition-all duration-500", isPresenter ? "max-w-7xl" : "max-w-4xl mx-auto space-y-8")}>

                {/* Header */}
                <BrandHeader
                    title={sessionCode ? `SESSION: ${sessionCode}` : 'GLOBAL_LEADERBOARD'}
                    className="mb-8 p-0 border-b-0 bg-transparent relative z-20"
                    rightElement={
                        <button
                            onClick={() => setIsPresenter(!isPresenter)}
                            className="schematic-btn px-4 py-2 flex items-center gap-2 text-xs"
                        >
                            {isPresenter ? <Minimize2 className="w-4 h-4" /> : <MonitorPlay className="w-4 h-4" />}
                            {isPresenter ? "TERM_VIEW" : "PRESENTER_MODE"}
                        </button>
                    }
                />

                {!isPresenter && (
                    <div className="mb-8">
                        <Link
                            href="/game"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group font-mono uppercase text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            [RETURN_TO_GRID]
                        </Link>
                    </div>
                )}

                {/* Presenter Instructions */}
                {isPresenter && sessionCode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16 relative"
                    >
                        <p className="text-muted-foreground text-xl mb-4 font-mono">ACCESS_PORTAL: <span className="text-foreground font-bold">aibingo.game</span></p>
                        <div className="inline-block relative">
                            <p className="relative text-8xl font-bold text-primary tracking-[0.2em] px-12 py-4 bg-background border-2 border-primary shadow-[12px_12px_0px_0px_rgba(249,115,22,0.3)]">
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
                                className="text-center py-20 bg-card border-2 border-dashed border-border"
                            >
                                <p className="text-muted-foreground font-mono text-xl">WAITING_FOR_PLAYERS...</p>
                            </motion.div>
                        ) : (
                            entries.map((entry, index) => (
                                <motion.div
                                    key={entry.rank}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "group relative flex items-center gap-4 p-4 border-2 transition-all duration-300",
                                        entry.rank === 1 ? "bg-primary/5 border-primary shadow-[6px_6px_0px_0px_var(--primary)] z-10" :
                                            entry.rank === 2 ? "bg-card border-foreground/50 shadow-[4px_4px_0px_0px_var(--foreground)]" :
                                                entry.rank === 3 ? "bg-card border-accent shadow-[2px_2px_0px_0px_var(--accent)]" :
                                                    "bg-card border-border hover:border-muted-foreground"
                                    )}
                                >
                                    {/* Rank */}
                                    <div className={cn(
                                        "w-12 h-12 flex items-center justify-center font-bold text-xl border-2",
                                        entry.rank === 1 ? "bg-primary text-primary-foreground border-primary" :
                                            entry.rank === 2 ? "bg-foreground text-background border-foreground" :
                                                entry.rank === 3 ? "bg-accent text-accent-foreground border-accent" :
                                                    "bg-muted text-muted-foreground border-border"
                                    )}>
                                        #{entry.rank}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <div className={cn("font-bold truncate text-lg uppercase", isPresenter && "text-2xl")}>
                                            {entry.name}
                                        </div>
                                        <div className="w-full h-2 bg-muted mt-2 border border-border">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${(entry.score / 20) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 md:gap-12 mr-4">
                                        <div className="text-right">
                                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold font-mono">Bingo_Lines</span>
                                            <div className="text-2xl font-bold text-primary flex items-center justify-end gap-2 font-mono">
                                                {entry.bingoLines} <span className="text-lg opacity-50">⌗</span>
                                            </div>
                                        </div>

                                        <div className="text-right w-24 hidden md:block">
                                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold font-mono">Tiles</span>
                                            <div className="text-xl font-bold text-foreground font-mono">
                                                <span className="text-primary">{entry.score}</span><span className="text-muted-foreground">/20</span>
                                            </div>
                                        </div>

                                        <div className="w-8 flex justify-center">
                                            {entry.isCompleted ? (
                                                <div className="bg-green-500 text-black p-1">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                            ) : (
                                                <div className="w-2 h-2 bg-border" />
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
