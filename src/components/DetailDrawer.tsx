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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          layoutId={`card-${component.id}`}
          className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white/80">{component.period}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-300">{component.family}</span>
                </div>
                <h2 className="text-3xl font-bold text-white">{component.name}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed text-lg">{component.description}</p>
            </div>

            {(component.why || component.what || component.how) && (
              <div className="grid gap-4 sm:grid-cols-3">
                {component.why && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold mb-2">
                      <Lightbulb className="w-4 h-4" /> Why?
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{component.why}</p>
                  </div>
                )}
                {component.what && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                      <BookOpen className="w-4 h-4" /> What?
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{component.what}</p>
                  </div>
                )}
                {component.how && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                      <Wrench className="w-4 h-4" /> How?
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{component.how}</p>
                  </div>
                )}
              </div>
            )}

            {(component.examples || component.codeSnippet) && (
              <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-white/10">
                <div className="flex items-center justify-between bg-white/5 border-b border-white/10 px-2">
                  {component.examples ? (
                    <div className="flex">
                      {component.examples.map((ex, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTab(idx)}
                          className={cn(
                            "px-4 py-3 text-xs font-medium transition-colors relative",
                            activeTab === idx
                              ? "text-blue-400"
                              : "text-gray-400 hover:text-gray-200"
                          )}
                        >
                          {ex.title}
                          {activeTab === idx && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="px-4 py-3 text-xs font-mono text-gray-400">Python (Gemini SDK)</span>
                  )}

                  <button
                    onClick={() => copy(component.examples ? component.examples[activeTab].code : component.codeSnippet!)}
                    className="mr-2 text-xs flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="p-4 overflow-x-auto">
                  {component.examples ? (
                    <div className="space-y-4">
                      {component.examples[activeTab].description && (
                        <p className="text-xs text-gray-400 italic border-l-2 border-white/10 pl-3">
                          {component.examples[activeTab].description}
                        </p>
                      )}
                      <pre className="text-xs sm:text-sm font-mono text-blue-100 leading-relaxed">
                        <code>{component.examples[activeTab].code}</code>
                      </pre>
                    </div>
                  ) : (
                    <pre className="text-xs sm:text-sm font-mono text-blue-100 leading-relaxed">
                      <code>{component.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="flex items-center gap-2 font-semibold text-blue-300 mb-2">
                <ExternalLink className="w-4 h-4" /> Learning Resource
              </h4>
              {component.colabUrl ? (
                <a
                  href={component.colabUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block transition-transform hover:scale-105"
                >
                  <img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open in Colab" className="h-8" />
                </a>
              ) : (
                <p className="text-sm text-blue-200/80">Follow the workshop guide to learn about {component.name}. content loaded.</p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-[#0f0f0f]">
            {isCompleted ? (
              <div className="w-full bg-green-500/20 text-green-400 font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-green-500/30">
                <CheckCircle className="w-5 h-5" /> Module Completed
              </div>
            ) : (
              <button
                onClick={handleAction}
                disabled={isCompleting || status === 'locked'}
                className={cn(
                  "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/20",
                  {
                    'bg-white text-black hover:bg-gray-200': status === 'unlocked',
                    'bg-gray-800 text-gray-500 cursor-not-allowed': status === 'locked',
                  }
                )}
              >
                {isCompleting ? <Loader2 className="w-5 h-5 animate-spin" /> : status === 'locked' ? 'Locked (Complete Previous Modules)' : 'Mark as Complete'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
