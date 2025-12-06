/**
 * DAL para dim_produto_catalogo
 * Sincronizado 100% com schema (14 campos)
 */

import { db } from '../../db';
import { dim_produto_catalogo } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface ProdutoCatalogoFilters {
  id?: number;
  nome?: string;
  categoria?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_produto_catalogo;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateProdutoCatalogoData {
  nome: string;
  descricao?: string;
  categoria?: string;
  subcategoria?: string;
  especificacoes?: string;
  unidade_medida?: string;
  codigo_referencia?: string;
  created_by: string;
  marca?: string;
  fornecedor?: string;
}

export interface UpdateProdutoCatalogoData {
  nome?: string;
  descricao?: string;
  categoria?: string;
  subcategoria?: string;
  especificacoes?: string;
  unidade_medida?: string;
  codigo_referencia?: string;
  updated_by?: string;
  marca?: string;
  fornecedor?: string;
}

export async function getProdutosCatalogo(filters: ProdutoCatalogoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_produto_catalogo.id, filters.id));
  if (filters.nome) conditions.push(like(dim_produto_catalogo.nome, `%${filters.nome}%`));
  if (filters.categoria) conditions.push(eq(dim_produto_catalogo.categoria, filters.categoria));
  if (!filters.incluirInativos) conditions.push(isNull(dim_produto_catalogo.deleted_at));

  let query = db.select().from(dim_produto_catalogo).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in dim_produto_catalogo) {
    const orderColumn = dim_produto_catalogo[filters.orderBy as keyof typeof dim_produto_catalogo];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(asc(dim_produto_catalogo.nome)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getProdutoCatalogoById(id: number) {
  const result = await db.select().from(dim_produto_catalogo).where(and(eq(dim_produto_catalogo.id, id), isNull(dim_produto_catalogo.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createProdutoCatalogo(data: CreateProdutoCatalogoData) {
  const result = await db.insert(dim_produto_catalogo).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateProdutoCatalogo(id: number, data: UpdateProdutoCatalogoData) {
  const result = await db.update(dim_produto_catalogo).set({ ...data, updated_at: sql`now()` }).where(eq(dim_produto_catalogo.id, id)).returning();
  return result[0] || null;
}

export async function deleteProdutoCatalogo(id: number, deleted_by?: string) {
  const result = await db.update(dim_produto_catalogo).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_produto_catalogo.id, id)).returning();
  return result[0] || null;
}

export async function countProdutosCatalogo(filters: ProdutoCatalogoFilters = {}) {
  const conditions: any[] = [];
  if (filters.categoria) conditions.push(eq(dim_produto_catalogo.categoria, filters.categoria));
  if (!filters.incluirInativos) conditions.push(isNull(dim_produto_catalogo.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_produto_catalogo).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
