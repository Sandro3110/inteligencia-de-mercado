'use client';

import { CopyButton } from './CopyButton';
import { ExportExcelButton } from './ExportExcelButton';
import { ExportExcelMultiSheetButton } from './ExportExcelMultiSheetButton';
import type { ClipboardColumn } from '@/lib/clipboard';
import type { ExcelColumn } from '@/lib/excel-exporter';

interface DataActionsBarProps {
  // Dados atuais (para copiar e exportar aba única)
  currentData: Record<string, any>[];
  currentColumns: ExcelColumn[];
  currentType: 'clientes' | 'leads' | 'concorrentes';

  // Contexto (para exportar múltiplas abas)
  produtoNome?: string;
  setorNome?: string;
  categoria?: string;
  pesquisaIds?: number[];
  analysisType?: 'produto' | 'setor';

  // Configurações
  filename: string;
  sheetName: string;
  title?: string;

  // Flags
  showMultiSheetExport?: boolean;

  // Customização
  className?: string;
}

/**
 * Barra de ações unificada para exportação de dados
 * Inclui: Copiar, Exportar Excel (aba única), Exportar Tudo (múltiplas abas)
 */
export function DataActionsBar({
  currentData,
  currentColumns,
  currentType,
  produtoNome,
  setorNome,
  categoria,
  pesquisaIds,
  analysisType,
  filename,
  sheetName,
  title,
  showMultiSheetExport = false,
  className = '',
}: DataActionsBarProps) {
  // Converter colunas para formato de clipboard (sem type)
  const clipboardColumns: ClipboardColumn[] = currentColumns.map((col) => ({
    key: col.key,
    label: col.label,
  }));

  // Metadata para exportação
  const metadata = {
    'Data de Exportação': new Date().toLocaleDateString('pt-BR'),
    'Hora de Exportação': new Date().toLocaleTimeString('pt-BR'),
    Tipo: currentType.charAt(0).toUpperCase() + currentType.slice(1),
    'Total de Registros': String(currentData.length),
  };

  return (
    <div className={`flex items-center gap-2 p-4 bg-muted/50 rounded-lg border ${className}`}>
      {/* Contador de registros */}
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          {currentData.length} registro{currentData.length !== 1 ? 's' : ''} encontrado
          {currentData.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Ações de exportação */}
      <div className="flex items-center gap-2">
        {/* Copiar */}
        <CopyButton
          data={currentData}
          columns={clipboardColumns}
          label="Copiar"
          variant="outline"
          size="default"
        />

        {/* Exportar aba única */}
        <ExportExcelButton
          data={currentData}
          columns={currentColumns}
          filename={filename}
          sheetName={sheetName}
          title={title}
          metadata={metadata}
          label="Exportar Excel"
          variant="outline"
          size="default"
        />

        {/* Exportar múltiplas abas (apenas no nível 3) */}
        {showMultiSheetExport && categoria && pesquisaIds && analysisType && (
          <>
            <div className="h-6 w-px bg-border" />
            <ExportExcelMultiSheetButton
              produtoNome={produtoNome}
              setorNome={setorNome}
              categoria={categoria}
              pesquisaIds={pesquisaIds}
              analysisType={analysisType}
              label="Exportar Tudo"
              variant="default"
              size="default"
            />
          </>
        )}
      </div>
    </div>
  );
}
