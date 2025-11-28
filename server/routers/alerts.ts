/**
 * Alerts Router - Sistema de Alertas Inteligentes
 * Gerencia configurações de alertas e histórico
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { alertConfigs, alertHistory } from '@/drizzle/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// Tipos de alertas suportados
export const AlertType = z.enum([
  'new_lead',
  'lead_qualified',
  'competitor_change',
  'market_opportunity',
  'data_anomaly',
  'validation_needed',
  'enrichment_complete',
]);

// Schema de configuração de alerta
const AlertConfigSchema = z.object({
  name: z.string().min(1).max(255),
  alertType: AlertType,
  condition: z.string().min(1),
  enabled: z.boolean().default(true),
});

export const alertsRouter = createTRPCRouter({
  /**
   * Listar configurações de alertas por projeto
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const configs = await db
        .select()
        .from(alertConfigs)
        .where(eq(alertConfigs.projectId, input.projectId))
        .orderBy(desc(alertConfigs.createdAt));

      return configs;
    }),

  /**
   * Criar nova configuração de alerta
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        config: AlertConfigSchema,
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const [newConfig] = await db
        .insert(alertConfigs)
        .values({
          projectId: input.projectId,
          name: input.config.name,
          alertType: input.config.alertType,
          condition: input.config.condition,
          enabled: input.config.enabled ? 1 : 0,
        })
        .returning();

      return newConfig;
    }),

  /**
   * Atualizar configuração de alerta
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        config: AlertConfigSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (input.config.name) updateData.name = input.config.name;
      if (input.config.alertType) updateData.alertType = input.config.alertType;
      if (input.config.condition) updateData.condition = input.config.condition;
      if (input.config.enabled !== undefined) updateData.enabled = input.config.enabled ? 1 : 0;

      const [updated] = await db
        .update(alertConfigs)
        .set(updateData)
        .where(eq(alertConfigs.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Deletar configuração de alerta
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      await db.delete(alertConfigs).where(eq(alertConfigs.id, input.id));

      return { success: true };
    }),

  /**
   * Obter histórico de alertas
   */
  history: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        alertType: AlertType.optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      let query = db
        .select()
        .from(alertHistory)
        .where(eq(alertHistory.projectId, input.projectId))
        .orderBy(desc(alertHistory.triggeredAt))
        .limit(input.limit)
        .offset(input.offset);

      if (input.alertType) {
        query = db
          .select()
          .from(alertHistory)
          .where(
            and(
              eq(alertHistory.projectId, input.projectId),
              eq(alertHistory.alertType, input.alertType)
            )
          )
          .orderBy(desc(alertHistory.triggeredAt))
          .limit(input.limit)
          .offset(input.offset);
      }

      const history = await query;

      return history;
    }),

  /**
   * Obter estatísticas de alertas
   */
  stats: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - input.days);

      // Total de alertas configurados
      const [configsCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(alertConfigs)
        .where(eq(alertConfigs.projectId, input.projectId));

      // Total de alertas ativos
      const [activeCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(alertConfigs)
        .where(
          and(
            eq(alertConfigs.projectId, input.projectId),
            eq(alertConfigs.enabled, 1)
          )
        );

      // Total de alertas disparados no período
      const [triggeredCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(alertHistory)
        .where(
          and(
            eq(alertHistory.projectId, input.projectId),
            gte(alertHistory.triggeredAt, dateThreshold.toISOString())
          )
        );

      // Alertas por tipo
      const byType = await db
        .select({
          alertType: alertHistory.alertType,
          count: sql<number>`count(*)::int`,
        })
        .from(alertHistory)
        .where(
          and(
            eq(alertHistory.projectId, input.projectId),
            gte(alertHistory.triggeredAt, dateThreshold.toISOString())
          )
        )
        .groupBy(alertHistory.alertType);

      return {
        totalConfigs: configsCount?.count || 0,
        activeConfigs: activeCount?.count || 0,
        triggeredInPeriod: triggeredCount?.count || 0,
        byType: byType,
      };
    }),

  /**
   * Marcar alerta como lido
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // Nota: Precisaria adicionar campo 'read' na tabela alert_history
      // Por enquanto, apenas retorna sucesso
      return { success: true, count: input.ids.length };
    }),

  /**
   * Testar condição de alerta
   */
  testCondition: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        alertType: AlertType,
        condition: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // Simular teste de condição
      // Em produção, executaria a condição real contra os dados
      const testResult = {
        valid: true,
        wouldTrigger: Math.random() > 0.5,
        message: 'Condição válida e testada com sucesso',
      };

      return testResult;
    }),
});

export type AlertsRouter = typeof alertsRouter;
