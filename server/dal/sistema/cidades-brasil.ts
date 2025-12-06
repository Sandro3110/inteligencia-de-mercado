/**
 * DAL para cidades_brasil
 * Sincronizado 100% com schema (9 campos)
 */

import { db } from '../../db';
import { cidades_brasil } from '../../../drizzle';
import { eq, and, desc, asc, sql, like } from 'drizzle-orm';

export interface CidadeBrasilFilters {
  id?: number;
  nome?: string;
  uf?: string;
  codigo_ibge?: string;
  orderBy?: keyof typeof cidades_brasil;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateCidadeBrasilData {
  nome: string;
  uf: string;
  codigo_ibge?: string;
  latitude?: string;
  longitude?: string;
  populacao?: number;
  regiao?: string;
}

export async function getCidadesBrasil(filters: CidadeBrasilFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(cidades_brasil.id, filters.id));
  if (filters.nome) conditions.push(like(cidades_brasil.nome, `%${filters.nome}%`));
  if (filters.uf) conditions.push(eq(cidades_brasil.uf, filters.uf));
  if (filters.codigo_ibge) conditions.push(eq(cidades_brasil.codigo_ibge, filters.codigo_ibge));

  let query = db.select().from(cidades_brasil).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy && filters.orderBy in cidades_brasil) {
    const orderColumn = cidades_brasil[filters.orderBy as keyof typeof cidades_brasil];
    if (orderColumn && typeof orderColumn !== 'function') {
      query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any)) as any;
    }
  } else {
    query = query.orderBy(asc(cidades_brasil.nome)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getCidadeBrasilById(id: number) {
  const result = await db.select().from(cidades_brasil).where(eq(cidades_brasil.id, id)).limit(1);
  return result[0] || null;
}

export async function getCidadeBrasilByCodigoIBGE(codigo_ibge: string) {
  const result = await db.select().from(cidades_brasil).where(eq(cidades_brasil.codigo_ibge, codigo_ibge)).limit(1);
  return result[0] || null;
}

export async function createCidadeBrasil(data: CreateCidadeBrasilData) {
  const result = await db.insert(cidades_brasil).values({ ...data, created_at: sql`now()` }).returning();
  return result[0];
}

export async function countCidadesBrasil(filters: CidadeBrasilFilters = {}) {
  const conditions: any[] = [];
  if (filters.uf) conditions.push(eq(cidades_brasil.uf, filters.uf));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(cidades_brasil).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
