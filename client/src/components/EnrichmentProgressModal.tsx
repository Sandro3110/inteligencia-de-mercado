import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FunnelInput } from './FunnelInput';
import { FunnelOutput } from './FunnelOutput';

interface JobStatus {
  jobId: string;
  status: string;
  progress: number;
  currentStep?: string;
  completed: string[];
  pending: string[];
  data: Record<string, any>;
  elapsed: number;
  estimated: number;
  cost: number;
  error?: string;
}

interface EnrichmentProgressModalProps {
  open: boolean;
  jobId: string | null;
  empresaNome: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function EnrichmentProgressModal({
  open,
  jobId,
  empresaNome,
  onComplete,
  onError
}: EnrichmentProgressModalProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (!jobId || !open) return;

    // Buscar status inicial
    fetchStatus();

    // Polling a cada 10 segundos
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, [jobId, open]);

  const fetchStatus = async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`https://www.intelmarket.app/api/ia-job-status?jobId=${jobId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar status');
      }

      const status: JobStatus = await response.json();
      setJobStatus(status);

      // Se completou ou falhou, notificar
      if (status.status === 'completed') {
        setTimeout(() => onComplete(), 2000); // Aguardar 2s para mostrar 100%
      } else if (status.status === 'failed') {
        onError(status.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  };

  const etapas = ['Cliente', 'Mercado', 'Produtos', 'Concorrentes', 'Leads'];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {jobStatus?.status === 'completed' ? (
              <span className="text-green-600">✓ Enriquecimento Concluído!</span>
            ) : (
              <span className="text-blue-600">Enriquecimento em Andamento...</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          {/* Funil Esquerdo - Entrada */}
          <FunnelInput
            empresa={empresaNome}
            etapas={etapas}
            tempo={jobStatus?.elapsed}
            custo={jobStatus?.cost}
            progresso={jobStatus?.progress || 0}
          />

          {/* Funil Direito - Processado */}
          <FunnelOutput
            completed={jobStatus?.completed || []}
            current={jobStatus?.currentStep}
            pending={jobStatus?.pending || []}
            data={jobStatus?.data || {}}
            elapsed={jobStatus?.elapsed || 0}
            estimated={jobStatus?.estimated || 25000}
          />
        </div>

        {jobStatus?.status === 'completed' && (
          <div className="text-center text-sm text-gray-500 mt-4">
            Redirecionando em 2 segundos...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
