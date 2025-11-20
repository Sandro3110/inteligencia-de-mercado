import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createNotification,
  listNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  type NotificationType,
} from "../db-notifications";

const notificationTypeSchema = z.enum([
  "enrichment_complete",
  "enrichment_started",
  "enrichment_error",
  "lead_high_quality",
  "quality_alert",
  "circuit_breaker",
  "project_created",
  "project_hibernated",
  "project_reactivated",
  "pesquisa_created",
  "validation_batch_complete",
  "export_complete",
  "report_generated",
  "lead_quality",
  "lead_closed",
  "new_competitor",
  "market_threshold",
  "data_incomplete",
  "system",
]);

export const notificationsRouter = router({
  /**
   * Listar notificações com filtros
   */
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        type: notificationTypeSchema.optional(),
        isRead: z.boolean().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return listNotifications({
        userId: ctx.user.id,
        ...input,
      });
    }),

  /**
   * Contar notificações não lidas
   */
  countUnread: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await countUnreadNotifications(
        ctx.user.id,
        input.projectId
      );
      return { count };
    }),

  /**
   * Marcar notificação como lida
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await markNotificationAsRead(input.id, ctx.user.id);
      return { success };
    }),

  /**
   * Marcar todas as notificações como lidas
   */
  markAllAsRead: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await markAllNotificationsAsRead(
        ctx.user.id,
        input.projectId
      );
      return { success };
    }),

  /**
   * Deletar notificação
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await deleteNotification(input.id, ctx.user.id);
      return { success };
    }),

  /**
   * Deletar todas as notificações lidas
   */
  deleteAllRead: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await deleteAllReadNotifications(
        ctx.user.id,
        input.projectId
      );
      return { success };
    }),

  /**
   * Criar notificação (uso interno)
   */
  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        type: notificationTypeSchema,
        title: z.string(),
        message: z.string(),
        metadata: z.record(z.any()).optional(),
        entityType: z.enum(["mercado", "cliente", "concorrente", "lead"]).optional(),
        entityId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await createNotification({
        userId: ctx.user.id,
        ...input,
      });
      return { success: !!id, id };
    }),
});
