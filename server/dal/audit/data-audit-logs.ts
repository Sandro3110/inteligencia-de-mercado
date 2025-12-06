/**
 * DAL para data_audit_logs
 * Sincronizado 100% com schema PostgreSQL (11 campos)
 */

import { db } from '../../db';
import { data_audit_logs } from '../../../drizzle';
import { eq, and, desc, asc, sql, gte, lte } from 'drizzle-orm';

export interface DataAuditLogFilters {
  id?: number;
  tabela?: string;
  operacao?: string;
  registro_id?: number;
  usuario_id?: string;
  dataInicio?: Date;
  dataFim?: Date;
  orderBy?: keyof typeof data_audit_logs;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateDataAuditLogData {
  tabela: string;
  operacao: string;
  registro_id: number;
  dados_anteriores?: any;
  dados_novos?: any;
  campos_alterados?: string;
  usuario_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export async function getDataAuditLogs(filters: DataAuditLogFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(data_audit_logs.id, filters.id));
  if (filters.tabela) conditions.push(eq(data_audit_logs.tabela, filters.tabela));
  if (filters.operacao) conditions.push(eq(data_audit_logs.operacao, filters.operacao));
  if (filters.registro_id) conditions.push(eq(data_audit_logs.registro_id, filters.registro_id));
  if (filters.usuario_id) conditions.push(eq(data_audit_logs.usuario_id, filters.usuario_id));
  if (filters.dataInicio) conditions.push(gte(data_audit_logs.created_at, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(data_audit_logs.created_at, filters.dataFim));

  let query = db.select().from(data_audit_logs).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = data_audit_logs[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(data_audit_logs.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getDataAuditLogById(id: number) {
  const result = await db.select().from(data_audit_logs).where(eq(data_audit_logs.id, id)).limit(1);
  return result[0] || null;
}

export async function createDataAuditLog(data: CreateDataAuditLogData) {
  const result = await db.insert(data_audit_logs).values(data).returning();
  return result[0];
}

export async function countDataAuditLogs(filters: DataAuditLogFilters = {}) {
  const conditions: any[] = [];
  if (filters.tabela) conditions.push(eq(data_audit_logs.tabela, filters.tabela));
  if (filters.operacao) conditions.push(eq(data_audit_logs.operacao, filters.operacao));
  if (filters.usuario_id) conditions.push(eq(data_audit_logs.usuario_id, filters.usuario_id));
  if (filters.dataInicio) conditions.push(gte(data_audit_logs.created_at, filters.dataInicio));
  if (filters.dataFim) conditions.push(lte(data_audit_logs.created_at, filters.dataFim));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(data_audit_logs).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
