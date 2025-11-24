/**
 * Indicador de progresso de exportação
 * Server Component - não requer 'use client'
 */

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Loader2, Clock } from 'lucide-react';

interface ExportStep {
  label: string;
  status: 'pending' | 'running' | 'completed';
  duration?: number;
}

interface ExportProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: ExportStep[];
  elapsedTime: number;
  estimatedTime: number;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

function getStepClassName(status: ExportStep['status']): string {
  const baseClass = 'flex items-center gap-3 p-3 rounded-lg transition-colors';
  
  switch (status) {
    case 'running':
      return `${baseClass} bg-blue-50 border border-blue-200`;
    case 'completed':
      return `${baseClass} bg-green-50`;
    default:
      return `${baseClass} bg-slate-50`;
  }
}

function getStepTextColor(status: ExportStep['status']): string {
  switch (status) {
    case 'running':
      return 'text-blue-900';
    case 'completed':
      return 'text-green-900';
    default:
      return 'text-slate-500';
  }
}

export default function ExportProgress({
  currentStep,
  totalSteps,
  steps,
  elapsedTime,
  estimatedTime,
}: ExportProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  const remainingTime = Math.max(0, estimatedTime - elapsedTime);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Gerando Exportação...</h3>
          <p className="text-slate-600">Por favor aguarde enquanto processamos seus dados</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-slate-600">
            <span>{Math.round(progress)}% concluído</span>
            <span>
              Etapa {currentStep} de {totalSteps}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className={getStepClassName(step.status)}>
              {/* Icon */}
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : step.status === 'running' ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <span className={`font-medium ${getStepTextColor(step.status)}`}>
                  {step.label}
                </span>
              </div>

              {/* Duration */}
              {step.duration && (
                <span className="text-sm text-slate-600">{formatTime(step.duration)}</span>
              )}
            </div>
          ))}
        </div>

        {/* Time Info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>Tempo decorrido: {formatTime(elapsedTime)}</span>
          </div>
          <div className="text-sm text-slate-600">
            Tempo restante: ~{formatTime(remainingTime)}
          </div>
        </div>
      </div>
    </Card>
  );
}
