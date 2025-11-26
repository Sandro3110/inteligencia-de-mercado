/**
 * Reports Router - Refatorado completamente
 * Gerenciamento de relatórios e agendamentos
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { reportSchedules } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export const reportsRouter = createTRPCRouter({
  /**
   * Listar agendamentos de relatórios
   */
  listSchedules: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        active: z.boolean().optional(),
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
          conditions.push(eq(reportSchedules.projectId, input.projectId));
        }

        if (input?.active !== undefined) {
          conditions.push(eq(reportSchedules.active, input.active ? 1 : 0));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return await db
          .select()
          .from(reportSchedules)
          .where(whereClause)
          .orderBy(desc(reportSchedules.createdAt));
      } catch (error) {
        console.error('[Reports] Error listing schedules:', error);
        throw new Error('Failed to list report schedules');
      }
    }),

  /**
   * Obter agendamento por ID
   */
  getScheduleById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [schedule] = await db
          .select()
          .from(reportSchedules)
          .where(eq(reportSchedules.id, id))
          .limit(1);

        return schedule || null;
      } catch (error) {
        console.error('[Reports] Error getting schedule:', error);
        throw new Error('Failed to get report schedule');
      }
    }),

  /**
   * Criar novo agendamento
   */
  createSchedule: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1, 'Nome é obrigatório').max(255),
        reportType: z.string(),
        frequency: z.string(),
        config: z.any().optional(),
        recipients: z.string().optional(),
        active: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .insert(reportSchedules)
          .values({
            projectId: input.projectId,
            name: input.name,
            reportType: input.reportType,
            frequency: input.frequency,
            config: input.config,
            recipients: input.recipients,
            active: input.active ? 1 : 0,
            lastRun: null,
            nextRun: null,
          })
          .returning();

        return result;
      } catch (error) {
        console.error('[Reports] Error creating schedule:', error);
        throw new Error('Failed to create report schedule');
      }
    }),

  /**
   * Atualizar agendamento
   */
  updateSchedule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        reportType: z.string().optional(),
        frequency: z.string().optional(),
        config: z.any().optional(),
        recipients: z.string().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const { id, active, ...data } = input;

        const updateData: any = {
          ...data,
          updatedAt: new Date().toISOString(),
        };

        if (active !== undefined) {
          updateData.active = active ? 1 : 0;
        }

        const [result] = await db
          .update(reportSchedules)
          .set(updateData)
          .where(eq(reportSchedules.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Reports] Error updating schedule:', error);
        throw new Error('Failed to update report schedule');
      }
    }),

  /**
   * Deletar agendamento
   */
  deleteSchedule: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        await db.delete(reportSchedules).where(eq(reportSchedules.id, id));

        return { success: true };
      } catch (error) {
        console.error('[Reports] Error deleting schedule:', error);
        throw new Error('Failed to delete report schedule');
      }
    }),

  /**
   * Ativar/Desativar agendamento
   */
  toggleSchedule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        active: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .update(reportSchedules)
          .set({
            active: input.active ? 1 : 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reportSchedules.id, input.id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Reports] Error toggling schedule:', error);
        throw new Error('Failed to toggle report schedule');
      }
    }),

  /**
   * Atualizar última execução
   */
  updateLastRun: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        lastRun: z.string(),
        nextRun: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [result] = await db
          .update(reportSchedules)
          .set({
            lastRun: input.lastRun,
            nextRun: input.nextRun,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(reportSchedules.id, input.id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Reports] Error updating last run:', error);
        throw new Error('Failed to update last run');
      }
    }),
});
