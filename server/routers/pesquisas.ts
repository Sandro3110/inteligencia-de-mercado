/**
 * Pesquisas Router - Gerenciamento de Pesquisas
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { db } from '@/lib/db';
import { pesquisas } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export const pesquisasRouter = createTRPCRouter({
  // Listar todas as pesquisas (com filtro opcional por projeto)
  list: publicProcedure
    .input(z.object({
      projectId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      if (input?.projectId) {
        return await db
          .select()
          .from(pesquisas)
          .where(eq(pesquisas.projectId, input.projectId));
      }
      
      return await db.select().from(pesquisas);
    }),

  // Buscar pesquisa por ID
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const result = await db
        .select()
        .from(pesquisas)
        .where(eq(pesquisas.id, id))
        .limit(1);
      
      return result[0] || null;
    }),

  // Criar nova pesquisa
  create: publicProcedure
    .input(z.object({
      projectId: z.number(),
      nome: z.string(),
      descricao: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await db
        .insert(pesquisas)
        .values({
          projectId: input.projectId,
          nome: input.nome,
          descricao: input.descricao,
          status: input.status || 'importado',
          ativo: 1,
        })
        .returning();
      
      return result[0];
    }),

  // Atualizar pesquisa
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      
      const result = await db
        .update(pesquisas)
        .set(data)
        .where(eq(pesquisas.id, id))
        .returning();
      
      return result[0];
    }),

  // Deletar pesquisa
  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      await db
        .delete(pesquisas)
        .where(eq(pesquisas.id, id));
      
      return { success: true };
    }),
});
