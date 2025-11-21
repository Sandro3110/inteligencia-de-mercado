import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, Clock } from "lucide-react";

interface ExportProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    label: string;
    status: "pending" | "running" | "completed";
    duration?: number;
  }>;
  elapsedTime: number;
  estimatedTime: number;
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

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Gerando Exportação...
          </h3>
          <p className="text-slate-600">
            Por favor aguarde enquanto processamos seus dados
          </p>
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
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.status === "running"
                  ? "bg-blue-50 border border-blue-200"
                  : step.status === "completed"
                    ? "bg-green-50"
                    : "bg-slate-50"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : step.status === "running" ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <span
                  className={`font-medium ${
                    step.status === "running"
                      ? "text-blue-900"
                      : step.status === "completed"
                        ? "text-green-900"
                        : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Duration */}
              {step.duration && (
                <span className="text-sm text-slate-600">
                  {formatTime(step.duration)}
                </span>
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
