'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface LogViewerProps {
  logs: LogEntry[];
}

export function LogViewer({ logs }: LogViewerProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const typeColors = {
    info: 'text-blue-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
      <div className="flex items-center gap-2 text-gray-400 mb-4 pb-2 border-b border-gray-700">
        <Terminal className="w-4 h-4" />
        <span>Log de Enriquecimento</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-gray-500 text-center py-8">Aguardando início do processamento...</div>
      ) : (
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-gray-500 flex-shrink-0">
                [{new Date(log.timestamp).toLocaleTimeString('pt-BR')}]
              </span>
              <span className="flex-shrink-0">{typeIcons[log.type]}</span>
              <span className={typeColors[log.type]}>{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}
