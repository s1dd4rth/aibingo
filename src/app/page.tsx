'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { sendMagicLink } from '@/actions/auth'; // Updated import
import { Loader2, ArrowRight, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | false | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Call sendMagicLink with minimal payload (types adjusted)
    const res = await sendMagicLink({ email });

    if (res.success) {
      setSuccess(true);
      if (res.previewUrl) {
        setPreviewUrl(res.previewUrl);
      }
    } else {
      setError(res.error || 'Failed to send link');
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full schematic-card p-8 bg-card relative"
      >
        <div className="flex flex-col gap-2 mb-8">
          <div className="text-xs font-mono text-accent uppercase tracking-wider">Authentication Protocol</div>
          <h1 className="text-4xl font-bold text-foreground">
            AI BINGO<span className="text-primary">.QUEST</span>
          </h1>
        </div>

        <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <p className="text-muted-foreground font-mono text-xs">ESTABLISH_CONNECTION</p>
          <Link href="/leaderboard" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-mono uppercase">
            <span className="opacity-50">🏆</span> Leaderboard_View
          </Link>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="bg-primary/10 border border-primary p-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl text-foreground font-bold uppercase tracking-tight">Transmission Sent</h2>
              <p className="text-muted-foreground font-mono text-sm">Target: <span className="text-foreground border-b border-primary">{email}</span></p>
            </div>

            {previewUrl && (
              <div className="mt-4 p-4 border border-dashed border-accent/50 bg-accent/5">
                <p className="text-xs text-accent mb-2 uppercase tracking-wider font-bold">Dev Mode: Ethereal</p>
                <a
                  href={previewUrl}
                  target="_blank"
                  className="text-accent hover:text-accent/80 underline text-sm font-mono block"
                >
                  [OPEN_SIMULATED_EMAIL] ↗
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono uppercase text-muted-foreground">User_Identity</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                placeholder="USER@DOMAIN.EXT"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-destructive font-mono text-xs bg-destructive/10 p-3 border border-destructive"
              >
                ERROR: {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full schematic-btn py-3 flex items-center justify-center gap-2",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  INITIATE_MAGIC_LINK <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
