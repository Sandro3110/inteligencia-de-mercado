/**
 * DAL para dim_status_qualificacao
 * Sincronizado 100% com schema (10 campos)
 */

import { db } from '../../db';
import { dim_status_qualificacao } from '../../../drizzle/schema';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface StatusQualificacaoFilters {
  id?: number;
  nome?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_status_qualificacao;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateStatusQualificacaoData {
  nome: string;
  descricao?: string;
  cor?: string;
  ordem?: number;
  created_by: string;
}

export interface UpdateStatusQualificacaoData {
  nome?: string;
  descricao?: string;
  cor?: string;
  ordem?: number;
  updated_by?: string;
}

export async function getStatusQualificacoes(filters: StatusQualificacaoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_status_qualificacao.id, filters.id));
  if (filters.nome) conditions.push(like(dim_status_qualificacao.nome, `%${filters.nome}%`));
  if (!filters.incluirInativos) conditions.push(isNull(dim_status_qualificacao.deleted_at));

  let query = db.select().from(dim_status_qualificacao).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_status_qualificacao[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(asc(dim_status_qualificacao.ordem)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getStatusQualificacaoById(id: number) {
  const result = await db.select().from(dim_status_qualificacao).where(and(eq(dim_status_qualificacao.id, id), isNull(dim_status_qualificacao.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createStatusQualificacao(data: CreateStatusQualificacaoData) {
  const result = await db.insert(dim_status_qualificacao).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateStatusQualificacao(id: number, data: UpdateStatusQualificacaoData) {
  const result = await db.update(dim_status_qualificacao).set({ ...data, updated_at: sql`now()` }).where(eq(dim_status_qualificacao.id, id)).returning();
  return result[0] || null;
}

export async function deleteStatusQualificacao(id: number, deleted_by?: string) {
  const result = await db.update(dim_status_qualificacao).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_status_qualificacao.id, id)).returning();
  return result[0] || null;
}

export async function countStatusQualificacoes(filters: StatusQualificacaoFilters = {}) {
  const conditions: any[] = [];
  if (!filters.incluirInativos) conditions.push(isNull(dim_status_qualificacao.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_status_qualificacao).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
