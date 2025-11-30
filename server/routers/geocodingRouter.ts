/**
 * Geocoding Router
 * Sistema de geocodificação usando tabela cidades_brasil
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { clientes, leads, concorrentes, geocodingJobs } from '../../drizzle/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

const BATCH_SIZE = 100; // Processar 100 entidades por vez

export const geocodingRouter = router({
  /**
   * Iniciar processo de geocodificação
   */
  startGeocoding: publicProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // Contar entidades que precisam de geocodificação
        // (têm cidade e UF mas não têm coordenadas)
        const [clientesCount, leadsCount, concorrentesCount] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)` })
            .from(clientes)
            .where(
              and(
                eq(clientes.pesquisaId, input.pesquisaId),
                sql`${clientes.cidade} IS NOT NULL AND ${clientes.cidade} != ''`,
                sql`${clientes.uf} IS NOT NULL AND ${clientes.uf} != ''`,
                isNull(clientes.latitude),
                isNull(clientes.longitude)
              )
            ),
          db
            .select({ count: sql<number>`count(*)` })
            .from(leads)
            .where(
              and(
                eq(leads.pesquisaId, input.pesquisaId),
                sql`${leads.cidade} IS NOT NULL AND ${leads.cidade} != ''`,
                sql`${leads.uf} IS NOT NULL AND ${leads.uf} != ''`,
                isNull(leads.latitude),
                isNull(leads.longitude)
              )
            ),
          db
            .select({ count: sql<number>`count(*)` })
            .from(concorrentes)
            .where(
              and(
                eq(concorrentes.pesquisaId, input.pesquisaId),
                sql`${concorrentes.cidade} IS NOT NULL AND ${concorrentes.cidade} != ''`,
                sql`${concorrentes.uf} IS NOT NULL AND ${concorrentes.uf} != ''`,
                isNull(concorrentes.latitude),
                isNull(concorrentes.longitude)
              )
            ),
        ]);

        const totalClientes = Number(clientesCount[0]?.count || 0);
        const totalLeads = Number(leadsCount[0]?.count || 0);
        const totalConcorrentes = Number(concorrentesCount[0]?.count || 0);
        const totalEntities = totalClientes + totalLeads + totalConcorrentes;

        if (totalEntities === 0) {
          throw new Error('Nenhuma entidade precisa de geocodificação');
        }

        // Calcular número de batches
        const totalBatches = Math.ceil(totalEntities / BATCH_SIZE);

        // Criar job de geocodificação
        const [job] = await db
          .insert(geocodingJobs)
          .values({
            pesquisaId: input.pesquisaId,
            userId: input.userId,
            status: 'processing',
            totalEntities,
            processedEntities: 0,
            totalBatches,
            currentBatch: 0,
            clientesTotal: totalClientes,
            leadsTotal: totalLeads,
            concorrentesTotal: totalConcorrentes,
            clientesProcessed: 0,
            leadsProcessed: 0,
            concorrentesProcessed: 0,
            startedAt: new Date().toISOString(),
          })
          .returning();

        return {
          jobId: job.id,
          totalEntities,
          totalBatches,
          message: `Geocodificação iniciada: ${totalEntities} entidades em ${totalBatches} lotes`,
        };
      } catch (error) {
        console.error('[Geocoding] Error starting geocoding:', error);
        throw error;
      }
    }),

  /**
   * Processar próximo batch de geocodificação
   */
  processBatch: publicProcedure
    .input(
      z.object({
        jobId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // Buscar job
        const [job] = await db
          .select()
          .from(geocodingJobs)
          .where(eq(geocodingJobs.id, input.jobId))
          .limit(1);

        if (!job) {
          throw new Error('Job não encontrado');
        }

        if (job.status !== 'processing') {
          throw new Error('Job não está em processamento');
        }

        let processedInBatch = 0;

        // Processar clientes
        if (job.clientesProcessed < job.clientesTotal) {
          const clientesToProcess = await db
            .select({
              id: clientes.id,
              cidade: clientes.cidade,
              uf: clientes.uf,
            })
            .from(clientes)
            .where(
              and(
                eq(clientes.pesquisaId, job.pesquisaId),
                sql`${clientes.cidade} IS NOT NULL AND ${clientes.cidade} != ''`,
                sql`${clientes.uf} IS NOT NULL AND ${clientes.uf} != ''`,
                isNull(clientes.latitude),
                isNull(clientes.longitude)
              )
            )
            .limit(BATCH_SIZE - processedInBatch);

          for (const cliente of clientesToProcess) {
            // Fazer JOIN com cidades_brasil para pegar coordenadas
            const [cidadeData] = await db.execute(sql`
              SELECT latitude, longitude
              FROM cidades_brasil
              WHERE LOWER(TRIM(nome)) = LOWER(TRIM(${cliente.cidade}))
                AND LOWER(TRIM(uf)) = LOWER(TRIM(${cliente.uf}))
              LIMIT 1
            `);

            if (cidadeData && 'latitude' in cidadeData && 'longitude' in cidadeData) {
              // Atualizar cliente com coordenadas
              await db
                .update(clientes)
                .set({
                  latitude: cidadeData.latitude as number,
                  longitude: cidadeData.longitude as number,
                })
                .where(eq(clientes.id, cliente.id));

              processedInBatch++;
            }
          }

          // Atualizar contador de clientes processados
          await db
            .update(geocodingJobs)
            .set({
              clientesProcessed: job.clientesProcessed + clientesToProcess.length,
            })
            .where(eq(geocodingJobs.id, input.jobId));
        }

        // Processar leads
        if (processedInBatch < BATCH_SIZE && job.leadsProcessed < job.leadsTotal) {
          const leadsToProcess = await db
            .select({
              id: leads.id,
              cidade: leads.cidade,
              uf: leads.uf,
            })
            .from(leads)
            .where(
              and(
                eq(leads.pesquisaId, job.pesquisaId),
                sql`${leads.cidade} IS NOT NULL AND ${leads.cidade} != ''`,
                sql`${leads.uf} IS NOT NULL AND ${leads.uf} != ''`,
                isNull(leads.latitude),
                isNull(leads.longitude)
              )
            )
            .limit(BATCH_SIZE - processedInBatch);

          for (const lead of leadsToProcess) {
            const [cidadeData] = await db.execute(sql`
              SELECT latitude, longitude
              FROM cidades_brasil
              WHERE LOWER(TRIM(nome)) = LOWER(TRIM(${lead.cidade}))
                AND LOWER(TRIM(uf)) = LOWER(TRIM(${lead.uf}))
              LIMIT 1
            `);

            if (cidadeData && 'latitude' in cidadeData && 'longitude' in cidadeData) {
              await db
                .update(leads)
                .set({
                  latitude: cidadeData.latitude as number,
                  longitude: cidadeData.longitude as number,
                })
                .where(eq(leads.id, lead.id));

              processedInBatch++;
            }
          }

          await db
            .update(geocodingJobs)
            .set({
              leadsProcessed: job.leadsProcessed + leadsToProcess.length,
            })
            .where(eq(geocodingJobs.id, input.jobId));
        }

        // Processar concorrentes
        if (processedInBatch < BATCH_SIZE && job.concorrentesProcessed < job.concorrentesTotal) {
          const concorrentesToProcess = await db
            .select({
              id: concorrentes.id,
              cidade: concorrentes.cidade,
              uf: concorrentes.uf,
            })
            .from(concorrentes)
            .where(
              and(
                eq(concorrentes.pesquisaId, job.pesquisaId),
                sql`${concorrentes.cidade} IS NOT NULL AND ${concorrentes.cidade} != ''`,
                sql`${concorrentes.uf} IS NOT NULL AND ${concorrentes.uf} != ''`,
                isNull(concorrentes.latitude),
                isNull(concorrentes.longitude)
              )
            )
            .limit(BATCH_SIZE - processedInBatch);

          for (const concorrente of concorrentesToProcess) {
            const [cidadeData] = await db.execute(sql`
              SELECT latitude, longitude
              FROM cidades_brasil
              WHERE LOWER(TRIM(nome)) = LOWER(TRIM(${concorrente.cidade}))
                AND LOWER(TRIM(uf)) = LOWER(TRIM(${concorrente.uf}))
              LIMIT 1
            `);

            if (cidadeData && 'latitude' in cidadeData && 'longitude' in cidadeData) {
              await db
                .update(concorrentes)
                .set({
                  latitude: cidadeData.latitude as number,
                  longitude: cidadeData.longitude as number,
                })
                .where(eq(concorrentes.id, concorrente.id));

              processedInBatch++;
            }
          }

          await db
            .update(geocodingJobs)
            .set({
              concorrentesProcessed: job.concorrentesProcessed + concorrentesToProcess.length,
            })
            .where(eq(geocodingJobs.id, input.jobId));
        }

        // Atualizar progresso do job
        const newProcessedTotal =
          job.clientesProcessed + job.leadsProcessed + job.concorrentesProcessed + processedInBatch;
        const newCurrentBatch = job.currentBatch + 1;
        const isCompleted = newProcessedTotal >= job.totalEntities;

        await db
          .update(geocodingJobs)
          .set({
            processedEntities: newProcessedTotal,
            currentBatch: newCurrentBatch,
            status: isCompleted ? 'completed' : 'processing',
            completedAt: isCompleted ? new Date().toISOString() : null,
          })
          .where(eq(geocodingJobs.id, input.jobId));

        // Criar notificação se concluído e ainda não notificado
        if (isCompleted && job.notifiedCompletion === 0) {
          const { createNotification } = await import('../db');
          await createNotification({
            userId: job.userId,
            type: 'geocoding',
            title: 'Geocodificação Concluída',
            message: `Geocodificação finalizada: ${newProcessedTotal} entidades processadas com sucesso.`,
          });

          // Marcar como notificado
          await db
            .update(geocodingJobs)
            .set({ notifiedCompletion: 1 })
            .where(eq(geocodingJobs.id, input.jobId));
        }

        return {
          jobId: input.jobId,
          processed: newProcessedTotal,
          total: job.totalEntities,
          currentBatch: newCurrentBatch,
          totalBatches: job.totalBatches,
          completed: isCompleted,
          processedInBatch,
        };
      } catch (error) {
        console.error('[Geocoding] Error processing batch:', error);

        // Marcar job como failed
        await db
          .update(geocodingJobs)
          .set({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(geocodingJobs.id, input.jobId));

        throw error;
      }
    }),

  /**
   * Obter status do job de geocodificação
   */
  getJobStatus: publicProcedure
    .input(
      z.object({
        jobId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const [job] = await db
        .select()
        .from(geocodingJobs)
        .where(eq(geocodingJobs.id, input.jobId))
        .limit(1);

      if (!job) {
        throw new Error('Job não encontrado');
      }

      return job;
    }),

  /**
   * Obter último job de uma pesquisa
   */
  getLatestJob: publicProcedure
    .input(
      z.object({
        pesquisaId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const [job] = await db
        .select()
        .from(geocodingJobs)
        .where(eq(geocodingJobs.pesquisaId, input.pesquisaId))
        .orderBy(sql`${geocodingJobs.createdAt} DESC`)
        .limit(1);

      return job || null;
    }),
});
