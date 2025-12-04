/**
 * DAL para dim_entidade
 * Gerencia entidades únicas (clientes, leads, concorrentes)
 * 
 * Business Rules:
 * - CNPJ único (se fornecido)
 * - Hash único (MD5 de CNPJ ou nome+cidade+uf)
 * - Tipo: cliente, lead, concorrente
 * - Origem rastreável
 * - Deduplicação > 60% similaridade
 */

import { db } from '../../db';
import { dimEntidade } from '../../../drizzle/schema';
import { eq, and, or, like, desc, asc, count, isNull, sql } from 'drizzle-orm';
import { createHash } from 'crypto';

// ============================================================================
// TIPOS
// ============================================================================

export type TipoEntidade = 'cliente' | 'lead' | 'concorrente';
export type OrigemTipo = 'importacao' | 'ia_prompt' | 'api' | 'manual';

export interface CreateEntidadeInput {
  tipoEntidade: TipoEntidade;
  nome: string;
  nomeFantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  site?: string;
  numFiliais?: number;
  numLojas?: number;
  numFuncionarios?: number;
  origemTipo: OrigemTipo;
  origemArquivo?: string;
  origemProcesso?: string;
  origemPrompt?: string;
  origemConfianca?: number;
  origemUsuarioId?: string;
  importacaoId?: number;
  createdBy?: string;
}

export interface UpdateEntidadeInput {
  tipoEntidade?: TipoEntidade;
  nome?: string;
  nomeFantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  site?: string;
  numFiliais?: number;
  numLojas?: number;
  numFuncionarios?: number;
  updatedBy?: string;
}

export interface EntidadeFilters {
  tipoEntidade?: TipoEntidade | TipoEntidade[];
  origemTipo?: OrigemTipo | OrigemTipo[];
  busca?: string;
  cnpj?: string;
  statusQualificacaoId?: number;
  projetoId?: number;
  pesquisaId?: number;
  orderBy?: 'nome' | 'created_at';
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
 * Criar nova entidade
 */
export async function createEntidade(input: CreateEntidadeInput) {
  // Validações
  if (!input.nome || input.nome.trim() === '') {
    throw new Error('Nome da entidade é obrigatório');
  }

  if (!input.tipoEntidade) {
    throw new Error('Tipo de entidade é obrigatório');
  }

  if (!['cliente', 'lead', 'concorrente'].includes(input.tipoEntidade)) {
    throw new Error('Tipo de entidade inválido');
  }

  if (!input.origemTipo) {
    throw new Error('Origem tipo é obrigatório');
  }

  // Validar CNPJ se fornecido
  if (input.cnpj) {
    const cnpjLimpo = limparCNPJ(input.cnpj);
    if (!validarCNPJ(cnpjLimpo)) {
      throw new Error('CNPJ inválido');
    }

    // Verificar CNPJ único
    const entidadeExistente = await getEntidadeByCNPJ(cnpjLimpo);
    if (entidadeExistente) {
      throw new Error(`Já existe uma entidade com o CNPJ ${input.cnpj}`);
    }

    input.cnpj = cnpjLimpo;
  }

  // Gerar hash único
  const entidadeHash = gerarHashEntidade(input);

  // Verificar hash único
  const entidadePorHash = await getEntidadeByHash(entidadeHash);
  if (entidadePorHash) {
    throw new Error('Já existe uma entidade com os mesmos dados');
  }

  const [novaEntidade] = await db
    .insert(dimEntidade)
    .values({
      ...input,
      entidadeHash,
      origemData: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return novaEntidade;
}

/**
 * Buscar entidade por ID
 */
export async function getEntidadeById(id: number, incluirDeletados = false) {
  const conditions = [eq(dimEntidade.id, id)];

  if (!incluirDeletados) {
    conditions.push(isNull(dimEntidade.deletedAt));
  }

  const [entidade] = await db
    .select()
    .from(dimEntidade)
    .where(and(...conditions))
    .limit(1);

  return entidade || null;
}

/**
 * Buscar entidades com filtros e paginação
 */
export async function getEntidades(
  filters: EntidadeFilters = {}
): Promise<ResultadoPaginado<typeof dimEntidade.$inferSelect>> {
  const {
    tipoEntidade,
    origemTipo,
    busca,
    cnpj,
    statusQualificacaoId,
    projetoId,
    pesquisaId,
    orderBy = 'created_at',
    orderDirection = 'desc',
    page = 1,
    limit = 50,
    incluirDeletados = false,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (!incluirDeletados) {
    conditions.push(isNull(dimEntidade.deletedAt));
  }

  if (tipoEntidade) {
    if (Array.isArray(tipoEntidade)) {
      conditions.push(or(...tipoEntidade.map((t) => eq(dimEntidade.tipoEntidade, t))));
    } else {
      conditions.push(eq(dimEntidade.tipoEntidade, tipoEntidade));
    }
  }

  if (origemTipo) {
    if (Array.isArray(origemTipo)) {
      conditions.push(or(...origemTipo.map((o) => eq(dimEntidade.origemTipo, o))));
    } else {
      conditions.push(eq(dimEntidade.origemTipo, origemTipo));
    }
  }

  if (cnpj) {
    conditions.push(eq(dimEntidade.cnpj, limparCNPJ(cnpj)));
  }

  if (busca) {
    conditions.push(
      or(
        like(dimEntidade.nome, `%${busca}%`),
        like(dimEntidade.nomeFantasia, `%${busca}%`),
        like(dimEntidade.cnpj, `%${busca}%`),
        like(dimEntidade.email, `%${busca}%`)
      )
    );
  }

  if (statusQualificacaoId) {
    conditions.push(eq(dimEntidade.statusQualificacaoId, statusQualificacaoId));
  }

  // TODO: Adicionar filtros por projeto e pesquisa quando houver relacionamento

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(dimEntidade)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = (dimEntidade as any)[orderBy] || dimEntidade.createdAt;
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(dimEntidade)
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
 * Atualizar entidade
 */
export async function updateEntidade(id: number, input: UpdateEntidadeInput) {
  // Verificar se entidade existe
  const entidadeExistente = await getEntidadeById(id);
  if (!entidadeExistente) {
    throw new Error(`Entidade com ID ${id} não encontrada`);
  }

  // Validar CNPJ se mudou
  if (input.cnpj && input.cnpj !== entidadeExistente.cnpj) {
    const cnpjLimpo = limparCNPJ(input.cnpj);
    if (!validarCNPJ(cnpjLimpo)) {
      throw new Error('CNPJ inválido');
    }

    const entidadePorCNPJ = await getEntidadeByCNPJ(cnpjLimpo);
    if (entidadePorCNPJ && entidadePorCNPJ.id !== id) {
      throw new Error(`Já existe uma entidade com o CNPJ ${input.cnpj}`);
    }

    input.cnpj = cnpjLimpo;
  }

  const [entidadeAtualizada] = await db
    .update(dimEntidade)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dimEntidade.id, id))
    .returning();

  return entidadeAtualizada;
}

/**
 * Deletar entidade (soft delete)
 */
export async function deleteEntidade(id: number, deletedBy?: string) {
  const [entidadeDeletada] = await db
    .update(dimEntidade)
    .set({
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
    })
    .where(eq(dimEntidade.id, id))
    .returning();

  return entidadeDeletada;
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Buscar entidade por CNPJ
 */
export async function getEntidadeByCNPJ(cnpj: string, incluirDeletados = false) {
  const cnpjLimpo = limparCNPJ(cnpj);
  const conditions = [eq(dimEntidade.cnpj, cnpjLimpo)];

  if (!incluirDeletados) {
    conditions.push(isNull(dimEntidade.deletedAt));
  }

  const [entidade] = await db
    .select()
    .from(dimEntidade)
    .where(and(...conditions))
    .limit(1);

  return entidade || null;
}

/**
 * Buscar entidade por hash
 */
export async function getEntidadeByHash(hash: string, incluirDeletados = false) {
  const conditions = [eq(dimEntidade.entidadeHash, hash)];

  if (!incluirDeletados) {
    conditions.push(isNull(dimEntidade.deletedAt));
  }

  const [entidade] = await db
    .select()
    .from(dimEntidade)
    .where(and(...conditions))
    .limit(1);

  return entidade || null;
}

/**
 * Buscar ou criar entidade (upsert)
 */
export async function buscarOuCriarEntidade(input: CreateEntidadeInput): Promise<{
  entidade: typeof dimEntidade.$inferSelect;
  criada: boolean;
}> {
  // Se tem CNPJ, buscar por CNPJ
  if (input.cnpj) {
    const cnpjLimpo = limparCNPJ(input.cnpj);
    const existente = await getEntidadeByCNPJ(cnpjLimpo);
    if (existente) {
      return { entidade: existente, criada: false };
    }
  }

  // Se não tem CNPJ, buscar por hash
  const hash = gerarHashEntidade(input);
  const existentePorHash = await getEntidadeByHash(hash);
  if (existentePorHash) {
    return { entidade: existentePorHash, criada: false };
  }

  // Se não encontrou, criar nova
  const nova = await createEntidade(input);
  return { entidade: nova, criada: true };
}

/**
 * Sugerir entidades similares para merge (> 60% similaridade)
 */
export async function sugerirMergeEntidades(
  entidadeId: number,
  threshold = 60
): Promise<Array<{ entidade: typeof dimEntidade.$inferSelect; similaridade: number }>> {
  const entidade = await getEntidadeById(entidadeId);
  if (!entidade) {
    throw new Error(`Entidade com ID ${entidadeId} não encontrada`);
  }

  // Buscar entidades do mesmo tipo
  const { data: candidatos } = await getEntidades({
    tipoEntidade: entidade.tipoEntidade,
    limit: 100,
  });

  // Calcular similaridade
  const similares = candidatos
    .filter((c) => c.id !== entidadeId)
    .map((c) => ({
      entidade: c,
      similaridade: calcularSimilaridadeEntidades(entidade, c),
    }))
    .filter((s) => s.similaridade >= threshold)
    .sort((a, b) => b.similaridade - a.similaridade);

  return similares;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Gerar hash único para entidade
 */
export function gerarHashEntidade(input: { cnpj?: string; nome: string }): string {
  if (input.cnpj) {
    const cnpjLimpo = limparCNPJ(input.cnpj);
    return createHash('md5').update(cnpjLimpo).digest('hex');
  }

  // Se não tem CNPJ, usar nome (normalizado)
  const nomeNormalizado = input.nome.toLowerCase().trim();
  return createHash('md5').update(nomeNormalizado).digest('hex');
}

/**
 * Limpar CNPJ (remover pontuação)
 */
function limparCNPJ(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, '');
}

/**
 * Validar CNPJ (formato e dígitos verificadores)
 */
function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = limparCNPJ(cnpj);

  if (cnpjLimpo.length !== 14) {
    return false;
  }

  // Validação básica (todos iguais)
  if (/^(\d)\1+$/.test(cnpjLimpo)) {
    return false;
  }

  // Validar dígitos verificadores
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) {
    return false;
  }

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) {
    return false;
  }

  return true;
}

/**
 * Calcular similaridade entre duas entidades (0-100)
 */
function calcularSimilaridadeEntidades(
  e1: typeof dimEntidade.$inferSelect,
  e2: typeof dimEntidade.$inferSelect
): number {
  let score = 0;
  let checks = 0;

  // Nome (peso 40%)
  if (e1.nome && e2.nome) {
    const simNome = calcularSimilaridadeLevenshtein(
      e1.nome.toLowerCase(),
      e2.nome.toLowerCase()
    );
    score += simNome * 0.4;
    checks++;
  }

  // CNPJ (peso 30%)
  if (e1.cnpj && e2.cnpj) {
    if (e1.cnpj === e2.cnpj) {
      score += 30;
    }
    checks++;
  }

  // Email (peso 15%)
  if (e1.email && e2.email) {
    if (e1.email.toLowerCase() === e2.email.toLowerCase()) {
      score += 15;
    }
    checks++;
  }

  // Telefone (peso 15%)
  if (e1.telefone && e2.telefone) {
    const tel1 = e1.telefone.replace(/\D/g, '');
    const tel2 = e2.telefone.replace(/\D/g, '');
    if (tel1 === tel2) {
      score += 15;
    }
    checks++;
  }

  return checks > 0 ? Math.round(score) : 0;
}

/**
 * Calcular similaridade de Levenshtein (0-100)
 */
function calcularSimilaridadeLevenshtein(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = ((maxLen - distance) / maxLen) * 100;

  return Math.round(similarity);
}
