/**
 * DAL para rate_limits
 * Sincronizado 100% com schema PostgreSQL (7 campos)
 */

import { db } from '../../db';
import { rate_limits } from '../../../drizzle';
import { eq, and, sql } from 'drizzle-orm';

export interface RateLimitFilters {
  id?: number;
  user_id?: string;
  endpoint?: string;
}

export interface CreateRateLimitData {
  user_id: string;
  endpoint: string;
  chamadas?: number;
  bloqueado_ate?: Date;
}

export interface UpdateRateLimitData {
  chamadas?: number;
  janela_inicio?: Date;
  bloqueado_ate?: Date;
}

export async function getRateLimits(filters: RateLimitFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(rate_limits.id, filters.id));
  if (filters.user_id) conditions.push(eq(rate_limits.user_id, filters.user_id));
  if (filters.endpoint) conditions.push(eq(rate_limits.endpoint, filters.endpoint));
  return db.select().from(rate_limits).where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getRateLimitById(id: number) {
  const result = await db.select().from(rate_limits).where(eq(rate_limits.id, id)).limit(1);
  return result[0] || null;
}

export async function createRateLimit(data: CreateRateLimitData) {
  const result = await db.insert(rate_limits).values(data).returning();
  return result[0];
}

export async function updateRateLimit(id: number, data: UpdateRateLimitData) {
  const result = await db.update(rate_limits).set(data).where(eq(rate_limits.id, id)).returning();
  return result[0] || null;
}
