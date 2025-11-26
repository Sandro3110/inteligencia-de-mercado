/**
 * Enrichment Router - Novo
 * Gerenciamento de enriquecimento de dados
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import {
  enrichmentJobs,
  enrichmentRuns,
  enrichmentQueue,
  enrichmentCache,
  enrichmentConfigs,
} from '@/drizzle/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export const enrichmentRouter = createTRPCRouter({
  /**
   * Listar jobs de enriquecimento
   */
  listJobs: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const conditions = [];

        if (input?.projectId) {
          conditions.push(eq(enrichmentJobs.projectId, input.projectId));
        }

        if (input?.status) {
          conditions.push(eq(enrichmentJobs.status, input.status));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return await db
          .select()
          .from(enrichmentJobs)
          .where(whereClause)
          .orderBy(desc(enrichmentJobs.createdAt))
          .limit(input?.limit || 50);
      } catch (error) {
        console.error('[Enrichment] Error listing jobs:', error);
        throw new Error('Failed to list enrichment jobs');
      }
    }),

  /**
   * Obter job por ID
   */
  getJobById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [job] = await db
          .select()
          .from(enrichmentJobs)
          .where(eq(enrichmentJobs.id, id))
          .limit(1);

        return job || null;
      } catch (error) {
        console.error('[Enrichment] Error getting job:', error);
        throw new Error('Failed to get enrichment job');
      }
    }),

  /**
   * Criar novo job de enriquecimento
   */
  createJob: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        type: z.string(),
        config: z.any().optional(),
        priority: z.number().min(0).max(10).default(5),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .insert(enrichmentJobs)
          .values({
            projectId: input.projectId,
            type: input.type,
            config: input.config,
            status: 'pending',
            priority: input.priority,
            totalRecords: 0,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
          })
          .returning();

        return result;
      } catch (error) {
        console.error('[Enrichment] Error creating job:', error);
        throw new Error('Failed to create enrichment job');
      }
    }),

  /**
   * Atualizar status do job
   */
  updateJobStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.string(),
        processedRecords: z.number().optional(),
        successfulRecords: z.number().optional(),
        failedRecords: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const { id, ...data } = input;

        const [result] = await db
          .update(enrichmentJobs)
          .set({
            ...data,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(enrichmentJobs.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Enrichment] Error updating job status:', error);
        throw new Error('Failed to update job status');
      }
    }),

  /**
   * Listar runs de enriquecimento
   */
  listRuns: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        jobId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const conditions = [];

        if (input?.projectId) {
          conditions.push(eq(enrichmentRuns.projectId, input.projectId));
        }

        if (input?.jobId) {
          conditions.push(eq(enrichmentRuns.jobId, input.jobId));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return await db
          .select()
          .from(enrichmentRuns)
          .where(whereClause)
          .orderBy(desc(enrichmentRuns.createdAt))
          .limit(input?.limit || 50);
      } catch (error) {
        console.error('[Enrichment] Error listing runs:', error);
        throw new Error('Failed to list enrichment runs');
      }
    }),

  /**
   * Obter configurações de enriquecimento
   */
  getConfigs: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        return await db
          .select()
          .from(enrichmentConfigs)
          .where(eq(enrichmentConfigs.projectId, input.projectId))
          .orderBy(desc(enrichmentConfigs.createdAt));
      } catch (error) {
        console.error('[Enrichment] Error getting configs:', error);
        return [];
      }
    }),

  /**
   * Salvar configuração de enriquecimento
   */
  saveConfig: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1).max(255),
        config: z.any(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .insert(enrichmentConfigs)
          .values({
            projectId: input.projectId,
            name: input.name,
            config: input.config,
            isDefault: input.isDefault || false,
          })
          .returning();

        return result;
      } catch (error) {
        console.error('[Enrichment] Error saving config:', error);
        throw new Error('Failed to save enrichment config');
      }
    }),

  /**
   * Obter estatísticas de enriquecimento
   */
  getStats: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [totalJobs, pendingJobs, runningJobs, completedJobs, failedJobs] = await Promise.all([
          db.select({ value: count() }).from(enrichmentJobs).where(eq(enrichmentJobs.projectId, input.projectId)),
          db.select({ value: count() }).from(enrichmentJobs).where(and(eq(enrichmentJobs.projectId, input.projectId), eq(enrichmentJobs.status, 'pending'))),
          db.select({ value: count() }).from(enrichmentJobs).where(and(eq(enrichmentJobs.projectId, input.projectId), eq(enrichmentJobs.status, 'running'))),
          db.select({ value: count() }).from(enrichmentJobs).where(and(eq(enrichmentJobs.projectId, input.projectId), eq(enrichmentJobs.status, 'completed'))),
          db.select({ value: count() }).from(enrichmentJobs).where(and(eq(enrichmentJobs.projectId, input.projectId), eq(enrichmentJobs.status, 'failed'))),
        ]);

        return {
          total: totalJobs[0]?.value || 0,
          pending: pendingJobs[0]?.value || 0,
          running: runningJobs[0]?.value || 0,
          completed: completedJobs[0]?.value || 0,
          failed: failedJobs[0]?.value || 0,
        };
      } catch (error) {
        console.error('[Enrichment] Error getting stats:', error);
        throw new Error('Failed to get enrichment stats');
      }
    }),
});
