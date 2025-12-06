/**
 * DAL para users
 * Sincronizado 100% com schema (11 campos)
 */

import { db } from '../../db';
import { users } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface UserFilters {
  id?: string;
  email?: string;
  role?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof users;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateUserData {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  role?: string;
  created_by?: string;
}

export interface UpdateUserData {
  email?: string;
  password_hash?: string;
  name?: string;
  role?: string;
  last_login?: Date;
  updated_by?: string;
}

export async function getUsers(filters: UserFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(users.id, filters.id));
  if (filters.email) conditions.push(like(users.email, `%${filters.email}%`));
  if (filters.role) conditions.push(eq(users.role, filters.role));
  if (!filters.incluirInativos) conditions.push(isNull(users.deleted_at));

  let query = db.select().from(users).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = users[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(users.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deleted_at))).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(and(eq(users.email, email), isNull(users.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createUser(data: CreateUserData) {
  const result = await db.insert(users).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateUser(id: string, data: UpdateUserData) {
  const result = await db.update(users).set({ ...data, updated_at: sql`now()` }).where(eq(users.id, id)).returning();
  return result[0] || null;
}

export async function deleteUser(id: string, deleted_by?: string) {
  const result = await db.update(users).set({ deleted_at: sql`now()`, deleted_by }).where(eq(users.id, id)).returning();
  return result[0] || null;
}

export async function countUsers(filters: UserFilters = {}) {
  const conditions: any[] = [];
  if (filters.role) conditions.push(eq(users.role, filters.role));
  if (!filters.incluirInativos) conditions.push(isNull(users.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
