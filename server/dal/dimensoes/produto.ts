/**
 * DAL para dim_produto
 * Gerencia produtos com categorização
 * 
 * Business Rules:
 * - Hash único (MD5 de nome+categoria)
 * - Ativo/inativo
 */

import { db } from '../../db';
import { getOrderColumn } from '../../helpers/order-by';
import { dimProduto } from '../../../drizzle/schema';
import { eq, and, or, like, desc, asc, count, isNull } from 'drizzle-orm';
import { createHash } from 'crypto';

// ============================================================================
// TIPOS
// ============================================================================

export interface CreateProdutoInput {
  nome: string;
  categoria?: string;
  descricao?: string;
  ativo?: boolean;
  createdBy?: string;
}

export interface UpdateProdutoInput {
  nome?: string;
  categoria?: string;
  descricao?: string;
  ativo?: boolean;
  updatedBy?: string;
}

export interface ProdutoFilters {
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
 * Criar novo produto
 */
export async function createProduto(input: CreateProdutoInput) {
  // Validações
  if (!input.nome || input.nome.trim() === '') {
    throw new Error('Nome do produto é obrigatório');
  }

  // Gerar hash único
  const produtoHash = gerarHashProduto(input.nome, input.categoria || '');

  // Verificar hash único
  const produtoExistente = await getProdutoByHash(produtoHash);
  if (produtoExistente) {
    throw new Error('Já existe um produto com o mesmo nome e categoria');
  }

  const [novoProduto] = await db
    .insert(dimProduto)
    .values({
      ...input,
      produtoHash,
      ativo: input.ativo !== undefined ? input.ativo : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return novoProduto;
}

/**
 * Buscar produto por ID
 */
export async function getProdutoById(id: number) {
  const [produto] = await db
    .select()
    .from(dimProduto)
    .where(eq(dimProduto.id, id))
    .limit(1);

  return produto || null;
}

/**
 * Buscar produtos com filtros e paginação
 */
export async function getProdutos(
  filters: ProdutoFilters = {}
): Promise<ResultadoPaginado<typeof dimProduto.$inferSelect>> {
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
    conditions.push(eq(dimProduto.ativo, ativo));
  }

  if (categoria) {
    if (Array.isArray(categoria)) {
      conditions.push(or(...categoria.map((c) => eq(dimProduto.categoria, c))));
    } else {
      conditions.push(eq(dimProduto.categoria, categoria));
    }
  }

  if (busca) {
    conditions.push(
      or(
        like(dimProduto.nome, `%${busca}%`),
        like(dimProduto.categoria, `%${busca}%`),
        like(dimProduto.descricao, `%${busca}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(dimProduto)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = getOrderColumn(dimProduto, orderBy, dimProduto.nome);
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(dimProduto)
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
 * Atualizar produto
 */
export async function updateProduto(id: number, input: UpdateProdutoInput) {
  // Verificar se produto existe
  const produtoExistente = await getProdutoById(id);
  if (!produtoExistente) {
    throw new Error(`Produto com ID ${id} não encontrado`);
  }

  // Se mudou nome ou categoria, verificar hash único
  if (input.nome || input.categoria) {
    const novoNome = input.nome || produtoExistente.nome;
    const novaCategoria = input.categoria || produtoExistente.categoria || '';
    const novoHash = gerarHashProduto(novoNome, novaCategoria);

    if (novoHash !== produtoExistente.produtoHash) {
      const produtoPorHash = await getProdutoByHash(novoHash);
      if (produtoPorHash && produtoPorHash.id !== id) {
        throw new Error('Já existe um produto com o mesmo nome e categoria');
      }
    }
  }

  const [produtoAtualizado] = await db
    .update(dimProduto)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dimProduto.id, id))
    .returning();

  return produtoAtualizado;
}

/**
 * Deletar produto (hard delete)
 * Apenas se não estiver sendo usado
 */
export async function deleteProduto(id: number) {
  // TODO: Verificar se produto está sendo usado em fato_entidade_produto
  // Por enquanto, apenas deletar

  await db.delete(dimProduto).where(eq(dimProduto.id, id));

  return { success: true };
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Buscar produto por hash
 */
export async function getProdutoByHash(hash: string) {
  const [produto] = await db
    .select()
    .from(dimProduto)
    .where(eq(dimProduto.produtoHash, hash))
    .limit(1);

  return produto || null;
}

/**
 * Buscar ou criar produto (upsert)
 */
export async function buscarOuCriarProduto(input: CreateProdutoInput): Promise<{
  produto: typeof dimProduto.$inferSelect;
  criado: boolean;
}> {
  const hash = gerarHashProduto(input.nome, input.categoria || '');
  const existente = await getProdutoByHash(hash);

  if (existente) {
    return { produto: existente, criado: false };
  }

  const novo = await createProduto(input);
  return { produto: novo, criado: true };
}

/**
 * Listar produtos ativos
 */
export async function getProdutosAtivos() {
  return getProdutos({ ativo: true });
}

/**
 * Listar produtos por categoria
 */
export async function getProdutosByCategoria(categoria: string) {
  return getProdutos({ categoria });
}

/**
 * Listar categorias únicas
 */
export async function getCategorias(): Promise<string[]> {
  const resultados = await db
    .selectDistinct({ categoria: dimProduto.categoria })
    .from(dimProduto)
    .where(isNull(dimProduto.categoria))
    .orderBy(asc(dimProduto.categoria));

  return resultados.map((r) => r.categoria).filter((c) => c !== null) as string[];
}

/**
 * Ativar produto
 */
export async function ativarProduto(id: number, updatedBy?: string) {
  return updateProduto(id, {
    ativo: true,
    updatedBy,
  });
}

/**
 * Inativar produto
 */
export async function inativarProduto(id: number, updatedBy?: string) {
  return updateProduto(id, {
    ativo: false,
    updatedBy,
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Gerar hash único para produto
 */
export function gerarHashProduto(nome: string, categoria: string): string {
  const nomeNormalizado = nome.toLowerCase().trim();
  const categoriaNormalizada = categoria.toLowerCase().trim();
  const chave = `${nomeNormalizado}|${categoriaNormalizada}`;

  return createHash('md5').update(chave).digest('hex');
}
