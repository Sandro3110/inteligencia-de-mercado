/**
 * DAL para dim_tempo
 * Sincronizado 100% com schema (16 campos)
 */

import { db } from '../../db';
import { dim_tempo } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, gte, lte } from 'drizzle-orm';

export interface TempoFilters {
  id?: number;
  data?: Date;
  ano?: number;
  mes?: number;
  trimestre?: number;
  dia_semana?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_tempo;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface CreateTempoData {
  data: Date;
  ano: number;
  mes: number;
  dia: number;
  trimestre: number;
  semestre: number;
  dia_semana: string;
  semana_ano: number;
  dia_ano: number;
  created_by: string;
  nome_mes?: string;
  eh_feriado?: boolean;
  eh_fim_semana?: boolean;
}

export interface UpdateTempoData {
  data?: Date;
  ano?: number;
  mes?: number;
  dia?: number;
  trimestre?: number;
  dia_semana?: string;
  semana_ano?: number;
  dia_ano?: number;
  updated_by?: string;
  nome_mes?: string;
  eh_feriado?: boolean;
  eh_fim_semana?: boolean;
}

export async function getTempos(filters: TempoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_tempo.id, filters.id));
  if (filters.data) conditions.push(eq(dim_tempo.data, filters.data));
  if (filters.ano) conditions.push(eq(dim_tempo.ano, filters.ano));
  if (filters.mes) conditions.push(eq(dim_tempo.mes, filters.mes));
  if (filters.trimestre) conditions.push(eq(dim_tempo.trimestre, filters.trimestre));
  if (filters.dia_semana) conditions.push(eq(dim_tempo.dia_semana, filters.dia_semana));
  if (filters.dataInicio) conditions.push(gte(dim_tempo.data, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(dim_tempo.data, filters.dataFim));

  let query = db.select().from(dim_tempo).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in dim_tempo) {
    const orderColumn = dim_tempo[filters.orderBy as keyof typeof dim_tempo];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(desc(dim_tempo.data)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getTempoById(id: number) {
  return result[0] || null;
}

export async function createTempo(data: CreateTempoData) {
  const result = await db.insert(dim_tempo).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateTempo(id: number, data: UpdateTempoData) {
  const result = await db.update(dim_tempo).set({ ...data, updated_at: sql`now()` }).where(eq(dim_tempo.id, id)).returning();
  return result[0] || null;
}

export async function deleteTempo(id: number, deleted_by?: string) {
  return result[0] || null;
}

export async function countTempos(filters: TempoFilters = {}) {
  const conditions: any[] = [];
  if (filters.ano) conditions.push(eq(dim_tempo.ano, filters.ano));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_tempo).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
