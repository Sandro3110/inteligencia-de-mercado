/**
 * Alerts Router - Simplificado
 * Placeholder até migração completa do schema
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

export const alertsRouter = createTRPCRouter({
  /**
   * Listar configurações de alertas
   */
  listConfigs: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        enabled: z.boolean().optional(),
      }).optional()
    )
    .query(async () => {
      // Retorna array vazio até schema ser migrado
      return [];
    }),

  /**
   * Listar histórico de alertas
   */
  listHistory: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async () => {
      // Retorna array vazio até schema ser migrado
      return [];
    }),

  /**
   * Obter estatísticas de alertas
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
        totalConfigs: 0,
        activeConfigs: 0,
        totalHistory: 0,
      };
    }),
});
