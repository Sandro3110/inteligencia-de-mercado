/**
 * DAL para fato_entidade_competidor
 * Relacionamento N:N entre contexto e competidor (entidade)
 * 
 * Business Rules:
 * - Contexto + Competidor único
 * - Nível competição: direto, indireto, potencial
 */

import { db } from '../../db';
import { getOrderColumn } from '../../helpers/order-by';
import { fato_entidade_competidor, dim_entidade } from '../../../drizzle/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export type NivelCompeticao = 'direto' | 'indireto' | 'potencial';

export interface CreateRelacaoInput {
  contextoId: number;
  competidorEntidadeId: number;
  nivelCompeticao?: NivelCompeticao;
  diferencial?: string;
  observacoes?: string;
  createdBy?: string;
}

export interface UpdateRelacaoInput {
  nivelCompeticao?: NivelCompeticao;
  diferencial?: string;
  observacoes?: string;
}

export interface RelacaoFilters {
  contextoId?: number;
  competidorEntidadeId?: number;
  nivelCompeticao?: NivelCompeticao | NivelCompeticao[];
  orderBy?: 'created_at';
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
 * Criar nova relação contexto-competidor
 */
export async function createRelacao(input: CreateRelacaoInput) {
  // Validações
  if (!input.contextoId) {
    throw new Error('Contexto ID é obrigatório');
  }

  if (!input.competidorEntidadeId) {
    throw new Error('Competidor Entidade ID é obrigatório');
  }

  // Verificar se já existe relação
  const relacaoExistente = await getRelacaoByContextoCompetidor(
    input.contextoId,
    input.competidorEntidadeId
  );

  if (relacaoExistente) {
    throw new Error('Já existe uma relação entre este contexto e competidor');
  }

  const [novaRelacao] = await db
    .insert(fato_entidade_competidor)
    .values({
      ...input,
      createdAt: new Date(),
    })
    .returning();

  return novaRelacao;
}

/**
 * Buscar relação por ID
 */
export async function getRelacaoById(id: number) {
  const [relacao] = await db
    .select()
    .from(fato_entidade_competidor)
    .where(eq(fato_entidade_competidor.id, id))
    .limit(1);

  return relacao || null;
}

/**
 * Buscar relações com filtros e paginação
 */
export async function getRelacoes(
  filters: RelacaoFilters = {}
): Promise<ResultadoPaginado<typeof fato_entidade_competidor.$inferSelect>> {
  const {
    contextoId,
    competidorEntidadeId,
    nivelCompeticao,
    orderBy = 'created_at',
    orderDirection = 'desc',
    page = 1,
    limit = 50,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (contextoId) {
    conditions.push(eq(fato_entidade_competidor.contextoId, contextoId));
  }

  if (competidorEntidadeId) {
    conditions.push(
      eq(fato_entidade_competidor.competidorEntidadeId, competidorEntidadeId)
    );
  }

  if (nivelCompeticao) {
    if (Array.isArray(nivelCompeticao)) {
      conditions.push(
        and(...nivelCompeticao.map((n) => eq(fato_entidade_competidor.nivelCompeticao, n)))
      );
    } else {
      conditions.push(eq(fato_entidade_competidor.nivelCompeticao, nivelCompeticao));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(fato_entidade_competidor)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn =
    getOrderColumn(fato_entidade_competidor, orderBy, fato_entidade_competidor.createdAt);
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(fato_entidade_competidor)
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
 * Atualizar relação
 */
export async function updateRelacao(id: number, input: UpdateRelacaoInput) {
  // Verificar se relação existe
  const relacaoExistente = await getRelacaoById(id);
  if (!relacaoExistente) {
    throw new Error(`Relação com ID ${id} não encontrada`);
  }

  const [relacaoAtualizada] = await db
    .update(fato_entidade_competidor)
    .set(input)
    .where(eq(fato_entidade_competidor.id, id))
    .returning();

  return relacaoAtualizada;
}

/**
 * Deletar relação (hard delete)
 */
export async function deleteRelacao(id: number) {
  await db.delete(fato_entidade_competidor).where(eq(fato_entidade_competidor.id, id));

  return { success: true };
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Buscar relação por contexto + competidor
 */
async function getRelacaoByContextoCompetidor(
  contextoId: number,
  competidorEntidadeId: number
) {
  const [relacao] = await db
    .select()
    .from(fato_entidade_competidor)
    .where(
      and(
        eq(fato_entidade_competidor.contextoId, contextoId),
        eq(fato_entidade_competidor.competidorEntidadeId, competidorEntidadeId)
      )
    )
    .limit(1);

  return relacao || null;
}

/**
 * Listar relações por contexto
 */
export async function getRelacoesByContexto(contextoId: number) {
  return getRelacoes({ contextoId });
}

/**
 * Buscar concorrentes de um contexto com JOIN
 */
export async function getConcorrentesDeContexto(contextoId: number) {
  const resultados = await db
    .select({
      relacao: fato_entidade_competidor,
      competidor: dim_entidade,
    })
    .from(fato_entidade_competidor)
    .innerJoin(
      dim_entidade,
      eq(fato_entidade_competidor.competidorEntidadeId, dim_entidade.id)
    )
    .where(eq(fato_entidade_competidor.contextoId, contextoId));

  return resultados;
}

/**
 * Adicionar múltiplos concorrentes a um contexto
 */
export async function adicionarConcorrentesAoContexto(
  contextoId: number,
  concorrentes: Array<{
    competidorEntidadeId: number;
    nivelCompeticao?: NivelCompeticao;
    diferencial?: string;
    observacoes?: string;
  }>,
  createdBy?: string
) {
  const relacoes = [];

  for (const concorrente of concorrentes) {
    try {
      const relacao = await createRelacao({
        contextoId,
        ...concorrente,
        createdBy,
      });
      relacoes.push(relacao);
    } catch (error) {
      // Se já existe, ignorar
      if ((error as Error).message.includes('Já existe')) {
        continue;
      }
      throw error;
    }
  }

  return relacoes;
}

/**
 * Contar concorrentes por nível de competição
 */
export async function contarConcorrentesPorNivel(contextoId?: number) {
  const conditions = [];

  if (contextoId) {
    conditions.push(eq(fato_entidade_competidor.contextoId, contextoId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const resultados = await db
    .select({
      nivelCompeticao: fato_entidade_competidor.nivelCompeticao,
      total: count(),
    })
    .from(fato_entidade_competidor)
    .where(whereClause)
    .groupBy(fato_entidade_competidor.nivelCompeticao);

  return resultados;
}

/**
 * Buscar concorrentes diretos de um contexto
 */
export async function getConcorrentesDiretos(contextoId: number) {
  return getConcorrentesDeContexto(contextoId).then((resultados) =>
    resultados.filter((r) => r.relacao.nivelCompeticao === 'direto')
  );
}

/**
 * Buscar concorrentes indiretos de um contexto
 */
export async function getConcorrentesIndiretos(contextoId: number) {
  return getConcorrentesDeContexto(contextoId).then((resultados) =>
    resultados.filter((r) => r.relacao.nivelCompeticao === 'indireto')
  );
}

/**
 * Buscar concorrentes potenciais de um contexto
 */
export async function getConcorrentesPotenciais(contextoId: number) {
  return getConcorrentesDeContexto(contextoId).then((resultados) =>
    resultados.filter((r) => r.relacao.nivelCompeticao === 'potencial')
  );
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Validar nível de competição
 */
export function validarNivelCompeticao(nivel: string): boolean {
  const niveisValidos: NivelCompeticao[] = ['direto', 'indireto', 'potencial'];

  return niveisValidos.includes(nivel as NivelCompeticao);
}

/**
 * Obter descrição do nível de competição
 */
export function getDescricaoNivelCompeticao(nivel: NivelCompeticao): string {
  const descricoes: Record<NivelCompeticao, string> = {
    direto: 'Competidor direto - oferece produtos/serviços similares ao mesmo público-alvo',
    indireto:
      'Competidor indireto - oferece produtos/serviços diferentes mas que atendem a mesma necessidade',
    potencial: 'Competidor potencial - pode se tornar um competidor no futuro',
  };

  return descricoes[nivel] || 'Nível desconhecido';
}

/**
 * Obter cor do nível de competição
 */
export function getCorNivelCompeticao(nivel: NivelCompeticao): string {
  const cores: Record<NivelCompeticao, string> = {
    direto: '#ef4444', // vermelho
    indireto: '#f59e0b', // laranja
    potencial: '#3b82f6', // azul
  };

  return cores[nivel] || '#6b7280';
}
