/**
 * DAL para dim_projeto
 * Gerencia projetos (unidades de negócio / centros de custo)
 * 
 * Business Rules:
 * - Código único por owner
 * - Nome único por owner
 * - Status: ativo, inativo, arquivado
 * - Soft delete
 */

import { db } from '../../db';
import { getOrderColumn } from '../../helpers/order-by';
import { dim_projeto } from '../../../drizzle/schema';
import { eq, and, or, like, desc, asc, count, isNull } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export interface CreateProjetoInput {
  codigo?: string;
  nome: string;
  descricao?: string;
  status?: 'ativo' | 'inativo' | 'arquivado';
  ownerId: number;
  unidadeNegocio?: string;
  centroCusto?: string;
  orcamentoTotal?: number;
  createdBy: string;
}

export interface UpdateProjetoInput {
  codigo?: string;
  nome?: string;
  descricao?: string;
  status?: 'ativo' | 'inativo' | 'arquivado';
  unidadeNegocio?: string;
  centroCusto?: string;
  orcamentoTotal?: number;
  updatedBy?: string;
}

export interface ProjetoFilters {
  ownerId?: number;
  status?: 'ativo' | 'inativo' | 'arquivado' | ('ativo' | 'inativo' | 'arquivado')[];
  busca?: string;
  orderBy?: 'nome' | 'codigo' | 'created_at';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  incluirDeletados?: boolean;
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
 * Criar novo projeto
 */
export async function createProjeto(input: CreateProjetoInput) {
  // Validações
  if (!input.nome || input.nome.trim() === '') {
    throw new Error('Nome do projeto é obrigatório');
  }

  if (!input.ownerId) {
    throw new Error('Owner ID é obrigatório');
  }

  // Verificar nome único por owner
  if (await existeProjetoComNome(input.nome, input.ownerId)) {
    throw new Error(`Já existe um projeto com o nome "${input.nome}" para este owner`);
  }

  // Verificar código único por owner (se fornecido)
  if (input.codigo && (await existeProjetoComCodigo(input.codigo, input.ownerId))) {
    throw new Error(`Já existe um projeto com o código "${input.codigo}" para este owner`);
  }

  const [novoProjeto] = await db
    .insert(dim_projeto)
    .values({
      ...input,
      status: input.status || 'ativo',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return novoProjeto;
}

/**
 * Buscar projeto por ID
 */
export async function getProjetoById(id: number, incluirDeletados = false) {
  const conditions = [eq(dim_projeto.id, id)];

  if (!incluirDeletados) {
    conditions.push(isNull(dim_projeto.deletedAt));
  }

  const [projeto] = await db
    .select()
    .from(dim_projeto)
    .where(and(...conditions))
    .limit(1);

  return projeto || null;
}

/**
 * Buscar projetos com filtros e paginação
 */
export async function getProjetos(
  filters: ProjetoFilters = {}
): Promise<ResultadoPaginado<typeof dim_projeto.$inferSelect>> {
  const {
    ownerId,
    status,
    busca,
    orderBy = 'created_at',
    orderDirection = 'desc',
    page = 1,
    limit = 50,
    incluirDeletados = false,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (!incluirDeletados) {
    conditions.push(isNull(dim_projeto.deletedAt));
  }

  if (ownerId) {
    conditions.push(eq(dim_projeto.ownerId, ownerId));
  }

  if (status) {
    if (Array.isArray(status)) {
      conditions.push(
        or(...status.map((s) => eq(dim_projeto.status, s)))
      );
    } else {
      conditions.push(eq(dim_projeto.status, status));
    }
  }

  if (busca) {
    conditions.push(
      or(
        like(dim_projeto.nome, `%${busca}%`),
        like(dim_projeto.codigo, `%${busca}%`),
        like(dim_projeto.descricao, `%${busca}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(dim_projeto)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = getOrderColumn(dim_projeto, orderBy, dim_projeto.createdAt);
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(dim_projeto)
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
 * Atualizar projeto
 */
export async function updateProjeto(id: number, input: UpdateProjetoInput) {
  // Verificar se projeto existe
  const projetoExistente = await getProjetoById(id);
  if (!projetoExistente) {
    throw new Error(`Projeto com ID ${id} não encontrado`);
  }

  // Verificar nome único (se mudou)
  if (input.nome && input.nome !== projetoExistente.nome) {
    if (await existeProjetoComNome(input.nome, projetoExistente.ownerId, id)) {
      throw new Error(`Já existe um projeto com o nome "${input.nome}" para este owner`);
    }
  }

  // Verificar código único (se mudou)
  if (input.codigo && input.codigo !== projetoExistente.codigo) {
    if (await existeProjetoComCodigo(input.codigo, projetoExistente.ownerId, id)) {
      throw new Error(`Já existe um projeto com o código "${input.codigo}" para este owner`);
    }
  }

  const [projetoAtualizado] = await db
    .update(dim_projeto)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dim_projeto.id, id))
    .returning();

  return projetoAtualizado;
}

/**
 * Deletar projeto (soft delete)
 */
export async function deleteProjeto(id: number, deletedBy?: string) {
  const [projetoDeletado] = await db
    .update(dim_projeto)
    .set({
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
    })
    .where(eq(dim_projeto.id, id))
    .returning();

  return projetoDeletado;
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Buscar projeto por código e owner
 */
export async function getProjetoByCodigoAndOwner(
  codigo: string,
  ownerId: number,
  incluirDeletados = false
) {
  const conditions = [eq(dim_projeto.codigo, codigo), eq(dim_projeto.ownerId, ownerId)];

  if (!incluirDeletados) {
    conditions.push(isNull(dim_projeto.deletedAt));
  }

  const [projeto] = await db
    .select()
    .from(dim_projeto)
    .where(and(...conditions))
    .limit(1);

  return projeto || null;
}

/**
 * Listar projetos ativos de um owner
 */
export async function getProjetosAtivos(ownerId: number) {
  return getProjetos({
    ownerId,
    status: 'ativo',
  });
}

/**
 * Arquivar projeto
 */
export async function arquivarProjeto(id: number, updatedBy?: string) {
  return updateProjeto(id, {
    status: 'arquivado',
    updatedBy,
  });
}

/**
 * Ativar projeto
 */
export async function ativarProjeto(id: number, updatedBy?: string) {
  return updateProjeto(id, {
    status: 'ativo',
    updatedBy,
  });
}

/**
 * Inativar projeto
 */
export async function inativarProjeto(id: number, updatedBy?: string) {
  return updateProjeto(id, {
    status: 'inativo',
    updatedBy,
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verificar se existe projeto com mesmo nome para o owner
 */
async function existeProjetoComNome(
  nome: string,
  ownerId: number,
  excludeId?: number
): Promise<boolean> {
  const conditions = [
    eq(dim_projeto.nome, nome),
    eq(dim_projeto.ownerId, ownerId),
    isNull(dim_projeto.deletedAt),
  ];

  if (excludeId) {
    conditions.push(eq(dim_projeto.id, excludeId));
  }

  const [resultado] = await db
    .select({ count: count() })
    .from(dim_projeto)
    .where(excludeId ? and(...conditions.slice(0, -1)) : and(...conditions));

  return resultado.count > 0;
}

/**
 * Verificar se existe projeto com mesmo código para o owner
 */
async function existeProjetoComCodigo(
  codigo: string,
  ownerId: number,
  excludeId?: number
): Promise<boolean> {
  const conditions = [
    eq(dim_projeto.codigo, codigo),
    eq(dim_projeto.ownerId, ownerId),
    isNull(dim_projeto.deletedAt),
  ];

  if (excludeId) {
    conditions.push(eq(dim_projeto.id, excludeId));
  }

  const [resultado] = await db
    .select({ count: count() })
    .from(dim_projeto)
    .where(excludeId ? and(...conditions.slice(0, -1)) : and(...conditions));

  return resultado.count > 0;
}
