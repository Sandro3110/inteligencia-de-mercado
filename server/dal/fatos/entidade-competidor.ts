/**
 * DAL para fato_entidade_competidor
 * Sincronizado 100% com schema (11 campos)
 */

import { db } from '../../db';
import { fato_entidade_competidor } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';

export interface EntidadeCompetidorFilters {
  id?: number;
  incluirInativos?: boolean;
  orderBy?: keyof typeof fato_entidade_competidor;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateEntidadeCompetidorData {
  data_identificacao: Date;
  nivel_ameaca?: string;
  analise_comparativa?: string;
  created_by: string;
  observacoes?: string;
}

export interface UpdateEntidadeCompetidorData {
  data_identificacao?: Date;
  nivel_ameaca?: string;
  analise_comparativa?: string;
  updated_by?: string;
  observacoes?: string;
}

export async function getEntidadeCompetidores(filters: EntidadeCompetidorFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(fato_entidade_competidor.id, filters.id));

  let query = db.select().from(fato_entidade_competidor).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = fato_entidade_competidor[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(fato_entidade_competidor.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getEntidadeCompetidorById(id: number) {
  return result[0] || null;
}

export async function createEntidadeCompetidor(data: CreateEntidadeCompetidorData) {
  const result = await db.insert(fato_entidade_competidor).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateEntidadeCompetidor(id: number, data: UpdateEntidadeCompetidorData) {
  const result = await db.update(fato_entidade_competidor).set({ ...data, updated_at: sql`now()` }).where(eq(fato_entidade_competidor.id, id)).returning();
  return result[0] || null;
}

export async function deleteEntidadeCompetidor(id: number, deleted_by?: string) {
  return result[0] || null;
}

export async function countEntidadeCompetidores(filters: EntidadeCompetidorFilters = {}) {
  const conditions: any[] = [];
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(fato_entidade_competidor).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
