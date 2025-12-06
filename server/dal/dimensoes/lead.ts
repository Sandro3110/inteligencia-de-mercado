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
  status?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_lead;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateLeadData {
  entidade_id: number;
  nome: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  status?: string;
  score?: number;
  interesses?: string;
  notas?: string;
  created_by: string;
  data_contato?: Date;
  data_conversao?: Date;
  valor_potencial?: string;
  produto_interesse?: string;
  responsavel?: string;
  ultima_interacao?: Date;
  proximo_followup?: Date;
}

export interface UpdateLeadData {
  nome?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  status?: string;
  score?: number;
  interesses?: string;
  notas?: string;
  updated_by?: string;
  data_contato?: Date;
  data_conversao?: Date;
  valor_potencial?: string;
  produto_interesse?: string;
  responsavel?: string;
  ultima_interacao?: Date;
  proximo_followup?: Date;
}

export async function getLeads(filters: LeadFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_lead.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(dim_lead.entidade_id, filters.entidade_id));
  if (filters.nome) conditions.push(like(dim_lead.nome, `%${filters.nome}%`));
  if (filters.status) conditions.push(eq(dim_lead.status, filters.status));

  let query = db.select().from(dim_lead).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in dim_lead) {
    const orderColumn = dim_lead[filters.orderBy as keyof typeof dim_lead];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(desc(dim_lead.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getLeadById(id: number) {
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
  return result[0] || null;
}

export async function countLeads(filters: LeadFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(dim_lead.entidade_id, filters.entidade_id));
  if (filters.status) conditions.push(eq(dim_lead.status, filters.status));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_lead).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
