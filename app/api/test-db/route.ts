import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { projects } from '@/drizzle/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[TEST-DB] Iniciando teste de conexão...');
    
    // Verificar variável de ambiente
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL não configurada',
        env: {
          VERCEL: process.env.VERCEL,
          NODE_ENV: process.env.NODE_ENV,
        }
      }, { status: 500 });
    }

    console.log('[TEST-DB] DATABASE_URL existe');
    console.log('[TEST-DB] VERCEL:', process.env.VERCEL);
    
    // Tentar conectar ao banco
    const db = await getDb();
    
    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível obter conexão com o banco',
      }, { status: 500 });
    }

    console.log('[TEST-DB] Conexão obtida, tentando query...');

    // Tentar fazer uma query simples
    const result = await db.select().from(projects).limit(5);

    console.log('[TEST-DB] Query executada com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Conexão com banco funcionando!',
      projectCount: result.length,
      projects: result.map(p => ({ id: p.id, nome: p.nome })),
      env: {
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV,
      }
    });

  } catch (error: any) {
    console.error('[TEST-DB] Erro:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      env: {
        VERCEL: process.env.VERCEL,
        NODE_ENV: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}
