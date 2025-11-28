import { NextResponse } from 'next/server';
import { enrichClienteOptimized } from '@/server/enrichmentOptimized';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clienteId, projectId } = body;

    if (!clienteId || !projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'clienteId e projectId são obrigatórios',
        },
        { status: 400 }
      );
    }

    console.log(`[TEST] Enriquecendo cliente ${clienteId} do projeto ${projectId}...`);

    const startTime = Date.now();
    const result = await enrichClienteOptimized(clienteId, projectId);
    const duration = Date.now() - startTime;

    console.log(`[TEST] Resultado:`, result);

    return NextResponse.json({
      success: result.success,
      duration,
      result,
    });
  } catch (error: any) {
    console.error('[TEST] Erro:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
