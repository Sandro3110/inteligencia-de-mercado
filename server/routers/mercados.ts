/**
 * Mercados Router - Gerenciamento de Mercados Únicos
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { db } from '@/lib/db';
import { mercadosUnicos } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const mercadosRouter = createTRPCRouter({
  // Listar todos os mercados (com filtro opcional por projeto ou pesquisa)
  list: publicProcedure
    .input(z.object({
      projectId: z.number().optional(),
      pesquisaId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      let query = db.select().from(mercadosUnicos);
      
      if (input?.projectId) {
        query = query.where(eq(mercadosUnicos.projectId, input.projectId)) as any;
      }
      
      if (input?.pesquisaId) {
        query = query.where(eq(mercadosUnicos.pesquisaId, input.pesquisaId)) as any;
      }
      
      return await query.orderBy(desc(mercadosUnicos.createdAt));
    }),

  // Buscar mercado por ID
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const result = await db
        .select()
        .from(mercadosUnicos)
        .where(eq(mercadosUnicos.id, id))
        .limit(1);
      
      return result[0] || null;
    }),

  // Criar novo mercado
  create: publicProcedure
    .input(z.object({
      projectId: z.number(),
      pesquisaId: z.number().optional(),
      nome: z.string(),
      segmentacao: z.string().optional(),
      categoria: z.string().optional(),
      tamanhoMercado: z.string().optional(),
      crescimentoAnual: z.string().optional(),
      tendencias: z.string().optional(),
      principaisPlayers: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db
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
          quantidadeClientes: 0,
        })
        .returning();
      
      return result[0];
    }),

  // Atualizar mercado
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      segmentacao: z.string().optional(),
      categoria: z.string().optional(),
      tamanhoMercado: z.string().optional(),
      crescimentoAnual: z.string().optional(),
      tendencias: z.string().optional(),
      principaisPlayers: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      
      const result = await db
        .update(mercadosUnicos)
        .set(data)
        .where(eq(mercadosUnicos.id, id))
        .returning();
      
      return result[0];
    }),

  // Deletar mercado
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      await db
        .delete(mercadosUnicos)
        .where(eq(mercadosUnicos.id, id));
      
      return { success: true };
    }),
});
