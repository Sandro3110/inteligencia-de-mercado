/**
 * DAL para dim_geografia
 * Gerencia localização geográfica (Região → Estado → Cidade)
 * 
 * Business Rules:
 * - Populada via seed (5.570 cidades)
 * - APENAS LEITURA (não permite criar/deletar)
 * - Busca fuzzy para correção de nomes
 */

import { db } from '../../db';
import { dimGeografia } from '../../../drizzle/schema';
import { eq, and, like, desc, asc, count, sql } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export type Regiao = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';

export interface GeografiaFilters {
  regiao?: Regiao | Regiao[];
  uf?: string | string[];
  cidade?: string;
  busca?: string;
  orderBy?: 'cidade' | 'uf' | 'regiao';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ResultadoPaginado<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// CONSULTAS (APENAS LEITURA)
// ============================================================================

/**
 * Buscar geografia por ID
 */
export async function getGeografiaById(id: number) {
  const [geografia] = await db
    .select()
    .from(dimGeografia)
    .where(eq(dimGeografia.id, id))
    .limit(1);

  return geografia || null;
}

/**
 * Buscar geografias com filtros e paginação
 */
export async function getGeografias(
  filters: GeografiaFilters = {}
): Promise<ResultadoPaginado<typeof dimGeografia.$inferSelect>> {
  const {
    regiao,
    uf,
    cidade,
    busca,
    orderBy = 'cidade',
    orderDirection = 'asc',
    page = 1,
    limit = 50,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (regiao) {
    if (Array.isArray(regiao)) {
      conditions.push(
        sql`${dimGeografia.regiao} IN (${sql.join(
          regiao.map((r) => sql`${r}`),
          sql`, `
        )})`
      );
    } else {
      conditions.push(eq(dimGeografia.regiao, regiao));
    }
  }

  if (uf) {
    if (Array.isArray(uf)) {
      conditions.push(
        sql`${dimGeografia.uf} IN (${sql.join(
          uf.map((u) => sql`${u}`),
          sql`, `
        )})`
      );
    } else {
      conditions.push(eq(dimGeografia.uf, uf));
    }
  }

  if (cidade) {
    conditions.push(like(dimGeografia.cidade, `%${cidade}%`));
  }

  if (busca) {
    conditions.push(
      sql`(${dimGeografia.cidade} ILIKE ${`%${busca}%`} OR ${dimGeografia.uf} ILIKE ${`%${busca}%`})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(dimGeografia)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = (dimGeografia as any)[orderBy] || dimGeografia.cidade;
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(dimGeografia)
    .where(whereClause)
    .orderBy(orderFn(orderColumn))
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Buscar geografia por cidade e UF
 */
export async function getGeografiaByCidadeUF(cidade: string, uf: string) {
  const [geografia] = await db
    .select()
    .from(dimGeografia)
    .where(and(eq(dimGeografia.cidade, cidade), eq(dimGeografia.uf, uf)))
    .limit(1);

  return geografia || null;
}

/**
 * Buscar cidades com busca fuzzy (Levenshtein)
 * Útil para correção de nomes de cidades
 */
export async function buscarCidadesFuzzy(
  termo: string,
  uf?: string,
  limit = 10
): Promise<Array<{ geografia: typeof dimGeografia.$inferSelect; distancia: number }>> {
  const conditions = [];

  if (uf) {
    conditions.push(eq(dimGeografia.uf, uf));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Buscar com Levenshtein distance
  const resultados = await db
    .select({
      geografia: dimGeografia,
      distancia: sql<number>`levenshtein(${dimGeografia.cidade}, ${termo})`,
    })
    .from(dimGeografia)
    .where(whereClause)
    .orderBy(sql`levenshtein(${dimGeografia.cidade}, ${termo})`)
    .limit(limit);

  return resultados as any;
}

/**
 * Listar geografias por região
 */
export async function getGeografiasByRegiao(regiao: Regiao) {
  return getGeografias({ regiao });
}

/**
 * Listar geografias por UF
 */
export async function getGeografiasByUF(uf: string) {
  return getGeografias({ uf });
}

/**
 * Listar todas as regiões
 */
export async function getRegioes(): Promise<Regiao[]> {
  const resultados = await db
    .selectDistinct({ regiao: dimGeografia.regiao })
    .from(dimGeografia)
    .orderBy(asc(dimGeografia.regiao));

  return resultados.map((r) => r.regiao as Regiao);
}

/**
 * Listar todas as UFs
 */
export async function getUFs(): Promise<string[]> {
  const resultados = await db
    .selectDistinct({ uf: dimGeografia.uf })
    .from(dimGeografia)
    .orderBy(asc(dimGeografia.uf));

  return resultados.map((r) => r.uf);
}

/**
 * Contar cidades por região
 */
export async function contarCidadesPorRegiao(): Promise<
  Array<{ regiao: string; total: number }>
> {
  const resultados = await db
    .select({
      regiao: dimGeografia.regiao,
      total: count(),
    })
    .from(dimGeografia)
    .groupBy(dimGeografia.regiao)
    .orderBy(desc(count()));

  return resultados;
}

/**
 * Contar cidades por UF
 */
export async function contarCidadesPorUF(): Promise<Array<{ uf: string; total: number }>> {
  const resultados = await db
    .select({
      uf: dimGeografia.uf,
      total: count(),
    })
    .from(dimGeografia)
    .groupBy(dimGeografia.uf)
    .orderBy(desc(count()));

  return resultados;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalizar nome de cidade (remover acentos, maiúsculas)
 */
export function normalizarCidade(cidade: string): string {
  return cidade
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Validar UF (2 letras maiúsculas)
 */
export function validarUF(uf: string): boolean {
  const ufsValidas = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  return ufsValidas.includes(uf.toUpperCase());
}
