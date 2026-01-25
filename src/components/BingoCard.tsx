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
}

export default function BingoCard({ component, status, onClick, index }: BingoCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      aria-disabled={isLocked}
      className={cn(
        "relative aspect-[4/5] p-4 rounded-xl flex flex-col justify-between text-left transition-all duration-300 group overflow-hidden",
        isLocked
          ? "bg-white/5 border border-white/5 cursor-not-allowed opacity-50"
          : "bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 hover:scale-[1.02] cursor-pointer",
        isCompleted && "bg-green-500/10 border-green-500/30"
      )}
    >
      {/* Background Gradient for completed */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-50" />
      )}

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="text-xs uppercase tracking-wider font-semibold opacity-60">
          {component.period}
        </div>
        <div>
          {isLocked && <Lock className="w-4 h-4 opacity-40" />}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-green-500 text-black p-1 rounded-full"
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-xs text-purple-400 mb-1">{component.family}</div>
        <h3 className={cn("text-lg font-bold leading-tight", isCompleted ? "text-green-100" : "text-white")}>{component.name}</h3>
      </div>

      {/* Decorative */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
    </motion.button>
  );
}
