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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Bingo Quest
        </h1>
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-400">Enter your email to receive a magic link.</p>
          <Link href="/leaderboard" className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition-colors">
            <span className="opacity-50">🏆</span> Leaderboard
          </Link>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="bg-green-500/20 p-4 rounded-full">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h2 className="text-xl text-white font-semibold">Check your inbox!</h2>
            <p className="text-gray-400">We sent a magic link to <span className="text-white">{email}</span></p>

            {previewUrl && (
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-300 mb-2 uppercase tracking-wider font-bold">Dev Mode: Ethereal</p>
                <a
                  href={previewUrl}
                  target="_blank"
                  className="text-blue-400 underline hover:text-blue-300 text-sm"
                >
                  Open Simulated Email ↗
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Send Magic Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
