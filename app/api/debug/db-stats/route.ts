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

    // Listar todas as tabelas do banco
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    // Tentar buscar pesquisas (pode não existir)
    let allPesquisas: any = { rows: [], error: null };
    try {
      allPesquisas = await db.execute(sql`
        SELECT id, nome, project_id as "projectId", status 
        FROM pesquisas 
        ORDER BY project_id, id 
        LIMIT 10
      `);
    } catch (e) {
      allPesquisas.error = e instanceof Error ? e.message : 'Erro ao buscar pesquisas';
    }

    // Tentar contar clientes
    let clientesCount: any = { rows: [], error: null };
    try {
      clientesCount = await db.execute(sql`
        SELECT project_id as "projectId", COUNT(*)::int as count 
        FROM clientes 
        GROUP BY project_id 
        ORDER BY project_id
      `);
    } catch (e) {
      clientesCount.error = e instanceof Error ? e.message : 'Erro ao contar clientes';
    }

    // Tentar contar concorrentes
    let concorrentesCount: any = { rows: [], error: null };
    try {
      concorrentesCount = await db.execute(sql`
        SELECT project_id as "projectId", COUNT(*)::int as count 
        FROM concorrentes 
        GROUP BY project_id 
        ORDER BY project_id
      `);
    } catch (e) {
      concorrentesCount.error = e instanceof Error ? e.message : 'Erro ao contar concorrentes';
    }

    // Tentar contar leads
    let leadsCount: any = { rows: [], error: null };
    try {
      leadsCount = await db.execute(sql`
        SELECT project_id as "projectId", COUNT(*)::int as count 
        FROM leads 
        GROUP BY project_id 
        ORDER BY project_id
      `);
    } catch (e) {
      leadsCount.error = e instanceof Error ? e.message : 'Erro ao contar leads';
    }

    // Tentar contar mercados
    let mercadosCount: any = { rows: [], error: null };
    try {
      mercadosCount = await db.execute(sql`
        SELECT project_id as "projectId", COUNT(*)::int as count 
        FROM "mercadosUnicos" 
        GROUP BY project_id 
        ORDER BY project_id
      `);
    } catch (e) {
      mercadosCount.error = e instanceof Error ? e.message : 'Erro ao contar mercados';
    }

    return NextResponse.json({
      success: true,
      data: {
        tables: tables.rows,
        projects: allProjects.rows,
        pesquisas: allPesquisas.rows || [],
        pesquisasError: allPesquisas.error,
        counts: {
          clientes: clientesCount.rows || [],
          clientesError: clientesCount.error,
          concorrentes: concorrentesCount.rows || [],
          concorrentesError: concorrentesCount.error,
          leads: leadsCount.rows || [],
          leadsError: leadsCount.error,
          mercados: mercadosCount.rows || [],
          mercadosError: mercadosCount.error,
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
