/**
 * DAL para dim_pesquisa
 * Gerencia pesquisas (snapshots temporais de enriquecimento)
 * 
 * Business Rules:
 * - Nome único por projeto
 * - Status: pendente, em_progresso, concluida, falhou, cancelada
 * - Soft delete
 * - Métricas calculadas automaticamente
 * - Re-enriquecimento cria nova versão
 */

import { db } from '../../db';
import { dimPesquisa, dimProjeto } from '../../../drizzle/schema';
import { eq, and, or, like, desc, asc, count, isNull } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export type StatusPesquisa = 'pendente' | 'em_progresso' | 'concluida' | 'falhou' | 'cancelada';

export interface CreatePesquisaInput {
  projetoId: number;
  nome: string;
  descricao?: string;
  objetivo?: string;
  status?: StatusPesquisa;
  createdBy: string;
}

export interface UpdatePesquisaInput {
  nome?: string;
  descricao?: string;
  objetivo?: string;
  status?: StatusPesquisa;
  totalEntidades?: number;
  entidadesEnriquecidas?: number;
  entidadesFalhadas?: number;
  qualidadeMedia?: number;
  errorMessage?: string;
  updatedBy?: string;
}

export interface PesquisaFilters {
  projetoId?: number;
  status?: StatusPesquisa | StatusPesquisa[];
  busca?: string;
  orderBy?: 'nome' | 'created_at' | 'started_at' | 'completed_at';
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

export interface EstatisticasExecucao {
  totalEntidades: number;
  entidadesEnriquecidas: number;
  entidadesFalhadas: number;
  qualidadeMedia: number;
}

// ============================================================================
// CRUD BÁSICO
// ============================================================================

/**
 * Criar nova pesquisa
 */
export async function createPesquisa(input: CreatePesquisaInput) {
  // Validações
  if (!input.nome || input.nome.trim() === '') {
    throw new Error('Nome da pesquisa é obrigatório');
  }

  if (!input.projetoId) {
    throw new Error('Projeto ID é obrigatório');
  }

  // Verificar se projeto existe
  const [projeto] = await db
    .select()
    .from(dimProjeto)
    .where(eq(dimProjeto.id, input.projetoId))
    .limit(1);

  if (!projeto) {
    throw new Error(`Projeto com ID ${input.projetoId} não encontrado`);
  }

  // Verificar nome único por projeto
  if (await existePesquisaComNome(input.nome, input.projetoId)) {
    throw new Error(`Já existe uma pesquisa com o nome "${input.nome}" neste projeto`);
  }

  const [novaPesquisa] = await db
    .insert(dimPesquisa)
    .values({
      ...input,
      status: input.status || 'pendente',
      totalEntidades: 0,
      entidadesEnriquecidas: 0,
      entidadesFalhadas: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return novaPesquisa;
}

/**
 * Buscar pesquisa por ID
 */
export async function getPesquisaById(id: number, incluirDeletados = false) {
  const conditions = [eq(dimPesquisa.id, id)];

  if (!incluirDeletados) {
    conditions.push(isNull(dimPesquisa.deletedAt));
  }

  const [pesquisa] = await db
    .select()
    .from(dimPesquisa)
    .where(and(...conditions))
    .limit(1);

  return pesquisa || null;
}

/**
 * Buscar pesquisas com filtros e paginação
 */
export async function getPesquisas(
  filters: PesquisaFilters = {}
): Promise<ResultadoPaginado<typeof dimPesquisa.$inferSelect>> {
  const {
    projetoId,
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
    conditions.push(isNull(dimPesquisa.deletedAt));
  }

  if (projetoId) {
    conditions.push(eq(dimPesquisa.projetoId, projetoId));
  }

  if (status) {
    if (Array.isArray(status)) {
      conditions.push(
        or(...status.map((s) => eq(dimPesquisa.status, s)))
      );
    } else {
      conditions.push(eq(dimPesquisa.status, status));
    }
  }

  if (busca) {
    conditions.push(
      or(
        like(dimPesquisa.nome, `%${busca}%`),
        like(dimPesquisa.descricao, `%${busca}%`),
        like(dimPesquisa.objetivo, `%${busca}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(dimPesquisa)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = (dimPesquisa as any)[orderBy] || dimPesquisa.createdAt;
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(dimPesquisa)
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
 * Atualizar pesquisa
 */
export async function updatePesquisa(id: number, input: UpdatePesquisaInput) {
  // Verificar se pesquisa existe
  const pesquisaExistente = await getPesquisaById(id);
  if (!pesquisaExistente) {
    throw new Error(`Pesquisa com ID ${id} não encontrada`);
  }

  // Verificar nome único (se mudou)
  if (input.nome && input.nome !== pesquisaExistente.nome) {
    if (await existePesquisaComNome(input.nome, pesquisaExistente.projetoId, id)) {
      throw new Error(`Já existe uma pesquisa com o nome "${input.nome}" neste projeto`);
    }
  }

  const [pesquisaAtualizada] = await db
    .update(dimPesquisa)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dimPesquisa.id, id))
    .returning();

  return pesquisaAtualizada;
}

/**
 * Deletar pesquisa (soft delete)
 */
export async function deletePesquisa(id: number, deletedBy?: string) {
  const [pesquisaDeletada] = await db
    .update(dimPesquisa)
    .set({
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
    })
    .where(eq(dimPesquisa.id, id))
    .returning();

  return pesquisaDeletada;
}

// ============================================================================
// BUSINESS LOGIC - CONTROLE DE EXECUÇÃO
// ============================================================================

/**
 * Iniciar pesquisa (marcar como em progresso)
 */
export async function iniciarPesquisa(id: number, startedBy: string) {
  const pesquisa = await getPesquisaById(id);
  if (!pesquisa) {
    throw new Error(`Pesquisa com ID ${id} não encontrada`);
  }

  if (pesquisa.status !== 'pendente') {
    throw new Error(`Pesquisa deve estar com status 'pendente' para ser iniciada`);
  }

  const [pesquisaIniciada] = await db
    .update(dimPesquisa)
    .set({
      status: 'em_progresso',
      startedAt: new Date(),
      startedBy,
      updatedAt: new Date(),
    })
    .where(eq(dimPesquisa.id, id))
    .returning();

  return pesquisaIniciada;
}

/**
 * Concluir pesquisa (marcar como concluída)
 */
export async function concluirPesquisa(id: number, stats: EstatisticasExecucao) {
  const pesquisa = await getPesquisaById(id);
  if (!pesquisa) {
    throw new Error(`Pesquisa com ID ${id} não encontrada`);
  }

  if (pesquisa.status !== 'em_progresso') {
    throw new Error(`Pesquisa deve estar com status 'em_progresso' para ser concluída`);
  }

  const startedAt = pesquisa.startedAt || new Date();
  const completedAt = new Date();
  const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

  const [pesquisaConcluida] = await db
    .update(dimPesquisa)
    .set({
      status: 'concluida',
      completedAt,
      durationSeconds,
      totalEntidades: stats.totalEntidades,
      entidadesEnriquecidas: stats.entidadesEnriquecidas,
      entidadesFalhadas: stats.entidadesFalhadas,
      qualidadeMedia: stats.qualidadeMedia,
      updatedAt: new Date(),
    })
    .where(eq(dimPesquisa.id, id))
    .returning();

  return pesquisaConcluida;
}

/**
 * Falhar pesquisa (marcar como falhada)
 */
export async function falharPesquisa(id: number, errorMessage: string) {
  const pesquisa = await getPesquisaById(id);
  if (!pesquisa) {
    throw new Error(`Pesquisa com ID ${id} não encontrada`);
  }

  if (pesquisa.status !== 'em_progresso') {
    throw new Error(`Pesquisa deve estar com status 'em_progresso' para ser marcada como falhada`);
  }

  const startedAt = pesquisa.startedAt || new Date();
  const completedAt = new Date();
  const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

  const [pesquisaFalhada] = await db
    .update(dimPesquisa)
    .set({
      status: 'falhou',
      completedAt,
      durationSeconds,
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(dimPesquisa.id, id))
    .returning();

  return pesquisaFalhada;
}

/**
 * Cancelar pesquisa
 */
export async function cancelarPesquisa(id: number, updatedBy?: string) {
  const [pesquisaCancelada] = await db
    .update(dimPesquisa)
    .set({
      status: 'cancelada',
      updatedAt: new Date(),
      updatedBy,
    })
    .where(eq(dimPesquisa.id, id))
    .returning();

  return pesquisaCancelada;
}

// ============================================================================
// BUSINESS LOGIC - CONSULTAS
// ============================================================================

/**
 * Listar pesquisas por projeto
 */
export async function getPesquisasByProjeto(projetoId: number) {
  return getPesquisas({ projetoId });
}

/**
 * Listar pesquisas em progresso
 */
export async function getPesquisasEmProgresso() {
  return getPesquisas({ status: 'em_progresso' });
}

/**
 * Listar pesquisas concluídas
 */
export async function getPesquisasConcluidas(projetoId?: number) {
  return getPesquisas({
    projetoId,
    status: 'concluida',
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verificar se existe pesquisa com mesmo nome no projeto
 */
async function existePesquisaComNome(
  nome: string,
  projetoId: number,
  excludeId?: number
): Promise<boolean> {
  const conditions = [
    eq(dimPesquisa.nome, nome),
    eq(dimPesquisa.projetoId, projetoId),
    isNull(dimPesquisa.deletedAt),
  ];

  if (excludeId) {
    conditions.push(eq(dimPesquisa.id, excludeId));
  }

  const [resultado] = await db
    .select({ count: count() })
    .from(dimPesquisa)
    .where(excludeId ? and(...conditions.slice(0, -1)) : and(...conditions));

  return resultado.count > 0;
}
