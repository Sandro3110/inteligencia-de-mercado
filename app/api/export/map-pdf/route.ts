import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  includeMap: boolean;
  includeMercados: boolean;
  includeClientes: boolean;
  includeLeads: boolean;
  includeConcorrentes: boolean;
}

interface Entity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  cidade?: string;
  uf?: string;
  setor?: string;
  porte?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mapImage, options, filters, entities } = body as {
      mapImage: string;
      options: ExportOptions;
      filters: any;
      entities: Entity[];
    };

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // ========== TÍTULO ==========
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Mapa Geográfico - Exportação', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // ========== DATA E FILTROS ==========
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, yPosition);
    yPosition += 6;

    // Mostrar filtros ativos
    const activeFilters: string[] = [];
    if (filters.projectId) activeFilters.push(`Projeto: ${filters.projectId}`);
    if (filters.pesquisaId) activeFilters.push(`Pesquisa: ${filters.pesquisaId}`);
    if (filters.uf) activeFilters.push(`Estado: ${filters.uf}`);
    if (filters.cidade) activeFilters.push(`Cidade: ${filters.cidade}`);
    if (filters.setor) activeFilters.push(`Setor: ${filters.setor}`);
    if (filters.porte) activeFilters.push(`Porte: ${filters.porte}`);
    if (filters.qualidade) activeFilters.push(`Qualidade: ${filters.qualidade}`);

    if (activeFilters.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Filtros: ${activeFilters.join(' | ')}`, 14, yPosition);
      yPosition += 8;
    } else {
      yPosition += 2;
    }

    // ========== IMAGEM DO MAPA ==========
    if (options.includeMap && mapImage) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Visualização do Mapa', 14, yPosition);
      yPosition += 8;

      // Adicionar imagem do mapa (ajustar tamanho para caber na página)
      const imgWidth = pageWidth - 28; // Margem de 14mm de cada lado
      const imgHeight = (imgWidth * 9) / 16; // Proporção 16:9

      if (yPosition + imgHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.addImage(mapImage, 'PNG', 14, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    }

    // ========== ESTATÍSTICAS GERAIS ==========
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Estatísticas Gerais', 14, yPosition);
    yPosition += 8;

    const clientes = entities.filter((e) => e.type === 'cliente');
    const leads = entities.filter((e) => e.type === 'lead');
    const concorrentes = entities.filter((e) => e.type === 'concorrente');

    const statsData = [
      ['Clientes', clientes.length.toString()],
      ['Leads', leads.length.toString()],
      ['Concorrentes', concorrentes.length.toString()],
      ['Total', entities.length.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Tipo', 'Quantidade']],
      body: statsData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 15;

    // ========== TABELAS DE ENTIDADES ==========

    // CLIENTES
    if (options.includeClientes && clientes.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Clientes (${clientes.length})`, 14, yPosition);
      yPosition += 8;

      const clientesData = clientes.slice(0, 100).map((c) => [
        c.nome || '-',
        c.cnpj || '-',
        c.cidade || '-',
        c.uf || '-',
        c.setor || '-',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nome', 'CNPJ', 'Cidade', 'UF', 'Setor']],
        body: clientesData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });

      // @ts-ignore
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // LEADS
    if (options.includeLeads && leads.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Leads (${leads.length})`, 14, yPosition);
      yPosition += 8;

      const leadsData = leads.slice(0, 100).map((l) => [
        l.nome || '-',
        l.cidade || '-',
        l.uf || '-',
        l.setor || '-',
        l.porte || '-',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nome', 'Cidade', 'UF', 'Setor', 'Porte']],
        body: leadsData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 14, right: 14 },
      });

      // @ts-ignore
      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // CONCORRENTES
    if (options.includeConcorrentes && concorrentes.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Concorrentes (${concorrentes.length})`, 14, yPosition);
      yPosition += 8;

      const concorrentesData = concorrentes.slice(0, 100).map((c) => [
        c.nome || '-',
        c.cidade || '-',
        c.uf || '-',
        c.porte || '-',
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Nome', 'Cidade', 'UF', 'Porte']],
        body: concorrentesData,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 14, right: 14 },
      });
    }

    // ========== RODAPÉ ==========
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Gerar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mapa_geografico.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
