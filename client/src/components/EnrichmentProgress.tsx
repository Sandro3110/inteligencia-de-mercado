import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface EnrichmentStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  message?: string;
  progress?: number;
}

interface EnrichmentProgressProps {
  steps: EnrichmentStep[];
  currentStep: number;
  totalProgress: number;
}

export function EnrichmentProgress({
  steps,
  currentStep,
  totalProgress,
}: EnrichmentProgressProps) {
  return (
    <div className="space-y-6">
      {/* Barra de Progresso Geral */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progresso Geral</span>
          <span className="text-muted-foreground">
            {Math.round(totalProgress)}%
          </span>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>

      {/* Lista de Etapas */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
              step.status === "in_progress"
                ? "border-primary bg-primary/5"
                : step.status === "completed"
                  ? "border-green-500/30 bg-green-500/5"
                  : step.status === "error"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-border/40 bg-background/50"
            }`}
          >
            {/* Ícone de Status */}
            <div className="mt-0.5">
              {step.status === "in_progress" ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : step.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : step.status === "error" ? (
                <Circle className="h-5 w-5 text-red-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40" />
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{step.label}</h4>
                {step.status === "in_progress" &&
                  step.progress !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {step.progress}%
                    </span>
                  )}
              </div>
              {step.message && (
                <p className="text-xs text-muted-foreground">{step.message}</p>
              )}
              {step.status === "in_progress" && step.progress !== undefined && (
                <Progress value={step.progress} className="h-1 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tempo Estimado */}
      {currentStep < steps.length && (
        <div className="text-center text-sm text-muted-foreground">
          Etapa {currentStep + 1} de {steps.length}
        </div>
      )}
    </div>
  );
}
