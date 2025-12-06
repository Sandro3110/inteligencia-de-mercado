/**
 * DAL para system_settings
 * Sincronizado 100% com schema (9 campos)
 */

import { db } from '../../db';
import { system_settings } from '../../../drizzle/schema';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface SystemSettingFilters {
  id?: number;
  chave?: string;
  categoria?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof system_settings;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateSystemSettingData {
  chave: string;
  valor: string;
  descricao?: string;
  categoria?: string;
  created_by?: string;
}

export interface UpdateSystemSettingData {
  chave?: string;
  valor?: string;
  descricao?: string;
  categoria?: string;
  updated_by?: string;
}

export async function getSystemSettings(filters: SystemSettingFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(system_settings.id, filters.id));
  if (filters.chave) conditions.push(like(system_settings.chave, `%${filters.chave}%`));
  if (filters.categoria) conditions.push(eq(system_settings.categoria, filters.categoria));
  if (!filters.incluirInativos) conditions.push(isNull(system_settings.deleted_at));

  let query = db.select().from(system_settings).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = system_settings[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(asc(system_settings.chave)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getSystemSettingById(id: number) {
  const result = await db.select().from(system_settings).where(and(eq(system_settings.id, id), isNull(system_settings.deleted_at))).limit(1);
  return result[0] || null;
}

export async function getSystemSettingByChave(chave: string) {
  const result = await db.select().from(system_settings).where(and(eq(system_settings.chave, chave), isNull(system_settings.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createSystemSetting(data: CreateSystemSettingData) {
  const result = await db.insert(system_settings).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateSystemSetting(id: number, data: UpdateSystemSettingData) {
  const result = await db.update(system_settings).set({ ...data, updated_at: sql`now()` }).where(eq(system_settings.id, id)).returning();
  return result[0] || null;
}

export async function deleteSystemSetting(id: number, deleted_by?: string) {
  const result = await db.update(system_settings).set({ deleted_at: sql`now()`, deleted_by }).where(eq(system_settings.id, id)).returning();
  return result[0] || null;
}

export async function countSystemSettings(filters: SystemSettingFilters = {}) {
  const conditions: any[] = [];
  if (filters.categoria) conditions.push(eq(system_settings.categoria, filters.categoria));
  if (!filters.incluirInativos) conditions.push(isNull(system_settings.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(system_settings).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
