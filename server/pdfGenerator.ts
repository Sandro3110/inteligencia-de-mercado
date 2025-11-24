import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface TerritorialReportData {
  projectName: string;
  totalStates: number;
  totalCities: number;
  totalClients: number;
  totalCompetitors: number;
  totalLeads: number;
  stateRanking: Array<{
    state: string;
    clients: number;
    competitors: number;
    leads: number;
    score: number;
  }>;
  cityRanking: Array<{
    city: string;
    state: string;
    clients: number;
    competitors: number;
    leads: number;
    score: number;
  }>;
  insights: string[];
  recommendations: string[];
  generatedAt: Date;
}

export async function generateTerritorialReportPDF(
  data: TerritorialReportData
): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper para adicionar nova página se necessário
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Título
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Análise Territorial", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  // Subtítulo - Projeto
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Projeto: ${data.projectName}`, pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 5;

  // Data de geração
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Gerado em: ${data.generatedAt.toLocaleDateString("pt-BR")} às ${data.generatedAt.toLocaleTimeString("pt-BR")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 15;

  // Resumo Executivo
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("📊 Resumo Executivo", 14, yPosition);
  yPosition += 10;

  // Cards de métricas
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const metrics = [
    { label: "Estados Cobertos", value: data.totalStates },
    { label: "Cidades Mapeadas", value: data.totalCities },
    { label: "Clientes Identificados", value: data.totalClients },
    { label: "Concorrentes Mapeados", value: data.totalCompetitors },
    { label: "Leads Gerados", value: data.totalLeads },
  ];

  metrics.forEach(metric => {
    doc.text(`• ${metric.label}: ${metric.value}`, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 10;
  checkPageBreak(60);

  // Ranking de Estados
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("🏆 Ranking de Estados", 14, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [["Estado", "Clientes", "Concorrentes", "Leads", "Score"]],
    body: data.stateRanking
      .slice(0, 10)
      .map(s => [
        s.state,
        s.clients.toString(),
        s.competitors.toString(),
        s.leads.toString(),
        s.score.toFixed(1),
      ]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 10 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  checkPageBreak(60);

  // Ranking de Cidades
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("🏙️ Top 10 Cidades", 14, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [["Cidade", "Estado", "Clientes", "Concorrentes", "Leads", "Score"]],
    body: data.cityRanking
      .slice(0, 10)
      .map(c => [
        c.city,
        c.state,
        c.clients.toString(),
        c.competitors.toString(),
        c.leads.toString(),
        c.score.toFixed(1),
      ]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 9 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  checkPageBreak(60);

  // Insights
  if (data.insights.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("💡 Insights Principais", 14, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    data.insights.forEach(insight => {
      checkPageBreak(15);
      const lines = doc.splitTextToSize(`• ${insight}`, pageWidth - 30);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 7;
    });

    yPosition += 10;
  }

  checkPageBreak(60);

  // Recomendações
  if (data.recommendations.length > 0) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("🎯 Recomendações Estratégicas", 14, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    data.recommendations.forEach((rec, index) => {
      checkPageBreak(15);
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 30);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 7;
    });
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Gestor PAV - Análise Territorial | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Retornar como Buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
