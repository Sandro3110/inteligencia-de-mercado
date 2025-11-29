import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mercados, chartData } = body;

    // Criar PDF
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Comparação de Mercados', 14, 22);
    
    // Data
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    let yPosition = 40;

    // Tabela de métricas principais
    doc.setFontSize(14);
    doc.text('Métricas Gerais', 14, yPosition);
    yPosition += 10;

    const tableData = mercados.map((m: any) => [
      m.nome,
      m.segmentacao,
      m.totalClientes.toString(),
      m.totalConcorrentes.toString(),
      m.totalLeads.toString(),
      m.qualidadeMediaGeral.toFixed(1) + '%',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Mercado', 'Segmentação', 'Clientes', 'Concorrentes', 'Leads', 'Qualidade']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 15;

    // Tabela de qualidade detalhada
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Qualidade Detalhada', 14, yPosition);
    yPosition += 10;

    const qualityData = mercados.map((m: any) => [
      m.nome,
      m.qualidadeMediaClientes.toFixed(1) + '%',
      m.qualidadeMediaConcorrentes.toFixed(1) + '%',
      m.qualidadeMediaLeads.toFixed(1) + '%',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Mercado', 'Qualidade Clientes', 'Qualidade Concorrentes', 'Qualidade Leads']],
      body: qualityData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 15;

    // Métricas calculadas
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Métricas Calculadas', 14, yPosition);
    yPosition += 10;

    const calculatedData = mercados.map((m: any) => [
      m.nome,
      m.totalClientes > 0 ? (m.totalLeads / m.totalClientes).toFixed(2) : '0',
      m.totalClientes > 0 ? (m.totalConcorrentes / m.totalClientes).toFixed(2) : '0',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Mercado', 'Leads por Cliente', 'Concorrentes por Cliente']],
      body: calculatedData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [245, 158, 11] },
    });

    // Gerar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="comparacao_mercados.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}
