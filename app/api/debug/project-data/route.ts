import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || '1'; // Default: Embalagens
    
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not set',
      });
    }

    const sql = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
    });

    try {
      // Buscar projeto
      const project = await sql`
        SELECT id, nome, status, ativo, descricao 
        FROM projects 
        WHERE id = ${projectId}
      `;

      // Buscar pesquisas do projeto
      const pesquisas = await sql`
        SELECT id, nome, status 
        FROM pesquisas 
        WHERE project_id = ${projectId}
        ORDER BY id
      `;

      // Contar entidades por projeto
      const clientes = await sql`
        SELECT COUNT(*)::int as count 
        FROM clientes 
        WHERE project_id = ${projectId}
      `;

      const concorrentes = await sql`
        SELECT COUNT(*)::int as count 
        FROM concorrentes 
        WHERE project_id = ${projectId}
      `;

      const leads = await sql`
        SELECT COUNT(*)::int as count 
        FROM leads 
        WHERE project_id = ${projectId}
      `;

      const mercados = await sql`
        SELECT COUNT(*)::int as count 
        FROM mercados_unicos 
        WHERE project_id = ${projectId}
      `;

      // Buscar alguns exemplos
      const clientesExemplos = await sql`
        SELECT id, nome, cnpj, validation_status 
        FROM clientes 
        WHERE project_id = ${projectId}
        LIMIT 3
      `;

      const concorrentesExemplos = await sql`
        SELECT id, nome, cnpj, validation_status 
        FROM concorrentes 
        WHERE project_id = ${projectId}
        LIMIT 3
      `;

      const leadsExemplos = await sql`
        SELECT id, nome, cnpj, validation_status 
        FROM leads 
        WHERE project_id = ${projectId}
        LIMIT 3
      `;

      const mercadosExemplos = await sql`
        SELECT id, nome, categoria 
        FROM mercados_unicos 
        WHERE project_id = ${projectId}
        LIMIT 3
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        projectId: parseInt(projectId),
        data: {
          project: project[0] || null,
          pesquisas: pesquisas,
          counts: {
            clientes: clientes[0].count,
            concorrentes: concorrentes[0].count,
            leads: leads[0].count,
            mercados: mercados[0].count,
          },
          examples: {
            clientes: clientesExemplos,
            concorrentes: concorrentesExemplos,
            leads: leadsExemplos,
            mercados: mercadosExemplos,
          },
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
