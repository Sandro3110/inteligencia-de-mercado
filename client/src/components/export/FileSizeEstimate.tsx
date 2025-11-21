/**
 * Componente de estimativa de tamanho de arquivo
 * Item 6 do módulo de exportação inteligente
 */

import { AlertTriangle, FileText, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

interface FileSizeEstimateProps {
  recordCount: number;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  outputType: 'simple' | 'complete' | 'report';
}

// Tamanhos médios por registro (em bytes)
const AVERAGE_SIZES = {
  csv: { simple: 200, complete: 500, report: 800 },
  excel: { simple: 300, complete: 700, report: 1200 },
  pdf: { simple: 1500, complete: 3000, report: 5000 },
  json: { simple: 250, complete: 600, report: 900 }
};

const FORMAT_OVERHEAD = {
  csv: 1024,
  excel: 10240,
  pdf: 51200,
  json: 2048
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function estimateTime(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  const seconds = Math.max(5, Math.ceil(mb * 2));
  
  if (seconds < 60) {
    return `~${seconds} segundos`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} minuto${minutes > 1 ? 's' : ''}`;
}

export function FileSizeEstimate({ recordCount, format, outputType }: FileSizeEstimateProps) {
  // Calcular tamanho estimado
  const avgSize = AVERAGE_SIZES[format][outputType];
  const overhead = FORMAT_OVERHEAD[format];
  const bytes = (recordCount * avgSize) + overhead;
  const formatted = formatBytes(bytes);
  const time = estimateTime(bytes);
  const mb = bytes / (1024 * 1024);

  // Determinar nível de aviso
  let warningLevel: 'none' | 'info' | 'warning' | 'danger' = 'none';
  let warningMessage = '';

  if (mb > 100) {
    warningLevel = 'danger';
    warningMessage = 'Arquivo muito grande (>100MB). Considere adicionar filtros ou dividir em lotes.';
  } else if (mb > 50) {
    warningLevel = 'warning';
    warningMessage = 'Arquivo grande (>50MB). Geração pode demorar alguns minutos.';
  } else if (mb > 20) {
    warningLevel = 'info';
    warningMessage = 'Arquivo médio (>20MB). Geração pode demorar até 1 minuto.';
  }

  return (
    <div className="space-y-3">
      {/* Badge de tamanho */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600">Tamanho estimado:</span>
        <Badge variant="secondary" className="font-mono">
          {formatted}
        </Badge>
        <span className="text-xs text-slate-500">({time})</span>
      </div>

      {/* Aviso se necessário */}
      {warningLevel !== 'none' && (
        <Alert variant={warningLevel === 'danger' ? 'destructive' : 'default'}>
          {warningLevel === 'danger' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertDescription className="text-sm">
            {warningMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Detalhamento técnico */}
      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer hover:text-slate-700">
          Detalhes do cálculo
        </summary>
        <div className="mt-2 space-y-1 pl-4">
          <div>• {recordCount} registros × {avgSize} bytes = {formatBytes(recordCount * avgSize)}</div>
          <div>• Overhead do formato: {formatBytes(overhead)}</div>
          <div>• Total: {formatted}</div>
        </div>
      </details>
    </div>
  );
}
