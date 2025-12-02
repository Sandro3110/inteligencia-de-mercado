/**
 * DAL para fato_entidade_produto
 * Relacionamento N:N entre contexto e produto
 * 
 * Business Rules:
 * - Contexto + Produto único
 * - Tipo relação: fabrica, comercializa, usa, etc
 */

import { db } from '../../db';
import { fatoEntidadeProduto, dimProduto, fatoEntidadeContexto } from '../../../drizzle/schema';
import { eq, and, desc, asc, count } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export type TipoRelacao =
  | 'fabrica'
  | 'comercializa'
  | 'distribui'
  | 'usa'
  | 'revende'
  | 'importa'
  | 'exporta'
  | 'outro';

export interface CreateRelacaoInput {
  contextoId: number;
  produtoId: number;
  tipoRelacao?: TipoRelacao;
  volumeEstimado?: string;
  observacoes?: string;
  createdBy?: string;
}

export interface UpdateRelacaoInput {
  tipoRelacao?: TipoRelacao;
  volumeEstimado?: string;
  observacoes?: string;
}

export interface RelacaoFilters {
  contextoId?: number;
  produtoId?: number;
  tipoRelacao?: TipoRelacao | TipoRelacao[];
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
 * Criar nova relação contexto-produto
 */
export async function createRelacao(input: CreateRelacaoInput) {
  // Validações
  if (!input.contextoId) {
    throw new Error('Contexto ID é obrigatório');
  }

  if (!input.produtoId) {
    throw new Error('Produto ID é obrigatório');
  }

  // Verificar se já existe relação
  const relacaoExistente = await getRelacaoByContextoProduto(
    input.contextoId,
    input.produtoId
  );

  if (relacaoExistente) {
    throw new Error('Já existe uma relação entre este contexto e produto');
  }

  const [novaRelacao] = await db
    .insert(fatoEntidadeProduto)
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
    .from(fatoEntidadeProduto)
    .where(eq(fatoEntidadeProduto.id, id))
    .limit(1);

  return relacao || null;
}

/**
 * Buscar relações com filtros e paginação
 */
export async function getRelacoes(
  filters: RelacaoFilters = {}
): Promise<ResultadoPaginado<typeof fatoEntidadeProduto.$inferSelect>> {
  const {
    contextoId,
    produtoId,
    tipoRelacao,
    orderBy = 'created_at',
    orderDirection = 'desc',
    page = 1,
    limit = 50,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (contextoId) {
    conditions.push(eq(fatoEntidadeProduto.contextoId, contextoId));
  }

  if (produtoId) {
    conditions.push(eq(fatoEntidadeProduto.produtoId, produtoId));
  }

  if (tipoRelacao) {
    if (Array.isArray(tipoRelacao)) {
      conditions.push(
        and(...tipoRelacao.map((t) => eq(fatoEntidadeProduto.tipoRelacao, t)))
      );
    } else {
      conditions.push(eq(fatoEntidadeProduto.tipoRelacao, tipoRelacao));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(fatoEntidadeProduto)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn =
    (fatoEntidadeProduto as any)[orderBy] || fatoEntidadeProduto.createdAt;
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(fatoEntidadeProduto)
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
    .update(fatoEntidadeProduto)
    .set(input)
    .where(eq(fatoEntidadeProduto.id, id))
    .returning();

  return relacaoAtualizada;
}

/**
 * Deletar relação (hard delete)
 */
export async function deleteRelacao(id: number) {
  await db.delete(fatoEntidadeProduto).where(eq(fatoEntidadeProduto.id, id));

  return { success: true };
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Buscar relação por contexto + produto
 */
async function getRelacaoByContextoProduto(contextoId: number, produtoId: number) {
  const [relacao] = await db
    .select()
    .from(fatoEntidadeProduto)
    .where(
      and(
        eq(fatoEntidadeProduto.contextoId, contextoId),
        eq(fatoEntidadeProduto.produtoId, produtoId)
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
 * Listar relações por produto
 */
export async function getRelacoesByProduto(produtoId: number) {
  return getRelacoes({ produtoId });
}

/**
 * Buscar produtos de um contexto com JOIN
 */
export async function getProdutosDeContexto(contextoId: number) {
  const resultados = await db
    .select({
      relacao: fatoEntidadeProduto,
      produto: dimProduto,
    })
    .from(fatoEntidadeProduto)
    .innerJoin(dimProduto, eq(fatoEntidadeProduto.produtoId, dimProduto.id))
    .where(eq(fatoEntidadeProduto.contextoId, contextoId));

  return resultados;
}

/**
 * Adicionar múltiplos produtos a um contexto
 */
export async function adicionarProdutosAoContexto(
  contextoId: number,
  produtos: Array<{
    produtoId: number;
    tipoRelacao?: TipoRelacao;
    volumeEstimado?: string;
    observacoes?: string;
  }>,
  createdBy?: string
) {
  const relacoes = [];

  for (const produto of produtos) {
    try {
      const relacao = await createRelacao({
        contextoId,
        ...produto,
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
 * Contar produtos por tipo de relação
 */
export async function contarProdutosPorTipoRelacao(contextoId?: number) {
  const conditions = [];

  if (contextoId) {
    conditions.push(eq(fatoEntidadeProduto.contextoId, contextoId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const resultados = await db
    .select({
      tipoRelacao: fatoEntidadeProduto.tipoRelacao,
      total: count(),
    })
    .from(fatoEntidadeProduto)
    .where(whereClause)
    .groupBy(fatoEntidadeProduto.tipoRelacao);

  return resultados;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Validar tipo de relação
 */
export function validarTipoRelacao(tipo: string): boolean {
  const tiposValidos: TipoRelacao[] = [
    'fabrica',
    'comercializa',
    'distribui',
    'usa',
    'revende',
    'importa',
    'exporta',
    'outro',
  ];

  return tiposValidos.includes(tipo as TipoRelacao);
}

/**
 * Obter descrição do tipo de relação
 */
export function getDescricaoTipoRelacao(tipo: TipoRelacao): string {
  const descricoes: Record<TipoRelacao, string> = {
    fabrica: 'Fabrica o produto',
    comercializa: 'Comercializa o produto',
    distribui: 'Distribui o produto',
    usa: 'Usa o produto',
    revende: 'Revende o produto',
    importa: 'Importa o produto',
    exporta: 'Exporta o produto',
    outro: 'Outro tipo de relação',
  };

  return descricoes[tipo] || 'Tipo desconhecido';
}
