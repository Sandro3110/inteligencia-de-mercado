/**
 * Mercados Router - Refatorado completamente
 * Gerenciamento de Mercados Únicos com queries otimizadas
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { mercadosUnicos, clientes, leads } from '@/drizzle/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export const mercadosRouter = createTRPCRouter({
  /**
   * Listar todos os mercados (com filtros opcionais)
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        pesquisaId: z.number().optional(),
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
          conditions.push(eq(mercadosUnicos.projectId, input.projectId));
        }

        if (input?.pesquisaId) {
          conditions.push(eq(mercadosUnicos.pesquisaId, input.pesquisaId));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return await db
          .select()
          .from(mercadosUnicos)
          .where(whereClause)
          .orderBy(desc(mercadosUnicos.createdAt));
      } catch (error) {
        console.error('[Mercados] Error listing:', error);
        throw new Error('Failed to list mercados');
      }
    }),

  /**
   * Buscar mercado por ID com estatísticas
   */
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [mercado] = await db
          .select()
          .from(mercadosUnicos)
          .where(eq(mercadosUnicos.id, id))
          .limit(1);

        if (!mercado) {
          return null;
        }

        // Buscar estatísticas relacionadas
        const [clientesCount, leadsCount] = await Promise.all([
          db.select({ value: count() }).from(clientes).where(eq(clientes.mercadoId, id)),
          db.select({ value: count() }).from(leads).where(eq(leads.mercadoId, id)),
        ]);

        return {
          ...mercado,
          stats: {
            clientes: clientesCount[0]?.value || 0,
            leads: leadsCount[0]?.value || 0,
          },
        };
      } catch (error) {
        console.error('[Mercados] Error getting by ID:', error);
        throw new Error('Failed to get mercado');
      }
    }),

  /**
   * Criar novo mercado
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
        nome: z.string().min(1, 'Nome é obrigatório').max(255),
        segmentacao: z.string().optional(),
        categoria: z.string().optional(),
        tamanhoMercado: z.string().optional(),
        crescimentoAnual: z.string().optional(),
        tendencias: z.string().optional(),
        principaisPlayers: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .insert(mercadosUnicos)
          .values({
            projectId: input.projectId,
            pesquisaId: input.pesquisaId,
            nome: input.nome,
            segmentacao: input.segmentacao,
            categoria: input.categoria,
            tamanhoMercado: input.tamanhoMercado,
            crescimentoAnual: input.crescimentoAnual,
            tendencias: input.tendencias,
            principaisPlayers: input.principaisPlayers,
            latitude: input.latitude,
            longitude: input.longitude,
            quantidadeClientes: 0,
          })
          .returning();

        return result;
      } catch (error) {
        console.error('[Mercados] Error creating:', error);
        throw new Error('Failed to create mercado');
      }
    }),

  /**
   * Atualizar mercado
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).max(255).optional(),
        segmentacao: z.string().optional(),
        categoria: z.string().optional(),
        tamanhoMercado: z.string().optional(),
        crescimentoAnual: z.string().optional(),
        tendencias: z.string().optional(),
        principaisPlayers: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
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
          .update(mercadosUnicos)
          .set({
            ...data,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(mercadosUnicos.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Mercados] Error updating:', error);
        throw new Error('Failed to update mercado');
      }
    }),

  /**
   * Deletar mercado
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        await db.delete(mercadosUnicos).where(eq(mercadosUnicos.id, id));

        return { success: true };
      } catch (error) {
        console.error('[Mercados] Error deleting:', error);
        throw new Error('Failed to delete mercado');
      }
    }),

  /**
   * Atualizar quantidade de clientes
   */
  updateClientCount: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        quantidadeClientes: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .update(mercadosUnicos)
          .set({
            quantidadeClientes: input.quantidadeClientes,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(mercadosUnicos.id, input.id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Mercados] Error updating client count:', error);
        throw new Error('Failed to update client count');
      }
    }),
});
