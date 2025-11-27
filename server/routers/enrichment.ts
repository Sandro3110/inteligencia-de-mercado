/**
 * Enrichment Router - Simplificado
 * Placeholder até migração completa do schema
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

export const enrichmentRouter = createTRPCRouter({
  /**
   * Listar jobs de enriquecimento
   */
  listJobs: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async () => {
      // Retorna array vazio até schema ser migrado
      return [];
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
    .query(async () => {
      // Retorna stats zeradas até schema ser migrado
      return {
        total: 0,
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0,
      };
    }),
});
