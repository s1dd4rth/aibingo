"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameComponent } from "@/lib/game-config";

interface BingoCardProps {
  component: GameComponent;
  status: 'locked' | 'unlocked' | 'completed';
  onUnlock: (id: string) => void;
  onComplete: (id: string) => void;
  index: number;
  [key: string]: unknown; // Allow other props like aria-label
}

export default function BingoCard({ component, status, onUnlock, onComplete, index, ...props }: BingoCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  const handleClick = () => {
    if (isLocked) return;

    if (status === 'unlocked') {
      onComplete(component.id);
    } else if (status === 'completed') {
      // If already completed, maybe allow un-completing or do nothing
      // For now, let's assume clicking a completed card does nothing or triggers onUnlock if it's meant to toggle
      // Based on the original `onClick` which was only active if `!isLocked`,
      // and the new `onUnlock` and `onComplete` props,
      // let's assume `onComplete` is called when an unlocked card is clicked,
      // and `onUnlock` is called if a completed card is clicked to revert it.
      // Or, if the intent is only to complete, then clicking a completed card does nothing.
      // Given the prompt, the most direct interpretation is that the button's `onClick`
      // should now decide between `onUnlock` and `onComplete` based on the current status.
      // Let's make it so clicking an unlocked card completes it, and clicking a completed card unlocks it.
      // This is a common pattern for toggle.
      onUnlock(component.id);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      onClick={handleClick}
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      disabled={isLocked}
      aria-disabled={isLocked}
      className={cn(
        "relative aspect-[4/5] p-5 flex flex-col justify-between text-left transition-all duration-200 group overflow-hidden border",
        // Base schematic style
        "bg-card border-border",

        // Interaction states
        !isLocked && "hover:border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer",

        // Locked State (Striped)
        isLocked && "opacity-60 cursor-not-allowed bg-[repeating-linear-gradient(45deg,var(--card),var(--card)_10px,var(--border)_10px,var(--border)_11px)]",

        // Completed State
        isCompleted && "bg-primary/10 border-primary"
      )}
      {...props}
    >
      {/* Header */}
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className={cn(
          "text-[10px] font-bold font-mono uppercase tracking-[0.1em] px-2 py-1 border",
          isLocked ? "bg-background border-border text-muted-foreground" :
            isCompleted ? "bg-primary text-primary-foreground border-primary" :
              "bg-background border-border text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors"
        )}>
          {component.period}
        </div>

        {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}

        {isCompleted && (
          <div className="bg-primary text-primary-foreground p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Check className="w-3.5 h-3.5" strokeWidth={4} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto">
        <div className={cn(
          "text-xs font-mono mb-2 flex items-center gap-2 uppercase",
          isCompleted ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"
        )}>
          <span className={cn("w-2 h-2 border border-current", isCompleted ? "bg-primary" : "bg-transparent group-hover:bg-primary transition-colors")}></span>
          {component.family}
        </div>
        <h3 className={cn(
          "text-xl font-bold leading-none tracking-tight font-sans uppercase",
          isCompleted ? "text-foreground" : "text-foreground group-hover:text-primary transition-colors"
        )}>
          {component.name}
        </h3>
      </div>
    </motion.button>
  );
}
