/**
 * DAL para dim_pesquisa
 * Sincronizado 100% com schema (21 campos)
 */

import { db } from '../../db';
import { dim_pesquisa } from '../../../drizzle/schema';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface PesquisaFilters {
  id?: number;
  entidade_id?: number;
  tipo?: string;
  status?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_pesquisa;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreatePesquisaData {
  entidade_id: number;
  tipo: string;
  descricao?: string;
  data_realizacao?: Date;
  metodologia?: string;
  amostra?: string;
  resultados?: string;
  insights?: string;
  created_by: string;
  fonte?: string;
  confiabilidade?: string;
  status?: string;
  data_validade?: Date;
  custo?: string;
  responsavel?: string;
}

export interface UpdatePesquisaData {
  tipo?: string;
  descricao?: string;
  data_realizacao?: Date;
  metodologia?: string;
  amostra?: string;
  resultados?: string;
  insights?: string;
  updated_by?: string;
  fonte?: string;
  confiabilidade?: string;
  status?: string;
  data_validade?: Date;
  custo?: string;
  responsavel?: string;
}

export async function getPesquisas(filters: PesquisaFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_pesquisa.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(dim_pesquisa.entidade_id, filters.entidade_id));
  if (filters.tipo) conditions.push(eq(dim_pesquisa.tipo, filters.tipo));
  if (filters.status) conditions.push(eq(dim_pesquisa.status, filters.status));
  if (!filters.incluirInativos) conditions.push(isNull(dim_pesquisa.deleted_at));

  let query = db.select().from(dim_pesquisa).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_pesquisa[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(dim_pesquisa.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getPesquisaById(id: number) {
  const result = await db.select().from(dim_pesquisa).where(and(eq(dim_pesquisa.id, id), isNull(dim_pesquisa.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createPesquisa(data: CreatePesquisaData) {
  const result = await db.insert(dim_pesquisa).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updatePesquisa(id: number, data: UpdatePesquisaData) {
  const result = await db.update(dim_pesquisa).set({ ...data, updated_at: sql`now()` }).where(eq(dim_pesquisa.id, id)).returning();
  return result[0] || null;
}

export async function deletePesquisa(id: number, deleted_by?: string) {
  const result = await db.update(dim_pesquisa).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_pesquisa.id, id)).returning();
  return result[0] || null;
}

export async function countPesquisas(filters: PesquisaFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(dim_pesquisa.entidade_id, filters.entidade_id));
  if (!filters.incluirInativos) conditions.push(isNull(dim_pesquisa.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_pesquisa).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
