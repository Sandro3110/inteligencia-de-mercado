import PDFDocument from 'pdfkit';
import { storagePut } from "../storage";
import { AnalysisResult, Insight } from "../services/analysisService";

/**
 * Renderer para PDF em formato de relatório executivo
 */
export class PDFReportRenderer {
  private readonly PAGE_WIDTH = 595; // A4
  private readonly PAGE_HEIGHT = 842;
  private readonly MARGIN = 60;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (this.MARGIN * 2);

  /**
   * Renderiza relatório executivo em PDF e faz upload para S3
   */
  async render(
    title: string,
    analysis: AnalysisResult,
    data: any[]
  ): Promise<{ url: string; size: number }> {
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
            const filename = `report_${Date.now()}.pdf`;
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
        this.renderCover(doc, title, analysis);
        this.renderTableOfContents(doc);
        this.renderExecutiveSummary(doc, analysis);
        this.renderMetrics(doc, analysis.metrics);
        this.renderInsights(doc, analysis.insights);
        
        if (analysis.swot) {
          this.renderSWOT(doc, analysis.swot);
        }
        
        this.renderRecommendations(doc, analysis.recommendations);
        this.renderDataSample(doc, data);
        this.renderFooters(doc);

        // Finaliza documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renderiza capa do relatório
   */
  private renderCover(doc: PDFKit.PDFDocument, title: string, analysis: AnalysisResult): void {
    // Fundo azul
    doc.rect(0, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT).fill('#1e40af');

    // Título
    doc.fontSize(32).font('Helvetica-Bold').fillColor('#FFFFFF')
      .text(title, this.MARGIN, 250, { align: 'center', width: this.CONTENT_WIDTH });

    doc.moveDown(2);

    // Subtítulo
    doc.fontSize(16).font('Helvetica')
      .text('Relatório de Inteligência de Mercado', { align: 'center' });

    doc.moveDown(4);

    // Data
    doc.fontSize(12)
      .text(new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      }), { align: 'center' });

    // Rodapé da capa
    doc.fontSize(10)
      .text('Gestor PAV - Inteligência de Mercado', this.MARGIN, this.PAGE_HEIGHT - 100, { 
        align: 'center' 
      });

    doc.addPage();
  }

  /**
   * Renderiza sumário
   */
  private renderTableOfContents(doc: PDFKit.PDFDocument): void {
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000')
      .text('Sumário', this.MARGIN, this.MARGIN);

    doc.moveDown(2);

    const sections = [
      '1. Sumário Executivo',
      '2. Métricas Principais',
      '3. Insights Estratégicos',
      '4. Análise SWOT',
      '5. Recomendações',
      '6. Amostra de Dados'
    ];

    doc.fontSize(12).font('Helvetica');
    sections.forEach((section, index) => {
      doc.text(section, { indent: 20 });
      doc.moveDown(0.5);
    });

    doc.addPage();
  }

  /**
   * Renderiza sumário executivo
   */
  private renderExecutiveSummary(doc: PDFKit.PDFDocument, analysis: AnalysisResult): void {
    this.renderSectionHeader(doc, '1. Sumário Executivo');

    doc.fontSize(11).font('Helvetica')
      .text(analysis.summary, { align: 'justify', lineGap: 5 });

    doc.moveDown(2);
  }

  /**
   * Renderiza métricas principais
   */
  private renderMetrics(doc: PDFKit.PDFDocument, metrics: Record<string, any>): void {
    this.renderSectionHeader(doc, '2. Métricas Principais');

    const metricsToShow = Object.entries(metrics).slice(0, 8);
    const colWidth = this.CONTENT_WIDTH / 2;
    let x = this.MARGIN;
    let y = doc.y;

    metricsToShow.forEach(([ key, value], index) => {
      // Nova linha a cada 2 métricas
      if (index % 2 === 0 && index > 0) {
        y += 80;
        x = this.MARGIN;
      }

      // Box da métrica
      doc.rect(x, y, colWidth - 10, 70).fillAndStroke('#f0f9ff', '#3b82f6');

      // Label
      doc.fontSize(10).font('Helvetica').fillColor('#64748b')
        .text(this.formatMetricLabel(key), x + 10, y + 10, { width: colWidth - 30 });

      // Valor
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af')
        .text(this.formatMetricValue(value), x + 10, y + 30, { width: colWidth - 30 });

      x += colWidth;
    });

    doc.moveDown(6);
  }

  /**
   * Renderiza insights estratégicos
   */
  private renderInsights(doc: PDFKit.PDFDocument, insights: Insight[]): void {
    this.renderSectionHeader(doc, '3. Insights Estratégicos');

    insights.forEach((insight, index) => {
      // Verifica se precisa de nova página
      if (doc.y > this.PAGE_HEIGHT - 150) {
        doc.addPage();
      }

      // Ícone de impacto
      const impactColor = this.getImpactColor(insight.impact);
      doc.circle(this.MARGIN + 8, doc.y + 8, 6).fill(impactColor);

      // Título do insight
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000')
        .text(insight.title, this.MARGIN + 25, doc.y - 8);

      doc.moveDown(0.5);

      // Categoria e impacto
      doc.fontSize(9).font('Helvetica').fillColor('#64748b')
        .text(`${this.formatCategory(insight.category)} | Impacto: ${insight.impact.toUpperCase()}`, 
          this.MARGIN + 25);

      doc.moveDown(0.5);

      // Descrição
      doc.fontSize(11).font('Helvetica').fillColor('#000000')
        .text(insight.description, this.MARGIN + 25, doc.y, { 
          align: 'justify', 
          lineGap: 3 
        });

      doc.moveDown(1.5);

      // Linha separadora
      if (index < insights.length - 1) {
        doc.moveTo(this.MARGIN, doc.y).lineTo(this.PAGE_WIDTH - this.MARGIN, doc.y)
          .stroke('#e2e8f0');
        doc.moveDown(1);
      }
    });

    doc.addPage();
  }

  /**
   * Renderiza análise SWOT
   */
  private renderSWOT(doc: PDFKit.PDFDocument, swot: any): void {
    this.renderSectionHeader(doc, '4. Análise SWOT');

    const quadrants = [
      { title: 'Forças', items: swot.strengths, color: '#10b981', x: this.MARGIN, y: doc.y },
      { title: 'Fraquezas', items: swot.weaknesses, color: '#ef4444', x: this.PAGE_WIDTH / 2 + 5, y: doc.y },
      { title: 'Oportunidades', items: swot.opportunities, color: '#3b82f6', x: this.MARGIN, y: doc.y + 200 },
      { title: 'Ameaças', items: swot.threats, color: '#f59e0b', x: this.PAGE_WIDTH / 2 + 5, y: doc.y + 200 }
    ];

    const boxWidth = (this.CONTENT_WIDTH / 2) - 10;
    const boxHeight = 180;

    quadrants.forEach(quadrant => {
      // Box
      doc.rect(quadrant.x, quadrant.y, boxWidth, boxHeight).fillAndStroke('#ffffff', quadrant.color);

      // Título
      doc.fontSize(12).font('Helvetica-Bold').fillColor(quadrant.color)
        .text(quadrant.title, quadrant.x + 10, quadrant.y + 10);

      // Items
      doc.fontSize(9).font('Helvetica').fillColor('#000000');
      let itemY = quadrant.y + 35;

      quadrant.items.slice(0, 4).forEach((item: string) => {
        doc.text(`• ${item}`, quadrant.x + 10, itemY, { 
          width: boxWidth - 20,
          lineGap: 2
        });
        itemY += 30;
      });
    });

    doc.addPage();
  }

  /**
   * Renderiza recomendações
   */
  private renderRecommendations(doc: PDFKit.PDFDocument, recommendations: any): void {
    this.renderSectionHeader(doc, '5. Recomendações Estratégicas');

    const timelines = [
      { title: 'Ações Imediatas (0-30 dias)', items: recommendations.immediate, icon: '🔴' },
      { title: 'Curto Prazo (1-3 meses)', items: recommendations.shortTerm, icon: '🟡' },
      { title: 'Longo Prazo (3-12 meses)', items: recommendations.longTerm, icon: '🟢' }
    ];

    timelines.forEach(timeline => {
      // Verifica se precisa de nova página
      if (doc.y > this.PAGE_HEIGHT - 200) {
        doc.addPage();
      }

      // Título da timeline
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af')
        .text(`${timeline.icon} ${timeline.title}`);

      doc.moveDown(0.5);

      // Items
      doc.fontSize(11).font('Helvetica').fillColor('#000000');
      timeline.items.forEach((item: string, index: number) => {
        doc.text(`${index + 1}. ${item}`, { indent: 20, lineGap: 3 });
        doc.moveDown(0.5);
      });

      doc.moveDown(1);
    });

    doc.addPage();
  }

  /**
   * Renderiza amostra de dados
   */
  private renderDataSample(doc: PDFKit.PDFDocument, data: any[]): void {
    this.renderSectionHeader(doc, '6. Amostra de Dados');

    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
      .text(`Exibindo os primeiros 10 registros de ${data.length} total.`);

    doc.moveDown(1);

    // Tabela simples
    const sample = data.slice(0, 10);
    const fields = Object.keys(sample[0] || {}).slice(0, 4); // Primeiros 4 campos

    sample.forEach((record, index) => {
      if (doc.y > this.PAGE_HEIGHT - 100) {
        doc.addPage();
      }

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e40af')
        .text(`Registro ${index + 1}:`, this.MARGIN);

      fields.forEach(field => {
        doc.fontSize(8).font('Helvetica').fillColor('#000000')
          .text(`${field}: ${this.formatValue(record[field])}`, this.MARGIN + 20);
      });

      doc.moveDown(0.5);
    });
  }

  /**
   * Renderiza rodapés em todas as páginas
   */
  private renderFooters(doc: PDFKit.PDFDocument): void {
    const pages = doc.bufferedPageRange();

    for (let i = 1; i < pages.count; i++) { // Pula capa (página 0)
      doc.switchToPage(i);

      doc.fontSize(8).font('Helvetica').fillColor('#64748b')
        .text(
          `Página ${i} de ${pages.count - 1} | Gestor PAV - Inteligência de Mercado | ${new Date().toLocaleDateString('pt-BR')}`,
          this.MARGIN,
          this.PAGE_HEIGHT - this.MARGIN + 20,
          { align: 'center', width: this.CONTENT_WIDTH }
        );
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private renderSectionHeader(doc: PDFKit.PDFDocument, title: string): void {
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1e40af')
      .text(title, this.MARGIN, doc.y);

    doc.moveDown(0.5);
    doc.moveTo(this.MARGIN, doc.y).lineTo(this.PAGE_WIDTH - this.MARGIN, doc.y).stroke('#3b82f6');
    doc.moveDown(1);
  }

  private formatMetricLabel(key: string): string {
    const labels: Record<string, string> = {
      totalRecords: 'Total de Registros',
      avgQualityScore: 'Qualidade Média',
      highQualityCount: 'Alta Qualidade',
      conversionPotential: 'Potencial de Conversão',
      avgRevenue: 'Faturamento Médio'
    };
    return labels[key] || key;
  }

  private formatMetricValue(value: any): string {
    if (typeof value === 'number') {
      if (value > 1000000) {
        return `R$ ${(value / 1000000).toFixed(1)}M`;
      }
      if (value > 1000) {
        return value.toFixed(0);
      }
      return value.toFixed(1);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 20) + '...';
    }
    return String(value);
  }

  private getImpactColor(impact: string): string {
    const colors: Record<string, string> = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[impact] || '#64748b';
  }

  private formatCategory(category: string): string {
    const labels: Record<string, string> = {
      opportunity: '💡 Oportunidade',
      risk: '⚠️ Risco',
      trend: '📈 Tendência',
      recommendation: '✅ Recomendação'
    };
    return labels[category] || category;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (value instanceof Date) return value.toLocaleDateString('pt-BR');
    if (typeof value === 'object') return JSON.stringify(value).substring(0, 50);
    return String(value).substring(0, 100);
  }
}

// Exporta instância singleton
export const pdfReportRenderer = new PDFReportRenderer();
