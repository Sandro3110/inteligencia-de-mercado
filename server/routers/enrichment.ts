import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { enrichmentJobs, pesquisas, pesquisas as pesquisasTable } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { logEnrichmentStarted } from '@/server/utils/auditLog';

export const enrichmentRouter = createTRPCRouter({
  /**
   * Buscar job de enriquecimento por pesquisaId
   */
  getJob: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const [job] = await db
        .select()
        .from(enrichmentJobs)
        .where(eq(enrichmentJobs.projectId, input.pesquisaId))
        .orderBy(desc(enrichmentJobs.createdAt))
        .limit(1);

      return job || null;
    }),

  /**
   * Iniciar enriquecimento
   */
  start: protectedProcedure
    .input(z.object({ pesquisaId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      try {
        // 1. Buscar pesquisa
        const [pesquisa] = await db
          .select()
          .from(pesquisas)
          .where(eq(pesquisas.id, input.pesquisaId))
          .limit(1);

        if (!pesquisa) {
          throw new Error('Pesquisa não encontrada');
        }

        if (pesquisa.totalClientes === 0) {
          throw new Error('Pesquisa não tem clientes para enriquecer');
        }

        // 2. Criar job
        const totalBatches = Math.ceil(pesquisa.totalClientes / 5);

        const [job] = await db
          .insert(enrichmentJobs)
          .values({
            projectId: input.pesquisaId,
            status: 'running',
            totalClientes: pesquisa.totalClientes,
            processedClientes: 0,
            successClientes: 0,
            failedClientes: 0,
            currentBatch: 0,
            totalBatches,
            batchSize: 5,
            checkpointInterval: 50,
            startedAt: new Date().toISOString(),
          })
          .returning();

        // 3. Atualizar status da pesquisa
        await db
          .update(pesquisas)
          .set({ status: 'enriquecendo' })
          .where(eq(pesquisas.id, input.pesquisaId));

        // 3.5 Registrar log de auditoria
        await logEnrichmentStarted({
          pesquisaId: input.pesquisaId,
          pesquisaNome: pesquisa.nome,
          totalClientes: pesquisa.totalClientes,
        });

        // 4. Trigger background processing
        // This will be handled by the API route
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.intelmarket.app';
        fetch(`${baseUrl}/api/enrichment/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id, pesquisaId: input.pesquisaId }),
        }).catch((err) => console.error('Failed to trigger enrichment:', err));

        return job;
      } catch (error) {
        console.error('[Enrichment] Error starting:', error);
        throw error;
      }
    }),

  /**
   * Pausar enriquecimento
   */
  pause: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    await db
      .update(enrichmentJobs)
      .set({
        status: 'paused',
        pausedAt: new Date().toISOString(),
      })
      .where(eq(enrichmentJobs.id, input.jobId));

    return { success: true };
  }),

  /**
   * Retomar enriquecimento
   */
  resume: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const [job] = await db
      .select()
      .from(enrichmentJobs)
      .where(eq(enrichmentJobs.id, input.jobId))
      .limit(1);

    if (!job) {
      throw new Error('Job não encontrado');
    }

    await db
      .update(enrichmentJobs)
      .set({
        status: 'running',
        pausedAt: null,
      })
      .where(eq(enrichmentJobs.id, input.jobId));

    // Trigger background processing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.intelmarket.app';
    fetch(`${baseUrl}/api/enrichment/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, pesquisaId: job.projectId }),
    }).catch((err) => console.error('Failed to trigger enrichment:', err));

    return { success: true };
  }),

  /**
   * Cancelar enriquecimento
   */
  cancel: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    await db
      .update(enrichmentJobs)
      .set({
        status: 'failed',
        errorMessage: 'Cancelado pelo usuário',
        completedAt: new Date().toISOString(),
      })
      .where(eq(enrichmentJobs.id, input.jobId));

    return { success: true };
  }),

  /**
   * Enriquecer todas as pesquisas de um projeto em lote
   */
  enrichAll: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // Buscar todas as pesquisas do projeto
      const allPesquisas = await db
        .select()
        .from(pesquisasTable)
        .where(eq(pesquisasTable.projectId, input.projectId));

      if (allPesquisas.length === 0) {
        throw new Error('Projeto não possui pesquisas');
      }

      // Iniciar enriquecimento para cada pesquisa
      const results = [];
      for (const pesquisa of allPesquisas) {
        try {
          // Criar job para cada pesquisa
          const totalBatches = Math.ceil((pesquisa.totalClientes || 0) / 5);

          const [job] = await db
            .insert(enrichmentJobs)
            .values({
              projectId: pesquisa.id,
              status: 'running',
              totalClientes: pesquisa.totalClientes || 0,
              processedClientes: 0,
              successClientes: 0,
              failedClientes: 0,
              currentBatch: 0,
              totalBatches,
              batchSize: 5,
              checkpointInterval: 50,
              startedAt: new Date().toISOString(),
            })
            .returning();

          // Atualizar status da pesquisa
          await db
            .update(pesquisasTable)
            .set({ status: 'enriquecendo' })
            .where(eq(pesquisasTable.id, pesquisa.id));

          // Trigger background processing
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/enrichment/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: job.id, pesquisaId: pesquisa.id }),
          }).catch((err) => console.error('Failed to trigger enrichment:', err));

          results.push({ pesquisaId: pesquisa.id, status: 'started', jobId: job.id });
        } catch (error) {
          results.push({ pesquisaId: pesquisa.id, status: 'error' });
        }
      }

      return {
        total: allPesquisas.length,
        started: results.filter((r) => r.status === 'started').length,
        failed: results.filter((r) => r.status === 'error').length,
        results,
      };
    }),
});
