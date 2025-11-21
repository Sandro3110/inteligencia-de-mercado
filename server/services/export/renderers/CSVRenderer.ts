/**
 * CSV Renderer
 * Renderiza dados em formato CSV
 */

export interface CSVOptions {
  delimiter?: string;
  includeHeaders?: boolean;
  encoding?: string;
}

export class CSVRenderer {
  private options: Required<CSVOptions>;

  constructor(options: CSVOptions = {}) {
    this.options = {
      delimiter: options.delimiter || ',',
      includeHeaders: options.includeHeaders !== false,
      encoding: options.encoding || 'utf-8',
    };
  }

  /**
   * Renderiza array de objetos em CSV
   */
  render(data: any[], fields: string[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const lines: string[] = [];

    // Headers
    if (this.options.includeHeaders) {
      lines.push(fields.map(f => this.escapeCSV(f)).join(this.options.delimiter));
    }

    // Data rows
    data.forEach(row => {
      const values = fields.map(field => {
        const value = row[field];
        return this.escapeCSV(this.formatValue(value));
      });
      lines.push(values.join(this.options.delimiter));
    });

    return lines.join('\n');
  }

  /**
   * Escapa valores CSV (adiciona aspas se necessário)
   */
  private escapeCSV(value: string): string {
    if (!value) return '';
    
    const stringValue = String(value);
    
    if (stringValue.includes(this.options.delimiter) || 
        stringValue.includes('"') || 
        stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Formata valores para CSV
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Retorna o MIME type
   */
  getMimeType(): string {
    return 'text/csv';
  }

  /**
   * Retorna a extensão do arquivo
   */
  getFileExtension(): string {
    return 'csv';
  }
}
