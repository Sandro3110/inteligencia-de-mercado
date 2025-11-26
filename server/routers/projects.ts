/**
 * Projects Router - Gerenciamento de Projetos
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { db } from '@/lib/db';
import { projects } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const projectsRouter = createTRPCRouter({
  /**
   * Listar todos os projetos
   */
  list: publicProcedure.query(async () => {
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    return result;
  }),

  /**
   * Buscar projeto por ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Criar novo projeto
   */
  create: publicProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        descricao: z.string().optional(),
        cor: z.string().default('#3b82f6'),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .insert(projects)
        .values({
          nome: input.nome,
          descricao: input.descricao || null,
          cor: input.cor,
          ativo: 1,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        })
        .returning();

      return result[0];
    }),

  /**
   * Atualizar projeto
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        cor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const result = await db
        .update(projects)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, id))
        .returning();

      return result[0];
    }),

  /**
   * Deletar projeto vazio
   */
  deleteEmpty: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(projects)
        .set({
          ativo: 0,
          status: 'archived',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, input.id))
        .returning();

      return result[0];
    }),

  /**
   * Hibernar projeto
   */
  hibernate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(projects)
        .set({
          status: 'hibernated',
          isPaused: 1,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, input.id))
        .returning();

      return result[0];
    }),

  /**
   * Reativar projeto
   */
  reactivate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const result = await db
        .update(projects)
        .set({
          status: 'active',
          isPaused: 0,
          ativo: 1,
          updatedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        })
        .where(eq(projects.id, input.id))
        .returning();

      return result[0];
    }),

  /**
   * Duplicar projeto
   */
  duplicate: publicProcedure
    .input(
      z.object({
        id: z.number(),
        newName: z.string().min(1),
        copyMarkets: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar projeto original
      const original = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      if (!original[0]) {
        throw new Error('Projeto não encontrado');
      }

      // Criar cópia
      const result = await db
        .insert(projects)
        .values({
          nome: input.newName,
          descricao: original[0].descricao,
          cor: original[0].cor,
          ativo: 1,
          status: 'active',
          executionMode: original[0].executionMode,
          maxParallelJobs: original[0].maxParallelJobs,
          isPaused: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
        })
        .returning();

      return result[0];
    }),
});
