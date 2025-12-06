/**
 * DAL para fato_entidade_contexto
 * Sincronizado 100% com schema (13 campos)
 */

import { db } from '../../db';
import { fato_entidade_contexto } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';

export interface EntidadeContextoFilters {
  id?: number;
  incluirInativos?: boolean;
  orderBy?: keyof typeof fato_entidade_contexto;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateEntidadeContextoData {
  descricao?: string;
  data_registro: Date;
  relevancia?: string;
  fonte?: string;
  created_by: string;
  tags?: string;
  impacto?: string;
}

export interface UpdateEntidadeContextoData {
  descricao?: string;
  data_registro?: Date;
  relevancia?: string;
  fonte?: string;
  updated_by?: string;
  tags?: string;
  impacto?: string;
}

export async function getEntidadeContextos(filters: EntidadeContextoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(fato_entidade_contexto.id, filters.id));

  let query = db.select().from(fato_entidade_contexto).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in fato_entidade_contexto) {
    const orderColumn = fato_entidade_contexto[filters.orderBy as keyof typeof fato_entidade_contexto];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(desc(fato_entidade_contexto.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getEntidadeContextoById(id: number) {
  return result[0] || null;
}

export async function createEntidadeContexto(data: CreateEntidadeContextoData) {
  const result = await db.insert(fato_entidade_contexto).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateEntidadeContexto(id: number, data: UpdateEntidadeContextoData) {
  const result = await db.update(fato_entidade_contexto).set({ ...data, updated_at: sql`now()` }).where(eq(fato_entidade_contexto.id, id)).returning();
  return result[0] || null;
}

export async function deleteEntidadeContexto(id: number, deleted_by?: string) {
  return result[0] || null;
}

export async function countEntidadeContextos(filters: EntidadeContextoFilters = {}) {
  const conditions: any[] = [];
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(fato_entidade_contexto).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
