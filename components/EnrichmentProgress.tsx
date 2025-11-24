import { useMemo } from 'react';
import { CheckCircle2, Circle, Loader2, LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  MEDIUM: 'h-5 w-5',
} as const;

const CLASSES = {
  CONTAINER: 'space-y-6',
  PROGRESS_SECTION: 'space-y-2',
  PROGRESS_HEADER: 'flex items-center justify-between text-sm',
  PROGRESS_LABEL: 'font-medium',
  PROGRESS_VALUE: 'text-muted-foreground',
  PROGRESS_BAR_LARGE: 'h-2',
  PROGRESS_BAR_SMALL: 'h-1 mt-2',
  STEPS_LIST: 'space-y-4',
  STEP_BASE: 'flex items-start gap-3 p-4 rounded-lg border transition-all',
  STEP_IN_PROGRESS: 'border-primary bg-primary/5',
  STEP_COMPLETED: 'border-green-500/30 bg-green-500/5',
  STEP_ERROR: 'border-red-500/30 bg-red-500/5',
  STEP_PENDING: 'border-border/40 bg-background/50',
  ICON_WRAPPER: 'mt-0.5',
  ICON_IN_PROGRESS: 'text-primary animate-spin',
  ICON_COMPLETED: 'text-green-500',
  ICON_ERROR: 'text-red-500',
  ICON_PENDING: 'text-muted-foreground/40',
  STEP_CONTENT: 'flex-1 space-y-1',
  STEP_HEADER: 'flex items-center justify-between',
  STEP_LABEL: 'font-medium text-sm',
  STEP_PROGRESS: 'text-xs text-muted-foreground',
  STEP_MESSAGE: 'text-xs text-muted-foreground',
  FOOTER: 'text-center text-sm text-muted-foreground',
} as const;

const LABELS = {
  OVERALL_PROGRESS: 'Progresso Geral',
  STEP_COUNTER: (current: number, total: number) => `Etapa ${current + 1} de ${total}`,
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

export interface EnrichmentStep {
  id: string;
  label: string;
  status: StepStatus;
  message?: string;
  progress?: number;
}

export interface EnrichmentProgressProps {
  steps: EnrichmentStep[];
  currentStep: number;
  totalProgress: number;
}

interface StepIconConfig {
  icon: LucideIcon;
  className: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStepClasses(status: StepStatus): string {
  const statusClasses: Record<StepStatus, string> = {
    in_progress: CLASSES.STEP_IN_PROGRESS,
    completed: CLASSES.STEP_COMPLETED,
    error: CLASSES.STEP_ERROR,
    pending: CLASSES.STEP_PENDING,
  };

  return cn(CLASSES.STEP_BASE, statusClasses[status]);
}

function getStepIcon(status: StepStatus): StepIconConfig {
  const iconConfigs: Record<StepStatus, StepIconConfig> = {
    in_progress: {
      icon: Loader2,
      className: cn(ICON_SIZES.MEDIUM, CLASSES.ICON_IN_PROGRESS),
    },
    completed: {
      icon: CheckCircle2,
      className: cn(ICON_SIZES.MEDIUM, CLASSES.ICON_COMPLETED),
    },
    error: {
      icon: Circle,
      className: cn(ICON_SIZES.MEDIUM, CLASSES.ICON_ERROR),
    },
    pending: {
      icon: Circle,
      className: cn(ICON_SIZES.MEDIUM, CLASSES.ICON_PENDING),
    },
  };

  return iconConfigs[status];
}

function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

function shouldShowProgress(status: StepStatus, progress?: number): boolean {
  return status === 'in_progress' && progress !== undefined;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function OverallProgress({ totalProgress }: { totalProgress: number }) {
  const formattedProgress = useMemo(
    () => formatProgress(totalProgress),
    [totalProgress]
  );

  return (
    <div className={CLASSES.PROGRESS_SECTION}>
      <div className={CLASSES.PROGRESS_HEADER}>
        <span className={CLASSES.PROGRESS_LABEL}>{LABELS.OVERALL_PROGRESS}</span>
        <span className={CLASSES.PROGRESS_VALUE}>{formattedProgress}</span>
      </div>
      <Progress value={totalProgress} className={CLASSES.PROGRESS_BAR_LARGE} />
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  const iconConfig = useMemo(() => getStepIcon(status), [status]);
  const Icon = iconConfig.icon;

  return (
    <div className={CLASSES.ICON_WRAPPER}>
      <Icon className={iconConfig.className} />
    </div>
  );
}

function StepContent({ step }: { step: EnrichmentStep }) {
  const showProgress = useMemo(
    () => shouldShowProgress(step.status, step.progress),
    [step.status, step.progress]
  );

  return (
    <div className={CLASSES.STEP_CONTENT}>
      <div className={CLASSES.STEP_HEADER}>
        <h4 className={CLASSES.STEP_LABEL}>{step.label}</h4>
        {showProgress && (
          <span className={CLASSES.STEP_PROGRESS}>{step.progress}%</span>
        )}
      </div>

      {step.message && (
        <p className={CLASSES.STEP_MESSAGE}>{step.message}</p>
      )}

      {showProgress && (
        <Progress value={step.progress} className={CLASSES.PROGRESS_BAR_SMALL} />
      )}
    </div>
  );
}

function StepItem({ step }: { step: EnrichmentStep }) {
  const stepClasses = useMemo(() => getStepClasses(step.status), [step.status]);

  return (
    <div className={stepClasses}>
      <StepIcon status={step.status} />
      <StepContent step={step} />
    </div>
  );
}

function StepCounter({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const shouldShow = useMemo(
    () => currentStep < totalSteps,
    [currentStep, totalSteps]
  );

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={CLASSES.FOOTER}>
      {LABELS.STEP_COUNTER(currentStep, totalSteps)}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * EnrichmentProgress
 * 
 * Componente que exibe o progresso de um processo de enriquecimento em etapas.
 * Mostra progresso geral, status de cada etapa e mensagens de progresso.
 * 
 * @example
 * ```tsx
 * <EnrichmentProgress
 *   steps={steps}
 *   currentStep={2}
 *   totalProgress={65}
 * />
 * ```
 */
export function EnrichmentProgress({
  steps,
  currentStep,
  totalProgress,
}: EnrichmentProgressProps) {
  return (
    <div className={CLASSES.CONTAINER}>
      <OverallProgress totalProgress={totalProgress} />

      <div className={CLASSES.STEPS_LIST}>
        {steps.map((step) => (
          <StepItem key={step.id} step={step} />
        ))}
      </div>

      <StepCounter currentStep={currentStep} totalSteps={steps.length} />
    </div>
  );
}
