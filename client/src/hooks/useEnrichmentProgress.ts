import { useEffect, useState, useRef } from "react";
import { EnrichmentStep } from "@/components/EnrichmentProgress";

interface EnrichmentProgressData {
  jobId: string;
  step: number;
  totalSteps: number;
  currentStepName: string;
  message: string;
  progress: number;
  totalProgress: number;
  status: "running" | "completed" | "error";
  error?: string;
}

export function useEnrichmentProgress(jobId: string | null) {
  const [steps, setSteps] = useState<EnrichmentStep[]>([
    { id: "1", label: "Criando projeto", status: "pending" },
    { id: "2", label: "Identificando mercados via LLM", status: "pending" },
    { id: "3", label: "Enriquecendo clientes via Data API", status: "pending" },
    { id: "4", label: "Buscando concorrentes", status: "pending" },
    { id: "5", label: "Identificando leads", status: "pending" },
    { id: "6", label: "Calculando scores de qualidade", status: "pending" },
    { id: "7", label: "Finalizando projeto", status: "pending" },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    // Criar conexão SSE
    const eventSource = new EventSource(`/api/enrichment/progress/${jobId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = event => {
      try {
        const data: EnrichmentProgressData = JSON.parse(event.data);

        // Atualizar estado global
        setCurrentStep(data.step);
        setTotalProgress(data.totalProgress);

        // Atualizar steps
        setSteps(prevSteps =>
          prevSteps.map((s, idx) => {
            const stepIndex = idx + 1;
            if (stepIndex < data.step) {
              return { ...s, status: "completed" as const, progress: 100 };
            } else if (stepIndex === data.step) {
              return {
                ...s,
                status:
                  data.status === "error"
                    ? ("error" as const)
                    : ("in_progress" as const),
                message: data.message,
                progress: data.progress,
              };
            } else {
              return { ...s, status: "pending" as const };
            }
          })
        );

        // Verificar conclusão ou erro
        if (data.status === "completed") {
          setIsComplete(true);
          setSteps(prevSteps =>
            prevSteps.map(s => ({
              ...s,
              status: "completed" as const,
              progress: 100,
            }))
          );
          eventSource.close();
        } else if (data.status === "error") {
          setError(data.error || "Erro desconhecido");
          eventSource.close();
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = err => {
      console.error("SSE connection error:", err);
      setError("Conexão perdida com o servidor");
      eventSource.close();
    };

    // Cleanup ao desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [jobId]);

  return {
    steps,
    currentStep,
    totalProgress,
    isComplete,
    error,
  };
}
