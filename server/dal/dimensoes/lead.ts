/**
 * DAL para dim_lead
 * Sincronizado 100% com schema (25 campos)
 */

import { db } from '../../db';
import { dim_lead } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface LeadFilters {
  id?: number;
  entidade_id?: number;
  nome?: string;
  email?: string;
  status?: string;
  origem?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_lead;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateLeadData {
  entidade_id: number;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  origem?: string;
  status?: string;
  score?: number;
  interesses?: string;
  notas?: string;
  created_by: string;
  data_contato?: Date;
  data_conversao?: Date;
  valor_potencial?: string;
  produto_interesse?: string;
  campanha_origem?: string;
  responsavel?: string;
  ultima_interacao?: Date;
  proximo_followup?: Date;
}

export interface UpdateLeadData {
  nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  origem?: string;
  status?: string;
  score?: number;
  interesses?: string;
  notas?: string;
  updated_by?: string;
  data_contato?: Date;
  data_conversao?: Date;
  valor_potencial?: string;
  produto_interesse?: string;
  campanha_origem?: string;
  responsavel?: string;
  ultima_interacao?: Date;
  proximo_followup?: Date;
}

export async function getLeads(filters: LeadFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_lead.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(dim_lead.entidade_id, filters.entidade_id));
  if (filters.nome) conditions.push(like(dim_lead.nome, `%${filters.nome}%`));
  if (filters.email) conditions.push(like(dim_lead.email, `%${filters.email}%`));
  if (filters.status) conditions.push(eq(dim_lead.status, filters.status));
  if (filters.origem) conditions.push(eq(dim_lead.origem, filters.origem));
  if (!filters.incluirInativos) conditions.push(isNull(dim_lead.deleted_at));

  let query = db.select().from(dim_lead).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_lead[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(dim_lead.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getLeadById(id: number) {
  const result = await db.select().from(dim_lead).where(and(eq(dim_lead.id, id), isNull(dim_lead.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createLead(data: CreateLeadData) {
  const result = await db.insert(dim_lead).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateLead(id: number, data: UpdateLeadData) {
  const result = await db.update(dim_lead).set({ ...data, updated_at: sql`now()` }).where(eq(dim_lead.id, id)).returning();
  return result[0] || null;
}

export async function deleteLead(id: number, deleted_by?: string) {
  const result = await db.update(dim_lead).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_lead.id, id)).returning();
  return result[0] || null;
}

export async function countLeads(filters: LeadFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(dim_lead.entidade_id, filters.entidade_id));
  if (filters.status) conditions.push(eq(dim_lead.status, filters.status));
  if (!filters.incluirInativos) conditions.push(isNull(dim_lead.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_lead).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
