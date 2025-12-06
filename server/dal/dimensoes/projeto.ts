/**
 * DAL para dim_projeto
 * Sincronizado 100% com schema (19 campos)
 */

import { db } from '../../db';
import { dim_projeto } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface ProjetoFilters {
  id?: number;
  entidade_id?: number;
  nome?: string;
  status?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_projeto;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateProjetoData {
  entidade_id: number;
  nome: string;
  descricao?: string;
  status?: string;
  data_inicio?: Date;
  data_fim?: Date;
  orcamento?: string;
  equipe?: string;
  objetivos?: string;
  resultados_esperados?: string;
  created_by: string;
  prioridade?: string;
  progresso_percentual?: number;
}

export interface UpdateProjetoData {
  nome?: string;
  descricao?: string;
  status?: string;
  data_inicio?: Date;
  data_fim?: Date;
  orcamento?: string;
  equipe?: string;
  objetivos?: string;
  resultados_esperados?: string;
  updated_by?: string;
  prioridade?: string;
  progresso_percentual?: number;
}

export async function getProjetos(filters: ProjetoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_projeto.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(dim_projeto.entidade_id, filters.entidade_id));
  if (filters.nome) conditions.push(like(dim_projeto.nome, `%${filters.nome}%`));
  if (filters.status) conditions.push(eq(dim_projeto.status, filters.status));
  if (!filters.incluirInativos) conditions.push(isNull(dim_projeto.deleted_at));

  let query = db.select().from(dim_projeto).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_projeto[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(dim_projeto.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getProjetoById(id: number) {
  const result = await db.select().from(dim_projeto).where(and(eq(dim_projeto.id, id), isNull(dim_projeto.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createProjeto(data: CreateProjetoData) {
  const result = await db.insert(dim_projeto).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateProjeto(id: number, data: UpdateProjetoData) {
  const result = await db.update(dim_projeto).set({ ...data, updated_at: sql`now()` }).where(eq(dim_projeto.id, id)).returning();
  return result[0] || null;
}

export async function deleteProjeto(id: number, deleted_by?: string) {
  const result = await db.update(dim_projeto).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_projeto.id, id)).returning();
  return result[0] || null;
}

export async function countProjetos(filters: ProjetoFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(dim_projeto.entidade_id, filters.entidade_id));
  if (!filters.incluirInativos) conditions.push(isNull(dim_projeto.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_projeto).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
