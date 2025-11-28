import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { pesquisas, clientes, leads, concorrentes, mercadosUnicos } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pesquisaId = parseInt(searchParams.get('pesquisaId') || '0');

    if (!pesquisaId) {
      return NextResponse.json({ error: 'pesquisaId é obrigatório' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com banco' }, { status: 500 });
    }

    // Buscar dados
    const [pesquisa] = await db.select().from(pesquisas).where(eq(pesquisas.id, pesquisaId));

    if (!pesquisa) {
      return NextResponse.json({ error: 'Pesquisa não encontrada' }, { status: 404 });
    }

    const [clientesData, leadsData, concorrentesData, mercadosData] = await Promise.all([
      db.select().from(clientes).where(eq(clientes.pesquisaId, pesquisaId)),
      db.select().from(leads).where(eq(leads.pesquisaId, pesquisaId)),
      db.select().from(concorrentes).where(eq(concorrentes.pesquisaId, pesquisaId)),
      db.select().from(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, pesquisaId)),
    ]);

    // Criar workbook
    const workbook = new ExcelJS.Workbook();

    // Aba 1: Resumo
    const resumoSheet = workbook.addWorksheet('Resumo');
    resumoSheet.columns = [
      { header: 'Métrica', key: 'metrica', width: 30 },
      { header: 'Valor', key: 'valor', width: 20 },
    ];
    resumoSheet.addRows([
      { metrica: 'Nome da Pesquisa', valor: pesquisa.nome },
      { metrica: 'Total de Clientes', valor: clientesData.length },
      { metrica: 'Total de Leads', valor: leadsData.length },
      { metrica: 'Total de Concorrentes', valor: concorrentesData.length },
      { metrica: 'Total de Mercados', valor: mercadosData.length },
    ]);

    // Aba 2: Clientes
    const clientesSheet = workbook.addWorksheet('Clientes');
    if (clientesData.length > 0) {
      const firstCliente = clientesData[0];
      clientesSheet.columns = Object.keys(firstCliente).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));
      clientesSheet.addRows(clientesData);
    }

    // Aba 3: Leads
    const leadsSheet = workbook.addWorksheet('Leads');
    if (leadsData.length > 0) {
      const firstLead = leadsData[0];
      leadsSheet.columns = Object.keys(firstLead).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));
      leadsSheet.addRows(leadsData);
    }

    // Aba 4: Concorrentes
    const concorrentesSheet = workbook.addWorksheet('Concorrentes');
    if (concorrentesData.length > 0) {
      const firstConcorrente = concorrentesData[0];
      concorrentesSheet.columns = Object.keys(firstConcorrente).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));
      concorrentesSheet.addRows(concorrentesData);
    }

    // Aba 5: Mercados
    const mercadosSheet = workbook.addWorksheet('Mercados');
    if (mercadosData.length > 0) {
      const firstMercado = mercadosData[0];
      mercadosSheet.columns = Object.keys(firstMercado).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));
      mercadosSheet.addRows(mercadosData);
    }

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Retornar arquivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pesquisa_${pesquisaId}_completo.xlsx"`,
      },
    });
  } catch (error) {
    console.error('[Export Excel] Error:', error);
    return NextResponse.json({ error: 'Erro ao gerar Excel' }, { status: 500 });
  }
}
