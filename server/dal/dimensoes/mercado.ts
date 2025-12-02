/**
 * DAL para dim_mercado
 * Gerencia mercados/setores com categorização
 * 
 * Business Rules:
 * - Hash único (MD5 de nome+categoria)
 * - Mercado padrão: "NÃO CLASSIFICADO" (id=1)
 * - Enriquecimento opcional via IA
 * - Não deletar mercado padrão
 */

import { db } from '../../db';
import { dimMercado } from '../../../drizzle/schema';
import { eq, and, or, like, desc, asc, count, isNull } from 'drizzle-orm';
import { createHash } from 'crypto';

// ============================================================================
// TIPOS
// ============================================================================

export interface CreateMercadoInput {
  nome: string;
  categoria?: string;
  descricao?: string;
  ativo?: boolean;
  createdBy?: string;
}

export interface UpdateMercadoInput {
  nome?: string;
  categoria?: string;
  descricao?: string;
  ativo?: boolean;
  updatedBy?: string;
}

export interface EnriquecerMercadoInput {
  descricao?: string;
  categoria?: string;
  enriquecidoPor: string;
}

export interface MercadoFilters {
  ativo?: boolean;
  categoria?: string | string[];
  busca?: string;
  orderBy?: 'nome' | 'categoria' | 'created_at';
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
// CRUD BÁSICO
// ============================================================================

/**
 * Criar novo mercado
 */
export async function createMercado(input: CreateMercadoInput) {
  // Validações
  if (!input.nome || input.nome.trim() === '') {
    throw new Error('Nome do mercado é obrigatório');
  }

  // Gerar hash único
  const mercadoHash = gerarHashMercado(input.nome, input.categoria || '');

  // Verificar hash único
  const mercadoExistente = await getMercadoByHash(mercadoHash);
  if (mercadoExistente) {
    throw new Error('Já existe um mercado com o mesmo nome e categoria');
  }

  const [novoMercado] = await db
    .insert(dimMercado)
    .values({
      ...input,
      mercadoHash,
      ativo: input.ativo !== undefined ? input.ativo : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return novoMercado;
}

/**
 * Buscar mercado por ID
 */
export async function getMercadoById(id: number) {
  const [mercado] = await db
    .select()
    .from(dimMercado)
    .where(eq(dimMercado.id, id))
    .limit(1);

  return mercado || null;
}

/**
 * Buscar mercados com filtros e paginação
 */
export async function getMercados(
  filters: MercadoFilters = {}
): Promise<ResultadoPaginado<typeof dimMercado.$inferSelect>> {
  const {
    ativo,
    categoria,
    busca,
    orderBy = 'nome',
    orderDirection = 'asc',
    page = 1,
    limit = 50,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (ativo !== undefined) {
    conditions.push(eq(dimMercado.ativo, ativo));
  }

  if (categoria) {
    if (Array.isArray(categoria)) {
      conditions.push(or(...categoria.map((c) => eq(dimMercado.categoria, c))));
    } else {
      conditions.push(eq(dimMercado.categoria, categoria));
    }
  }

  if (busca) {
    conditions.push(
      or(
        like(dimMercado.nome, `%${busca}%`),
        like(dimMercado.categoria, `%${busca}%`),
        like(dimMercado.descricao, `%${busca}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(dimMercado)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = (dimMercado as any)[orderBy] || dimMercado.nome;
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(dimMercado)
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
 * Atualizar mercado
 */
export async function updateMercado(id: number, input: UpdateMercadoInput) {
  // Verificar se mercado existe
  const mercadoExistente = await getMercadoById(id);
  if (!mercadoExistente) {
    throw new Error(`Mercado com ID ${id} não encontrado`);
  }

  // Não permitir alterar mercado padrão
  if (id === 1) {
    throw new Error('Não é permitido alterar o mercado padrão "NÃO CLASSIFICADO"');
  }

  // Se mudou nome ou categoria, verificar hash único
  if (input.nome || input.categoria) {
    const novoNome = input.nome || mercadoExistente.nome;
    const novaCategoria = input.categoria || mercadoExistente.categoria || '';
    const novoHash = gerarHashMercado(novoNome, novaCategoria);

    if (novoHash !== mercadoExistente.mercadoHash) {
      const mercadoPorHash = await getMercadoByHash(novoHash);
      if (mercadoPorHash && mercadoPorHash.id !== id) {
        throw new Error('Já existe um mercado com o mesmo nome e categoria');
      }
    }
  }

  const [mercadoAtualizado] = await db
    .update(dimMercado)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dimMercado.id, id))
    .returning();

  return mercadoAtualizado;
}

/**
 * Deletar mercado (hard delete)
 * Apenas se não estiver sendo usado
 */
export async function deleteMercado(id: number) {
  // Não permitir deletar mercado padrão
  if (id === 1) {
    throw new Error('Não é permitido deletar o mercado padrão "NÃO CLASSIFICADO"');
  }

  // TODO: Verificar se mercado está sendo usado em fato_entidade_contexto
  // Por enquanto, apenas deletar

  await db.delete(dimMercado).where(eq(dimMercado.id, id));

  return { success: true };
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Buscar mercado por hash
 */
export async function getMercadoByHash(hash: string) {
  const [mercado] = await db
    .select()
    .from(dimMercado)
    .where(eq(dimMercado.mercadoHash, hash))
    .limit(1);

  return mercado || null;
}

/**
 * Buscar mercado padrão ("NÃO CLASSIFICADO")
 */
export async function getMercadoPadrao() {
  return getMercadoById(1);
}

/**
 * Buscar ou criar mercado (upsert)
 */
export async function buscarOuCriarMercado(input: CreateMercadoInput): Promise<{
  mercado: typeof dimMercado.$inferSelect;
  criado: boolean;
}> {
  const hash = gerarHashMercado(input.nome, input.categoria || '');
  const existente = await getMercadoByHash(hash);

  if (existente) {
    return { mercado: existente, criado: false };
  }

  const novo = await createMercado(input);
  return { mercado: novo, criado: true };
}

/**
 * Enriquecer mercado com dados da IA
 */
export async function enriquecerMercado(id: number, dados: EnriquecerMercadoInput) {
  const mercado = await getMercadoById(id);
  if (!mercado) {
    throw new Error(`Mercado com ID ${id} não encontrado`);
  }

  const [mercadoEnriquecido] = await db
    .update(dimMercado)
    .set({
      descricao: dados.descricao || mercado.descricao,
      categoria: dados.categoria || mercado.categoria,
      enriquecidoEm: new Date(),
      enriquecidoPor: dados.enriquecidoPor,
      updatedAt: new Date(),
    })
    .where(eq(dimMercado.id, id))
    .returning();

  return mercadoEnriquecido;
}

/**
 * Listar mercados ativos
 */
export async function getMercadosAtivos() {
  return getMercados({ ativo: true });
}

/**
 * Listar categorias únicas
 */
export async function getCategorias(): Promise<string[]> {
  const resultados = await db
    .selectDistinct({ categoria: dimMercado.categoria })
    .from(dimMercado)
    .where(isNull(dimMercado.categoria))
    .orderBy(asc(dimMercado.categoria));

  return resultados.map((r) => r.categoria).filter((c) => c !== null) as string[];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Gerar hash único para mercado
 */
export function gerarHashMercado(nome: string, categoria: string): string {
  const nomeNormalizado = nome.toLowerCase().trim();
  const categoriaNormalizada = categoria.toLowerCase().trim();
  const chave = `${nomeNormalizado}|${categoriaNormalizada}`;

  return createHash('md5').update(chave).digest('hex');
}
