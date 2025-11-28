/**
 * Clientes Router
 * Gerencia operações relacionadas a clientes
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { clientes, projects } from '@/drizzle/schema';
import { eq, and, count } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const clientesRouter = createTRPCRouter({
  /**
   * Listar clientes por projeto
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

        // Buscar clientes
        const whereConditions = [eq(clientes.projectId, input.projectId)];
        
        if (input.pesquisaId) {
          whereConditions.push(eq(clientes.pesquisaId, input.pesquisaId));
        }

        const result = await db
          .select()
          .from(clientes)
          .where(and(...whereConditions));

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('[Clientes] Error listing:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list clientes',
        });
      }
    }),

  /**
   * Contar clientes por projeto
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
        const whereConditions = [eq(clientes.projectId, input.projectId)];
        
        if (input.pesquisaId) {
          whereConditions.push(eq(clientes.pesquisaId, input.pesquisaId));
        }

        const [result] = await db
          .select({ value: count() })
          .from(clientes)
          .where(and(...whereConditions));

        return result?.value || 0;
      } catch (error) {
        console.error('[Clientes] Error counting:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to count clientes',
        });
      }
    }),

  /**
   * Obter cliente por ID
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
        const [cliente] = await db
          .select()
          .from(clientes)
          .where(
            and(
              eq(clientes.id, input.id),
              eq(clientes.projectId, input.projectId)
            )
          )
          .limit(1);

        if (!cliente) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cliente não encontrado',
          });
        }

        return cliente;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error('[Clientes] Error getting by ID:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get cliente',
        });
      }
    }),
});
