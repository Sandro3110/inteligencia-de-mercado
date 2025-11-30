/**
 * Notifications Router
 * Sistema de notificações com polling (compatível com Vercel)
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { notifications } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { checkAndNotifyCompletedJobs } from '@/server/utils/createEnrichmentNotification';

export const notificationsRouter = createTRPCRouter({
  /**
   * Buscar notificações não lidas do usuário
   */
  getUnread: publicProcedure
    .input(
      z
        .object({
          userId: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const userId = input?.userId;
      const limit = input?.limit || 20;

      try {
        // Sistema sem auth: retorna todas as notificações não lidas ou filtra por userId
        const unreadNotifications = userId
          ? await db
              .select()
              .from(notifications)
              .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)))
              .orderBy(desc(notifications.createdAt))
              .limit(limit)
          : await db
              .select()
              .from(notifications)
              .where(eq(notifications.isRead, 0))
              .orderBy(desc(notifications.createdAt))
              .limit(limit);

        return unreadNotifications.map((n) => ({
          id: n.id?.toString() || '',
          type: n.type as 'info' | 'warning' | 'error' | 'success',
          title: n.title || '',
          message: n.message || '',
          timestamp: n.createdAt || new Date().toISOString(),
          read: n.isRead === 1,
          entityType: n.entityType,
          entityId: n.entityId,
        }));
      } catch (error) {
        console.error('[Notifications] Error fetching unread:', error);
        return [];
      }
    }),

  /**
   * Buscar todas as notificações do usuário
   */
  getAll: publicProcedure
    .input(
      z
        .object({
          userId: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const userId = input?.userId;
      const limit = input?.limit || 50;

      try {
        // Sistema sem auth: retorna todas as notificações ou filtra por userId se fornecido
        const allNotifications = userId
          ? await db
              .select()
              .from(notifications)
              .where(eq(notifications.userId, userId))
              .orderBy(desc(notifications.createdAt))
              .limit(limit)
          : await db
              .select()
              .from(notifications)
              .orderBy(desc(notifications.createdAt))
              .limit(limit);

        return allNotifications.map((n) => ({
          id: n.id?.toString() || '',
          type: n.type as 'info' | 'warning' | 'error' | 'success',
          title: n.title || '',
          message: n.message || '',
          timestamp: n.createdAt || new Date().toISOString(),
          read: n.isRead === 1,
          entityType: n.entityType,
          entityId: n.entityId,
        }));
      } catch (error) {
        console.error('[Notifications] Error fetching all:', error);
        return [];
      }
    }),

  /**
   * Marcar notificação como lida
   */
  markAsRead: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        await db
          .update(notifications)
          .set({ isRead: 1 })
          .where(eq(notifications.id, parseInt(input.id)));

        return { success: true };
      } catch (error) {
        console.error('[Notifications] Error marking as read:', error);
        throw new Error('Failed to mark notification as read');
      }
    }),

  /**
   * Marcar todas as notificações como lidas
   */
  markAllAsRead: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        // Sistema sem auth: marca todas ou filtra por userId
        if (input.userId) {
          await db
            .update(notifications)
            .set({ isRead: 1 })
            .where(and(eq(notifications.userId, input.userId), eq(notifications.isRead, 0)));
        } else {
          await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.isRead, 0));
        }

        return { success: true };
      } catch (error) {
        console.error('[Notifications] Error marking all as read:', error);
        throw new Error('Failed to mark all notifications as read');
      }
    }),

  /**
   * Criar nova notificação (para testes ou uso interno)
   */
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().optional().default('system'),
        projectId: z.number().optional(),
        type: z.enum([
          'info',
          'warning',
          'error',
          'success',
          'enrichment_complete',
          'new_lead',
          'quality_alert',
          'system',
        ]),
        title: z.string(),
        message: z.string(),
        entityType: z.string().optional(),
        entityId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const [notification] = await db
          .insert(notifications)
          .values({
            userId: input.userId,
            projectId: input.projectId,
            type: input.type,
            title: input.title,
            message: input.message,
            entityType: input.entityType,
            entityId: input.entityId,
            isRead: 0,
          })
          .returning();

        return {
          success: true,
          notification: {
            id: notification.id?.toString() || '',
            type: notification.type as 'info' | 'warning' | 'error' | 'success',
            title: notification.title || '',
            message: notification.message || '',
            timestamp: notification.createdAt || new Date().toISOString(),
            read: false,
          },
        };
      } catch (error) {
        console.error('[Notifications] Error creating notification:', error);
        throw new Error('Failed to create notification');
      }
    }),

  /**
   * Verificar e criar notificações de jobs completados
   */
  checkCompletedJobs: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    try {
      await checkAndNotifyCompletedJobs(db);
      return { success: true };
    } catch (error) {
      console.error('[Notifications] Error checking completed jobs:', error);
      throw new Error('Failed to check completed jobs');
    }
  }),

  /**
   * Criar notificações de exemplo/demonstração
   */
  createSampleNotifications: publicProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      try {
        const sampleNotifications = [
          {
            userId: 'system',
            projectId: input.projectId,
            type: 'enrichment_complete' as const,
            title: 'Enriquecimento Concluído',
            message: 'Base Inicial foi enriquecida com sucesso! 405 clientes processados.',
            entityType: 'pesquisa',
            entityId: 1,
            isRead: 0,
          },
          {
            userId: 'system',
            projectId: input.projectId,
            type: 'new_lead' as const,
            title: 'Novos Leads Identificados',
            message: '2730 leads foram identificados e adicionados ao sistema.',
            entityType: 'leads',
            entityId: 1,
            isRead: 0,
          },
          {
            userId: 'system',
            projectId: input.projectId,
            type: 'quality_alert' as const,
            title: 'Alerta de Qualidade',
            message: 'Qualidade média dos dados está em 66%. Considere revisar alguns registros.',
            entityType: 'pesquisa',
            entityId: 1,
            isRead: 0,
          },
          {
            userId: 'system',
            projectId: input.projectId,
            type: 'system' as const,
            title: 'Sistema Atualizado',
            message: 'Nova versão do IntelMarket disponível com melhorias de performance.',
            entityType: 'system',
            isRead: 0,
          },
        ];

        const created = await db.insert(notifications).values(sampleNotifications).returning();

        return {
          success: true,
          count: created.length,
          notifications: created.map((n) => ({
            id: n.id?.toString() || '',
            type: n.type,
            title: n.title || '',
            message: n.message || '',
            timestamp: n.createdAt || new Date().toISOString(),
            read: false,
          })),
        };
      } catch (error) {
        console.error('[Notifications] Error creating sample notifications:', error);
        throw new Error('Failed to create sample notifications');
      }
    }),
});
