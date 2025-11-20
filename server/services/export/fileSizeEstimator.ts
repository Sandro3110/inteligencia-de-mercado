/**
 * Estimador de tamanho de arquivo para exportações
 * Item 6 do módulo de exportação inteligente
 */

export interface FileSizeEstimate {
  bytes: number;
  formatted: string;
  warning?: string;
}

// Tamanhos médios por registro (em bytes)
const AVERAGE_SIZES = {
  csv: {
    simple: 200,    // Campos básicos
    complete: 500,  // Todos os campos
    report: 800     // Com análise
  },
  excel: {
    simple: 300,
    complete: 700,
    report: 1200
  },
  pdf: {
    simple: 1500,
    complete: 3000,
    report: 5000
  },
  json: {
    simple: 250,
    complete: 600,
    report: 900
  }
};

// Overhead fixo por formato (cabeçalhos, metadados, etc)
const FORMAT_OVERHEAD = {
  csv: 1024,        // 1 KB
  excel: 10240,     // 10 KB
  pdf: 51200,       // 50 KB
  json: 2048        // 2 KB
};

export function estimateFileSize(
  recordCount: number,
  format: 'csv' | 'excel' | 'pdf' | 'json',
  outputType: 'simple' | 'complete' | 'report'
): FileSizeEstimate {
  // Tamanho base por registro
  const avgSize = AVERAGE_SIZES[format][outputType];
  
  // Overhead do formato
  const overhead = FORMAT_OVERHEAD[format];
  
  // Cálculo total
  const bytes = (recordCount * avgSize) + overhead;
  
  // Formatação legível
  const formatted = formatBytes(bytes);
  
  // Avisos para arquivos grandes
  let warning: string | undefined;
  const mb = bytes / (1024 * 1024);
  
  if (mb > 100) {
    warning = 'Arquivo muito grande (>100MB). Considere adicionar filtros ou dividir em lotes.';
  } else if (mb > 50) {
    warning = 'Arquivo grande (>50MB). Geração pode demorar alguns minutos.';
  } else if (mb > 20) {
    warning = 'Arquivo médio (>20MB). Geração pode demorar até 1 minuto.';
  }
  
  return {
    bytes,
    formatted,
    warning
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Estima tempo de geração baseado no tamanho
 */
export function estimateGenerationTime(bytes: number): {
  seconds: number;
  formatted: string;
} {
  const mb = bytes / (1024 * 1024);
  
  // Estimativa: ~2 segundos por MB (processamento + I/O)
  const seconds = Math.max(5, Math.ceil(mb * 2));
  
  let formatted: string;
  if (seconds < 60) {
    formatted = `~${seconds} segundos`;
  } else {
    const minutes = Math.ceil(seconds / 60);
    formatted = `~${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
  
  return { seconds, formatted };
}
