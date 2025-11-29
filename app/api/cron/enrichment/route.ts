import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { enrichmentJobs, clientes, pesquisas, systemSettings } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { enrichClienteOptimized } from '@/server/enrichmentOptimized';
import { logEnrichmentCompleted, logEnrichmentFailed } from '@/server/utils/auditLog';

/**
 * Vercel Cron Job para processar enriquecimento em background
 * Executa a cada 1 minuto e processa 1 cliente por vez
 *
 * GET /api/cron/enrichment
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const db = await getDb();
    if (!db) {
      console.error('[Cron] Database connection failed');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 1. Buscar API key
    const [openaiSetting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, 'OPENAI_API_KEY'))
      .limit(1);

    if (!openaiSetting || !openaiSetting.settingValue) {
      console.error('[Cron] OpenAI API key not configured');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const apiKey = openaiSetting.settingValue;

    // 2. Buscar jobs ativos (running)
    const activeJobs = await db
      .select()
      .from(enrichmentJobs)
      .where(eq(enrichmentJobs.status, 'running'))
      .limit(1);

    if (activeJobs.length === 0) {
      console.log('[Cron] No active jobs found');
      return NextResponse.json({
        message: 'No active jobs',
        executionTime: `${Date.now() - startTime}ms`,
      });
    }

    const job = activeJobs[0];
    console.log(
      `[Cron] Processing job ${job.id}, progress: ${job.processedClientes}/${job.totalClientes}`
    );

    // 3. Buscar pesquisa
    const [pesquisa] = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.id, job.projectId))
      .limit(1);

    if (!pesquisa) {
      console.error(`[Cron] Pesquisa ${job.projectId} not found`);
      return NextResponse.json({ error: 'Pesquisa not found' }, { status: 404 });
    }

    // 4. Buscar próximo cliente não processado
    const allClientes = await db
      .select()
      .from(clientes)
      .where(eq(clientes.pesquisaId, job.projectId));

    if (allClientes.length === 0) {
      console.error(`[Cron] No clientes found for pesquisa ${job.projectId}`);
      return NextResponse.json({ error: 'No clientes found' }, { status: 404 });
    }

    // Verificar se já processamos todos
    if (job.processedClientes >= job.totalClientes) {
      console.log(`[Cron] Job ${job.id} completed! Updating status...`);

      // Atualizar job como concluído
      await db
        .update(enrichmentJobs)
        .set({
          status: 'completed',
          completedAt: new Date().toISOString(),
        })
        .where(eq(enrichmentJobs.id, job.id));

      // Atualizar pesquisa
      await db
        .update(pesquisas)
        .set({
          status: 'concluido',
          clientesEnriquecidos: job.successClientes,
        })
        .where(eq(pesquisas.id, job.projectId));

      // Log de auditoria
      await logEnrichmentCompleted({
        pesquisaId: job.projectId,
        pesquisaNome: pesquisa.nome,
        totalClientes: job.totalClientes,
        successClientes: job.successClientes,
        failedClientes: job.failedClientes,
        durationMinutes: Math.round((Date.now() - new Date(job.startedAt).getTime()) / 60000),
      });

      return NextResponse.json({
        message: 'Job completed successfully',
        jobId: job.id,
        totalClientes: job.totalClientes,
        successClientes: job.successClientes,
        failedClientes: job.failedClientes,
        executionTime: `${Date.now() - startTime}ms`,
      });
    }

    // 5. Pegar o próximo cliente para processar
    const cliente = allClientes[job.processedClientes];

    console.log(`[Cron] Processing cliente ${cliente.id}: ${cliente.nome}`);

    // 6. Processar cliente
    try {
      await enrichClienteOptimized({
        clienteId: cliente.id,
        pesquisaId: job.projectId,
        projectId: pesquisa.projectId,
        apiKey,
      });

      // Atualizar progresso (sucesso)
      await db
        .update(enrichmentJobs)
        .set({
          processedClientes: job.processedClientes + 1,
          successClientes: job.successClientes + 1,
          lastClienteId: cliente.id,
        })
        .where(eq(enrichmentJobs.id, job.id));

      // Atualizar contador na pesquisa
      await db
        .update(pesquisas)
        .set({
          clientesEnriquecidos: job.successClientes + 1,
        })
        .where(eq(pesquisas.id, job.projectId));

      console.log(`[Cron] Cliente ${cliente.id} processed successfully`);

      return NextResponse.json({
        message: 'Cliente processed successfully',
        jobId: job.id,
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        progress: `${job.processedClientes + 1}/${job.totalClientes}`,
        executionTime: `${Date.now() - startTime}ms`,
      });
    } catch (error: any) {
      console.error(`[Cron] Error processing cliente ${cliente.id}:`, error);

      // Atualizar progresso (falha)
      await db
        .update(enrichmentJobs)
        .set({
          processedClientes: job.processedClientes + 1,
          failedClientes: job.failedClientes + 1,
          lastClienteId: cliente.id,
          errorMessage: error.message,
        })
        .where(eq(enrichmentJobs.id, job.id));

      return NextResponse.json(
        {
          message: 'Cliente processing failed',
          jobId: job.id,
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          error: error.message,
          progress: `${job.processedClientes + 1}/${job.totalClientes}`,
          executionTime: `${Date.now() - startTime}ms`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        executionTime: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
