/**
 * Alerts Router - Novo
 * Gerenciamento de alertas e notificações
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { alertConfigs, alertHistory } from '@/drizzle/schema';
import { eq, and, desc, count } from 'drizzle-orm';

export const alertsRouter = createTRPCRouter({
  /**
   * Listar configurações de alertas
   */
  listConfigs: protectedProcedure
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
          conditions.push(eq(alertConfigs.projectId, input.projectId));
        }

        if (input?.active !== undefined) {
          conditions.push(eq(alertConfigs.active, input.active ? 1 : 0));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return await db
          .select()
          .from(alertConfigs)
          .where(whereClause)
          .orderBy(desc(alertConfigs.createdAt));
      } catch (error) {
        console.error('[Alerts] Error listing configs:', error);
        throw new Error('Failed to list alert configs');
      }
    }),

  /**
   * Obter configuração por ID
   */
  getConfigById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [config] = await db
          .select()
          .from(alertConfigs)
          .where(eq(alertConfigs.id, id))
          .limit(1);

        return config || null;
      } catch (error) {
        console.error('[Alerts] Error getting config:', error);
        throw new Error('Failed to get alert config');
      }
    }),

  /**
   * Criar nova configuração de alerta
   */
  createConfig: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        name: z.string().min(1, 'Nome é obrigatório').max(255),
        alertType: z.string(),
        condition: z.any(),
        recipients: z.string(),
        frequency: z.string().optional(),
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
          .insert(alertConfigs)
          .values({
            projectId: input.projectId,
            name: input.name,
            alertType: input.alertType,
            condition: input.condition,
            recipients: input.recipients,
            frequency: input.frequency,
            active: input.active ? 1 : 0,
            lastTriggered: null,
          })
          .returning();

        return result;
      } catch (error) {
        console.error('[Alerts] Error creating config:', error);
        throw new Error('Failed to create alert config');
      }
    }),

  /**
   * Atualizar configuração de alerta
   */
  updateConfig: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        alertType: z.string().optional(),
        condition: z.any().optional(),
        recipients: z.string().optional(),
        frequency: z.string().optional(),
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
          .update(alertConfigs)
          .set(updateData)
          .where(eq(alertConfigs.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Alerts] Error updating config:', error);
        throw new Error('Failed to update alert config');
      }
    }),

  /**
   * Deletar configuração de alerta
   */
  deleteConfig: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        await db.delete(alertConfigs).where(eq(alertConfigs.id, id));

        return { success: true };
      } catch (error) {
        console.error('[Alerts] Error deleting config:', error);
        throw new Error('Failed to delete alert config');
      }
    }),

  /**
   * Ativar/Desativar alerta
   */
  toggleConfig: protectedProcedure
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
          .update(alertConfigs)
          .set({
            active: input.active ? 1 : 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(alertConfigs.id, input.id))
          .returning();

        return result;
      } catch (error) {
        console.error('[Alerts] Error toggling config:', error);
        throw new Error('Failed to toggle alert config');
      }
    }),

  /**
   * Listar histórico de alertas
   */
  listHistory: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        configId: z.number().optional(),
        limit: z.number().min(1).max(200).default(100),
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
          conditions.push(eq(alertHistory.projectId, input.projectId));
        }

        if (input?.configId) {
          conditions.push(eq(alertHistory.configId, input.configId));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return await db
          .select()
          .from(alertHistory)
          .where(whereClause)
          .orderBy(desc(alertHistory.triggeredAt))
          .limit(input?.limit || 100);
      } catch (error) {
        console.error('[Alerts] Error listing history:', error);
        throw new Error('Failed to list alert history');
      }
    }),

  /**
   * Registrar disparo de alerta
   */
  logTrigger: protectedProcedure
    .input(
      z.object({
        configId: z.number(),
        projectId: z.number(),
        message: z.string(),
        data: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // Registrar no histórico
        const [history] = await db
          .insert(alertHistory)
          .values({
            configId: input.configId,
            projectId: input.projectId,
            message: input.message,
            data: input.data,
            triggeredAt: new Date().toISOString(),
          })
          .returning();

        // Atualizar lastTriggered na config
        await db
          .update(alertConfigs)
          .set({
            lastTriggered: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(alertConfigs.id, input.configId));

        return history;
      } catch (error) {
        console.error('[Alerts] Error logging trigger:', error);
        throw new Error('Failed to log alert trigger');
      }
    }),

  /**
   * Obter estatísticas de alertas
   */
  getStats: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [totalConfigs, activeConfigs, totalHistory] = await Promise.all([
          db.select({ value: count() }).from(alertConfigs).where(eq(alertConfigs.projectId, input.projectId)),
          db.select({ value: count() }).from(alertConfigs).where(and(eq(alertConfigs.projectId, input.projectId), eq(alertConfigs.active, 1))),
          db.select({ value: count() }).from(alertHistory).where(eq(alertHistory.projectId, input.projectId)),
        ]);

        return {
          totalConfigs: totalConfigs[0]?.value || 0,
          activeConfigs: activeConfigs[0]?.value || 0,
          totalHistory: totalHistory[0]?.value || 0,
        };
      } catch (error) {
        console.error('[Alerts] Error getting stats:', error);
        throw new Error('Failed to get alert stats');
      }
    }),
});
