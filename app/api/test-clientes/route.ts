/**
 * Rota de teste para verificar se a query de clientes funciona
 */

import { NextResponse } from 'next/server';
import { getServerlessDb } from '@/server/lib/drizzle-serverless';
import * as schema from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pesquisaId = parseInt(searchParams.get('pesquisaId') || '1');

    console.log('[TEST] Testing clientes query with pesquisaId:', pesquisaId);

    const db = await getServerlessDb();

    // Teste 1: COUNT
    const countResult = await db
      .select({ count: schema.clientes.id })
      .from(schema.clientes)
      .where(eq(schema.clientes.pesquisaId, pesquisaId));

    console.log('[TEST] Count result:', countResult.length);

    // Teste 2: SELECT com LIMIT
    const selectResult = await db
      .select()
      .from(schema.clientes)
      .where(eq(schema.clientes.pesquisaId, pesquisaId))
      .limit(5);

    console.log('[TEST] Select result:', selectResult.length, 'rows');

    return NextResponse.json({
      success: true,
      pesquisaId,
      countRows: countResult.length,
      selectRows: selectResult.length,
      sampleData: selectResult.length > 0 ? {
        id: selectResult[0].id,
        nome: selectResult[0].nome,
        cidade: selectResult[0].cidade,
      } : null,
    });
  } catch (error: any) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
