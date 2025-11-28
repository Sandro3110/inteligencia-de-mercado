import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not set',
      });
    }

    // Criar conexão direta
    const sql = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require', // Forçar SSL
    });

    try {
      // Testar conexão básica
      const result = await sql`SELECT NOW() as now, version() as version`;
      
      // Listar tabelas
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;

      // Contar registros em projects
      const projectsCount = await sql`SELECT COUNT(*)::int as count FROM projects`;
      
      // Buscar alguns projetos
      const projects = await sql`SELECT id, nome, status, ativo FROM projects ORDER BY id LIMIT 5`;

      await sql.end();

      return NextResponse.json({
        success: true,
        connection: {
          time: result[0].now,
          version: result[0].version,
        },
        tables: tables.map(t => t.table_name),
        stats: {
          projectsCount: projectsCount[0].count,
          projects: projects,
        },
      });
    } catch (queryError) {
      await sql.end();
      throw queryError;
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
