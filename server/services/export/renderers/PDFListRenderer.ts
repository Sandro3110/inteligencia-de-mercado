/**
 * PDF List Renderer
 * Renderiza dados em formato PDF (lista/tabela)
 */

import PDFDocument from "pdfkit";

export interface PDFOptions {
  title?: string;
  includeHeaders?: boolean;
  pageSize?: "A4" | "LETTER";
  orientation?: "portrait" | "landscape";
}

export class PDFListRenderer {
  private options: Required<PDFOptions>;

  constructor(options: PDFOptions = {}) {
    this.options = {
      title: options.title || "Exportação de Dados",
      includeHeaders: options.includeHeaders !== false,
      pageSize: options.pageSize || "A4",
      orientation: options.orientation || "landscape",
    };
  }

  /**
   * Renderiza array de objetos em PDF
   */
  async render(data: any[], fields: string[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: this.options.pageSize,
          layout: this.options.orientation,
          margin: 50,
        });

        const chunks: Buffer[] = [];

        doc.on("data", chunk => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Título
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(this.options.title, { align: "center" });
        doc.moveDown();

        // Metadados
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, {
            align: "right",
          })
          .text(`Total de registros: ${data.length}`, { align: "right" });
        doc.moveDown();

        if (data.length === 0) {
          doc.fontSize(12).text("Nenhum dado para exibir.");
          doc.end();
          return;
        }

        // Tabela
        const tableTop = doc.y;
        const itemHeight = 20;
        const columnWidth = (doc.page.width - 100) / fields.length;

        // Headers
        if (this.options.includeHeaders) {
          doc.fontSize(10).font("Helvetica-Bold");
          fields.forEach((field, i) => {
            doc.text(this.truncate(field, 20), 50 + i * columnWidth, tableTop, {
              width: columnWidth - 5,
              align: "left",
            });
          });
          doc.moveDown();
        }

        // Data rows
        doc.fontSize(9).font("Helvetica");
        let currentY = doc.y;

        data.forEach((row, rowIndex) => {
          // Nova página se necessário
          if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 50;
          }

          fields.forEach((field, colIndex) => {
            const value = this.formatValue(row[field]);
            doc.text(
              this.truncate(value, 30),
              50 + colIndex * columnWidth,
              currentY,
              { width: columnWidth - 5, align: "left" }
            );
          });

          currentY += itemHeight;
          doc.y = currentY;
        });

        // Rodapé
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc
            .fontSize(8)
            .text(`Página ${i + 1} de ${pageCount}`, 50, doc.page.height - 50, {
              align: "center",
            });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Formata valores para PDF
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (value instanceof Date) {
      return value.toLocaleDateString("pt-BR");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Trunca texto para caber na célula
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Retorna o MIME type
   */
  getMimeType(): string {
    return "application/pdf";
  }

  /**
   * Retorna a extensão do arquivo
   */
  getFileExtension(): string {
    return "pdf";
  }
}
