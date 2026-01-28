import Link from 'next/link';
import { cn } from "@/lib/utils";

interface BrandHeaderProps {
    title?: string;
    rightElement?: React.ReactNode;
    className?: string;
}

export default function BrandHeader({ title, rightElement, className }: BrandHeaderProps) {
    return (
        <header className={cn(
            "flex items-center justify-between px-6 py-4 border-b border-border bg-background sticky top-0 z-50",
            className
        )}>
            <div className="flex items-center gap-4">
                <Link href="/" className="group flex flex-col">
                    <div className="text-[10px] font-mono text-accent uppercase tracking-wider group-hover:text-accent/80 transition-colors">
                        Authentication Protocol
                    </div>
                    <div className="text-xl font-bold text-foreground font-sans tracking-tight">
                        AI BINGO<span className="text-primary">.QUEST</span>
                    </div>
                </Link>

                {title && (
                    <>
                        <div className="h-8 w-px bg-border mx-2" />
                        <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest pt-1">
                            {title}
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4">
                {rightElement}
            </div>
        </header>
    );
}
