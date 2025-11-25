"use client";

import { useState, useCallback } from 'react';

/**
 * Hook to handle IME (Input Method Editor) composition events
 * Useful for handling CJK (Chinese, Japanese, Korean) input
 */
export function useComposition<T extends HTMLElement = HTMLElement>(options?: {
  onKeyDown?: (event: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (event: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (event: React.CompositionEvent<T>) => void;
}) {
  const [isComposing, setIsComposing] = useState(false);

  const onCompositionStart = useCallback(
    (event: React.CompositionEvent<T>) => {
      setIsComposing(true);
      options?.onCompositionStart?.(event);
    },
    [options]
  );

  const onCompositionEnd = useCallback(
    (event: React.CompositionEvent<T>) => {
      setIsComposing(false);
      options?.onCompositionEnd?.(event);
    },
    [options]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<T>) => {
      if (!isComposing) {
        options?.onKeyDown?.(event);
      }
    },
    [options, isComposing]
  );

  return {
    isComposing,
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
  };
}
