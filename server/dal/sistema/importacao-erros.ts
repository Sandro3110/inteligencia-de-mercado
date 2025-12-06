/**
 * DAL para importacao_erros
 * Sincronizado 100% com schema (8 campos)
 */

import { db } from '../../db';
import { importacao_erros } from '../../../drizzle/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export interface ImportacaoErroFilters {
  id?: number;
  importacao_id?: number;
  tipo_erro?: string;
  orderBy?: keyof typeof importacao_erros;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateImportacaoErroData {
  importacao_id: number;
  linha?: number;
  coluna?: string;
  tipo_erro?: string;
  mensagem_erro?: string;
  dados_linha?: string;
}

export async function getImportacaoErros(filters: ImportacaoErroFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(importacao_erros.id, filters.id));
  if (filters.importacao_id) conditions.push(eq(importacao_erros.importacao_id, filters.importacao_id));
  if (filters.tipo_erro) conditions.push(eq(importacao_erros.tipo_erro, filters.tipo_erro));

  let query = db.select().from(importacao_erros).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = importacao_erros[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(importacao_erros.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getImportacaoErroById(id: number) {
  const result = await db.select().from(importacao_erros).where(eq(importacao_erros.id, id)).limit(1);
  return result[0] || null;
}

export async function createImportacaoErro(data: CreateImportacaoErroData) {
  const result = await db.insert(importacao_erros).values({ ...data, created_at: sql`now()` }).returning();
  return result[0];
}

export async function countImportacaoErros(filters: ImportacaoErroFilters = {}) {
  const conditions: any[] = [];
  if (filters.importacao_id) conditions.push(eq(importacao_erros.importacao_id, filters.importacao_id));
  if (filters.tipo_erro) conditions.push(eq(importacao_erros.tipo_erro, filters.tipo_erro));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(importacao_erros).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
