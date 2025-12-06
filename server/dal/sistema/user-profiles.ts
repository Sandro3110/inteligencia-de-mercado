/**
 * DAL para user_profiles
 * Sincronizado 100% com schema PostgreSQL (8 campos)
 */

import { db } from '../../db';
import { user_profiles } from '../../../drizzle';
import { eq, and, sql } from 'drizzle-orm';

export interface UserProfileFilters {
  id?: string;
  email?: string;
  ativo?: boolean;
}

export interface CreateUserProfileData {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  role_id?: number;
  ativo?: boolean;
}

export interface UpdateUserProfileData {
  nome?: string;
  email?: string;
  senha_hash?: string;
  role_id?: number;
  ativo?: boolean;
  ultimo_acesso?: Date;
}

export async function getUserProfiles(filters: UserProfileFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(user_profiles.id, filters.id));
  if (filters.email) conditions.push(eq(user_profiles.email, filters.email));
  if (filters.ativo !== undefined) conditions.push(eq(user_profiles.ativo, filters.ativo));
  return db.select().from(user_profiles).where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getUserProfileById(id: string) {
  const result = await db.select().from(user_profiles).where(eq(user_profiles.id, id)).limit(1);
  return result[0] || null;
}

export async function createUserProfile(data: CreateUserProfileData) {
  const result = await db.insert(user_profiles).values(data).returning();
  return result[0];
}

export async function updateUserProfile(id: string, data: UpdateUserProfileData) {
  const result = await db.update(user_profiles).set(data).where(eq(user_profiles.id, id)).returning();
  return result[0] || null;
}
