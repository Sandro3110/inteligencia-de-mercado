#!/usr/bin/env python3
"""
Script para adicionar exports wrapper nos componentes dimensionais
"""

import os

# LoadingState wrapper
loading_state_wrapper = """
// ============================================================================
// LOADING STATE WRAPPER
// ============================================================================

export const LoadingState = {
  Spinner: LoadingSpinner,
  Progress: LoadingProgress,
  SkeletonCard,
  SkeletonTable,
  SkeletonKPIGrid,
  SkeletonMap,
  SkeletonChart,
  FullPage: FullPageLoading,
  Inline: InlineLoading,
};

export default LoadingState;
"""

# ErrorState wrapper
error_state_wrapper = """
// ============================================================================
// ERROR STATE WRAPPER
// ============================================================================

export const ErrorState = {
  Alert: ErrorAlert,
  Empty: EmptyState,
  Boundary: ErrorBoundaryFallback,
  NoResults,
  Connection: ConnectionError,
  Permission: PermissionError,
};

export default ErrorState;
"""

# Adicionar wrappers
with open('client/src/components/dimensional/LoadingState.tsx', 'a') as f:
    f.write(loading_state_wrapper)

with open('client/src/components/dimensional/ErrorState.tsx', 'a') as f:
    f.write(error_state_wrapper)

print("Exports wrapper adicionados com sucesso!")
