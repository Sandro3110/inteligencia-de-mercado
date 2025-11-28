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

    const sql = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
    });

    try {
      const projectId = 1; // Embalagens

      // Buscar projeto
      const project = await sql`
        SELECT id, nome, status, ativo 
        FROM projects 
        WHERE id = ${projectId}
      `;

      // Buscar pesquisas
      const pesquisas = await sql`
        SELECT id, nome, status 
        FROM pesquisas 
        WHERE "projectId" = ${projectId}
      `;

      // Contar entidades
      const clientesCount = await sql`
        SELECT COUNT(*)::int as count 
        FROM clientes 
        WHERE "projectId" = ${projectId}
      `;

      const concorrentesCount = await sql`
        SELECT COUNT(*)::int as count 
        FROM concorrentes 
        WHERE "projectId" = ${projectId}
      `;

      const leadsCount = await sql`
        SELECT COUNT(*)::int as count 
        FROM leads 
        WHERE "projectId" = ${projectId}
      `;

      const mercadosCount = await sql`
        SELECT COUNT(*)::int as count 
        FROM mercados_unicos 
        WHERE "projectId" = ${projectId}
      `;

      // Buscar exemplos
      const clientesExemplos = await sql`
        SELECT id, nome, cnpj, "validationStatus" 
        FROM clientes 
        WHERE "projectId" = ${projectId}
        LIMIT 3
      `;

      const concorrentesExemplos = await sql`
        SELECT id, nome, cnpj, "validationStatus" 
        FROM concorrentes 
        WHERE "projectId" = ${projectId}
        LIMIT 3
      `;

      const leadsExemplos = await sql`
        SELECT id, nome, cnpj, "validationStatus" 
        FROM leads 
        WHERE "projectId" = ${projectId}
        LIMIT 3
      `;

      const mercadosExemplos = await sql`
        SELECT id, nome, categoria 
        FROM mercados_unicos 
        WHERE "projectId" = ${projectId}
        LIMIT 3
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        projectId,
        data: {
          project: project[0] || null,
          pesquisas: pesquisas,
          counts: {
            clientes: clientesCount[0].count,
            concorrentes: concorrentesCount[0].count,
            leads: leadsCount[0].count,
            mercados: mercadosCount[0].count,
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
