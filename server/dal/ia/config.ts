/**
 * DAL para ia_config
 * Sincronizado 100% com schema PostgreSQL (7 campos)
 */

import { db } from '../../db';
import { ia_config } from '../../../drizzle';
import { eq, and, desc, sql } from 'drizzle-orm';

export interface IAConfigFilters {
  id?: number;
  plataforma?: string;
  ativo?: boolean;
}

export interface CreateIAConfigData {
  plataforma?: string;
  modelo?: string;
  budget_mensal?: string;
  ativo?: boolean;
}

export interface UpdateIAConfigData {
  plataforma?: string;
  modelo?: string;
  budget_mensal?: string;
  ativo?: boolean;
}

export async function getIAConfigs(filters: IAConfigFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_config.id, filters.id));
  if (filters.plataforma) conditions.push(eq(ia_config.plataforma, filters.plataforma));
  if (filters.ativo !== undefined) conditions.push(eq(ia_config.ativo, filters.ativo));
  return db.select().from(ia_config).where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getIAConfigById(id: number) {
  const result = await db.select().from(ia_config).where(eq(ia_config.id, id)).limit(1);
  return result[0] || null;
}

export async function createIAConfig(data: CreateIAConfigData) {
  const result = await db.insert(ia_config).values(data).returning();
  return result[0];
}

export async function updateIAConfig(id: number, data: UpdateIAConfigData) {
  const result = await db.update(ia_config).set({ ...data, updated_at: sql`now()` }).where(eq(ia_config.id, id)).returning();
  return result[0] || null;
}

export async function getIAConfigByChave(chave: string) {
  const result = await db.select().from(ia_config).where(eq(ia_config.plataforma, chave)).limit(1);
  return result[0] || null;
}

export async function deleteIAConfig(id: number) {
  const result = await db.delete(ia_config).where(eq(ia_config.id, id)).returning();
  return result[0] || null;
}

export async function countIAConfigs(filters: IAConfigFilters = {}) {
  const conditions: any[] = [];
  if (filters.plataforma) conditions.push(eq(ia_config.plataforma, filters.plataforma));
  if (filters.ativo !== undefined) conditions.push(eq(ia_config.ativo, filters.ativo));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_config).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
