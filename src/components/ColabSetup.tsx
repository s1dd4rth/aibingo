"use client";

import { motion } from 'framer-motion';
import { Terminal, Copy, Check } from 'lucide-react';
import { useCopy } from '@/lib/useCopy';

export default function ColabSetup() {
  const { copied, copy } = useCopy();
  const setupCommand = `# 1. Install SDK
!pip install -q -U google-genai

# 2. Configure Client
from google import genai
from google.colab import userdata

# Set your key in Colab Secrets (left sidebar key icon)
api_key = userdata.get('GOOGLE_API_KEY')
client = genai.Client(api_key=api_key)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <Terminal className="w-4 h-4" />
            <span className="text-sm">Quick Setup</span>
          </div>
          <span className="text-xs text-gray-500 hidden sm:block">Run this in your first Colab cell</span>
        </div>

        <div className="relative group">
          <button
            onClick={() => copy(setupCommand)}
            className="absolute right-4 top-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-gray-300 hover:text-white transition-all active:scale-95 border border-white/5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <div className="p-4 overflow-x-auto bg-[#0d1117]">
            <pre className="font-mono text-sm text-blue-100 leading-relaxed">
              <code>{setupCommand}</code>
            </pre>
          </div>
        </div>
        <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20 text-xs text-yellow-200/80 flex items-start gap-2">
          <span>⚠️</span>
          <span>You may see a red dependency error regarding <code>google-auth</code>. It is safe to ignore for this workshop.</span>
        </div>
      </div>
    </motion.div>
  );
}
