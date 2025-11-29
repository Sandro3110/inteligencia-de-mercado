import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const result = await pool.query(`
      SELECT id, nome, "projectId"
      FROM pesquisas 
      WHERE nome ILIKE '%embalagem%'
      ORDER BY id DESC
      LIMIT 5
    `);
    
    await pool.end();
    
    return NextResponse.json({ pesquisas: result.rows });
  } catch (error) {
    console.error('[Find Pesquisa] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
