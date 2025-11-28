import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('[MAP-DATABASE] Iniciando mapeamento do banco de dados');
    
    // Listar todas as tabelas
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows as Array<{ table_name: string }>;
    console.log('[MAP-DATABASE] Tabelas encontradas:', tables.length);
    
    const databaseStructure: Record<string, any> = {};
    
    // Para cada tabela, buscar suas colunas
    for (const table of tables) {
      const tableName = table.table_name;
      
      const columnsResult = await db.execute(sql`
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `);
      
      const columns = columnsResult.rows;
      
      // Tentar pegar uma amostra de dados
      let sample = null;
      try {
        const sampleResult = await db.execute(sql.raw(`SELECT * FROM "${tableName}" LIMIT 1`));
        sample = sampleResult.rows?.[0] || null;
      } catch (err) {
        console.log(`[MAP-DATABASE] Erro ao buscar amostra de ${tableName}:`, err);
      }
      
      databaseStructure[tableName] = {
        columns: columns,
        sampleKeys: sample ? Object.keys(sample) : [],
        rowCount: null // Podemos adicionar depois se necessário
      };
    }
    
    console.log('[MAP-DATABASE] Mapeamento concluído');
    
    return NextResponse.json({
      success: true,
      tableCount: tables.length,
      tables: tables.map(t => t.table_name),
      structure: databaseStructure
    });
  } catch (error) {
    console.error('[MAP-DATABASE] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
