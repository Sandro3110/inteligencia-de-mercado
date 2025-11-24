/**
 * Excel Renderer
 * Renderiza dados em formato Excel (XLSX)
 * Migrated from xlsx to exceljs for security
 */

import ExcelJS from 'exceljs';

export interface ExcelOptions {
  sheetName?: string;
  includeHeaders?: boolean;
  autoWidth?: boolean;
}

export class ExcelRenderer {
  private options: Required<ExcelOptions>;

  constructor(options: ExcelOptions = {}) {
    this.options = {
      sheetName: options.sheetName || 'Dados',
      includeHeaders: options.includeHeaders !== false,
      autoWidth: options.autoWidth !== false,
    };
  }

  /**
   * Renderiza array de objetos em Excel
   */
  async render(data: unknown[], fields: string[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.options.sheetName);

    if (!data || data.length === 0) {
      // Retorna workbook vazio
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    // Configurar colunas
    worksheet.columns = fields.map((field) => ({
      header: this.options.includeHeaders ? field : undefined,
      key: field,
      width: this.options.autoWidth ? this.calculateColumnWidth(field, data) : 15,
    }));

    // Adicionar dados
    data.forEach((row) => {
      const rowData: Record<string, any> = {};
      fields.forEach((field) => {
        rowData[field] = this.formatValue((row as any)[field]);
      });
      worksheet.addRow(rowData);
    });

    // Estilizar cabeçalho se incluído
    if (this.options.includeHeaders) {
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }

    // Retornar buffer
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * Calcula largura ideal da coluna
   */
  private calculateColumnWidth(field: string, data: unknown[]): number {
    const maxLength = Math.max(
      field.length,
      ...data.map((row) => String(this.formatValue((row as any)[field])).length)
    );
    return Math.min(maxLength + 2, 50);
  }

  /**
   * Formata valores para Excel
   */
  private formatValue(value: unknown): string | number | Date {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value as string | number;
  }

  /**
   * Retorna o MIME type
   */
  getMimeType(): string {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  /**
   * Retorna a extensão do arquivo
   */
  getFileExtension(): string {
    return 'xlsx';
  }
}
