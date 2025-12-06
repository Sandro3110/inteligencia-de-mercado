/**
 * DAL para dim_produto
 * Sincronizado 100% com schema (22 campos)
 */

import { db } from '../../db';
import { dim_produto } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface ProdutoFilters {
  id?: number;
  nome?: string;
  categoria?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_produto;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateProdutoData {
  entidade_id: number;
  nome: string;
  categoria?: string;
  descricao?: string;
  preco?: string;
  moeda?: string;
  disponibilidade?: string;
  especificacoes_tecnicas?: string;
  diferenciais_competitivos?: string;
  created_by: string;
  publico_alvo?: string;
  canais_distribuicao?: string;
  data_lancamento?: Date;
  ciclo_vida?: string;
  margem_lucro?: string;
}

export interface UpdateProdutoData {
  nome?: string;
  categoria?: string;
  descricao?: string;
  preco?: string;
  moeda?: string;
  disponibilidade?: string;
  especificacoes_tecnicas?: string;
  diferenciais_competitivos?: string;
  updated_by?: string;
  publico_alvo?: string;
  canais_distribuicao?: string;
  data_lancamento?: Date;
  ciclo_vida?: string;
  margem_lucro?: string;
}

export async function getProdutos(filters: ProdutoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_produto.id, filters.id));
  if (filters.nome) conditions.push(like(dim_produto.nome, `%${filters.nome}%`));
  if (filters.categoria) conditions.push(eq(dim_produto.categoria, filters.categoria));
  if (!filters.incluirInativos) conditions.push(isNull(dim_produto.deleted_at));

  let query = db.select().from(dim_produto).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in dim_produto) {
    const orderColumn = dim_produto[filters.orderBy as keyof typeof dim_produto];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(desc(dim_produto.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getProdutoById(id: number) {
  const result = await db.select().from(dim_produto).where(and(eq(dim_produto.id, id), isNull(dim_produto.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createProduto(data: CreateProdutoData) {
  const result = await db.insert(dim_produto).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateProduto(id: number, data: UpdateProdutoData) {
  const result = await db.update(dim_produto).set({ ...data, updated_at: sql`now()` }).where(eq(dim_produto.id, id)).returning();
  return result[0] || null;
}

export async function deleteProduto(id: number, deleted_by?: string) {
  const result = await db.update(dim_produto).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_produto.id, id)).returning();
  return result[0] || null;
}

export async function countProdutos(filters: ProdutoFilters = {}) {
  const conditions: any[] = [];
  if (!filters.incluirInativos) conditions.push(isNull(dim_produto.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_produto).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
