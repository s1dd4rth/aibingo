"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameComponent } from "@/lib/game-config";

interface BingoCardProps {
  component: GameComponent;
  status: 'locked' | 'unlocked' | 'completed';
  onClick: () => void;
  index: number;
  [key: string]: any; // Allow other props like aria-label
}

export default function BingoCard({ component, status, onClick, index, ...props }: BingoCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      aria-disabled={isLocked}
      className={cn(
        "relative aspect-[4/5] p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-500 group overflow-hidden border",
        isLocked
          ? "bg-zinc-900/50 border-white/5 cursor-not-allowed opacity-60 grayscale-[0.5]"
          : "bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] hover:-translate-y-1 cursor-pointer",
        isCompleted && "bg-gradient-to-br from-green-950/40 to-emerald-900/20 border-green-500/30"
      )}
      {...props}
    >
      {/* Background Effects */}
      {!isLocked && !isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      {isCompleted && (
        <>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-50" />
        </>
      )}

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full border backdrop-blur-md",
          isLocked ? "bg-white/5 border-white/5 text-zinc-500" :
            isCompleted ? "bg-green-500/20 border-green-500/30 text-green-300" :
              "bg-white/5 border-white/10 text-zinc-400 group-hover:border-purple-500/30 group-hover:text-purple-300 transition-colors"
        )}>
          {component.period}
        </div>

        {isLocked && <Lock className="w-4 h-4 text-zinc-600" />}

        {isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-green-500 text-black p-1.5 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto">
        <div className={cn(
          "text-xs font-medium mb-2 flex items-center gap-2",
          isCompleted ? "text-green-400" : "text-zinc-500 group-hover:text-purple-400 transition-colors"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", isCompleted ? "bg-green-400" : "bg-zinc-600 group-hover:bg-purple-400 transition-colors")}></span>
          {component.family}
        </div>
        <h3 className={cn(
          "text-xl font-bold leading-tight tracking-tight",
          isCompleted ? "text-green-100" : "text-white group-hover:text-white transition-colors"
        )}>
          {component.name}
        </h3>
      </div>

      {/* Decorative Glow */}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[60px] transition-all duration-500",
        isCompleted ? "bg-green-500/20" : "bg-purple-600/10 group-hover:bg-purple-600/20 group-hover:blur-[80px]"
      )} />

    </motion.button>
  );
}
