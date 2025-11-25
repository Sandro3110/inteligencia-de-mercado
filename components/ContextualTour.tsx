'use client';

import { useEffect, useCallback, useMemo } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS, Styles, Locale } from 'react-joyride';
import { useTour, TourType, TOURS } from '@/hooks/useTour';

// ============================================================================
// CONSTANTS
// ============================================================================

const TIMING = {
  AUTO_START_DELAY: 500,
} as const;

const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
} as const;

const Z_INDEX = {
  TOUR: 10000,
} as const;

const SPACING = {
  BUTTON_PADDING: '8px 16px',
  BUTTON_MARGIN: 8,
} as const;

const BORDER_RADIUS = {
  TOOLTIP: 8,
  BUTTON: 6,
} as const;

const FONT_SIZE = {
  TOOLTIP: 14,
} as const;

const JOYRIDE_STYLES: Partial<Styles> = {
  options: {
    primaryColor: COLORS.PRIMARY,
    zIndex: Z_INDEX.TOUR,
  },
  tooltip: {
    borderRadius: BORDER_RADIUS.TOOLTIP,
    fontSize: FONT_SIZE.TOOLTIP,
  },
  buttonNext: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.BUTTON,
    padding: SPACING.BUTTON_PADDING,
  },
  buttonBack: {
    color: COLORS.SECONDARY,
    marginRight: SPACING.BUTTON_MARGIN,
  },
  buttonSkip: {
    color: COLORS.SECONDARY,
  },
} as const;

const JOYRIDE_LOCALE: Locale = {
  back: 'Voltar',
  close: 'Fechar',
  last: 'Finalizar',
  next: 'Próximo',
  open: 'Abrir',
  skip: 'Pular tour',
} as const;

const FINISHED_STATUSES = [STATUS.FINISHED, STATUS.SKIPPED] as const;

const LABELS = {
  START_TOUR: 'Iniciar Tour',
  REPEAT_TOUR: 'Repetir Tour',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface ContextualTourProps {
  tourId: TourType;
  autoStart?: boolean;
  onComplete?: () => void;
}

interface TourButtonProps {
  tourId: TourType;
  children?: React.ReactNode;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isTourFinished(status: string): boolean {
  return FINISHED_STATUSES.includes(status as (typeof FINISHED_STATUSES)[number]);
}

function getButtonLabel(hasCompleted: boolean): string {
  return hasCompleted ? LABELS.REPEAT_TOUR : LABELS.START_TOUR;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ContextualTour
 * 
 * Componente reutilizável para tours contextuais usando react-joyride.
 * 
 * @example
 * ```tsx
 * <ContextualTour tourId="project-creation" autoStart />
 * ```
 */
export function ContextualTour({
  tourId,
  autoStart = false,
  onComplete,
}: ContextualTourProps) {
  // Hooks
  const { isRunning, hasCompleted, startTour, completeTour } = useTour(tourId);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const steps = useMemo(() => TOURS[tourId]?.steps || [], [tourId]);

  const shouldRender = useMemo(
    () => steps && !hasCompleted,
    [steps, hasCompleted]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type } = data;

      if (isTourFinished(status)) {
        completeTour();
        onComplete?.();
      }

      // Log para debug
      if (type === EVENTS.TARGET_NOT_FOUND) {
        console.warn(`[Tour ${tourId}] Target not found:`, data.step.target);
      }
    },
    [tourId, completeTour, onComplete]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (autoStart && !hasCompleted) {
      // Delay para garantir que elementos estejam renderizados
      const timer = setTimeout(() => {
        startTour();
      }, TIMING.AUTO_START_DELAY);

      return () => clearTimeout(timer);
    }
  }, [autoStart, hasCompleted, startTour]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!shouldRender) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={JOYRIDE_STYLES}
      locale={JOYRIDE_LOCALE}
    />
  );
}

// ============================================================================
// TOUR BUTTON COMPONENT
// ============================================================================

/**
 * TourButton
 * 
 * Botão para iniciar ou repetir um tour manualmente.
 * 
 * @example
 * ```tsx
 * <TourButton tourId="project-creation">Ver Tutorial</TourButton>
 * ```
 */
export function TourButton({ tourId, children, className }: TourButtonProps) {
  // Hooks
  const { startTour, resetTour, hasCompleted } = useTour(tourId);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const buttonLabel = useMemo(
    () => getButtonLabel(hasCompleted),
    [hasCompleted]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleClick = useCallback(() => {
    if (hasCompleted) {
      resetTour();
    }
    startTour();
  }, [hasCompleted, resetTour, startTour]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <button onClick={handleClick} className={className}>
      {children || buttonLabel}
    </button>
  );
}
