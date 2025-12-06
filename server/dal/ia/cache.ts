/**
 * DAL para ia_cache
 * Sincronizado 100% com schema (9 campos)
 */

import { db } from '../../db';
import { ia_cache } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like, lt } from 'drizzle-orm';

export interface IACacheFilters {
  id?: number;
  chave?: string;
  tipo?: string;
  incluirInativos?: boolean;
  incluirExpirados?: boolean;
  orderBy?: keyof typeof ia_cache;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIACacheData {
  chave: string;
  valor: string;
  tipo?: string;
  expiracao?: Date;
  created_by: string;
}

export interface UpdateIACacheData {
  chave?: string;
  valor?: string;
  tipo?: string;
  expiracao?: Date;
  updated_by?: string;
}

export async function getIACaches(filters: IACacheFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_cache.id, filters.id));
  if (filters.chave) conditions.push(like(ia_cache.chave, `%${filters.chave}%`));
  if (filters.tipo) conditions.push(eq(ia_cache.tipo, filters.tipo));
  if (!filters.incluirInativos) conditions.push(isNull(ia_cache.deleted_at));
  if (!filters.incluirExpirados) {
    conditions.push(sql`(${ia_cache.expiracao} IS NULL OR ${ia_cache.expiracao} > now())`);
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
  const result = await db.select().from(ia_cache).where(and(eq(ia_cache.id, id), isNull(ia_cache.deleted_at))).limit(1);
  return result[0] || null;
}

export async function getIACacheByChave(chave: string) {
  const result = await db.select().from(ia_cache).where(
    and(
      eq(ia_cache.chave, chave), 
      isNull(ia_cache.deleted_at),
      sql`(${ia_cache.expiracao} IS NULL OR ${ia_cache.expiracao} > now())`
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
  const result = await db.update(ia_cache).set({ deleted_at: sql`now()`, deleted_by }).where(eq(ia_cache.id, id)).returning();
  return result[0] || null;
}

export async function deleteExpiredCaches() {
  const result = await db.delete(ia_cache).where(lt(ia_cache.expiracao, sql`now()`)).returning();
  return result.length;
}

export async function countIACaches(filters: IACacheFilters = {}) {
  const conditions: any[] = [];
  if (filters.tipo) conditions.push(eq(ia_cache.tipo, filters.tipo));
  if (!filters.incluirInativos) conditions.push(isNull(ia_cache.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_cache).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
