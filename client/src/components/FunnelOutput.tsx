import React from 'react';
import { CheckCircle2, Loader2, Pause } from 'lucide-react';

interface StepData {
  fields?: number;
  total?: number;
  score?: number;
  sentimento?: string;
  count?: number;
  status?: string;
}

interface FunnelOutputProps {
  completed: string[];
  current?: string;
  pending: string[];
  data?: Record<string, StepData>;
  elapsed?: number;
  estimated?: number;
}

const STEP_LABELS: Record<string, string> = {
  cliente: 'CLIENTE',
  mercado: 'MERCADO',
  produtos: 'PRODUTOS',
  concorrentes: 'CONCORRENTES',
  leads: 'LEADS'
};

export function FunnelOutput({ completed = [], current, pending = [], data = {}, elapsed = 0, estimated = 25000 }: FunnelOutputProps) {
  const allSteps = ['cliente', 'mercado', 'produtos', 'concorrentes', 'leads'];

  const getStepStatus = (step: string) => {
    if (completed.includes(step)) return 'completed';
    if (step === current) return 'processing';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Pause className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-green-400';
      case 'processing':
        return 'from-blue-500 to-blue-400';
      default:
        return 'from-gray-300 to-gray-200';
    }
  };

  const getStepDetails = (step: string, stepData?: StepData) => {
    if (!stepData) return 'Aguardando...';

    switch (step) {
      case 'cliente':
        return `${stepData.fields || 0}/${stepData.total || 10} campos`;
      case 'mercado':
        return `Score: ${stepData.score || 0}/100 (${stepData.sentimento || 'N/A'})`;
      case 'produtos':
        return `${stepData.count || 0} produtos identificados`;
      case 'concorrentes':
        return `${stepData.count || 0} concorrentes encontrados`;
      case 'leads':
        return `${stepData.count || 0} leads qualificados`;
      default:
        return 'Processando...';
    }
  };

  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-green-50 to-white rounded-lg border-2 border-green-200">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">📊 PROCESSADO</h3>
        <p className="text-sm text-gray-500">Dados enriquecidos</p>
      </div>

      {/* Etapas */}
      {allSteps.map((step, index) => {
        const status = getStepStatus(step);
        const stepData = data[step];
        const isLast = index === allSteps.length - 1;

        return (
          <React.Fragment key={step}>
            {/* Card da etapa */}
            <div className="w-full max-w-xs">
              <div
                className={`relative overflow-hidden bg-white border-4 rounded-lg shadow-md transition-all duration-500 ${
                  status === 'completed'
                    ? 'border-green-400'
                    : status === 'processing'
                    ? 'border-blue-400'
                    : 'border-gray-300'
                }`}
              >
                {/* Líquido enchendo (animação) */}
                {status === 'completed' && (
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getStepColor(status)} opacity-10 animate-fill-up`}
                    style={{ height: '100%' }}
                  />
                )}

                {/* Conteúdo */}
                <div className="relative z-10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-semibold text-gray-700">
                      {STEP_LABELS[step]}
                    </div>
                    {getStepIcon(status)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {status === 'completed' || status === 'processing'
                      ? getStepDetails(step, stepData)
                      : 'Aguardando...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Seta com animação de fluxo */}
            {!isLast && (
              <div className="relative h-8">
                <div className="text-4xl text-green-400">↓</div>
                {status === 'completed' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-green-400 animate-flow" />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Tempo estimado */}
      <div className="w-full max-w-xs mt-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 shadow-lg text-white text-center">
          <div className="text-xs opacity-80">Tempo</div>
          <div className="text-lg font-bold">
            ⏱ {formatTime(elapsed)} / ~{formatTime(estimated)}
          </div>
        </div>
      </div>
    </div>
  );
}
