/**
 * Tipos compartilhados para o sistema de exportação
 */

export interface ExportState {
  // Step 1: Context
  projectId?: string;
  entityType: 'mercados' | 'clientes' | 'concorrentes' | 'leads' | 'produtos';
  context?: string;

  // Step 2: Filters
  filters?: Record<string, any>;

  // Step 3: Fields
  selectedFields?: string[];
  includeRelationships?: boolean;

  // Step 4: Output
  title?: string;
  format?: 'csv' | 'excel' | 'json' | 'pdf';
  outputType?: 'simple' | 'complete' | 'report';
  depth?: 'quick' | 'standard' | 'deep';
  templateType?: 'market' | 'client' | 'competitive' | 'lead';
}

export interface ExportConfig {
  name: string;
  description?: string;
  state: ExportState;
  createdAt: string;
  updatedAt: string;
}
