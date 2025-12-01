/**
 * Utilitário para exportar dados para Excel com múltiplas abas
 * Ideal para exportar Clientes, Leads e Concorrentes em um único arquivo
 */

import * as XLSX from 'xlsx';
import type { ExcelColumn } from './excel-exporter';

export interface SheetData {
  name: string;
  data: Record<string, any>[];
  columns: ExcelColumn[];
  color?: string; // Cor da aba (hex sem #)
}

export interface SummaryStats {
  label: string;
  value: string | number;
}

export interface MultiSheetExportOptions {
  filename: string;
  sheets: SheetData[];
  summary?: {
    title: string;
    stats: SummaryStats[];
  };
  metadata?: Record<string, string>;
}

/**
 * Exporta dados para Excel com múltiplas abas
 *
 * Características:
 * - Uma aba por tipo de dado (Clientes, Leads, Concorrentes)
 * - Aba "Resumo" opcional com estatísticas gerais
 * - Formatação profissional em todas as abas
 * - Cores diferentes por aba (visual)
 * - Metadata (data de exportação, filtros aplicados)
 */
export function exportToExcelMultiSheet(options: MultiSheetExportOptions): void {
  const { filename, sheets, summary, metadata } = options;

  if (sheets.length === 0) {
    throw new Error('Nenhuma aba para exportar');
  }

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Adicionar aba de resumo (se fornecido)
  if (summary) {
    const summaryRows: any[][] = [];

    // Título
    summaryRows.push([summary.title]);
    summaryRows.push([]);

    // Metadata
    if (metadata) {
      summaryRows.push(['Informações da Exportação']);
      summaryRows.push([]);
      Object.entries(metadata).forEach(([key, value]) => {
        summaryRows.push([key, value]);
      });
      summaryRows.push([]);
    }

    // Estatísticas
    summaryRows.push(['Resumo Geral']);
    summaryRows.push([]);
    summary.stats.forEach((stat) => {
      summaryRows.push([stat.label, stat.value]);
    });

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);

    // Formatação da aba de resumo
    if (summaryWs['!ref']) {
      summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
    }

    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');
  }

  // Adicionar abas de dados
  sheets.forEach((sheet) => {
    if (sheet.data.length === 0) {
      return; // Pular abas vazias
    }

    const rows: any[][] = [];

    // Cabeçalho
    const headerRow = sheet.columns.map((col) => col.label);
    rows.push(headerRow);

    // Dados
    sheet.data.forEach((row) => {
      const dataRow = sheet.columns.map((col) => {
        const value = row[col.key];

        if (value === null || value === undefined) {
          return '';
        }

        switch (col.type) {
          case 'number':
          case 'currency':
          case 'percentage':
            return typeof value === 'number' ? value : parseFloat(value) || 0;

          case 'date':
            if (value instanceof Date) {
              return value;
            }
            const parsedDate = new Date(value);
            return isNaN(parsedDate.getTime()) ? value : parsedDate;

          default:
            return String(value);
        }
      });
      rows.push(dataRow);
    });

    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Aplicar formatação
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);

      // Largura das colunas
      ws['!cols'] = sheet.columns.map((col) => ({
        wch: col.width || 15,
      }));

      // Filtros automáticos
      ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: range.s.c },
          e: { r: range.e.r, c: range.e.c },
        }),
      };
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  // Salvar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Helper para criar metadata padrão
 */
export function createDefaultMetadata(): Record<string, string> {
  return {
    'Data de Exportação': new Date().toLocaleDateString('pt-BR'),
    'Hora de Exportação': new Date().toLocaleTimeString('pt-BR'),
    Sistema: 'Intelmarket - Inteligência de Mercado',
  };
}

/**
 * Helper para criar estatísticas de resumo
 */
export function createSummaryStats(
  clientesCount: number,
  leadsCount: number,
  concorrentesCount: number,
  additionalStats?: SummaryStats[]
): SummaryStats[] {
  const baseStats: SummaryStats[] = [
    { label: 'Total de Clientes', value: clientesCount },
    { label: 'Total de Leads', value: leadsCount },
    { label: 'Total de Concorrentes', value: concorrentesCount },
    { label: 'Total Geral', value: clientesCount + leadsCount + concorrentesCount },
  ];

  return additionalStats ? [...baseStats, ...additionalStats] : baseStats;
}
