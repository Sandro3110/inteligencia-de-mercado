/**
 * DAL para user_profiles
 * Sincronizado 100% com schema (11 campos)
 */

import { db } from '../../db';
import { user_profiles } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';

export interface UserProfileFilters {
  id?: number;
  user_id?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof user_profiles;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateUserProfileData {
  user_id: string;
  avatar_url?: string;
  bio?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  created_by?: string;
}

export interface UpdateUserProfileData {
  avatar_url?: string;
  bio?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  updated_by?: string;
}

export async function getUserProfiles(filters: UserProfileFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(user_profiles.id, filters.id));
  if (filters.user_id) conditions.push(eq(user_profiles.user_id, filters.user_id));
  if (!filters.incluirInativos) conditions.push(isNull(user_profiles.deleted_at));

  let query = db.select().from(user_profiles).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = user_profiles[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(user_profiles.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getUserProfileById(id: number) {
  const result = await db.select().from(user_profiles).where(and(eq(user_profiles.id, id), isNull(user_profiles.deleted_at))).limit(1);
  return result[0] || null;
}

export async function getUserProfileByUserId(user_id: string) {
  const result = await db.select().from(user_profiles).where(and(eq(user_profiles.user_id, user_id), isNull(user_profiles.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createUserProfile(data: CreateUserProfileData) {
  const result = await db.insert(user_profiles).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateUserProfile(id: number, data: UpdateUserProfileData) {
  const result = await db.update(user_profiles).set({ ...data, updated_at: sql`now()` }).where(eq(user_profiles.id, id)).returning();
  return result[0] || null;
}

export async function deleteUserProfile(id: number, deleted_by?: string) {
  const result = await db.update(user_profiles).set({ deleted_at: sql`now()`, deleted_by }).where(eq(user_profiles.id, id)).returning();
  return result[0] || null;
}

export async function countUserProfiles(filters: UserProfileFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(user_profiles.user_id, filters.user_id));
  if (!filters.incluirInativos) conditions.push(isNull(user_profiles.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(user_profiles).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
