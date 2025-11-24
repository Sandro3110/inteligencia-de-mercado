/**
 * Email Config Router - Configuração de email
 * Adaptado para Next.js App Router
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';

/**
 * Router de configuração de email
 */
export const emailConfigRouter = createTRPCRouter({
  /**
   * Obter configuração de email do projeto
   */
  get: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
      })
    )
    .query(async ({ input }) => {
      // TODO: Implementar na Fase 7
      return {
        config: null,
      };
    }),

  /**
   * Salvar configuração de email
   */
  save: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        config: z.object({
          smtpHost: z.string(),
          smtpPort: z.number(),
          smtpUser: z.string(),
          smtpPassword: z.string(),
          fromEmail: z.string().email(),
          fromName: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implementar na Fase 7
      return {
        success: true,
      };
    }),

  /**
   * Testar configuração de email
   */
  test: protectedProcedure
    .input(
      z.object({
        projetoId: z.number(),
        testEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implementar na Fase 7
      return {
        success: true,
        message: 'Email de teste enviado',
      };
    }),
});
