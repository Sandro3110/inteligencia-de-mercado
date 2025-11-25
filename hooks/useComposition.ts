"use client";

import { useState, useCallback } from "react";

interface CompositionState {
  isComposing: boolean;
  compositionValue: string;
}

interface UseCompositionOptions<T extends HTMLElement> {
  onKeyDown?: (event: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (event: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (event: React.CompositionEvent<T>) => void;
}

interface UseCompositionReturn<T extends HTMLElement> {
  isComposing: boolean;
  compositionValue: string;
  onKeyDown: (event: React.KeyboardEvent<T>) => void;
  onCompositionStart: (event: React.CompositionEvent<T>) => void;
  onCompositionEnd: (event: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement>(
  options: UseCompositionOptions<T> = {}
): UseCompositionReturn<T> {
  const [state, setState] = useState<CompositionState>({
    isComposing: false,
    compositionValue: "",
  });

  const handleCompositionStart = useCallback(
    (event: React.CompositionEvent<T>) => {
      setState((prev) => ({ ...prev, isComposing: true }));
      options.onCompositionStart?.(event);
    },
    [options]
  );

  const handleCompositionEnd = useCallback(
    (event: React.CompositionEvent<T>) => {
      setState({
        isComposing: false,
        compositionValue: (event.target as HTMLInputElement | HTMLTextAreaElement).value,
      });
      options.onCompositionEnd?.(event);
    },
    [options]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<T>) => {
      options.onKeyDown?.(event);
    },
    [options]
  );

  return {
    isComposing: state.isComposing,
    compositionValue: state.compositionValue,
    onKeyDown: handleKeyDown,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  };
}
