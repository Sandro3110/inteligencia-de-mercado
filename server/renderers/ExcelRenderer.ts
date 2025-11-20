import * as XLSX from 'xlsx';
import { storagePut } from "../storage";

/**
 * Configuração de abas do Excel
 */
export interface ExcelSheetConfig {
  name: string;
  data: any[];
  fields: string[];
}

/**
 * Renderer para formato Excel (XLSX)
 */
export class ExcelRenderer {
  /**
   * Renderiza dados em formato Excel e faz upload para S3
   */
  async render(
    data: any[],
    selectedFields: string[],
    additionalSheets?: ExcelSheetConfig[]
  ): Promise<{ url: string; size: number }> {
    if (data.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    // Cria workbook
    const workbook = XLSX.utils.book_new();

    // Adiciona aba principal
    this.addSheet(workbook, 'Dados Principais', data, selectedFields);

    // Adiciona abas adicionais (se fornecidas)
    if (additionalSheets) {
      additionalSheets.forEach(sheet => {
        this.addSheet(workbook, sheet.name, sheet.data, sheet.fields);
      });
    }

    // Adiciona aba de metadados
    this.addMetadataSheet(workbook, data.length, selectedFields.length);

    // Gera buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Faz upload para S3
    const filename = `export_${Date.now()}.xlsx`;
    const { url } = await storagePut(
      `exports/${filename}`,
      buffer as Buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    return {
      url,
      size: (buffer as Buffer).length
    };
  }

  /**
   * Adiciona uma aba ao workbook
   */
  private addSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
    data: any[],
    fields: string[]
  ): void {
    // Prepara dados para o Excel
    const rows = data.map(record => {
      const row: Record<string, any> = {};
      fields.forEach(field => {
        row[field] = this.formatValue(record[field]);
      });
      return row;
    });

    // Cria worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: fields });

    // Ajusta largura das colunas
    const colWidths = fields.map(field => ({
      wch: Math.max(field.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    // Adiciona ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  /**
   * Adiciona aba de metadados
   */
  private addMetadataSheet(
    workbook: XLSX.WorkBook,
    recordCount: number,
    fieldCount: number
  ): void {
    const metadata = [
      { Campo: 'Data de Exportação', Valor: new Date().toISOString() },
      { Campo: 'Total de Registros', Valor: recordCount },
      { Campo: 'Total de Campos', Valor: fieldCount },
      { Campo: 'Sistema', Valor: 'Gestor PAV - Inteligência de Mercado' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Metadados');
  }

  /**
   * Formata valor para Excel
   */
  private formatValue(value: any): any {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  }
}

// Exporta instância singleton
export const excelRenderer = new ExcelRenderer();
