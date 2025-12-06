/**
 * DAL para ia_config_historico
 * Sincronizado 100% com schema (8 campos)
 */

import { db } from '../../db';
import { ia_config_historico } from '../../../drizzle';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export interface IAConfigHistoricoFilters {
  id?: number;
  config_id?: number;
  orderBy?: keyof typeof ia_config_historico;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIAConfigHistoricoData {
  config_id: number;
  chave: string;
  valor_anterior: string;
  valor_novo: string;
  alterado_por: string;
}

export async function getIAConfigHistoricos(filters: IAConfigHistoricoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_config_historico.id, filters.id));
  if (filters.config_id) conditions.push(eq(ia_config_historico.config_id, filters.config_id));

  let query = db.select().from(ia_config_historico).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = ia_config_historico[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(ia_config_historico.data_alteracao)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getIAConfigHistoricoById(id: number) {
  const result = await db.select().from(ia_config_historico).where(eq(ia_config_historico.id, id)).limit(1);
  return result[0] || null;
}

export async function createIAConfigHistorico(data: CreateIAConfigHistoricoData) {
  const result = await db.insert(ia_config_historico).values({ ...data, data_alteracao: sql`now()`, created_at: sql`now()` }).returning();
  return result[0];
}

export async function countIAConfigHistoricos(filters: IAConfigHistoricoFilters = {}) {
  const conditions: any[] = [];
  if (filters.config_id) conditions.push(eq(ia_config_historico.config_id, filters.config_id));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_config_historico).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
