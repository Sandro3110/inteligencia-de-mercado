/**
 * DAL para dim_geografia
 * Sincronizado 100% com schema (19 campos)
 */

import { db } from '../../db';
import { dim_geografia } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export interface GeografiaFilters {
  id?: number;
  cidade?: string;
  uf?: string;
  regiao?: string;
  pais?: string;
  macrorregiao?: string;
  mesorregiao?: string;
  microrregiao?: string;
  codigo_ibge?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_geografia;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateGeografiaData {
  cidade: string;
  uf: string;
  regiao?: string;
  latitude?: string;
  longitude?: string;
  codigo_ibge?: string;
  populacao?: number;
  pib_per_capita?: string;
  created_by?: string;
  pais?: string;
  macrorregiao?: string;
  mesorregiao?: string;
  microrregiao?: string;
}

export interface UpdateGeografiaData {
  cidade?: string;
  uf?: string;
  regiao?: string;
  latitude?: string;
  longitude?: string;
  codigo_ibge?: string;
  populacao?: number;
  pib_per_capita?: string;
  updated_by?: string;
  pais?: string;
  macrorregiao?: string;
  mesorregiao?: string;
  microrregiao?: string;
}

// ============================================================================
// FUNÇÕES CRUD
// ============================================================================

export async function getGeografias(filters: GeografiaFilters = {}) {
  const conditions: any[] = [];

  if (filters.id) {
    conditions.push(eq(dim_geografia.id, filters.id));
  }
  if (filters.cidade) {
    conditions.push(like(dim_geografia.cidade, `%${filters.cidade}%`));
  }
  if (filters.uf) {
    conditions.push(eq(dim_geografia.uf, filters.uf));
  }
  if (filters.regiao) {
    conditions.push(eq(dim_geografia.regiao, filters.regiao));
  }
  if (filters.pais) {
    conditions.push(eq(dim_geografia.pais, filters.pais));
  }
  if (filters.macrorregiao) {
    conditions.push(eq(dim_geografia.macrorregiao, filters.macrorregiao));
  }
  if (filters.mesorregiao) {
    conditions.push(eq(dim_geografia.mesorregiao, filters.mesorregiao));
  }
  if (filters.microrregiao) {
    conditions.push(eq(dim_geografia.microrregiao, filters.microrregiao));
  }
  if (filters.codigo_ibge) {
    conditions.push(eq(dim_geografia.codigo_ibge, filters.codigo_ibge));
  }

  // Soft delete
  if (!filters.incluirInativos) {
    conditions.push(isNull(dim_geografia.deleted_at));
  }

  let query = db
    .select()
    .from(dim_geografia)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Ordenação
  if (filters.orderBy && filters.orderBy in dim_geografia) {
    const orderColumn = dim_geografia[filters.orderBy as keyof typeof dim_geografia];
    if (orderColumn) {
      query = query.orderBy(
        filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)
      ) as any;
    }
  } else {
    query = query.orderBy(asc(dim_geografia.cidade)) as any;
  }

  // Paginação
  if (filters.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function getGeografiaById(id: number) {
  const result = await db
    .select()
    .from(dim_geografia)
    .where(and(eq(dim_geografia.id, id), isNull(dim_geografia.deleted_at)))
    .limit(1);

  return result[0] || null;
}

export async function createGeografia(data: CreateGeografiaData) {
  const result = await db
    .insert(dim_geografia)
    .values({
      ...data,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .returning();

  return result[0];
}

export async function updateGeografia(id: number, data: UpdateGeografiaData) {
  const result = await db
    .update(dim_geografia)
    .set({
      ...data,
      updated_at: sql`now()`,
    })
    .where(eq(dim_geografia.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteGeografia(id: number, deleted_by?: string) {
  const result = await db
    .update(dim_geografia)
    .set({
      deleted_at: sql`now()`,
      deleted_by,
    })
    .where(eq(dim_geografia.id, id))
    .returning();

  return result[0] || null;
}

export async function countGeografias(filters: GeografiaFilters = {}) {
  const conditions: any[] = [];

  if (filters.uf) {
    conditions.push(eq(dim_geografia.uf, filters.uf));
  }
  if (filters.regiao) {
    conditions.push(eq(dim_geografia.regiao, filters.regiao));
  }

  if (!filters.incluirInativos) {
    conditions.push(isNull(dim_geografia.deleted_at));
  }

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dim_geografia)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result[0]?.count || 0;
}
