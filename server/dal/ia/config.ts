/**
 * DAL para ia_config
 * Sincronizado 100% com schema (10 campos)
 */

import { db } from '../../db';
import { ia_config } from '../../../drizzle/schema';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface IAConfigFilters {
  id?: number;
  chave?: string;
  categoria?: string;
  ativo?: boolean;
  incluirInativos?: boolean;
  orderBy?: keyof typeof ia_config;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIAConfigData {
  chave: string;
  valor: string;
  descricao?: string;
  categoria?: string;
  ativo?: boolean;
  created_by: string;
}

export interface UpdateIAConfigData {
  chave?: string;
  valor?: string;
  descricao?: string;
  categoria?: string;
  ativo?: boolean;
  updated_by?: string;
}

export async function getIAConfigs(filters: IAConfigFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_config.id, filters.id));
  if (filters.chave) conditions.push(like(ia_config.chave, `%${filters.chave}%`));
  if (filters.categoria) conditions.push(eq(ia_config.categoria, filters.categoria));
  if (filters.ativo !== undefined) conditions.push(eq(ia_config.ativo, filters.ativo));
  if (!filters.incluirInativos) conditions.push(isNull(ia_config.deleted_at));

  let query = db.select().from(ia_config).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = ia_config[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(asc(ia_config.chave)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getIAConfigById(id: number) {
  const result = await db.select().from(ia_config).where(and(eq(ia_config.id, id), isNull(ia_config.deleted_at))).limit(1);
  return result[0] || null;
}

export async function getIAConfigByChave(chave: string) {
  const result = await db.select().from(ia_config).where(and(eq(ia_config.chave, chave), isNull(ia_config.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createIAConfig(data: CreateIAConfigData) {
  const result = await db.insert(ia_config).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateIAConfig(id: number, data: UpdateIAConfigData) {
  const result = await db.update(ia_config).set({ ...data, updated_at: sql`now()` }).where(eq(ia_config.id, id)).returning();
  return result[0] || null;
}

export async function deleteIAConfig(id: number, deleted_by?: string) {
  const result = await db.update(ia_config).set({ deleted_at: sql`now()`, deleted_by }).where(eq(ia_config.id, id)).returning();
  return result[0] || null;
}

export async function countIAConfigs(filters: IAConfigFilters = {}) {
  const conditions: any[] = [];
  if (filters.categoria) conditions.push(eq(ia_config.categoria, filters.categoria));
  if (!filters.incluirInativos) conditions.push(isNull(ia_config.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_config).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
