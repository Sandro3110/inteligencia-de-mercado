import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFSection {
  title: string;
  content: string;
}

export interface PDFData {
  title: string;
  subtitle?: string;
  projectId?: number;
  date: string;
  statistics?: Array<{ label: string; value: string | number }>;
  sections: PDFSection[];
}

/**
 * Gera PDF profissional com layout padronizado
 */
export function generatePDF(data: PDFData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = 0;

  // ========================================
  // CABEÇALHO AZUL
  // ========================================
  doc.setFillColor(37, 99, 235); // #2563eb
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text(data.title.toUpperCase(), pageWidth / 2, 20, { align: 'center' });

  // Subtítulo
  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(224, 231, 255); // #e0e7ff
    doc.text(data.subtitle, pageWidth / 2, 30, { align: 'center' });
  }

  // Info do projeto e data
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const infoText = data.projectId ? `Projeto ID: ${data.projectId} | ${data.date}` : data.date;
  doc.text(infoText, pageWidth / 2, 42, { align: 'center' });

  yPosition = 60;

  // ========================================
  // ESTATÍSTICAS (se houver)
  // ========================================
  if (data.statistics && data.statistics.length > 0) {
    // Caixa azul claro
    doc.setFillColor(240, 249, 255); // #f0f9ff
    doc.setDrawColor(37, 99, 235); // #2563eb
    doc.setLineWidth(0.5);
    const boxHeight = 10 + data.statistics.length * 7;
    doc.rect(margin, yPosition, contentWidth, boxHeight, 'FD');

    // Título da caixa
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(14);
    doc.text('📊 ESTATÍSTICAS GERAIS', margin + 5, yPosition + 8);

    // Estatísticas
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let statY = yPosition + 15;
    for (const stat of data.statistics) {
      doc.text(`• ${stat.label}: ${stat.value}`, margin + 5, statY);
      statY += 7;
    }

    yPosition += boxHeight + 10;
  }

  // ========================================
  // SEÇÕES
  // ========================================
  doc.setTextColor(0, 0, 0);

  for (const section of data.sections) {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Separador azul
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Título da seção
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(16);
    doc.text(`📋 ${section.title.toUpperCase()}`, margin, yPosition);
    yPosition += 10;

    // Conteúdo da seção
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    // Quebrar texto em linhas
    const lines = doc.splitTextToSize(section.content, contentWidth);

    for (const line of lines) {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(line, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 5; // Espaço entre seções
  }

  // ========================================
  // RODAPÉ (última página)
  // ========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${totalPages} | Gerado em ${data.date}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Converter para Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

/**
 * Gera PDF com tabela SWOT
 */
export function generatePDFWithSWOT(
  data: PDFData,
  swot: {
    forcas: string[];
    fraquezas: string[];
    oportunidades: string[];
    ameacas: string[];
  }
): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = 0;

  // Cabeçalho (mesmo código anterior)
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text(data.title.toUpperCase(), pageWidth / 2, 20, { align: 'center' });

  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(224, 231, 255);
    doc.text(data.subtitle, pageWidth / 2, 30, { align: 'center' });
  }

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const infoText = data.projectId ? `Projeto ID: ${data.projectId} | ${data.date}` : data.date;
  doc.text(infoText, pageWidth / 2, 42, { align: 'center' });

  yPosition = 60;

  // Estatísticas (se houver)
  if (data.statistics && data.statistics.length > 0) {
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    const boxHeight = 10 + data.statistics.length * 7;
    doc.rect(margin, yPosition, contentWidth, boxHeight, 'FD');

    doc.setTextColor(37, 99, 235);
    doc.setFontSize(14);
    doc.text('📊 ESTATÍSTICAS GERAIS', margin + 5, yPosition + 8);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let statY = yPosition + 15;
    for (const stat of data.statistics) {
      doc.text(`• ${stat.label}: ${stat.value}`, margin + 5, statY);
      statY += 7;
    }

    yPosition += boxHeight + 10;
  }

  // Seções normais
  doc.setTextColor(0, 0, 0);

  for (const section of data.sections) {
    if (section.title.toLowerCase().includes('swot')) {
      // Renderizar SWOT como tabela
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.8);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setTextColor(37, 99, 235);
      doc.setFontSize(16);
      doc.text('📋 ANÁLISE SWOT', margin, yPosition);
      yPosition += 10;

      // Tabela SWOT
      autoTable(doc, {
        startY: yPosition,
        head: [['Forças', 'Fraquezas']],
        body: [[swot.forcas.join('\n'), swot.fraquezas.join('\n')]],
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: margin, right: margin },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Oportunidades', 'Ameaças']],
        body: [[swot.oportunidades.join('\n'), swot.ameacas.join('\n')]],
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 12,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: margin, right: margin },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      // Seção normal
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.8);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      doc.setTextColor(37, 99, 235);
      doc.setFontSize(16);
      doc.text(`📋 ${section.title.toUpperCase()}`, margin, yPosition);
      yPosition += 10;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      const lines = doc.splitTextToSize(section.content, contentWidth);

      for (const line of lines) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(line, margin, yPosition);
        yPosition += 6;
      }

      yPosition += 5;
    }
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${totalPages} | Gerado em ${data.date}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
