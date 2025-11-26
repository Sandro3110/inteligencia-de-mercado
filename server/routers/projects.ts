/**
 * Projects Router - Gerenciamento de Projetos
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { db } from '@/lib/db';
import { projects } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const projectsRouter = createTRPCRouter({
  /**
   * Listar todos os projetos
   */
  list: protectedProcedure.query(async () => {
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    return result;
  }),

  /**
   * Buscar projeto por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      return result[0] || null;
    }),
});
