/**
 * Reports Router - Simplificado
 * Placeholder até migração completa do schema
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

export const reportsRouter = createTRPCRouter({
  /**
   * Listar agendamentos de relatórios
   */
  listSchedules: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
      }).optional()
    )
    .query(async () => {
      // Retorna array vazio até schema ser migrado
      return [];
    }),
});
