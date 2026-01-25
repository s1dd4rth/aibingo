"use client";

import { useState } from 'react';

/**
 * Hook for copy-to-clipboard functionality.
 *
 * @returns {object} - copied flag and copy function.
 * @example
 * const { copied, copy } = useCopy();
 * <button onClick={() => copy(text)}>Copy</button>
 */
export function useCopy<T extends string | undefined>() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: T) => {
    if (!text) return;
    await navigator.clipboard.writeText(text as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copy };
}
