/**
 * DAL para audit_logs
 * Sincronizado 100% com schema PostgreSQL (13 campos)
 */

import { db } from '../../db';
import { audit_logs } from '../../../drizzle';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';

export interface AuditLogFilters {
  id?: number;
  user_id?: string;
  action?: string;
  endpoint?: string;
  metodo?: string;
  resultado?: string;
  dataInicio?: Date;
  dataFim?: Date;
  orderBy?: keyof typeof audit_logs;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateAuditLogData {
  user_id: string;
  action: string;
  endpoint: string;
  metodo: string;
  parametros?: any;
  resultado?: string;
  erro?: string;
  ip_address?: string;
  user_agent?: string;
  duracao_ms?: number;
  custo?: string;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(audit_logs.id, filters.id));
  if (filters.user_id) conditions.push(eq(audit_logs.user_id, filters.user_id));
  if (filters.action) conditions.push(eq(audit_logs.action, filters.action));
  if (filters.endpoint) conditions.push(eq(audit_logs.endpoint, filters.endpoint));
  if (filters.metodo) conditions.push(eq(audit_logs.metodo, filters.metodo));
  if (filters.resultado) conditions.push(eq(audit_logs.resultado, filters.resultado));
  if (filters.dataInicio) conditions.push(gte(audit_logs.created_at, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(audit_logs.created_at, filters.dataFim));

  let query = db.select().from(audit_logs).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in audit_logs) {
    const orderColumn = audit_logs[filters.orderBy as keyof typeof audit_logs];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(desc(audit_logs.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getAuditLogById(id: number) {
  const result = await db.select().from(audit_logs).where(eq(audit_logs.id, id)).limit(1);
  return result[0] || null;
}

export async function createAuditLog(data: CreateAuditLogData) {
  const result = await db.insert(audit_logs).values(data).returning();
  return result[0];
}

export async function countAuditLogs(filters: AuditLogFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(audit_logs.user_id, filters.user_id));
  if (filters.action) conditions.push(eq(audit_logs.action, filters.action));
  if (filters.dataInicio) conditions.push(gte(audit_logs.created_at, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(audit_logs.created_at, filters.dataFim));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(audit_logs).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
