/**
 * DAL para audit_logs
 * Sincronizado 100% com schema (10 campos)
 */

import { db } from '../../db';
import { audit_logs } from '../../../drizzle';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';

export interface AuditLogFilters {
  id?: number;
  user_id?: string;
  tabela?: string;
  operacao?: string;
  dataInicio?: Date;
  dataFim?: Date;
  orderBy?: keyof typeof audit_logs;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateAuditLogData {
  user_id?: string;
  tabela: string;
  operacao: string;
  registro_id?: number;
  dados_anteriores?: string;
  dados_novos?: string;
  ip_origem?: string;
  user_agent?: string;
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(audit_logs.id, filters.id));
  if (filters.user_id) conditions.push(eq(audit_logs.user_id, filters.user_id));
  if (filters.tabela) conditions.push(eq(audit_logs.tabela, filters.tabela));
  if (filters.operacao) conditions.push(eq(audit_logs.operacao, filters.operacao));
  if (filters.dataInicio) conditions.push(gte(audit_logs.timestamp, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(audit_logs.timestamp, filters.dataFim));

  let query = db.select().from(audit_logs).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = audit_logs[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(audit_logs.timestamp)) as any;
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
  const result = await db.insert(audit_logs).values({ ...data, timestamp: sql`now()` }).returning();
  return result[0];
}

export async function countAuditLogs(filters: AuditLogFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(audit_logs.user_id, filters.user_id));
  if (filters.tabela) conditions.push(eq(audit_logs.tabela, filters.tabela));
  if (filters.operacao) conditions.push(eq(audit_logs.operacao, filters.operacao));
  if (filters.dataInicio) conditions.push(gte(audit_logs.timestamp, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(audit_logs.timestamp, filters.dataFim));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(audit_logs).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
