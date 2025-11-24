'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { cn } from '@/lib/utils';
import { AlertTriangle, RotateCcw } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  LARGE: 48,
  SMALL: 16,
} as const;

const CLASSES = {
  CONTAINER: 'flex items-center justify-center min-h-screen p-8 bg-background',
  CONTENT: 'flex flex-col items-center w-full max-w-2xl p-8',
  ICON: 'text-destructive mb-6 flex-shrink-0',
  TITLE: 'text-xl mb-4',
  ERROR_BOX: 'p-4 w-full rounded bg-muted overflow-auto mb-6',
  ERROR_TEXT: 'text-sm text-muted-foreground whitespace-break-spaces',
  BUTTON_BASE: 'flex items-center gap-2 px-4 py-2 rounded-lg',
  BUTTON_COLORS: 'bg-primary text-primary-foreground',
  BUTTON_HOVER: 'hover:opacity-90 cursor-pointer',
} as const;

const LABELS = {
  ERROR_TITLE: 'An unexpected error occurred.',
  RELOAD_BUTTON: 'Reload Page',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getButtonClasses(): string {
  return cn(
    CLASSES.BUTTON_BASE,
    CLASSES.BUTTON_COLORS,
    CLASSES.BUTTON_HOVER
  );
}

function handleReload(): void {
  window.location.reload();
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ErrorBoundary
 * 
 * Componente de classe que captura erros em qualquer lugar da árvore de componentes filhos,
 * registra esses erros e exibe uma UI de fallback em vez de quebrar toda a aplicação.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Log error para console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private renderErrorUI(): ReactNode {
    return (
      <div className={CLASSES.CONTAINER}>
        <div className={CLASSES.CONTENT}>
          <AlertTriangle
            size={ICON_SIZES.LARGE}
            className={CLASSES.ICON}
          />

          <h2 className={CLASSES.TITLE}>{LABELS.ERROR_TITLE}</h2>

          <div className={CLASSES.ERROR_BOX}>
            <pre className={CLASSES.ERROR_TEXT}>
              {this.state.error?.stack}
            </pre>
          </div>

          <button
            onClick={handleReload}
            className={getButtonClasses()}
          >
            <RotateCcw size={ICON_SIZES.SMALL} />
            {LABELS.RELOAD_BUTTON}
          </button>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
