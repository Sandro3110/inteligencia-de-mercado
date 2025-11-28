import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('[TEST-USERS] Verificando estrutura da tabela users');
    
    // Query para ver as colunas da tabela users
    const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('[TEST-USERS] Colunas encontradas:', columns);
    
    // Tentar fazer um SELECT * LIMIT 1 para ver a estrutura real
    const sample = await db.execute(sql`SELECT * FROM users LIMIT 1`);
    
    console.log('[TEST-USERS] Amostra de dados:', sample);
    
    return NextResponse.json({
      success: true,
      columns: columns.rows,
      sample: sample.rows[0] || null,
      sampleKeys: sample.rows[0] ? Object.keys(sample.rows[0]) : []
    });
  } catch (error) {
    console.error('[TEST-USERS] Erro:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
