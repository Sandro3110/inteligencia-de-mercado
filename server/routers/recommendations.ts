import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { recommendations } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const recommendationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ projectId: z.number(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      return await db.select().from(recommendations).where(eq(recommendations.projectId, input.projectId)).orderBy(desc(recommendations.priority)).limit(input.limit);
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      await db.update(recommendations).set({ read: 1 }).where(eq(recommendations.id, input.id));
      return { success: true };
    }),
});
