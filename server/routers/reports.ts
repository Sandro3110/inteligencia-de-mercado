import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { reportSchedules, exportHistory } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const reportsRouter = createTRPCRouter({
  listSchedules: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      return await db.select().from(reportSchedules).where(eq(reportSchedules.projectId, input.projectId)).orderBy(desc(reportSchedules.createdAt));
    }),

  exportHistory: protectedProcedure
    .input(z.object({ projectId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      return await db.select().from(exportHistory).where(eq(exportHistory.projectId, input.projectId)).orderBy(desc(exportHistory.createdAt)).limit(input.limit);
    }),

  createSchedule: protectedProcedure
    .input(z.object({ projectId: z.number(), name: z.string(), frequency: z.enum(['daily', 'weekly', 'monthly']), format: z.enum(['pdf', 'excel', 'csv']) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      const [schedule] = await db.insert(reportSchedules).values({ projectId: input.projectId, name: input.name, frequency: input.frequency, format: input.format, enabled: 1 }).returning();
      return schedule;
    }),
});
