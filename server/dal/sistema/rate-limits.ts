/**
 * DAL para rate_limits
 * Sincronizado 100% com schema (8 campos)
 */

import { db } from '../../db';
import { rate_limits } from '../../../drizzle/schema';
import { eq, and, desc, asc, sql, gte } from 'drizzle-orm';

export interface RateLimitFilters {
  id?: number;
  user_id?: string;
  endpoint?: string;
  dataInicio?: Date;
  orderBy?: keyof typeof rate_limits;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateRateLimitData {
  user_id: string;
  endpoint: string;
  requests_count: number;
  window_start: Date;
  window_end: Date;
}

export interface UpdateRateLimitData {
  requests_count?: number;
  window_start?: Date;
  window_end?: Date;
}

export async function getRateLimits(filters: RateLimitFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(rate_limits.id, filters.id));
  if (filters.user_id) conditions.push(eq(rate_limits.user_id, filters.user_id));
  if (filters.endpoint) conditions.push(eq(rate_limits.endpoint, filters.endpoint));
  if (filters.dataInicio) conditions.push(gte(rate_limits.window_start, filters.dataInicio));

  let query = db.select().from(rate_limits).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = rate_limits[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(rate_limits.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getRateLimitById(id: number) {
  const result = await db.select().from(rate_limits).where(eq(rate_limits.id, id)).limit(1);
  return result[0] || null;
}

export async function getCurrentRateLimit(user_id: string, endpoint: string) {
  const result = await db.select().from(rate_limits).where(
    and(
      eq(rate_limits.user_id, user_id),
      eq(rate_limits.endpoint, endpoint),
      sql`${rate_limits.window_end} > now()`
    )
  ).orderBy(desc(rate_limits.window_end)).limit(1);
  return result[0] || null;
}

export async function createRateLimit(data: CreateRateLimitData) {
  const result = await db.insert(rate_limits).values({ ...data, created_at: sql`now()` }).returning();
  return result[0];
}

export async function updateRateLimit(id: number, data: UpdateRateLimitData) {
  const result = await db.update(rate_limits).set(data).where(eq(rate_limits.id, id)).returning();
  return result[0] || null;
}

export async function incrementRateLimit(id: number) {
  const result = await db.update(rate_limits).set({ requests_count: sql`${rate_limits.requests_count} + 1` }).where(eq(rate_limits.id, id)).returning();
  return result[0] || null;
}

export async function deleteExpiredRateLimits() {
  const result = await db.delete(rate_limits).where(sql`${rate_limits.window_end} < now()`).returning();
  return result.length;
}

export async function countRateLimits(filters: RateLimitFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(rate_limits.user_id, filters.user_id));
  if (filters.endpoint) conditions.push(eq(rate_limits.endpoint, filters.endpoint));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(rate_limits).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
