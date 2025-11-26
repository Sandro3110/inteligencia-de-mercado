import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  let sql: any = null;
  
  try {
    console.log('[TEST-RAW] Iniciando teste com postgres-js direto...');
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL não configurada',
      }, { status: 500 });
    }

    console.log('[TEST-RAW] DATABASE_URL existe');
    console.log('[TEST-RAW] Criando conexão...');

    // Criar conexão direta com postgres-js
    sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
    });

    console.log('[TEST-RAW] Conexão criada, executando query...');

    // Query SQL RAW simples
    const result = await sql`
      SELECT id, nome, descricao 
      FROM projects 
      LIMIT 5
    `;

    console.log('[TEST-RAW] Query executada com sucesso!');
    console.log('[TEST-RAW] Resultados:', result.length);

    await sql.end();

    return NextResponse.json({
      success: true,
      message: 'Query RAW funcionou!',
      projectCount: result.length,
      projects: result,
      env: {
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV,
      }
    });

  } catch (error: any) {
    console.error('[TEST-RAW] Erro:', error);
    
    if (sql) {
      try {
        await sql.end();
      } catch (e) {
        console.error('[TEST-RAW] Erro ao fechar conexão:', e);
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack,
      env: {
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}
