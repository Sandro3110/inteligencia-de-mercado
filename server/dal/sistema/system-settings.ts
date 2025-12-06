/**
 * DAL para system_settings
 * Sincronizado 100% com schema (9 campos)
 */

import { db } from '../../db';
import { system_settings } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface SystemSettingFilters {
  id?: number;
  orderBy?: keyof typeof system_settings;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateSystemSettingData {
  valor: string;
  descricao?: string;
  created_by?: string;
}

export interface UpdateSystemSettingData {
  valor?: string;
  descricao?: string;
  updated_by?: string;
}

export async function getSystemSettings(filters: SystemSettingFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(system_settings.id, filters.id));

  let query = db.select().from(system_settings).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = system_settings[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getSystemSettingById(id: number) {
  return result[0] || null;
}

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
  return result[0] || null;
}

export async function countSystemSettings(filters: SystemSettingFilters = {}) {
  const conditions: any[] = [];
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(system_settings).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
