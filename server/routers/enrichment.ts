import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { enrichmentQueue, enrichmentJobs, enrichmentRuns } from '@/drizzle/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export const enrichmentRouter = createTRPCRouter({
  listJobs: protectedProcedure
    .input(z.object({ projectId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      return await db.select().from(enrichmentJobs).where(eq(enrichmentJobs.projectId, input.projectId)).orderBy(desc(enrichmentJobs.createdAt)).limit(input.limit);
    }),

  stats: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(enrichmentJobs).where(eq(enrichmentJobs.projectId, input.projectId));
      const [pending] = await db.select({ count: sql<number>`count(*)::int` }).from(enrichmentQueue).where(eq(enrichmentQueue.projectId, input.projectId));
      const [completed] = await db.select({ count: sql<number>`count(*)::int` }).from(enrichmentJobs).where(and(eq(enrichmentJobs.projectId, input.projectId), eq(enrichmentJobs.status, 'completed')));
      return { totalJobs: total?.count || 0, pendingQueue: pending?.count || 0, completed: completed?.count || 0 };
    }),

  createJob: protectedProcedure
    .input(z.object({ projectId: z.number(), entityType: z.enum(['lead', 'cliente', 'concorrente']), entityIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const [job] = await db.insert(enrichmentJobs).values({ projectId: input.projectId, entityType: input.entityType, status: 'pending', totalEntities: input.entityIds.length }).returning();
      return job;
    }),
});
