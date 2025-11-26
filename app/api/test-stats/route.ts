import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { projects, pesquisas, mercadosUnicos, leads } from '@/drizzle/schema';
import { count, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIdParam = searchParams.get('projectId');
    const projectId = projectIdParam ? Number(projectIdParam) : null;

    const db = await getDb();
    
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Contar projetos ativos
    const projectsCount = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.ativo, 1));

    // Se projectId fornecido, buscar stats específicas do projeto
    if (projectId) {
      const [pesquisasCount, mercadosCount, leadsCount] = await Promise.all([
        db.select({ count: count() }).from(pesquisas).where(eq(pesquisas.projectId, projectId)),
        db.select({ count: count() }).from(mercadosUnicos).where(eq(mercadosUnicos.projectId, projectId)),
        db.select({ count: count() }).from(leads).where(eq(leads.projectId, projectId)),
      ]);

      return NextResponse.json({
        success: true,
        projectId,
        stats: {
          projects: projectsCount[0]?.count || 0,
          pesquisas: pesquisasCount[0]?.count || 0,
          mercados: mercadosCount[0]?.count || 0,
          leads: leadsCount[0]?.count || 0,
        },
      });
    }

    // Stats gerais (todos os projetos)
    const [allPesquisas, allMercados, allLeads] = await Promise.all([
      db.select({ count: count() }).from(pesquisas),
      db.select({ count: count() }).from(mercadosUnicos),
      db.select({ count: count() }).from(leads),
    ]);

    return NextResponse.json({
      success: true,
      projectId: null,
      stats: {
        projects: projectsCount[0]?.count || 0,
        pesquisas: allPesquisas[0]?.count || 0,
        mercados: allMercados[0]?.count || 0,
        leads: allLeads[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error in test-stats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
