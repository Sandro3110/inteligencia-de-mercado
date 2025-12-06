/**
 * DAL para ia_alertas
 * Sincronizado 100% com schema (14 campos)
 */

import { db } from '../../db';
import { ia_alertas } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface IAAlertaFilters {
  id?: number;
  tipo?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof ia_alertas;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIAAlertaData {
  tipo: string;
  titulo: string;
  descricao?: string;
  status: string;
  entidade_relacionada?: number;
  data_deteccao: Date;
  created_by: string;
  acao_recomendada?: string;
  data_resolucao?: Date;
}

export interface UpdateIAAlertaData {
  tipo?: string;
  titulo?: string;
  descricao?: string;
  entidade_relacionada?: number;
  data_deteccao?: Date;
  updated_by?: string;
  acao_recomendada?: string;
  data_resolucao?: Date;
}

export async function getIAAlertas(filters: IAAlertaFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_alertas.id, filters.id));
  if (filters.tipo) conditions.push(eq(ia_alertas.tipo, filters.tipo));
  if (filters.status) conditions.push(eq(ia_alertas.status, filters.status));

  let query = db.select().from(ia_alertas).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = ia_alertas[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(ia_alertas.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getIAAlertaById(id: number) {
  return result[0] || null;
}

export async function createIAAlerta(data: CreateIAAlertaData) {
  const result = await db.insert(ia_alertas).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateIAAlerta(id: number, data: UpdateIAAlertaData) {
  const result = await db.update(ia_alertas).set({ ...data, updated_at: sql`now()` }).where(eq(ia_alertas.id, id)).returning();
  return result[0] || null;
}

export async function deleteIAAlerta(id: number, deleted_by?: string) {
  return result[0] || null;
}

export async function countIAAlertas(filters: IAAlertaFilters = {}) {
  const conditions: any[] = [];
  if (filters.tipo) conditions.push(eq(ia_alertas.tipo, filters.tipo));
  if (filters.status) conditions.push(eq(ia_alertas.status, filters.status));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_alertas).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
