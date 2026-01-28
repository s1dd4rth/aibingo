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
  variant?: 'default' | 'bonus';
  [key: string]: unknown;
}

export default function BingoCard({ component, status, onUnlock, onComplete, index, variant = 'default', ...props }: BingoCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isBonus = variant === 'bonus';

  // dynamic colors
  const primaryColor = isBonus ? 'text-[#00ff00]' : 'text-primary';
  const borderColor = isBonus ? 'border-[#00ff00]' : 'border-primary';
  const bgColor = isBonus ? 'bg-[#00ff00]' : 'bg-primary';
  const bgColorLight = isBonus ? 'bg-[#00ff00]/10' : 'bg-primary/10';

  const handleClick = () => {
    if (isLocked) return;

    if (status === 'unlocked') {
      // For consistency, clicking unlocked opens details (handled by parent usually via onUnlock/selected)
      // Wait, current BingoCard calls onComplete directly?
      // In BingoGrid: onUnlock={() => setSelectedComponentId(componentId)}
      // In BingoCard logic (previous file view):
      // if unlocked -> onComplete (Line 25) ?
      // if completed -> onUnlock (Line 38) ?

      // This seems weird. "onUnlock" usually implies "Open Details". "onComplete" implies "Mark Done".
      // In BingoGrid: 
      // onUnlock leads to `setSelectedComponentId` (Open Drawer).
      // onComplete leads to `handleComplete` (Mark Done).

      // The previous BingoCard logic (Lines 24-39 in viewed file) was:
      // if unlocked -> onComplete(id)
      // This effectively bypassed the drawer if passing handleComplete directly!
      // But BingoGrid passes:
      // onUnlock={() => setSelectedComponentId(componentId)}
      // onComplete={() => handleComplete(componentId)}

      // If BingoCard calls onComplete when unlocked, it marks it complete directly?
      // That contradicts "Open Drawer".
      // The user complained "it's not reflecting...".
      // Wait, did I misread BingoCard logic?

      // Let's look at Line 24 in BingoCard.tsx:
      // if (status === 'unlocked') { onComplete(component.id); }

      // If BingoGrid passes `handleComplete` to `onComplete`, then clicking an unlocked card IMMEDIATELY completes it without drawer?
      // But BingoGrid HAS a DetailDrawer. How is it opened?
      // Maybe onUnlock is used for opening drawer?

      // If status is UNLOCKED, we want to OPEN DRAWER.
      // So we should call `onUnlock` (which sets selection).

      // Existing code:
      // if (status === 'unlocked') onComplete(component.id)

      // This seems WRONG if we want to open drawer.
      // But maybe `onComplete` passed from BingoGrid IS opening the drawer?
      // In BingoGrid.tsx (viewed in Step 1136):
      // onUnlock={() => setSelectedComponentId(componentId)}
      // onComplete={() => handleComplete(componentId)}

      // `handleComplete` calls server action.
      // So clicking unlocked card -> Marks it complete immediately!
      // The Drawer is only accessible if... ?
      // Maybe the user CANNOT access drawer for Core cards right now?
      // That would be a huge UX gap.

      // BUT the user request said "Both bingo cards and bonus card should work in the same way".
      // Bonus cards (my implementation) OPEN DRAWER.
      // Core cards (existing implementation) apparently COMPLETE IMMEDIATELY?
      // If so, I should fix Core cards to OPEN DRAWER too!

      // Let's swap the logic in `BingoCard` to match desired behavior.
      // Unlocked -> Open Details (onUnlock/onSelect).
      // Unlocked -> onUnlock.

      onUnlock(component.id);
    } else if (status === 'completed') {
      // If completed, maybe view details again?
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
        "bg-card border-border", // Base
        !isLocked && `hover:${borderColor} hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] cursor-pointer`,
        isLocked && "opacity-60 cursor-not-allowed bg-[repeating-linear-gradient(45deg,var(--card),var(--card)_10px,var(--border)_10px,var(--border)_11px)]",
        isCompleted && `${bgColorLight} ${borderColor}`
      )}
      {...props}
    >
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className={cn(
          "text-[10px] font-bold font-mono uppercase tracking-[0.1em] px-2 py-1 border",
          isLocked ? "bg-background border-border text-muted-foreground" :
            isCompleted ? `${bgColor} text-white ${borderColor}` : // Assuming generic white text for filled chips
              `bg-background border-border text-muted-foreground group-hover:${borderColor} group-hover:${primaryColor} transition-colors`
        )}>
          {component.period}
        </div>

        {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}

        {isCompleted && (
          <div className={`${bgColor} text-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            <Check className="w-3.5 h-3.5" strokeWidth={4} />
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        <div className={cn(
          "text-xs font-mono mb-2 flex items-center gap-2 uppercase",
          isCompleted ? primaryColor : "text-muted-foreground group-hover:text-foreground transition-colors"
        )}>
          <span className={cn("w-2 h-2 border border-current", isCompleted ? bgColor : `bg-transparent group-hover:${bgColor} transition-colors`)}></span>
          {component.family}
        </div>
        <h3 className={cn(
          "text-xl font-bold leading-none tracking-tight font-sans uppercase",
          isCompleted ? "text-foreground" : "text-foreground group-hover:text-foreground transition-colors"
        )}>
          {component.name}
        </h3>

        {/* Bonus Points Indicator */}
        {isBonus && component.bonusPoints && (
          <div className="mt-2 text-[10px] font-bold text-[#00ff00]">
            +{component.bonusPoints} PTS
          </div>
        )}
      </div>
    </motion.button>
  );
}
