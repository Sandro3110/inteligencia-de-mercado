/**
 * Excel Renderer
 * Renderiza dados em formato Excel (XLSX)
 */

import * as XLSX from "xlsx";

export interface ExcelOptions {
  sheetName?: string;
  includeHeaders?: boolean;
  autoWidth?: boolean;
}

export class ExcelRenderer {
  private options: Required<ExcelOptions>;

  constructor(options: ExcelOptions = {}) {
    this.options = {
      sheetName: options.sheetName || "Dados",
      includeHeaders: options.includeHeaders !== false,
      autoWidth: options.autoWidth !== false,
    };
  }

  /**
   * Renderiza array de objetos em Excel
   */
  render(data: unknown[], fields: string[]): Buffer {
    if (!data || data.length === 0) {
      // Retorna workbook vazio
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([[]]);
      XLSX.utils.book_append_sheet(wb, ws, this.options.sheetName);
      return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
    }

    // Preparar dados
    const rows: unknown[][] = [];

    // Headers
    if (this.options.includeHeaders) {
      rows.push(fields);
    }

    // Data rows
    data.forEach(row => {
      const values = fields.map(field => this.formatValue(row[field]));
      rows.push(values);
    });

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Auto-width
    if (this.options.autoWidth) {
      const colWidths = fields.map((field, idx) => {
        const maxLength = Math.max(
          field.length,
          ...data.map(row => String(this.formatValue(row[field])).length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      ws["!cols"] = colWidths;
    }

    XLSX.utils.book_append_sheet(wb, ws, this.options.sheetName);

    // Retornar buffer
    return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  }

  /**
   * Formata valores para Excel
   */
  private formatValue(value: unknown): string | number {
    if (value === null || value === undefined) {
      return "";
    }

    if (value instanceof Date) {
      return value.toISOString().split("T")[0];
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  }

  /**
   * Retorna o MIME type
   */
  getMimeType(): string {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  /**
   * Retorna a extensão do arquivo
   */
  getFileExtension(): string {
    return "xlsx";
  }
}
