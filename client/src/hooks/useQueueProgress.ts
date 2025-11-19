import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface QueueProgressOptions {
  projectId: number | null;
  enabled?: boolean;
  onJobCompleted?: (queueId: number) => void;
  onJobError?: (queueId: number, error: string) => void;
}

/**
 * Hook para monitorar progresso da fila e exibir notificações
 */
export function useQueueProgress({
  projectId,
  enabled = true,
  onJobCompleted,
  onJobError,
}: QueueProgressOptions) {
  const previousStatusRef = useRef<any>(null);

  // Buscar status da fila com polling (a cada 5 segundos)
  const { data: queueStatus } = trpc.queue.status.useQuery(
    { projectId: projectId! },
    {
      enabled: enabled && !!projectId,
      refetchInterval: 5000, // 5 segundos
    }
  );

  // Detectar mudanças e exibir notificações
  useEffect(() => {
    if (!queueStatus || !previousStatusRef.current) {
      previousStatusRef.current = queueStatus;
      return;
    }

    const prev = previousStatusRef.current;
    const curr = queueStatus;

    // Job concluído
    if (curr.completed > prev.completed) {
      const completedCount = curr.completed - prev.completed;
      toast.success(`${completedCount} job(s) concluído(s)!`, {
        description: 'Enriquecimento finalizado com sucesso',
        duration: 5000,
      });
      onJobCompleted?.(0); // TODO: passar queueId real
    }

    // Job com erro
    if (curr.error > prev.error) {
      const errorCount = curr.error - prev.error;
      toast.error(`${errorCount} job(s) falharam`, {
        description: 'Verifique os logs para mais detalhes',
        duration: 5000,
      });
      onJobError?.(0, 'Erro no processamento'); // TODO: passar queueId e erro real
    }

    // Job iniciado
    if (curr.processing > prev.processing) {
      const processingCount = curr.processing - prev.processing;
      toast.info(`${processingCount} job(s) em processamento...`, {
        duration: 3000,
      });
    }

    previousStatusRef.current = queueStatus;
  }, [queueStatus, onJobCompleted, onJobError]);

  return {
    queueStatus,
    isProcessing: (queueStatus?.processing || 0) > 0,
    hasPending: (queueStatus?.pending || 0) > 0,
    hasErrors: (queueStatus?.error || 0) > 0,
  };
}
