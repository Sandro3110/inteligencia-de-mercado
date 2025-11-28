'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
}

export function ProgressBar({ current, total, status }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const statusColors = {
    pending: 'bg-gray-400',
    running: 'bg-blue-600',
    completed: 'bg-green-600',
    failed: 'bg-red-600',
    paused: 'bg-yellow-600',
  };

  const statusLabels = {
    pending: 'Pendente',
    running: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
    paused: 'Pausado',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-gray-700">{statusLabels[status]}</span>
          <span className="text-sm text-gray-600 ml-2">
            {current} / {total} clientes
          </span>
        </div>
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${statusColors[status]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Processados</div>
          <div className="font-semibold text-gray-900">{current}</div>
        </div>
        <div>
          <div className="text-gray-600">Restantes</div>
          <div className="font-semibold text-gray-900">{total - current}</div>
        </div>
        <div>
          <div className="text-gray-600">Total</div>
          <div className="font-semibold text-gray-900">{total}</div>
        </div>
      </div>
    </div>
  );
}
