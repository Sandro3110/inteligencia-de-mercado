import PDFDocument from 'pdfkit';
import { storagePut } from "../storage";
import { Readable } from 'stream';

/**
 * Renderer para PDF em formato de lista tabular
 */
export class PDFListRenderer {
  private readonly PAGE_WIDTH = 595; // A4
  private readonly PAGE_HEIGHT = 842;
  private readonly MARGIN = 50;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (this.MARGIN * 2);

  /**
   * Renderiza dados em formato PDF lista e faz upload para S3
   */
  async render(
    data: any[],
    selectedFields: string[],
    title: string = 'Exportação de Dados'
  ): Promise<{ url: string; size: number }> {
    if (data.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    return new Promise((resolve, reject) => {
      try {
        // Cria documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: this.MARGIN, bottom: this.MARGIN, left: this.MARGIN, right: this.MARGIN }
        });

        // Buffer para coletar chunks
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);

            // Faz upload para S3
            const filename = `export_${Date.now()}.pdf`;
            const { url } = await storagePut(`exports/${filename}`, buffer, 'application/pdf');

            resolve({
              url,
              size: buffer.length
            });
          } catch (error) {
            reject(error);
          }
        });

        // Renderiza conteúdo
        this.renderHeader(doc, title, data.length);
        this.renderTable(doc, data, selectedFields);
        this.renderFooter(doc);

        // Finaliza documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renderiza cabeçalho do PDF
   */
  private renderHeader(doc: PDFKit.PDFDocument, title: string, recordCount: number): void {
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica')
      .text(`Data: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.text(`Total de Registros: ${recordCount}`, { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(this.MARGIN, doc.y).lineTo(this.PAGE_WIDTH - this.MARGIN, doc.y).stroke();
    doc.moveDown(1);
  }

  /**
   * Renderiza tabela de dados
   */
  private renderTable(doc: PDFKit.PDFDocument, data: any[], fields: string[]): void {
    const rowHeight = 25;
    const colWidth = this.CONTENT_WIDTH / Math.min(fields.length, 6); // Máximo 6 colunas por página

    // Se houver mais de 6 campos, divide em múltiplas tabelas
    const fieldChunks = this.chunkArray(fields, 6);

    fieldChunks.forEach((fieldChunk, chunkIndex) => {
      if (chunkIndex > 0) {
        doc.addPage();
        this.renderHeader(doc, 'Exportação de Dados (continuação)', data.length);
      }

      // Renderiza header da tabela
      let x = this.MARGIN;
      let y = doc.y;

      doc.fontSize(9).font('Helvetica-Bold');
      fieldChunk.forEach(field => {
        doc.text(this.truncate(field, 20), x, y, { width: colWidth, align: 'left' });
        x += colWidth;
      });

      y += rowHeight;
      doc.moveTo(this.MARGIN, y).lineTo(this.PAGE_WIDTH - this.MARGIN, y).stroke();

      // Renderiza linhas de dados
      doc.font('Helvetica').fontSize(8);

      data.forEach((record, index) => {
        // Verifica se precisa de nova página
        if (y + rowHeight > this.PAGE_HEIGHT - this.MARGIN) {
          doc.addPage();
          y = this.MARGIN;

          // Re-renderiza header
          x = this.MARGIN;
          doc.fontSize(9).font('Helvetica-Bold');
          fieldChunk.forEach(field => {
            doc.text(this.truncate(field, 20), x, y, { width: colWidth, align: 'left' });
            x += colWidth;
          });
          y += rowHeight;
          doc.moveTo(this.MARGIN, y).lineTo(this.PAGE_WIDTH - this.MARGIN, y).stroke();
          doc.font('Helvetica').fontSize(8);
        }

        x = this.MARGIN;
        fieldChunk.forEach(field => {
          const value = this.formatValue(record[field]);
          doc.text(this.truncate(value, 30), x, y, { width: colWidth, align: 'left' });
          x += colWidth;
        });

        y += rowHeight;

        // Linha separadora a cada 5 registros
        if ((index + 1) % 5 === 0) {
          doc.moveTo(this.MARGIN, y).lineTo(this.PAGE_WIDTH - this.MARGIN, y).stroke('#CCCCCC');
        }
      });

      doc.moveDown(2);
    });
  }

  /**
   * Renderiza rodapé do PDF
   */
  private renderFooter(doc: PDFKit.PDFDocument): void {
    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      doc.fontSize(8).font('Helvetica')
        .text(
          `Página ${i + 1} de ${pages.count} | Gestor PAV - Inteligência de Mercado`,
          this.MARGIN,
          this.PAGE_HEIGHT - this.MARGIN + 10,
          { align: 'center' }
        );
    }
  }

  /**
   * Formata valor para exibição
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (value instanceof Date) return value.toLocaleDateString('pt-BR');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  /**
   * Trunca texto para caber na célula
   */
  private truncate(text: string, maxLength: number): string {
    if (!text) return '';
    const str = String(text);
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
  }

  /**
   * Divide array em chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Exporta instância singleton
export const pdfListRenderer = new PDFListRenderer();
