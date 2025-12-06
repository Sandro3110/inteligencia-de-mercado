/**
 * DAL para roles
 * Sincronizado 100% com schema (9 campos)
 */

import { db } from '../../db';
import { roles } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface RoleFilters {
  id?: number;
  nome?: string;
  orderBy?: keyof typeof roles;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateRoleData {
  nome: string;
  descricao?: string;
  permissoes?: string;
  nivel_acesso?: number;
  created_by?: string;
}

export interface UpdateRoleData {
  nome?: string;
  descricao?: string;
  permissoes?: string;
  nivel_acesso?: number;
  updated_by?: string;
}

export async function getRoles(filters: RoleFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(roles.id, filters.id));
  if (filters.nome) conditions.push(like(roles.nome, `%${filters.nome}%`));

  let query = db.select().from(roles).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = roles[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(asc(roles.nome)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getRoleById(id: number) {
  return result[0] || null;
}

export async function getRoleByNome(nome: string) {
  return result[0] || null;
}

export async function createRole(data: CreateRoleData) {
  const result = await db.insert(roles).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateRole(id: number, data: UpdateRoleData) {
  const result = await db.update(roles).set({ ...data, updated_at: sql`now()` }).where(eq(roles.id, id)).returning();
  return result[0] || null;
}

export async function deleteRole(id: number, deleted_by?: string) {
  return result[0] || null;
}

export async function countRoles(filters: RoleFilters = {}) {
  const conditions: any[] = [];
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(roles).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
