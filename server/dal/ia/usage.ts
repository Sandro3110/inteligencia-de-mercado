/**
 * DAL para ia_usage
 * Sincronizado 100% com schema (12 campos)
 */

import { db } from '../../db';
import { ia_usage } from '../../../drizzle';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';

export interface IAUsageFilters {
  id?: number;
  user_id?: string;
  operacao?: string;
  modelo?: string;
  dataInicio?: Date;
  dataFim?: Date;
  orderBy?: keyof typeof ia_usage;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateIAUsageData {
  user_id: string;
  operacao: string;
  modelo?: string;
  tokens_entrada?: number;
  tokens_saida?: number;
  custo_estimado?: string;
  duracao_ms?: number;
  sucesso?: boolean;
  erro?: string;
}

export async function getIAUsages(filters: IAUsageFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(ia_usage.id, filters.id));
  if (filters.user_id) conditions.push(eq(ia_usage.user_id, filters.user_id));
  if (filters.operacao) conditions.push(eq(ia_usage.operacao, filters.operacao));
  if (filters.modelo) conditions.push(eq(ia_usage.modelo, filters.modelo));
  if (filters.dataInicio) conditions.push(gte(ia_usage.timestamp, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(ia_usage.timestamp, filters.dataFim));

  let query = db.select().from(ia_usage).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = ia_usage[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(ia_usage.timestamp)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getIAUsageById(id: number) {
  const result = await db.select().from(ia_usage).where(eq(ia_usage.id, id)).limit(1);
  return result[0] || null;
}

export async function createIAUsage(data: CreateIAUsageData) {
  const result = await db.insert(ia_usage).values({ ...data, timestamp: sql`now()`, created_at: sql`now()` }).returning();
  return result[0];
}

export async function countIAUsages(filters: IAUsageFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(ia_usage.user_id, filters.user_id));
  if (filters.operacao) conditions.push(eq(ia_usage.operacao, filters.operacao));
  if (filters.dataInicio) conditions.push(gte(ia_usage.timestamp, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(ia_usage.timestamp, filters.dataFim));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(ia_usage).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}

export async function sumTokensIAUsage(filters: IAUsageFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(ia_usage.user_id, filters.user_id));
  if (filters.dataInicio) conditions.push(gte(ia_usage.timestamp, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(ia_usage.timestamp, filters.dataFim));
  
  const result = await db.select({
    total_entrada: sql<number>`COALESCE(SUM(${ia_usage.tokens_entrada}), 0)::int`,
    total_saida: sql<number>`COALESCE(SUM(${ia_usage.tokens_saida}), 0)::int`,
  }).from(ia_usage).where(conditions.length > 0 ? and(...conditions) : undefined);
  
  return result[0] || { total_entrada: 0, total_saida: 0 };
}
