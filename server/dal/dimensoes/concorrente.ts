/**
 * DAL para dim_concorrente
 * Sincronizado 100% com schema (26 campos)
 */

import { db } from '../../db';
import { dim_concorrente } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface ConcorrenteFilters {
  id?: number;
  entidade_id?: number;
  nome?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_concorrente;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateConcorrenteData {
  entidade_id: number;
  nome: string;
  descricao?: string;
  site?: string;
  produtos_servicos?: string;
  pontos_fortes?: string;
  pontos_fracos?: string;
  participacao_mercado?: string;
  estrategia_principal?: string;
  created_by: string;
  faturamento_estimado?: string;
  numero_funcionarios?: number;
  localizacao_principal?: string;
  canais_venda?: string;
  diferenciais?: string;
  ameacas?: string;
  nivel_ameaca?: string;
  posicionamento?: string;
  publico_alvo?: string;
  estrategia_preco?: string;
}

export interface UpdateConcorrenteData {
  nome?: string;
  descricao?: string;
  site?: string;
  produtos_servicos?: string;
  pontos_fortes?: string;
  pontos_fracos?: string;
  participacao_mercado?: string;
  estrategia_principal?: string;
  updated_by?: string;
  faturamento_estimado?: string;
  numero_funcionarios?: number;
  localizacao_principal?: string;
  canais_venda?: string;
  diferenciais?: string;
  ameacas?: string;
  nivel_ameaca?: string;
  posicionamento?: string;
  publico_alvo?: string;
  estrategia_preco?: string;
}

export async function getConcorrentes(filters: ConcorrenteFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_concorrente.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(dim_concorrente.entidade_id, filters.entidade_id));
  if (filters.nome) conditions.push(like(dim_concorrente.nome, `%${filters.nome}%`));

  let query = db.select().from(dim_concorrente).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in dim_concorrente) {
    const orderColumn = dim_concorrente[filters.orderBy as keyof typeof dim_concorrente];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(desc(dim_concorrente.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getConcorrenteById(id: number) {
  return result[0] || null;
}

export async function createConcorrente(data: CreateConcorrenteData) {
  const result = await db.insert(dim_concorrente).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateConcorrente(id: number, data: UpdateConcorrenteData) {
  const result = await db.update(dim_concorrente).set({ ...data, updated_at: sql`now()` }).where(eq(dim_concorrente.id, id)).returning();
  return result[0] || null;
}

export async function deleteConcorrente(id: number, deleted_by?: string) {
  return result[0] || null;
}

export async function countConcorrentes(filters: ConcorrenteFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(dim_concorrente.entidade_id, filters.entidade_id));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_concorrente).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
