/**
 * DAL para ia_cache
 * Sincronizado 100% com schema PostgreSQL (8 campos)
 */

import { db } from '../../db';
import { ia_cache } from '../../../drizzle';
import { eq, and, desc, asc, sql, lt } from 'drizzle-orm';

export interface IACacheFilters {
  id?: number;
  cache_key?: string;
  tipo?: string;
  incluirExpirados?: boolean;
  orderBy?: keyof typeof ia_cache;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIACacheData {
  cache_key: string;
  tipo: string;
  dados: any;
  expires_at: Date;
}

export interface UpdateIACacheData {
  dados?: any;
  expires_at?: Date;
  hits?: number;
  last_hit_at?: Date;
}

export async function getIACaches(filters: IACacheFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_cache.id, filters.id));
  if (filters.cache_key) conditions.push(eq(ia_cache.cache_key, filters.cache_key));
  if (filters.tipo) conditions.push(eq(ia_cache.tipo, filters.tipo));
  if (!filters.incluirExpirados) {
    conditions.push(sql`${ia_cache.expires_at} > now()`);
  }

  let query = db.select().from(ia_cache).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = ia_cache[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(ia_cache.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getIACacheById(id: number) {
  const result = await db.select().from(ia_cache).where(eq(ia_cache.id, id)).limit(1);
  return result[0] || null;
}

export async function getIACacheByKey(cache_key: string) {
  const result = await db.select().from(ia_cache).where(
    and(
      eq(ia_cache.cache_key, cache_key),
      sql`${ia_cache.expires_at} > now()`
    )
  ).limit(1);
  return result[0] || null;
}

export async function createIACache(data: CreateIACacheData) {
  const result = await db.insert(ia_cache).values(data).returning();
  return result[0];
}

export async function updateIACache(id: number, data: UpdateIACacheData) {
  const result = await db.update(ia_cache).set(data).where(eq(ia_cache.id, id)).returning();
  return result[0] || null;
}

export async function incrementCacheHit(id: number) {
  const result = await db.update(ia_cache).set({
    hits: sql`${ia_cache.hits} + 1`,
    last_hit_at: sql`now()`
  }).where(eq(ia_cache.id, id)).returning();
  return result[0] || null;
}

export async function deleteIACache(id: number) {
  const result = await db.delete(ia_cache).where(eq(ia_cache.id, id)).returning();
  return result[0] || null;
}

export async function deleteExpiredCaches() {
  const result = await db.delete(ia_cache).where(lt(ia_cache.expires_at, sql`now()`)).returning();
  return result.length;
}

export async function countIACaches(filters: IACacheFilters = {}) {
  const conditions: any[] = [];
  if (filters.tipo) conditions.push(eq(ia_cache.tipo, filters.tipo));
  if (!filters.incluirExpirados) {
    conditions.push(sql`${ia_cache.expires_at} > now()`);
  }
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_cache).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}

export async function getIACacheByChave(cache_key: string) {
  const result = await db.select().from(ia_cache).where(
    and(
      eq(ia_cache.cache_key, cache_key),
      sql`${ia_cache.expires_at} > now()`
    )
  ).limit(1);
  return result[0] || null;
}
