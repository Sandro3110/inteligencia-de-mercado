import { storagePut } from "../storage";

/**
 * Renderer para formato CSV
 */
export class CSVRenderer {
  /**
   * Renderiza dados em formato CSV e faz upload para S3
   */
  async render(
    data: unknown[],
    selectedFields: string[]
  ): Promise<{ url: string; size: number }> {
    if (data.length === 0) {
      throw new Error("Nenhum dado para exportar");
    }

    // Gera CSV
    const csv = this.generateCSV(data, selectedFields);

    // Converte para buffer
    const buffer = Buffer.from(csv, "utf-8");

    // Faz upload para S3
    const filename = `export_${Date.now()}.csv`;
    const { url } = await storagePut(`exports/${filename}`, buffer, "text/csv");

    return {
      url,
      size: buffer.length,
    };
  }

  /**
   * Gera string CSV a partir dos dados
   */
  private generateCSV(data: unknown[], selectedFields: string[]): string {
    const lines: string[] = [];

    // Header
    lines.push(selectedFields.map(field => this.escapeCSV(field)).join(","));

    // Data rows
    data.forEach(record => {
      const values = selectedFields.map(field => {
        // @ts-ignore - TODO: Fix record type
        const value = record[field];
        return this.escapeCSV(this.formatValue(value));
      });
      lines.push(values.join(","));
    });

    return lines.join("\n");
  }

  /**
   * Escapa valor para CSV (adiciona aspas se necessário)
   */
  private escapeCSV(value: string): string {
    if (!value) return '""';

    const str = String(value);

    // Se contém vírgula, quebra de linha ou aspas, envolve em aspas
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Formata valor para exibição
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }
}

// Exporta instância singleton
export const csvRenderer = new CSVRenderer();
