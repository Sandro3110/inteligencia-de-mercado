/**
 * Unified Map Router - Mapa unificado
 * Adaptado para Next.js App Router
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

/**
 * Router do mapa unificado
 */
export const unifiedMapRouter = createTRPCRouter({
  /**
   * Obter dados para o mapa unificado
   */
  getData: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        layers: z.array(z.enum(['clientes', 'concorrentes', 'leads'])).optional(),
        bounds: z
          .object({
            north: z.number(),
            south: z.number(),
            east: z.number(),
            west: z.number(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar na Fase 6
      return {
        markers: [],
        heatmapData: [],
        clusters: [],
      };
    }),

  /**
   * Salvar configuração do mapa
   */
  saveConfig: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        config: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implementar na Fase 6
      return {
        success: true,
      };
    }),

  /**
   * Obter configuração do mapa
   */
  getConfig: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar na Fase 6
      return {
        config: {},
      };
    }),
});
