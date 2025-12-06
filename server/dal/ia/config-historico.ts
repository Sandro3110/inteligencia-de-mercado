/**
 * DAL para ia_config_historico
 * Sincronizado 100% com schema (8 campos)
 */

import { db } from '../../db';
import { ia_config_historico } from '../../../drizzle';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export interface IAConfigHistoricoFilters {
  id?: number;
  orderBy?: keyof typeof ia_config_historico;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIAConfigHistoricoData {
  valor_anterior: string;
  valor_novo: string;
  alterado_por: string;
}

export async function getIAConfigHistoricos(filters: IAConfigHistoricoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_config_historico.id, filters.id));

  let query = db.select().from(ia_config_historico).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = ia_config_historico[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
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
  return result[0];
}

export async function countIAConfigHistoricos(filters: IAConfigHistoricoFilters = {}) {
  const conditions: any[] = [];
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_config_historico).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
