/**
 * Notifications Router - Versão Refatorada e Simplificada
 * Sistema de notificações limpo e funcional
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';
import { notifications } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

export const notificationsRouter = createTRPCRouter({
  /**
   * Buscar notificações não lidas
   */
  getUnread: publicProcedure
    .input(
      z
        .object({
          projectId: z.number().optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const query = input?.projectId
          ? and(eq(notifications.projectId, input.projectId), eq(notifications.isRead, 0))
          : eq(notifications.isRead, 0);

        const result = await db
          .select()
          .from(notifications)
          .where(query)
          .orderBy(desc(notifications.createdAt))
          .limit(input?.limit || 50);

        return result.map((n) => ({
          id: String(n.id || ''),
          type: n.type as 'info' | 'warning' | 'error' | 'success',
          title: n.title || '',
          message: n.message || '',
          timestamp: n.createdAt || new Date().toISOString(),
          read: n.isRead === 1,
          entityType: n.entityType,
          entityId: n.entityId,
        }));
      } catch (error) {
        console.error('[Notifications] Error:', error);
        return [];
      }
    }),

  /**
   * Marcar notificação como lida
   */
  markAsRead: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, parseInt(input.id)));

    return { success: true };
  }),

  /**
   * Marcar todas como lidas
   */
  markAllAsRead: publicProcedure
    .input(z.object({ projectId: z.number().optional() }).optional())
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const query = input?.projectId
        ? and(eq(notifications.projectId, input.projectId), eq(notifications.isRead, 0))
        : eq(notifications.isRead, 0);

      await db.update(notifications).set({ isRead: 1 }).where(query);

      return { success: true };
    }),

  /**
   * Deletar notificação
   */
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db.delete(notifications).where(eq(notifications.id, parseInt(input.id)));

    return { success: true };
  }),

  /**
   * Criar notificação
   */
  create: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        type: z.enum(['info', 'warning', 'error', 'success']),
        title: z.string(),
        message: z.string(),
        entityType: z.string().optional(),
        entityId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [notification] = await db
        .insert(notifications)
        .values({
          userId: 'system',
          projectId: input.projectId,
          type: input.type,
          title: input.title,
          message: input.message,
          entityType: input.entityType || null,
          entityId: input.entityId || null,
          isRead: 0,
        })
        .returning();

      return {
        success: true,
        notification: {
          id: String(notification.id || ''),
          type: notification.type,
          title: notification.title || '',
          message: notification.message || '',
          timestamp: notification.createdAt || new Date().toISOString(),
          read: false,
        },
      };
    }),
});
