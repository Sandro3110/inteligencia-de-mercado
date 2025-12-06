/**
 * DAL para ia_cache
 * Sincronizado 100% com schema (9 campos)
 */

import { db } from '../../db';
import { ia_cache } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like, lt } from 'drizzle-orm';

export interface IACacheFilters {
  id?: number;
  tipo?: string;
  incluirInativos?: boolean;
  incluirExpirados?: boolean;
  orderBy?: keyof typeof ia_cache;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIACacheData {
  valor: string;
  tipo?: string;
  created_by: string;
}

export interface UpdateIACacheData {
  valor?: string;
  tipo?: string;
  updated_by?: string;
}

export async function getIACaches(filters: IACacheFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_cache.id, filters.id));
  if (filters.tipo) conditions.push(eq(ia_cache.tipo, filters.tipo));
  if (!filters.incluirExpirados) {
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
  return result[0] || null;
}

  const result = await db.select().from(ia_cache).where(
    and(
    )
  ).limit(1);
  return result[0] || null;
}

export async function createIACache(data: CreateIACacheData) {
  const result = await db.insert(ia_cache).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateIACache(id: number, data: UpdateIACacheData) {
  const result = await db.update(ia_cache).set({ ...data, updated_at: sql`now()` }).where(eq(ia_cache.id, id)).returning();
  return result[0] || null;
}

export async function deleteIACache(id: number, deleted_by?: string) {
  return result[0] || null;
}

export async function deleteExpiredCaches() {
  return result.length;
}

export async function countIACaches(filters: IACacheFilters = {}) {
  const conditions: any[] = [];
  if (filters.tipo) conditions.push(eq(ia_cache.tipo, filters.tipo));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_cache).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
