/**
 * Word/DOCX Renderer - Exporta dados em formato Word
 * Item 15 do módulo de exportação inteligente
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
} from "docx";

export interface WordRenderOptions {
  includeHeader?: boolean;
  includeSummary?: boolean;
  pageNumbers?: boolean;
}

export class WordRenderer {
  async render(
    data: unknown[],
    metadata: {
      context?: string;
      filters?: unknown;
      recordCount: number;
      generatedAt: Date;
      projectId?: number;
      analysis?: string;
    },
    options: WordRenderOptions = {}
  ): Promise<Buffer> {
    const {
      includeHeader = true,
      includeSummary = true,
      pageNumbers = true,
    } = options;

    const sections: unknown[] = [];

    // Cabeçalho
    if (includeHeader) {
      sections.push(
        new Paragraph({
          text: "Relatório de Exportação",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: `Gerado em: ${metadata.generatedAt.toLocaleString("pt-BR")}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Sumário
    if (includeSummary && metadata.context) {
      sections.push(
        new Paragraph({
          text: "Contexto da Exportação",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: metadata.context,
          spacing: { after: 400 },
        })
      );
    }

    // Estatísticas
    sections.push(
      new Paragraph({
        text: "Estatísticas",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Total de registros: ", bold: true }),
          new TextRun({ text: metadata.recordCount.toString() }),
        ],
        spacing: { after: 100 },
      })
    );

    // Análise (se disponível)
    if (metadata.analysis) {
      sections.push(
        new Paragraph({
          text: "Análise Contextualizada",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: metadata.analysis,
          spacing: { after: 400 },
        })
      );
    }

    // Tabela de dados
    sections.push(
      new Paragraph({
        text: "Dados Exportados",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    if (data.length > 0) {
      const table = this.createTable(data);
      sections.push(table);
    } else {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Nenhum registro encontrado.",
              italics: true,
            }),
          ],
        })
      );
    }

    // Criar documento
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: sections,
        },
      ],
    });

    // Gerar buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  /**
   * Cria tabela formatada com os dados
   */
  private createTable(data: unknown[]): Table {
    if (data.length === 0) {
      return new Table({ rows: [] });
    }

    // Extrair colunas do primeiro registro
    const columns = Object.keys(data[0]);

    // Criar linha de cabeçalho
    const headerRow = new TableRow({
      tableHeader: true,
      children: columns.map(
        col =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: this.formatColumnName(col),
                    bold: true,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: "4472C4",
            },
            width: {
              size: 100 / columns.length,
              type: WidthType.PERCENTAGE,
            },
          })
      ),
    });

    // Criar linhas de dados
    const dataRows = data.slice(0, 1000).map(
      (
        record,
        index // Limitar a 1000 registros
      ) =>
        new TableRow({
          children: columns.map(
            col =>
              new TableCell({
                children: [
                  new Paragraph({
                    text: this.formatCellValue(record[col]),
                  }),
                ],
                shading: {
                  fill: index % 2 === 0 ? "FFFFFF" : "F2F2F2",
                },
              })
          ),
        })
    );

    return new Table({
      rows: [headerRow, ...dataRows],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  }

  /**
   * Formata nome de coluna (camelCase → Title Case)
   */
  private formatColumnName(name: string): string {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Formata valor de célula
   */
  private formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    return String(value);
  }
}
