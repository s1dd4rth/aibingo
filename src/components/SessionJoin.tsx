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
        <div className="schematic-card p-6 space-y-4">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 border border-primary">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Live Workshop_Session</h3>
                    <p className="text-muted-foreground text-xs font-mono">
                        {isInSession
                            ? `STATUS: CONNECTED >> ${currentSession}`
                            : "INPUT SESSION_CODE TO INITIATE LINK"}
                    </p>
                </div>
            </div>

            {!isInSession && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="CODE_INPUT (e.g., ABC123)"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="flex-1 bg-input border border-border px-4 py-2 text-foreground uppercase font-mono tracking-wider focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        />
                        <button
                            onClick={handleJoin}
                            disabled={isLoading || !code || code.length !== 6}
                            className="schematic-btn px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                            {isLoading ? '...' : <><LogIn className="w-4 h-4" /> LINK</>}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive p-2 text-destructive text-xs font-mono">
                            ERROR: {error}
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground font-mono">
                        NO_CODE? REQUEST_FROM_FACILITATOR OR{' '}
                        <Link href="/facilitator" className="text-primary hover:underline uppercase">
                            [CREATE_SESSION]
                        </Link>
                    </div>
                </div>
            )}

            {isInSession && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 text-xs font-mono uppercase">
                            ● LINK_ESTABLISHED
                        </div>
                    </div>
                    <Link
                        href="/leaderboard"
                        className="text-sm text-primary hover:text-primary/80 underline flex items-center gap-1 font-mono uppercase"
                    >
                        <span className="opacity-70">🏆</span> Leaderboard_View
                    </Link>
                </div>
            )}
        </div>
    );
}
