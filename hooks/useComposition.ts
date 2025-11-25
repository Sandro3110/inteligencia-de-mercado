"use client";

import { useState, useCallback } from "react";

interface CompositionState {
  isComposing: boolean;
  compositionValue: string;
}

export function useComposition() {
  const [state, setState] = useState<CompositionState>({
    isComposing: false,
    compositionValue: "",
  });

  const handleCompositionStart = useCallback(() => {
    setState((prev) => ({ ...prev, isComposing: true }));
  }, []);

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent<HTMLInputElement>) => {
    setState((prev) => ({
      ...prev,
      compositionValue: event.currentTarget.value,
    }));
  }, []);

  const handleCompositionEnd = useCallback((event: React.CompositionEvent<HTMLInputElement>) => {
    setState({
      isComposing: false,
      compositionValue: event.currentTarget.value,
    });
  }, []);

  return {
    isComposing: state.isComposing,
    compositionValue: state.compositionValue,
    compositionHandlers: {
      onCompositionStart: handleCompositionStart,
      onCompositionUpdate: handleCompositionUpdate,
      onCompositionEnd: handleCompositionEnd,
    },
  };
}
