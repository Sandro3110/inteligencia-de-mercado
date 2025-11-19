import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExecutiveReportData } from '../../../server/generateExecutiveReport';

export function generateExecutivePDF(data: ExecutiveReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // ===== CAPA =====
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Executivo', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(data.projectName, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  const dateStr = new Date(data.generatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Gerado em: ${dateStr}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 30;
  doc.setTextColor(0);

  // ===== SUMÁRIO EXECUTIVO =====
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sumário Executivo', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Total de Mercados', data.summary.totalMercados.toString()],
    ['Total de Clientes', data.summary.totalClientes.toString()],
    ['Total de Concorrentes', data.summary.totalConcorrentes.toString()],
    ['Total de Leads', data.summary.totalLeads.toString()],
    ['Leads de Alta Qualidade (≥80)', `${data.summary.leadsHighQuality} (${((data.summary.leadsHighQuality / data.summary.totalLeads) * 100).toFixed(1)}%)`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ===== INSIGHTS ESTRATÉGICOS =====
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Insights Estratégicos', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  data.insights.forEach((insight, index) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    const lines = doc.splitTextToSize(`${index + 1}. ${insight}`, pageWidth - 40);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 3;
  });

  yPosition += 10;

  // ===== TOP 10 MERCADOS =====
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Mercados por Volume de Leads', 20, yPosition);
  yPosition += 10;

  const topMercadosData = data.topMercados.map((m) => [
    m.nome.length > 30 ? m.nome.substring(0, 27) + '...' : m.nome,
    m.segmentacao,
    m.totalClientes.toString(),
    m.totalConcorrentes.toString(),
    m.totalLeads.toString(),
    m.densidadeCompetitiva.toFixed(1),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Mercado', 'Seg.', 'Clientes', 'Concor.', 'Leads', 'Dens.']],
    body: topMercadosData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ===== ANÁLISE COMPETITIVA =====
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise Competitiva', 20, yPosition);
  yPosition += 10;

  const analiseData = [
    ['Mercado Mais Competitivo', data.analiseCompetitiva.mercadoMaisCompetitivo],
    ['Mercado Menos Competitivo', data.analiseCompetitiva.mercadoMenosCompetitivo],
    ['Média de Concorrentes por Mercado', data.analiseCompetitiva.mediaConcorrentesPorMercado.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Indicador', 'Valor']],
    body: analiseData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ===== LEADS PRIORITÁRIOS =====
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Leads Prioritários (Score ≥ 80) - Top ${Math.min(data.leadsPrioritarios.length, 20)}`, 20, yPosition);
  yPosition += 10;

  if (data.leadsPrioritarios.length > 0) {
    const leadsData = data.leadsPrioritarios.map((lead) => [
      lead.nome.length > 25 ? lead.nome.substring(0, 22) + '...' : lead.nome,
      lead.mercado.length > 20 ? lead.mercado.substring(0, 17) + '...' : lead.mercado,
      lead.score.toString(),
      lead.cnpj || '-',
      lead.email || '-',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Nome', 'Mercado', 'Score', 'CNPJ', 'Email']],
      body: leadsData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 15 },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 },
      },
      margin: { left: 20, right: 20 },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhum lead com score ≥ 80 encontrado.', 20, yPosition);
  }

  // ===== RODAPÉ EM TODAS AS PÁGINAS =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${totalPages} | Gestor PAV - Relatório Executivo`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Salvar PDF
  const fileName = `Relatorio_Executivo_${data.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
