/**
 * Concorrentes Router
 * Gerencia operações relacionadas a concorrentes
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { concorrentes, projects } from '@/drizzle/schema';
import { eq, and, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const concorrentesRouter = createTRPCRouter({
  /**
   * Listar concorrentes por projeto
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }

      try {
        // Validar se projeto existe e está ativo
        const [project] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.id, input.projectId), eq(projects.ativo, 1)))
          .limit(1);

        if (!project) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Projeto não encontrado ou inativo',
          });
        }

        // Buscar concorrentes
        const whereConditions = [eq(concorrentes.projectId, input.projectId)];
        
        if (input.pesquisaId) {
          whereConditions.push(eq(concorrentes.pesquisaId, input.pesquisaId));
        }

        const result = await db
          .select()
          .from(concorrentes)
          .where(and(...whereConditions));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('[Concorrentes] Error listing:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list concorrentes',
        });
      }
    }),

  /**
   * Contar concorrentes por projeto
   */
  count: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }

      try {
        const whereConditions = [eq(concorrentes.projectId, input.projectId)];
        
        if (input.pesquisaId) {
          whereConditions.push(eq(concorrentes.pesquisaId, input.pesquisaId));
        }

        const [result] = await db
          .select({ value: count() })
          .from(concorrentes)
          .where(and(...whereConditions));

        return result?.value || 0;
      } catch (error) {
        console.error('[Concorrentes] Error counting:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to count concorrentes',
        });
      }
    }),

  /**
   * Obter concorrente por ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }

      try {
        const [concorrente] = await db
          .select()
          .from(concorrentes)
          .where(
            and(
              eq(concorrentes.id, input.id),
              eq(concorrentes.projectId, input.projectId)
            )
          )
          .limit(1);

        if (!concorrente) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Concorrente não encontrado',
          });
        }

        return concorrente;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('[Concorrentes] Error getting by ID:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get concorrente',
        });
      }
    }),
});
