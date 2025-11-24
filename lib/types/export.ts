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

  // Step 4: Output
  format?: 'csv' | 'xlsx' | 'json' | 'pdf';
  depth?: 'quick' | 'balanced' | 'deep';
}

export interface ExportConfig {
  name: string;
  description?: string;
  state: ExportState;
  createdAt: string;
  updatedAt: string;
}
