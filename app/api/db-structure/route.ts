import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    console.log('[DB-STRUCTURE] Listando tabelas...');
    
    // Listar todas as tabelas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`[DB-STRUCTURE] Encontradas ${tables.length} tabelas`);
    
    const structure: Record<string, any> = {};
    
    // Para cada tabela, buscar colunas
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`[DB-STRUCTURE] Mapeando: ${tableName}`);
      
      const columns = await sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      // Pegar amostra
      let sampleKeys: string[] = [];
      try {
        const sample = await sql.unsafe(`SELECT * FROM "${tableName}" LIMIT 1`);
        if (sample && sample.length > 0) {
          sampleKeys = Object.keys(sample[0]);
        }
      } catch (err) {
        console.log(`[DB-STRUCTURE] Erro ao buscar amostra de ${tableName}`);
      }
      
      structure[tableName] = {
        columns: columns.map((c: any) => ({
          name: c.column_name,
          type: c.data_type,
          nullable: c.is_nullable === 'YES',
          default: c.column_default
        })),
        sampleKeys
      };
    }
    
    await sql.end();
    
    return NextResponse.json({
      success: true,
      tableCount: tables.length,
      tables: tables.map((t: any) => t.table_name),
      structure
    });
  } catch (error) {
    await sql.end();
    console.error('[DB-STRUCTURE] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
