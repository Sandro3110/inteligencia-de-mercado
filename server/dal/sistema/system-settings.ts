/**
 * DAL para system_settings
 * Sincronizado 100% com schema PostgreSQL (6 campos)
 */

import { db } from '../../db';
import { system_settings } from '../../../drizzle';
import { eq, and, sql } from 'drizzle-orm';

export interface SystemSettingFilters {
  id?: number;
  settingKey?: string;
}

export interface CreateSystemSettingData {
  settingKey: string;
  settingValue?: string;
  description?: string;
}

export interface UpdateSystemSettingData {
  settingValue?: string;
  description?: string;
}

export async function getSystemSettings(filters: SystemSettingFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(system_settings.id, filters.id));
  if (filters.settingKey) conditions.push(eq(system_settings.settingKey, filters.settingKey));
  return db.select().from(system_settings).where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getSystemSettingById(id: number) {
  const result = await db.select().from(system_settings).where(eq(system_settings.id, id)).limit(1);
  return result[0] || null;
}

export async function createSystemSetting(data: CreateSystemSettingData) {
  const result = await db.insert(system_settings).values(data).returning();
  return result[0];
}

export async function updateSystemSetting(id: number, data: UpdateSystemSettingData) {
  const result = await db.update(system_settings).set({ ...data, updatedAt: sql`now()` }).where(eq(system_settings.id, id)).returning();
  return result[0] || null;
}

export async function getSystemSettingByChave(chave: string) {
  const result = await db.select().from(system_settings).where(eq(system_settings.settingKey, chave)).limit(1);
  return result[0] || null;
}

export async function deleteSystemSetting(id: number) {
  const result = await db.delete(system_settings).where(eq(system_settings.id, id)).returning();
  return result[0] || null;
}

export async function countSystemSettings(filters: SystemSettingFilters = {}) {
  const conditions: any[] = [];
  if (filters.settingKey) conditions.push(eq(system_settings.settingKey, filters.settingKey));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(system_settings).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
