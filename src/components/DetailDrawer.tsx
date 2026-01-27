import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, CheckCircle, Loader2, Lightbulb, BookOpen, Wrench, Copy, Check } from 'lucide-react';
import { GameComponent } from '@/lib/game-config';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCopy } from '@/lib/useCopy';

interface DetailDrawerProps {
  component: GameComponent | null;
  onClose: () => void;
  onComplete: () => void;
  status: 'locked' | 'unlocked' | 'completed';
  isCompleting?: boolean;
}

export default function DetailDrawer({ component, onClose, onComplete, status, isCompleting = false }: DetailDrawerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { copied, copy } = useCopy();
  const isCompleted = status === 'completed';

  // Reset tab when component changes
  if (component && activeTab >= (component.examples?.length || 0) && activeTab !== 0) {
    setActiveTab(0);
  }

  if (!component) return null;

  const handleAction = () => {
    if (isCompleted || status === 'locked') return;
    onComplete();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/90"
        />

        <motion.div
          layoutId={`card-${component.id}`}
          className="relative w-full max-w-2xl bg-card border-2 border-border shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className="p-6 border-b-2 border-border bg-muted/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-2 mb-2 font-mono uppercase text-xs">
                  <span className="font-bold px-2 py-1 border border-border bg-background text-muted-foreground">{component.period}</span>
                  <span className="font-bold px-2 py-1 border border-primary bg-primary/10 text-primary">{component.family}</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground font-sans uppercase tracking-tight">{component.name}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 font-mono">:: SYSTEM_DESCRIPTION</h3>
              <p className="text-foreground leading-relaxed text-lg border-l-4 border-primary/50 pl-4">{component.description}</p>
            </div>

            {(component.why || component.what || component.how) && (
              <div className="grid gap-4 sm:grid-cols-3">
                {component.why && (
                  <div className="bg-background p-4 border border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase text-sm font-mono">
                      <Lightbulb className="w-4 h-4" /> Why?
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{component.why}</p>
                  </div>
                )}
                {component.what && (
                  <div className="bg-background p-4 border border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-2 text-accent font-bold mb-2 uppercase text-sm font-mono">
                      <BookOpen className="w-4 h-4" /> What?
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{component.what}</p>
                  </div>
                )}
                {component.how && (
                  <div className="bg-background p-4 border border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-2 text-green-500 font-bold mb-2 uppercase text-sm font-mono">
                      <Wrench className="w-4 h-4" /> How?
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{component.how}</p>
                  </div>
                )}
              </div>
            )}

            {(component.examples || component.codeSnippet) && (
              <div className="bg-background border border-border">
                <div className="flex items-center justify-between border-b border-border px-2 bg-muted/10">
                  {component.examples ? (
                    <div className="flex gap-1 pt-2 px-2">
                      {component.examples.map((ex, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTab(idx)}
                          className={cn(
                            "px-4 py-2 text-xs font-bold font-mono uppercase transition-all border-t border-l border-r border-transparent",
                            activeTab === idx
                              ? "bg-background border-border border-b-background -mb-[1px] text-primary"
                              : "text-muted-foreground hover:bg-muted/20"
                          )}
                        >
                          {ex.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="px-4 py-3 text-xs font-mono font-bold uppercase text-muted-foreground">Python (Gemini SDK)</span>
                  )}

                  <button
                    onClick={() => copy(component.examples ? component.examples[activeTab].code : component.codeSnippet!)}
                    className="mr-2 text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-mono uppercase"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'COPIED' : 'COPY_CODE'}
                  </button>
                </div>

                <div className="p-4 overflow-x-auto bg-black/20">
                  {component.examples ? (
                    <div className="space-y-4">
                      {component.examples[activeTab].description && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-accent pl-3">
                          {`// ${component.examples[activeTab].description}`}
                        </p>
                      )}
                      <pre className="text-xs sm:text-sm font-mono text-foreground leading-relaxed">
                        <code>{component.examples[activeTab].code}</code>
                      </pre>
                    </div>
                  ) : (
                    <pre className="text-xs sm:text-sm font-mono text-foreground leading-relaxed">
                      <code>{component.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="flex items-center gap-2 font-bold text-accent mb-2 uppercase font-mono text-sm">
                <ExternalLink className="w-4 h-4" /> Learning_Resource
              </h4>
              {component.docUrl ? (
                <a
                  href={component.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent px-4 py-2 border border-accent/50 font-bold uppercase text-xs transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  ACCESS_DOCUMENTATION
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground font-mono">{`// DOCS_PENDING...`}</p>
              )}
            </div>
          </div>

          <div className="p-6 border-t-2 border-border bg-muted/10">
            {isCompleted ? (
              <div className="w-full bg-green-500/10 text-green-500 font-bold py-4 border border-green-500 flex items-center justify-center gap-2 uppercase tracking-wide">
                <CheckCircle className="w-5 h-5" /> Module_Verified
              </div>
            ) : (
              <button
                onClick={handleAction}
                disabled={isCompleting || status === 'locked'}
                className={cn(
                  "w-full py-4 font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wide border-2",
                  {
                    'bg-primary text-primary-foreground border-primary hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]': status === 'unlocked',
                    'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50': status === 'locked',
                  }
                )}
              >
                {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : status === 'locked' ? 'LOCKED [COMPLETE_PREV]' : 'MARK_AS_COMPLETE'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
