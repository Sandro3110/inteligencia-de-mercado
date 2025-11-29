import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { enrichmentJobs, clientes, pesquisas } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { enrichClienteOptimized } from '@/server/enrichmentOptimized';

/**
 * Vercel Cron Job para processar enriquecimento em background
 * Executa a cada 1 minuto e processa até 5 clientes em paralelo
 *
 * GET /api/cron/enrichment
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const BATCH_SIZE = 5; // Processar 5 clientes por execução

  try {
    const db = await getDb();
    if (!db) {
      console.error('[Cron] Database connection failed');
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 1. Buscar jobs ativos (running)
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

    // 2. Buscar pesquisa
    const [pesquisa] = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.id, job.projectId))
      .limit(1);

    if (!pesquisa) {
      console.error(`[Cron] Pesquisa ${job.projectId} not found`);
      return NextResponse.json({ error: 'Pesquisa not found' }, { status: 404 });
    }

    // 3. Buscar todos os clientes da pesquisa
    const allClientes = await db
      .select()
      .from(clientes)
      .where(eq(clientes.pesquisaId, job.projectId));

    if (allClientes.length === 0) {
      console.error(`[Cron] No clientes found for pesquisa ${job.projectId}`);
      return NextResponse.json({ error: 'No clientes found' }, { status: 404 });
    }

    // 4. Verificar se já processamos todos
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

      return NextResponse.json({
        message: 'Job completed successfully',
        jobId: job.id,
        totalClientes: job.totalClientes,
        successClientes: job.successClientes,
        failedClientes: job.failedClientes,
        executionTime: `${Date.now() - startTime}ms`,
      });
    }

    // 5. Pegar próximo lote de clientes para processar
    const clientesToProcess = allClientes.slice(
      job.processedClientes,
      job.processedClientes + BATCH_SIZE
    );

    console.log(`[Cron] Processing batch of ${clientesToProcess.length} clientes`);

    // 6. Processar clientes EM PARALELO
    const results = await Promise.allSettled(
      clientesToProcess.map(async (cliente) => {
        console.log(`[Cron] Processing cliente ${cliente.id}: ${cliente.nome}`);

        try {
          // CHAMADA CORRETA: Passar parâmetros diretos, não objeto!
          const result = await enrichClienteOptimized(cliente.id, pesquisa.projectId);

          console.log(`[Cron] Cliente ${cliente.id} processed:`, {
            success: result.success,
            mercados: result.mercadosCreated,
            produtos: result.produtosCreated,
            concorrentes: result.concorrentesCreated,
            leads: result.leadsCreated,
            duration: `${result.duration}ms`,
          });

          return { clienteId: cliente.id, success: true, result };
        } catch (error: any) {
          console.error(`[Cron] Error processing cliente ${cliente.id}:`, error);
          return { clienteId: cliente.id, success: false, error: error.message };
        }
      })
    );

    // 7. Contar sucessos e falhas
    let successCount = 0;
    let failedCount = 0;
    const processedDetails: any[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
        processedDetails.push({
          clienteId: result.value.clienteId,
          status: 'success',
          data: result.value.result,
        });
      } else {
        failedCount++;
        processedDetails.push({
          clienteId: clientesToProcess[index].id,
          status: 'failed',
          error: result.status === 'fulfilled' ? result.value.error : 'Promise rejected',
        });
      }
    });

    // 8. Atualizar progresso do job
    await db
      .update(enrichmentJobs)
      .set({
        processedClientes: job.processedClientes + clientesToProcess.length,
        successClientes: job.successClientes + successCount,
        failedClientes: job.failedClientes + failedCount,
        lastClienteId: clientesToProcess[clientesToProcess.length - 1].id,
      })
      .where(eq(enrichmentJobs.id, job.id));

    // 9. Atualizar contador na pesquisa
    await db
      .update(pesquisas)
      .set({
        clientesEnriquecidos: job.successClientes + successCount,
      })
      .where(eq(pesquisas.id, job.projectId));

    console.log(`[Cron] Batch completed: ${successCount} success, ${failedCount} failed`);

    return NextResponse.json({
      message: 'Batch processed successfully',
      jobId: job.id,
      batchSize: clientesToProcess.length,
      successCount,
      failedCount,
      progress: `${job.processedClientes + clientesToProcess.length}/${job.totalClientes}`,
      processedDetails,
      executionTime: `${Date.now() - startTime}ms`,
    });
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
