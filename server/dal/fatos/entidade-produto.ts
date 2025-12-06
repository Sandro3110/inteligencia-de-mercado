/**
 * DAL para fato_entidade_produto
 * Sincronizado 100% com schema (11 campos)
 */

import { db } from '../../db';
import { fato_entidade_produto } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';

export interface EntidadeProdutoFilters {
  id?: number;
  entidade_id?: number;
  produto_id?: number;
  incluirInativos?: boolean;
  orderBy?: keyof typeof fato_entidade_produto;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateEntidadeProdutoData {
  entidade_id: number;
  produto_id: number;
  data_associacao: Date;
  quantidade?: number;
  valor_unitario?: string;
  created_by: string;
  observacoes?: string;
}

export interface UpdateEntidadeProdutoData {
  data_associacao?: Date;
  quantidade?: number;
  valor_unitario?: string;
  updated_by?: string;
  observacoes?: string;
}

export async function getEntidadeProdutos(filters: EntidadeProdutoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(fato_entidade_produto.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(fato_entidade_produto.entidade_id, filters.entidade_id));
  if (filters.produto_id) conditions.push(eq(fato_entidade_produto.produto_id, filters.produto_id));
  if (!filters.incluirInativos) conditions.push(isNull(fato_entidade_produto.deleted_at));

  let query = db.select().from(fato_entidade_produto).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = fato_entidade_produto[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(fato_entidade_produto.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getEntidadeProdutoById(id: number) {
  const result = await db.select().from(fato_entidade_produto).where(and(eq(fato_entidade_produto.id, id), isNull(fato_entidade_produto.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createEntidadeProduto(data: CreateEntidadeProdutoData) {
  const result = await db.insert(fato_entidade_produto).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateEntidadeProduto(id: number, data: UpdateEntidadeProdutoData) {
  const result = await db.update(fato_entidade_produto).set({ ...data, updated_at: sql`now()` }).where(eq(fato_entidade_produto.id, id)).returning();
  return result[0] || null;
}

export async function deleteEntidadeProduto(id: number, deleted_by?: string) {
  const result = await db.update(fato_entidade_produto).set({ deleted_at: sql`now()`, deleted_by }).where(eq(fato_entidade_produto.id, id)).returning();
  return result[0] || null;
}

export async function countEntidadeProdutos(filters: EntidadeProdutoFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(fato_entidade_produto.entidade_id, filters.entidade_id));
  if (filters.produto_id) conditions.push(eq(fato_entidade_produto.produto_id, filters.produto_id));
  if (!filters.incluirInativos) conditions.push(isNull(fato_entidade_produto.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(fato_entidade_produto).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
