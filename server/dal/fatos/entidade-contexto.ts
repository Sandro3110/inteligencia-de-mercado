/**
 * DAL para fato_entidade_contexto
 * Sincronizado 100% com schema (13 campos)
 */

import { db } from '../../db';
import { fato_entidade_contexto } from '../../../drizzle/schema';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';

export interface EntidadeContextoFilters {
  id?: number;
  entidade_id?: number;
  tipo_contexto?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof fato_entidade_contexto;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateEntidadeContextoData {
  entidade_id: number;
  tipo_contexto: string;
  descricao?: string;
  data_registro: Date;
  relevancia?: string;
  fonte?: string;
  created_by: string;
  tags?: string;
  impacto?: string;
}

export interface UpdateEntidadeContextoData {
  tipo_contexto?: string;
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
  if (filters.entidade_id) conditions.push(eq(fato_entidade_contexto.entidade_id, filters.entidade_id));
  if (filters.tipo_contexto) conditions.push(eq(fato_entidade_contexto.tipo_contexto, filters.tipo_contexto));
  if (!filters.incluirInativos) conditions.push(isNull(fato_entidade_contexto.deleted_at));

  let query = db.select().from(fato_entidade_contexto).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = fato_entidade_contexto[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(fato_entidade_contexto.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getEntidadeContextoById(id: number) {
  const result = await db.select().from(fato_entidade_contexto).where(and(eq(fato_entidade_contexto.id, id), isNull(fato_entidade_contexto.deleted_at))).limit(1);
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
  const result = await db.update(fato_entidade_contexto).set({ deleted_at: sql`now()`, deleted_by }).where(eq(fato_entidade_contexto.id, id)).returning();
  return result[0] || null;
}

export async function countEntidadeContextos(filters: EntidadeContextoFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(fato_entidade_contexto.entidade_id, filters.entidade_id));
  if (filters.tipo_contexto) conditions.push(eq(fato_entidade_contexto.tipo_contexto, filters.tipo_contexto));
  if (!filters.incluirInativos) conditions.push(isNull(fato_entidade_contexto.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(fato_entidade_contexto).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
