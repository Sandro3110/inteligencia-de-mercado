/**
 * DAL para dim_canal
 * Sincronizado 100% com schema (17 campos)
 */

import { db } from '../../db';
import { dim_canal } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface CanalFilters {
  id?: number;
  nome?: string;
  tipo?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_canal;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateCanalData {
  entidade_id: number;
  nome: string;
  tipo?: string;
  descricao?: string;
  url?: string;
  alcance?: string;
  engajamento?: string;
  custo?: string;
  efetividade?: string;
  created_by: string;
  status?: string;
  metricas?: string;
}

export interface UpdateCanalData {
  nome?: string;
  tipo?: string;
  descricao?: string;
  url?: string;
  alcance?: string;
  engajamento?: string;
  custo?: string;
  efetividade?: string;
  updated_by?: string;
  status?: string;
  metricas?: string;
}

export async function getCanais(filters: CanalFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_canal.id, filters.id));
  if (filters.nome) conditions.push(like(dim_canal.nome, `%${filters.nome}%`));
  if (filters.tipo) conditions.push(eq(dim_canal.tipo, filters.tipo));
  if (!filters.incluirInativos) conditions.push(isNull(dim_canal.deleted_at));

  let query = db.select().from(dim_canal).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_canal[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(dim_canal.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getCanalById(id: number) {
  const result = await db.select().from(dim_canal).where(and(eq(dim_canal.id, id), isNull(dim_canal.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createCanal(data: CreateCanalData) {
  const result = await db.insert(dim_canal).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateCanal(id: number, data: UpdateCanalData) {
  const result = await db.update(dim_canal).set({ ...data, updated_at: sql`now()` }).where(eq(dim_canal.id, id)).returning();
  return result[0] || null;
}

export async function deleteCanal(id: number, deleted_by?: string) {
  const result = await db.update(dim_canal).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_canal.id, id)).returning();
  return result[0] || null;
}

export async function countCanais(filters: CanalFilters = {}) {
  const conditions: any[] = [];
  if (!filters.incluirInativos) conditions.push(isNull(dim_canal.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_canal).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
