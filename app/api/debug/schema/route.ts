import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table') || 'clientes';
    
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
      // Buscar colunas da tabela
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;

      // Buscar um registro de exemplo
      const sample = await sql`
        SELECT * 
        FROM ${sql(tableName)} 
        LIMIT 1
      `;

      await sql.end();

      return NextResponse.json({
        success: true,
        table: tableName,
        columns: columns,
        sampleKeys: sample.length > 0 ? Object.keys(sample[0]) : [],
        sample: sample.length > 0 ? sample[0] : null,
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
