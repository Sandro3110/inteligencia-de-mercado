/**
 * DAL para dim_mercado
 * Sincronizado 100% com schema (21 campos)
 */

import { db } from '../../db';
import { dim_mercado } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface MercadoFilters {
  id?: number;
  entidade_id?: number;
  nome?: string;
  categoria?: string;
  segmentacao?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_mercado;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateMercadoData {
  entidade_id: number;
  nome: string;
  categoria?: string;
  segmentacao?: string;
  tamanho_mercado?: string;
  crescimento_anual?: string;
  tendencias?: string;
  principais_players?: string;
  created_by: string;
  sentimento?: string;
  score_atratividade?: number;
  nivel_saturacao?: string;
  oportunidades?: string;
  riscos?: string;
  recomendacao_estrategica?: string;
}

export interface UpdateMercadoData {
  nome?: string;
  categoria?: string;
  segmentacao?: string;
  tamanho_mercado?: string;
  crescimento_anual?: string;
  tendencias?: string;
  principais_players?: string;
  updated_by?: string;
  sentimento?: string;
  score_atratividade?: number;
  nivel_saturacao?: string;
  oportunidades?: string;
  riscos?: string;
  recomendacao_estrategica?: string;
}

export async function getMercados(filters: MercadoFilters = {}) {
  const conditions: any[] = [];

  if (filters.id) conditions.push(eq(dim_mercado.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(dim_mercado.entidade_id, filters.entidade_id));
  if (filters.nome) conditions.push(like(dim_mercado.nome, `%${filters.nome}%`));
  if (filters.categoria) conditions.push(eq(dim_mercado.categoria, filters.categoria));
  if (filters.segmentacao) conditions.push(eq(dim_mercado.segmentacao, filters.segmentacao));
  if (!filters.incluirInativos) conditions.push(isNull(dim_mercado.deleted_at));

  let query = db.select().from(dim_mercado).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_mercado[filters.orderBy];
    if (orderColumn) {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
    }
  } else {
    query = query.orderBy(desc(dim_mercado.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getMercadoById(id: number) {
  const result = await db.select().from(dim_mercado).where(and(eq(dim_mercado.id, id), isNull(dim_mercado.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createMercado(data: CreateMercadoData) {
  const result = await db.insert(dim_mercado).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateMercado(id: number, data: UpdateMercadoData) {
  const result = await db.update(dim_mercado).set({ ...data, updated_at: sql`now()` }).where(eq(dim_mercado.id, id)).returning();
  return result[0] || null;
}

export async function deleteMercado(id: number, deleted_by?: string) {
  const result = await db.update(dim_mercado).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_mercado.id, id)).returning();
  return result[0] || null;
}

export async function countMercados(filters: MercadoFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(dim_mercado.entidade_id, filters.entidade_id));
  if (!filters.incluirInativos) conditions.push(isNull(dim_mercado.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_mercado).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
