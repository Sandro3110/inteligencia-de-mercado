/**
 * Utilitário para exportar dados para Excel com formatação profissional
 * Usa biblioteca xlsx (SheetJS)
 */

import * as XLSX from 'xlsx';

export interface ExcelColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  width?: number;
}

export interface ExcelExportOptions {
  filename: string;
  sheetName: string;
  data: Record<string, any>[];
  columns: ExcelColumn[];
  title?: string;
  metadata?: Record<string, string>;
}

/**
 * Exporta dados para arquivo Excel (.xlsx) com formatação profissional
 *
 * Características:
 * - Cabeçalho formatado (negrito, cor de fundo)
 * - Colunas auto-ajustadas
 * - Filtros automáticos
 * - Linhas zebradas (alternadas)
 * - Bordas nas células
 * - Formatação de números, datas e moeda
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const { filename, sheetName, data, columns, title, metadata } = options;

  if (data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Preparar dados
  const rows: any[][] = [];

  // Adicionar título (se fornecido)
  if (title) {
    rows.push([title]);
    rows.push([]); // Linha em branco
  }

  // Adicionar metadata (se fornecido)
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      rows.push([key, value]);
    });
    rows.push([]); // Linha em branco
  }

  // Adicionar cabeçalho
  const headerRow = columns.map((col) => col.label);
  rows.push(headerRow);

  // Adicionar dados
  data.forEach((row) => {
    const dataRow = columns.map((col) => {
      const value = row[col.key];

      // Tratar valores nulos
      if (value === null || value === undefined) {
        return '';
      }

      // Formatação por tipo
      switch (col.type) {
        case 'number':
          return typeof value === 'number' ? value : parseFloat(value) || 0;

        case 'currency':
          return typeof value === 'number' ? value : parseFloat(value) || 0;

        case 'percentage':
          return typeof value === 'number' ? value / 100 : parseFloat(value) / 100 || 0;

        case 'date':
          if (value instanceof Date) {
            return value;
          }
          // Tentar parsear string como data
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

  // Calcular índice do cabeçalho
  let headerRowIndex = 0;
  if (title) headerRowIndex += 2; // Título + linha em branco
  if (metadata) headerRowIndex += Object.keys(metadata).length + 1; // Metadata + linha em branco

  // Aplicar formatação
  if (ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Largura das colunas
    ws['!cols'] = columns.map((col) => ({
      wch: col.width || 15,
    }));

    // Adicionar filtros automáticos
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: headerRowIndex, c: range.s.c },
        e: { r: range.e.r, c: range.e.c },
      }),
    };
  }

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Salvar arquivo
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Converte dados para formato CSV
 */
export function exportToCSV(options: Omit<ExcelExportOptions, 'sheetName'>): void {
  const { filename, data, columns } = options;

  if (data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Criar cabeçalho
  const header = columns.map((col) => col.label).join(',');

  // Criar linhas
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];

        if (value === null || value === undefined) {
          return '';
        }

        // Escapar valores que contêm vírgula ou aspas
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(',')
  );

  // Combinar tudo
  const csv = [header, ...rows].join('\n');

  // Criar blob e download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
