import ExcelJS from 'exceljs';
import { storagePut } from '../storage';

/**
 * Configuração de abas do Excel
 */
export interface ExcelSheetConfig {
  name: string;
  data: unknown[];
  fields: string[];
}

/**
 * Renderer para formato Excel (XLSX)
 * Migrated from xlsx to exceljs for security
 */
export class ExcelRenderer {
  /**
   * Renderiza dados em formato Excel e faz upload para S3
   */
  async render(
    data: unknown[],
    selectedFields: string[],
    additionalSheets?: ExcelSheetConfig[]
  ): Promise<{ url: string; size: number }> {
    if (data.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    // Cria workbook
    const workbook = new ExcelJS.Workbook();

    // Adiciona aba principal
    await this.addSheet(workbook, 'Dados Principais', data, selectedFields);

    // Adiciona abas adicionais (se fornecidas)
    if (additionalSheets) {
      for (const sheet of additionalSheets) {
        await this.addSheet(workbook, sheet.name, sheet.data, sheet.fields);
      }
    }

    // Adiciona aba de metadados
    await this.addMetadataSheet(workbook, data.length, selectedFields.length);

    // Gera buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Faz upload para S3
    const filename = `export_${Date.now()}.xlsx`;
    const { url } = await storagePut(
      `exports/${filename}`,
      buffer as Buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    return {
      url,
      size: (buffer as Buffer).length,
    };
  }

  /**
   * Adiciona uma aba ao workbook
   */
  private async addSheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    data: unknown[],
    fields: string[]
  ): Promise<void> {
    // Cria worksheet
    const worksheet = workbook.addWorksheet(sheetName);

    // Adiciona cabeçalhos
    worksheet.columns = fields.map((field) => ({
      header: field,
      key: field,
      width: Math.max(field.length, 15),
    }));

    // Adiciona dados
    data.forEach((record) => {
      const row: Record<string, any> = {};
      fields.forEach((field) => {
        row[field] = this.formatValue((record as any)[field]);
      });
      worksheet.addRow(row);
    });

    // Estiliza cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
  }

  /**
   * Adiciona aba de metadados
   */
  private async addMetadataSheet(
    workbook: ExcelJS.Workbook,
    recordCount: number,
    fieldCount: number
  ): Promise<void> {
    const worksheet = workbook.addWorksheet('Metadados');

    worksheet.columns = [
      { header: 'Campo', key: 'campo', width: 25 },
      { header: 'Valor', key: 'valor', width: 40 },
    ];

    worksheet.addRow({
      campo: 'Data de Exportação',
      valor: new Date().toISOString(),
    });
    worksheet.addRow({
      campo: 'Total de Registros',
      valor: recordCount,
    });
    worksheet.addRow({
      campo: 'Total de Campos',
      valor: fieldCount,
    });
    worksheet.addRow({
      campo: 'Sistema',
      valor: 'Gestor PAV - Inteligência de Mercado',
    });

    // Estiliza cabeçalho
    worksheet.getRow(1).font = { bold: true };
  }

  /**
   * Formata valor para Excel
   */
  private formatValue(value: unknown): string | number | Date {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return value as string | number;
  }
}

// Exporta instância singleton
export const excelRenderer = new ExcelRenderer();
