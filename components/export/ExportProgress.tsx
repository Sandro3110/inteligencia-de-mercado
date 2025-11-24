/**
 * ExportProgress Component
 * Export progress indicator
 * Server Component - does not require 'use client'
 */

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2, Clock, type LucideIcon } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type StepStatus = 'pending' | 'running' | 'completed';

interface ExportStep {
  label: string;
  status: StepStatus;
  duration?: number;
}

interface ExportProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: ExportStep[];
  elapsedTime: number;
  estimatedTime: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
  MEDIUM: 'w-5 h-5',
} as const;

const LABELS = {
  TITLE: 'Gerando Exportação...',
  SUBTITLE: 'Por favor aguarde enquanto processamos seus dados',
  PROGRESS_COMPLETED: '% concluído',
  STEP_LABEL: (current: number, total: number) => `Etapa ${current} de ${total}`,
  ELAPSED_TIME: 'Tempo decorrido:',
  REMAINING_TIME: 'Tempo restante: ~',
} as const;

const CLASSES = {
  CARD: 'p-6',
  CONTAINER: 'space-y-6',
  HEADER: 'text-center',
  TITLE: 'text-xl font-bold text-slate-900 mb-2',
  SUBTITLE: 'text-slate-600',
  PROGRESS_SECTION: 'space-y-2',
  PROGRESS_BAR: 'h-3',
  PROGRESS_INFO: 'flex justify-between text-sm text-slate-600',
  STEPS_CONTAINER: 'space-y-3',
  STEP_BASE: 'flex items-center gap-3 p-3 rounded-lg transition-colors',
  STEP_RUNNING: 'bg-blue-50 border border-blue-200',
  STEP_COMPLETED: 'bg-green-50',
  STEP_PENDING: 'bg-slate-50',
  STEP_ICON_CONTAINER: 'flex-shrink-0',
  STEP_LABEL_CONTAINER: 'flex-1',
  STEP_TEXT_RUNNING: 'text-blue-900',
  STEP_TEXT_COMPLETED: 'text-green-900',
  STEP_TEXT_PENDING: 'text-slate-500',
  STEP_DURATION: 'text-sm text-slate-600',
  PENDING_ICON: 'w-5 h-5 rounded-full border-2 border-slate-300',
  TIME_INFO: 'flex items-center justify-between pt-4 border-t border-slate-200',
  TIME_ROW: 'flex items-center gap-2 text-sm text-slate-600',
  TIME_TEXT: 'text-sm text-slate-600',
} as const;

const STATUS_COLORS = {
  running: {
    icon: 'text-blue-600',
    text: CLASSES.STEP_TEXT_RUNNING,
    container: CLASSES.STEP_RUNNING,
  },
  completed: {
    icon: 'text-green-600',
    text: CLASSES.STEP_TEXT_COMPLETED,
    container: CLASSES.STEP_COMPLETED,
  },
  pending: {
    icon: 'text-slate-300',
    text: CLASSES.STEP_TEXT_PENDING,
    container: CLASSES.STEP_PENDING,
  },
} as const;

const TIME_THRESHOLDS = {
  SECONDS_PER_MINUTE: 60,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format time in seconds to human-readable format
 */
function formatTime(seconds: number): string {
  if (seconds < TIME_THRESHOLDS.SECONDS_PER_MINUTE) {
    return `${Math.round(seconds)}s`;
  }
  
  const mins = Math.floor(seconds / TIME_THRESHOLDS.SECONDS_PER_MINUTE);
  const secs = Math.round(seconds % TIME_THRESHOLDS.SECONDS_PER_MINUTE);
  return `${mins}m ${secs}s`;
}

/**
 * Get step container CSS classes based on status
 */
function getStepClassName(status: StepStatus): string {
  return `${CLASSES.STEP_BASE} ${STATUS_COLORS[status].container}`;
}

/**
 * Get step text CSS classes based on status
 */
function getStepTextColor(status: StepStatus): string {
  return STATUS_COLORS[status].text;
}

/**
 * Calculate progress percentage
 */
function calculateProgress(currentStep: number, totalSteps: number): number {
  return (currentStep / totalSteps) * 100;
}

/**
 * Calculate remaining time
 */
function calculateRemainingTime(estimatedTime: number, elapsedTime: number): number {
  return Math.max(0, estimatedTime - elapsedTime);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Step icon component
 */
interface StepIconProps {
  status: StepStatus;
}

function StepIcon({ status }: StepIconProps) {
  const iconColor = STATUS_COLORS[status].icon;

  if (status === 'completed') {
    return <CheckCircle2 className={`${ICON_SIZES.MEDIUM} ${iconColor}`} />;
  }

  if (status === 'running') {
    return <Loader2 className={`${ICON_SIZES.MEDIUM} ${iconColor} animate-spin`} />;
  }

  return <div className={CLASSES.PENDING_ICON} />;
}

/**
 * Step item component
 */
interface StepItemProps {
  step: ExportStep;
}

function StepItem({ step }: StepItemProps) {
  return (
    <div className={getStepClassName(step.status)}>
      {/* Icon */}
      <div className={CLASSES.STEP_ICON_CONTAINER}>
        <StepIcon status={step.status} />
      </div>

      {/* Label */}
      <div className={CLASSES.STEP_LABEL_CONTAINER}>
        <span className={`font-medium ${getStepTextColor(step.status)}`}>{step.label}</span>
      </div>

      {/* Duration */}
      {step.duration && (
        <span className={CLASSES.STEP_DURATION}>{formatTime(step.duration)}</span>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Display export progress with steps and time estimates
 */
export default function ExportProgress({
  currentStep,
  totalSteps,
  steps,
  elapsedTime,
  estimatedTime,
}: ExportProgressProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const progress = useMemo(
    () => calculateProgress(currentStep, totalSteps),
    [currentStep, totalSteps]
  );

  const remainingTime = useMemo(
    () => calculateRemainingTime(estimatedTime, elapsedTime),
    [estimatedTime, elapsedTime]
  );

  const progressPercentage = useMemo(() => Math.round(progress), [progress]);

  const stepLabel = useMemo(
    () => LABELS.STEP_LABEL(currentStep, totalSteps),
    [currentStep, totalSteps]
  );

  const formattedElapsedTime = useMemo(() => formatTime(elapsedTime), [elapsedTime]);

  const formattedRemainingTime = useMemo(() => formatTime(remainingTime), [remainingTime]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className={CLASSES.CARD}>
      <div className={CLASSES.CONTAINER}>
        {/* Header */}
        <div className={CLASSES.HEADER}>
          <h3 className={CLASSES.TITLE}>{LABELS.TITLE}</h3>
          <p className={CLASSES.SUBTITLE}>{LABELS.SUBTITLE}</p>
        </div>

        {/* Progress Bar */}
        <div className={CLASSES.PROGRESS_SECTION}>
          <Progress value={progress} className={CLASSES.PROGRESS_BAR} />
          <div className={CLASSES.PROGRESS_INFO}>
            <span>
              {progressPercentage}
              {LABELS.PROGRESS_COMPLETED}
            </span>
            <span>{stepLabel}</span>
          </div>
        </div>

        {/* Steps */}
        <div className={CLASSES.STEPS_CONTAINER}>
          {steps.map((step, index) => (
            <StepItem key={index} step={step} />
          ))}
        </div>

        {/* Time Info */}
        <div className={CLASSES.TIME_INFO}>
          <div className={CLASSES.TIME_ROW}>
            <Clock className={ICON_SIZES.SMALL} />
            <span>
              {LABELS.ELAPSED_TIME} {formattedElapsedTime}
            </span>
          </div>
          <div className={CLASSES.TIME_TEXT}>
            {LABELS.REMAINING_TIME}
            {formattedRemainingTime}
          </div>
        </div>
      </div>
    </Card>
  );
}
