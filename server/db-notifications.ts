import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { notifications } from "../drizzle/schema";

export type NotificationType =
  | "enrichment_complete"
  | "enrichment_started"
  | "enrichment_error"
  | "lead_high_quality"
  | "quality_alert"
  | "circuit_breaker"
  | "project_created"
  | "project_hibernated"
  | "project_reactivated"
  | "pesquisa_created"
  | "validation_batch_complete"
  | "export_complete"
  | "report_generated"
  | "lead_quality"
  | "lead_closed"
  | "new_competitor"
  | "market_threshold"
  | "data_incomplete"
  | "system";

export interface CreateNotificationInput {
  userId: string;
  projectId?: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  entityType?: "mercado" | "cliente" | "concorrente" | "lead";
  entityId?: number;
}

export interface ListNotificationsFilters {
  userId: string;
  projectId?: number;
  type?: NotificationType;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Criar uma nova notificação
 */
export async function createNotification(input: CreateNotificationInput) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return null;
  }

  try {
    const [result] = await db.insert(notifications).values({
      userId: input.userId,
      projectId: input.projectId || null,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      isRead: 0,
    });

    return result.insertId;
  } catch (error) {
    console.error("[Notifications] Error creating notification:", error);
    throw error;
  }
}

/**
 * Listar notificações com filtros
 */
export async function listNotifications(filters: ListNotificationsFilters) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return [];
  }

  try {
    const conditions = [eq(notifications.userId, filters.userId)];

    if (filters.projectId !== undefined) {
      conditions.push(eq(notifications.projectId, filters.projectId));
    }

    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type));
    }

    if (filters.isRead !== undefined) {
      conditions.push(eq(notifications.isRead, filters.isRead ? 1 : 0));
    }

    if (filters.startDate) {
      conditions.push(
        gte(notifications.createdAt, filters.startDate.toISOString())
      );
    }

    if (filters.endDate) {
      conditions.push(
        lte(notifications.createdAt, filters.endDate.toISOString())
      );
    }

    let query = db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;

    // Parse metadata JSON
    return results.map((n) => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata as string) : null,
    }));
  } catch (error) {
    console.error("[Notifications] Error listing notifications:", error);
    throw error;
  }
}

/**
 * Contar notificações não lidas
 */
export async function countUnreadNotifications(
  userId: string,
  projectId?: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return 0;
  }

  try {
    const conditions = [
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0),
    ];

    if (projectId !== undefined) {
      conditions.push(eq(notifications.projectId, projectId));
    }

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(...conditions));

    return result?.count || 0;
  } catch (error) {
    console.error("[Notifications] Error counting unread notifications:", error);
    return 0;
  }
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(id: number, userId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return false;
  }

  try {
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    return true;
  } catch (error) {
    console.error("[Notifications] Error marking notification as read:", error);
    return false;
  }
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificationsAsRead(
  userId: string,
  projectId?: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return false;
  }

  try {
    const conditions = [
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0),
    ];

    if (projectId !== undefined) {
      conditions.push(eq(notifications.projectId, projectId));
    }

    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(and(...conditions));

    return true;
  } catch (error) {
    console.error(
      "[Notifications] Error marking all notifications as read:",
      error
    );
    return false;
  }
}

/**
 * Deletar notificação
 */
export async function deleteNotification(id: number, userId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return false;
  }

  try {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));

    return true;
  } catch (error) {
    console.error("[Notifications] Error deleting notification:", error);
    return false;
  }
}

/**
 * Deletar todas as notificações lidas
 */
export async function deleteAllReadNotifications(
  userId: string,
  projectId?: number
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Notifications] Database not available");
    return false;
  }

  try {
    const conditions = [
      eq(notifications.userId, userId),
      eq(notifications.isRead, 1),
    ];

    if (projectId !== undefined) {
      conditions.push(eq(notifications.projectId, projectId));
    }

    await db.delete(notifications).where(and(...conditions));

    return true;
  } catch (error) {
    console.error(
      "[Notifications] Error deleting read notifications:",
      error
    );
    return false;
  }
}
