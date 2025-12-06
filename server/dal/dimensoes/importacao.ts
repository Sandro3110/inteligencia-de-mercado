/**
 * DAL para dim_importacao
 * Sincronizado 100% com schema (17 campos)
 */

import { db } from '../../db';
import { dim_importacao } from '../../../drizzle/schema';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface ImportacaoFilters {
  id?: number;
  nome_arquivo?: string;
  status?: string;
  tipo?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_importacao;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateImportacaoData {
  nome_arquivo: string;
  tipo: string;
  status: string;
  data_importacao: Date;
  total_registros: number;
  registros_sucesso: number;
  registros_erro: number;
  created_by: string;
  observacoes?: string;
  caminho_arquivo?: string;
  tamanho_arquivo?: number;
  duracao_segundos?: number;
}

export interface UpdateImportacaoData {
  nome_arquivo?: string;
  tipo?: string;
  status?: string;
  data_importacao?: Date;
  total_registros?: number;
  registros_sucesso?: number;
  registros_erro?: number;
  updated_by?: string;
  observacoes?: string;
  caminho_arquivo?: string;
  tamanho_arquivo?: number;
  duracao_segundos?: number;
}

export async function getImportacoes(filters: ImportacaoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_importacao.id, filters.id));
  if (filters.nome_arquivo) conditions.push(like(dim_importacao.nome_arquivo, `%${filters.nome_arquivo}%`));
  if (filters.status) conditions.push(eq(dim_importacao.status, filters.status));
  if (filters.tipo) conditions.push(eq(dim_importacao.tipo, filters.tipo));
  if (!filters.incluirInativos) conditions.push(isNull(dim_importacao.deleted_at));

  let query = db.select().from(dim_importacao).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_importacao[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(dim_importacao.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getImportacaoById(id: number) {
  const result = await db.select().from(dim_importacao).where(and(eq(dim_importacao.id, id), isNull(dim_importacao.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createImportacao(data: CreateImportacaoData) {
  const result = await db.insert(dim_importacao).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateImportacao(id: number, data: UpdateImportacaoData) {
  const result = await db.update(dim_importacao).set({ ...data, updated_at: sql`now()` }).where(eq(dim_importacao.id, id)).returning();
  return result[0] || null;
}

export async function deleteImportacao(id: number, deleted_by?: string) {
  const result = await db.update(dim_importacao).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_importacao.id, id)).returning();
  return result[0] || null;
}

export async function countImportacoes(filters: ImportacaoFilters = {}) {
  const conditions: any[] = [];
  if (filters.status) conditions.push(eq(dim_importacao.status, filters.status));
  if (!filters.incluirInativos) conditions.push(isNull(dim_importacao.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_importacao).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
