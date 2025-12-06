/**
 * DAL para usuarios_bloqueados
 * Sincronizado 100% com schema (8 campos)
 */

import { db } from '../../db';
import { usuarios_bloqueados } from '../../../drizzle/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export interface UsuarioBloqueadoFilters {
  id?: number;
  user_id?: string;
  ativo?: boolean;
  orderBy?: keyof typeof usuarios_bloqueados;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateUsuarioBloqueadoData {
  user_id: string;
  motivo?: string;
  data_bloqueio: Date;
  data_desbloqueio?: Date;
  ativo?: boolean;
}

export interface UpdateUsuarioBloqueadoData {
  motivo?: string;
  data_bloqueio?: Date;
  data_desbloqueio?: Date;
  ativo?: boolean;
}

export async function getUsuariosBloqueados(filters: UsuarioBloqueadoFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(usuarios_bloqueados.id, filters.id));
  if (filters.user_id) conditions.push(eq(usuarios_bloqueados.user_id, filters.user_id));
  if (filters.ativo !== undefined) conditions.push(eq(usuarios_bloqueados.ativo, filters.ativo));

  let query = db.select().from(usuarios_bloqueados).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = usuarios_bloqueados[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(usuarios_bloqueados.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getUsuarioBloqueadoById(id: number) {
  const result = await db.select().from(usuarios_bloqueados).where(eq(usuarios_bloqueados.id, id)).limit(1);
  return result[0] || null;
}

export async function getUsuarioBloqueadoByUserId(user_id: string) {
  const result = await db.select().from(usuarios_bloqueados).where(and(eq(usuarios_bloqueados.user_id, user_id), eq(usuarios_bloqueados.ativo, true))).limit(1);
  return result[0] || null;
}

export async function createUsuarioBloqueado(data: CreateUsuarioBloqueadoData) {
  const result = await db.insert(usuarios_bloqueados).values({ ...data, created_at: sql`now()` }).returning();
  return result[0];
}

export async function updateUsuarioBloqueado(id: number, data: UpdateUsuarioBloqueadoData) {
  const result = await db.update(usuarios_bloqueados).set(data).where(eq(usuarios_bloqueados.id, id)).returning();
  return result[0] || null;
}

export async function desbloquearUsuario(id: number) {
  const result = await db.update(usuarios_bloqueados).set({ ativo: false, data_desbloqueio: sql`now()` }).where(eq(usuarios_bloqueados.id, id)).returning();
  return result[0] || null;
}

export async function countUsuariosBloqueados(filters: UsuarioBloqueadoFilters = {}) {
  const conditions: any[] = [];
  if (filters.ativo !== undefined) conditions.push(eq(usuarios_bloqueados.ativo, filters.ativo));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(usuarios_bloqueados).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
