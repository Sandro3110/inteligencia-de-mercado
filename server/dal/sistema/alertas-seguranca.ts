/**
 * DAL para alertas_seguranca
 * Sincronizado 100% com schema (11 campos)
 */

import { db } from '../../db';
import { alertas_seguranca } from '../../../drizzle/schema';
import { eq, and, desc, asc, sql, like } from 'drizzle-orm';

export interface AlertaSegurancaFilters {
  id?: number;
  user_id?: string;
  tipo?: string;
  severidade?: string;
  resolvido?: boolean;
  orderBy?: keyof typeof alertas_seguranca;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateAlertaSegurancaData {
  user_id?: string;
  tipo: string;
  descricao?: string;
  ip_origem?: string;
  severidade?: string;
  resolvido?: boolean;
  data_resolucao?: Date;
}

export interface UpdateAlertaSegurancaData {
  tipo?: string;
  descricao?: string;
  ip_origem?: string;
  severidade?: string;
  resolvido?: boolean;
  data_resolucao?: Date;
}

export async function getAlertasSeguranca(filters: AlertaSegurancaFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(alertas_seguranca.id, filters.id));
  if (filters.user_id) conditions.push(eq(alertas_seguranca.user_id, filters.user_id));
  if (filters.tipo) conditions.push(eq(alertas_seguranca.tipo, filters.tipo));
  if (filters.severidade) conditions.push(eq(alertas_seguranca.severidade, filters.severidade));
  if (filters.resolvido !== undefined) conditions.push(eq(alertas_seguranca.resolvido, filters.resolvido));

  let query = db.select().from(alertas_seguranca).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = alertas_seguranca[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(alertas_seguranca.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getAlertaSegurancaById(id: number) {
  const result = await db.select().from(alertas_seguranca).where(eq(alertas_seguranca.id, id)).limit(1);
  return result[0] || null;
}

export async function createAlertaSeguranca(data: CreateAlertaSegurancaData) {
  const result = await db.insert(alertas_seguranca).values({ ...data, created_at: sql`now()` }).returning();
  return result[0];
}

export async function updateAlertaSeguranca(id: number, data: UpdateAlertaSegurancaData) {
  const result = await db.update(alertas_seguranca).set(data).where(eq(alertas_seguranca.id, id)).returning();
  return result[0] || null;
}

export async function resolverAlertaSeguranca(id: number) {
  const result = await db.update(alertas_seguranca).set({ resolvido: true, data_resolucao: sql`now()` }).where(eq(alertas_seguranca.id, id)).returning();
  return result[0] || null;
}

export async function countAlertasSeguranca(filters: AlertaSegurancaFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(alertas_seguranca.user_id, filters.user_id));
  if (filters.tipo) conditions.push(eq(alertas_seguranca.tipo, filters.tipo));
  if (filters.resolvido !== undefined) conditions.push(eq(alertas_seguranca.resolvido, filters.resolvido));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(alertas_seguranca).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
