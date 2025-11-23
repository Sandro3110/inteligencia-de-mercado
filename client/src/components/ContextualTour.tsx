import Joyride, { CallBackProps, STATUS, EVENTS } from "react-joyride";
import { useTour, TourType, TOURS } from "@/hooks/useTour";
import { useEffect } from "react";

interface ContextualTourProps {
  tourId: TourType;
  autoStart?: boolean;
  onComplete?: () => void;
}

/**
 * Componente reutilizável para tours contextuais
 *
 * Uso:
 * ```tsx
 * <ContextualTour tourId="project-creation" autoStart />
 * ```
 */
export function ContextualTour({
  tourId,
  autoStart = false,
  onComplete,
}: ContextualTourProps) {
  const { isRunning, hasCompleted, startTour, completeTour } = useTour(tourId);

  useEffect(() => {
    if (autoStart && !hasCompleted) {
      // Delay para garantir que elementos estejam renderizados
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasCompleted, startTour]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      completeTour();
      onComplete?.();
    }

    // Log para debug
    if (type === EVENTS.TARGET_NOT_FOUND) {
      console.warn(`[Tour ${tourId}] Target not found:`, data.step.target);
    }
  };

  const steps = TOURS[tourId];

  if (!steps || hasCompleted) {
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
      styles={{
        options: {
          primaryColor: "#3b82f6",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 14,
        },
        buttonNext: {
          backgroundColor: "#3b82f6",
          borderRadius: 6,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "#64748b",
          marginRight: 8,
        },
        buttonSkip: {
          color: "#64748b",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        open: "Abrir",
        skip: "Pular tour",
      }}
    />
  );
}

/**
 * Botão para iniciar tour manualmente
 */
interface TourButtonProps {
  tourId: TourType;
  children?: React.ReactNode;
  className?: string;
}

export function TourButton({ tourId, children, className }: TourButtonProps) {
  const { startTour, resetTour, hasCompleted } = useTour(tourId);

  const handleClick = () => {
    if (hasCompleted) {
      resetTour();
    }
    startTour();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children || (hasCompleted ? "Repetir Tour" : "Iniciar Tour")}
    </button>
  );
}
