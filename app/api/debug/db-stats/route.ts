import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available',
      }, { status: 500 });
    }

    // Buscar todos os projetos
    const allProjects = await db.execute(sql`
      SELECT id, nome, status, ativo 
      FROM projects 
      ORDER BY id
    `);

    // Buscar todas as pesquisas
    const allPesquisas = await db.execute(sql`
      SELECT id, nome, project_id as "projectId", status 
      FROM pesquisas 
      ORDER BY project_id, id
    `);

    // Contar clientes por projeto
    const clientesCount = await db.execute(sql`
      SELECT project_id as "projectId", COUNT(*)::int as count 
      FROM clientes 
      GROUP BY project_id 
      ORDER BY project_id
    `);

    // Contar concorrentes por projeto
    const concorrentesCount = await db.execute(sql`
      SELECT project_id as "projectId", COUNT(*)::int as count 
      FROM concorrentes 
      GROUP BY project_id 
      ORDER BY project_id
    `);

    // Contar leads por projeto
    const leadsCount = await db.execute(sql`
      SELECT project_id as "projectId", COUNT(*)::int as count 
      FROM leads 
      GROUP BY project_id 
      ORDER BY project_id
    `);

    // Contar mercados por projeto
    const mercadosCount = await db.execute(sql`
      SELECT project_id as "projectId", COUNT(*)::int as count 
      FROM "mercadosUnicos" 
      GROUP BY project_id 
      ORDER BY project_id
    `);

    return NextResponse.json({
      success: true,
      data: {
        projects: allProjects.rows,
        pesquisas: allPesquisas.rows,
        counts: {
          clientes: clientesCount.rows,
          concorrentes: concorrentesCount.rows,
          leads: leadsCount.rows,
          mercados: mercadosCount.rows,
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
