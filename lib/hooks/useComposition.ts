import { useRef, useCallback } from 'react';

/**
 * Hook to handle IME (Input Method Editor) composition events
 * Useful for handling CJK (Chinese, Japanese, Korean) input
 */
export function useComposition<T extends HTMLElement = HTMLElement>(options?: {
  onKeyDown?: (event: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (event: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (event: React.CompositionEvent<T>) => void;
}) {
  const isComposingRef = useRef(false);

  const onCompositionStart = useCallback(
    (event: React.CompositionEvent<T>) => {
      isComposingRef.current = true;
      options?.onCompositionStart?.(event);
    },
    [options]
  );

  const onCompositionEnd = useCallback(
    (event: React.CompositionEvent<T>) => {
      isComposingRef.current = false;
      options?.onCompositionEnd?.(event);
    },
    [options]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<T>) => {
      if (!isComposingRef.current) {
        options?.onKeyDown?.(event);
      }
    },
    [options]
  );

  return {
    isComposing: isComposingRef.current,
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
  };
}
