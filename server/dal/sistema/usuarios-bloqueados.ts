/**
 * DAL para usuarios_bloqueados
 * Sincronizado 100% com schema PostgreSQL (6 campos)
 */

import { db } from '../../db';
import { usuarios_bloqueados } from '../../../drizzle';
import { eq, and, sql } from 'drizzle-orm';

export interface UsuarioBloqueadoFilters {
  id?: number;
  user_id?: string;
}

export interface CreateUsuarioBloqueadoData {
  user_id: string;
  motivo: string;
  bloqueado_ate: Date;
  bloqueado_por?: string;
}

export interface UpdateUsuarioBloqueadoData {
  motivo?: string;
  bloqueado_ate?: Date;
}

export async function getUsuariosBloqueados(filters: UsuarioBloqueadoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(usuarios_bloqueados.id, filters.id));
  if (filters.user_id) conditions.push(eq(usuarios_bloqueados.user_id, filters.user_id));
  return db.select().from(usuarios_bloqueados).where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getUsuarioBloqueadoById(id: number) {
  const result = await db.select().from(usuarios_bloqueados).where(eq(usuarios_bloqueados.id, id)).limit(1);
  return result[0] || null;
}

export async function createUsuarioBloqueado(data: CreateUsuarioBloqueadoData) {
  const result = await db.insert(usuarios_bloqueados).values(data).returning();
  return result[0];
}

export async function updateUsuarioBloqueado(id: number, data: UpdateUsuarioBloqueadoData) {
  const result = await db.update(usuarios_bloqueados).set(data).where(eq(usuarios_bloqueados.id, id)).returning();
  return result[0] || null;
}

export async function getUsuarioBloqueadoByUserId(user_id: string) {
  const result = await db.select().from(usuarios_bloqueados).where(eq(usuarios_bloqueados.user_id, user_id)).limit(1);
  return result[0] || null;
}

export async function desbloquearUsuario(id: number) {
  const result = await db.delete(usuarios_bloqueados).where(eq(usuarios_bloqueados.id, id)).returning();
  return result[0] || null;
}

export async function countUsuariosBloqueados(filters: UsuarioBloqueadoFilters = {}) {
  const conditions: any[] = [];
  if (filters.user_id) conditions.push(eq(usuarios_bloqueados.user_id, filters.user_id));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(usuarios_bloqueados).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
