/**
 * Notifications Router
 * Sistema de notificações com polling (compatível com Vercel)
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { notifications } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

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
        // Se não tiver userId, retorna vazio (sistema sem auth)
        if (!userId) {
          return [];
        }

        const unreadNotifications = await db
          .select()
          .from(notifications)
          .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)))
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
        if (!userId) {
          return [];
        }

        const allNotifications = await db
          .select()
          .from(notifications)
          .where(eq(notifications.userId, userId))
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
        userId: z.string(),
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
          .where(and(eq(notifications.userId, input.userId), eq(notifications.isRead, 0)));

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
        userId: z.string(),
        projectId: z.number().optional(),
        type: z.enum(['info', 'warning', 'error', 'success']),
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
});
