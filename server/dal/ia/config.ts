/**
 * DAL para ia_config
 * Sincronizado 100% com schema (10 campos)
 */

import { db } from '../../db';
import { ia_config } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface IAConfigFilters {
  id?: number;
  ativo?: boolean;
  incluirInativos?: boolean;
  orderBy?: keyof typeof ia_config;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIAConfigData {
  valor: string;
  descricao?: string;
  ativo?: boolean;
  created_by: string;
}

export interface UpdateIAConfigData {
  valor?: string;
  descricao?: string;
  ativo?: boolean;
  updated_by?: string;
}

export async function getIAConfigs(filters: IAConfigFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_config.id, filters.id));
  if (filters.ativo !== undefined) conditions.push(eq(ia_config.ativo, filters.ativo));

  let query = db.select().from(ia_config).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = ia_config[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getIAConfigById(id: number) {
  return result[0] || null;
}

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
  return result[0] || null;
}

export async function countIAConfigs(filters: IAConfigFilters = {}) {
  const conditions: any[] = [];
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_config).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
