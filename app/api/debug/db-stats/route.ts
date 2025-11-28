import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { projects, pesquisas, clientes, concorrentes, leads, mercadosUnicos } from '@/drizzle/schema';
import { sql, count } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();

    // Buscar todos os projetos
    const allProjects = await db.select({
      id: projects.id,
      nome: projects.nome,
      status: projects.status,
      ativo: projects.ativo,
    }).from(projects).orderBy(projects.id);

    // Buscar todas as pesquisas
    const allPesquisas = await db.select({
      id: pesquisas.id,
      nome: pesquisas.nome,
      projectId: pesquisas.projectId,
      status: pesquisas.status,
    }).from(pesquisas).orderBy(pesquisas.projectId, pesquisas.id);

    // Contar clientes por projeto
    const clientesCount = await db.select({
      projectId: clientes.projectId,
      count: count(),
    }).from(clientes).groupBy(clientes.projectId);

    // Contar concorrentes por projeto
    const concorrentesCount = await db.select({
      projectId: concorrentes.projectId,
      count: count(),
    }).from(concorrentes).groupBy(concorrentes.projectId);

    // Contar leads por projeto
    const leadsCount = await db.select({
      projectId: leads.projectId,
      count: count(),
    }).from(leads).groupBy(leads.projectId);

    // Contar mercados por projeto
    const mercadosCount = await db.select({
      projectId: mercadosUnicos.projectId,
      count: count(),
    }).from(mercadosUnicos).groupBy(mercadosUnicos.projectId);

    return NextResponse.json({
      success: true,
      data: {
        projects: allProjects,
        pesquisas: allPesquisas,
        counts: {
          clientes: clientesCount,
          concorrentes: concorrentesCount,
          leads: leadsCount,
          mercados: mercadosCount,
        },
      },
    });
  } catch (error) {
    console.error('[DEBUG] Erro ao consultar banco:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
