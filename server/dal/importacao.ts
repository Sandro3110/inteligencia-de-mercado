import { db } from '../db';
import { dim_importacao, importacao_erros, dim_entidade } from '../../drizzle/schema';
import { eq, desc, and, sql, count } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateImportacaoInput {
  projetoId: number;
  pesquisaId: number;
  nomeArquivo: string;
  tipoArquivo: 'csv' | 'xlsx';
  tamanhoBytes?: number;
  totalLinhas: number;
  mapeamentoColunas?: Record<string, string>;
  opcoes?: Record<string, any>;
  createdBy: string;
}

export interface UpdateImportacaoInput {
  linhasProcessadas?: number;
  linhasSucesso?: number;
  linhasErro?: number;
  linhasDuplicadas?: number;
  linhasGeografiaFuzzy?: number;
  status?: 'pendente' | 'processando' | 'concluido' | 'falhou' | 'cancelado';
  erroMensagem?: string;
  progressoPercentual?: number;
  startedAt?: Date;
  completedAt?: Date;
  durationSeconds?: number;
  updatedBy?: string;
}

export interface CreateErroInput {
  importacaoId: number;
  linhaNumero: number;
  linhaDados: Record<string, any>;
  campoErro?: string;
  tipoErro: 'validacao' | 'duplicata' | 'fk' | 'geografia' | 'outro';
  mensagemErro: string;
  sugestaoCorrecao?: Record<string, any>;
}

// ============================================================================
// CRUD - Importação
// ============================================================================

export async function createImportacao(input: CreateImportacaoInput) {
  const [importacao] = await db
    .insert(dim_importacao)
    .values({
      ...input,
      mapeamentoColunas: input.mapeamentoColunas ? JSON.stringify(input.mapeamentoColunas) : null,
      opcoes: input.opcoes ? JSON.stringify(input.opcoes) : null,
    })
    .returning();

  return importacao;
}

export async function getImportacaoById(id: number) {
  const importacao = await db.query.dim_importacao.findFirst({
    where: eq(dim_importacao.id, id),
  });

  if (!importacao) return null;

  return {
    ...importacao,
    mapeamentoColunas: importacao.mapeamentoColunas
      ? JSON.parse(importacao.mapeamentoColunas)
      : null,
    opcoes: importacao.opcoes ? JSON.parse(importacao.opcoes) : null,
  };
}

export async function getImportacoes(filters?: {
  projetoId?: number;
  pesquisaId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (filters?.projetoId) {
    conditions.push(eq(dim_importacao.projetoId, filters.projetoId));
  }

  if (filters?.pesquisaId) {
    conditions.push(eq(dim_importacao.pesquisaId, filters.pesquisaId));
  }

  if (filters?.status) {
    conditions.push(eq(dim_importacao.status, filters.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const importacoes = await db.query.dim_importacao.findMany({
    where,
    orderBy: [desc(dim_importacao.createdAt)],
    limit: filters?.limit || 20,
    offset: filters?.offset || 0,
  });

  return importacoes.map((imp) => ({
    ...imp,
    mapeamentoColunas: imp.mapeamentoColunas ? JSON.parse(imp.mapeamentoColunas) : null,
    opcoes: imp.opcoes ? JSON.parse(imp.opcoes) : null,
  }));
}

export async function updateImportacao(id: number, input: UpdateImportacaoInput) {
  const [updated] = await db
    .update(dim_importacao)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(dim_importacao.id, id))
    .returning();

  return updated;
}

export async function deleteImportacao(id: number) {
  await db.delete(dim_importacao).where(eq(dim_importacao.id, id));
}

// ============================================================================
// CONTROLE DE EXECUÇÃO
// ============================================================================

export async function iniciarImportacao(id: number, userId: string) {
  return await updateImportacao(id, {
    status: 'processando',
    startedAt: new Date(),
    progressoPercentual: 0,
    updatedBy: userId,
  });
}

export async function concluirImportacao(id: number, userId: string) {
  const importacao = await getImportacaoById(id);
  if (!importacao) throw new Error('Importação não encontrada');

  const duration = importacao.startedAt
    ? Math.floor((Date.now() - importacao.startedAt.getTime()) / 1000)
    : 0;

  return await updateImportacao(id, {
    status: 'concluido',
    completedAt: new Date(),
    durationSeconds: duration,
    progressoPercentual: 100,
    updatedBy: userId,
  });
}

export async function falharImportacao(id: number, erro: string, userId: string) {
  return await updateImportacao(id, {
    status: 'falhou',
    erroMensagem: erro,
    completedAt: new Date(),
    updatedBy: userId,
  });
}

export async function cancelarImportacao(id: number, userId: string) {
  return await updateImportacao(id, {
    status: 'cancelado',
    completedAt: new Date(),
    updatedBy: userId,
  });
}

export async function atualizarProgresso(
  id: number,
  linhasProcessadas: number,
  linhasSucesso: number,
  linhasErro: number,
  linhasDuplicadas: number
) {
  const importacao = await getImportacaoById(id);
  if (!importacao) throw new Error('Importação não encontrada');

  const percentual = Math.floor((linhasProcessadas / importacao.totalLinhas) * 100);

  return await updateImportacao(id, {
    linhasProcessadas,
    linhasSucesso,
    linhasErro,
    linhasDuplicadas,
    progressoPercentual: percentual,
  });
}

// ============================================================================
// ERROS
// ============================================================================

export async function createErro(input: CreateErroInput) {
  const [erro] = await db
    .insert(importacao_erros)
    .values({
      ...input,
      linhaDados: JSON.stringify(input.linhaDados),
      sugestaoCorrecao: input.sugestaoCorrecao ? JSON.stringify(input.sugestaoCorrecao) : null,
    })
    .returning();

  return erro;
}

export async function getErrosByImportacao(importacaoId: number, limit = 100) {
  const erros = await db.query.importacao_erros.findMany({
    where: eq(importacao_erros.importacaoId, importacaoId),
    limit,
  });

  return erros.map((erro) => ({
    ...erro,
    linhaDados: JSON.parse(erro.linhaDados),
    sugestaoCorrecao: erro.sugestaoCorrecao ? JSON.parse(erro.sugestaoCorrecao) : null,
  }));
}

export async function countErrosByTipo(importacaoId: number) {
  const result = await db
    .select({
      tipoErro: importacao_erros.tipoErro,
      total: count(),
    })
    .from(importacao_erros)
    .where(eq(importacao_erros.importacaoId, importacaoId))
    .groupBy(importacao_erros.tipoErro);

  return result;
}

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

export async function getEstatisticasImportacao(id: number) {
  const importacao = await getImportacaoById(id);
  if (!importacao) return null;

  const errosPorTipo = await countErrosByTipo(id);

  return {
    totalLinhas: importacao.totalLinhas,
    linhasProcessadas: importacao.linhasProcessadas || 0,
    linhasSucesso: importacao.linhasSucesso || 0,
    linhasErro: importacao.linhasErro || 0,
    linhasDuplicadas: importacao.linhasDuplicadas || 0,
    linhasGeografiaFuzzy: importacao.linhasGeografiaFuzzy || 0,
    progressoPercentual: importacao.progressoPercentual || 0,
    status: importacao.status,
    durationSeconds: importacao.durationSeconds,
    errosPorTipo,
  };
}

export async function getEntidadesByImportacao(importacaoId: number, limit = 100) {
  const entidades = await db.query.dim_entidade.findMany({
    where: eq(dim_entidade.importacaoId, importacaoId),
    limit,
  });

  return entidades;
}

// ============================================================================
// HELPERS
// ============================================================================

export function calcularTaxaSucesso(importacao: any): number {
  if (!importacao.totalLinhas) return 0;
  return Math.floor((importacao.linhasSucesso / importacao.totalLinhas) * 100);
}

export function calcularTaxaErro(importacao: any): number {
  if (!importacao.totalLinhas) return 0;
  return Math.floor((importacao.linhasErro / importacao.totalLinhas) * 100);
}

export function getStatusColor(status: string): string {
  const cores: Record<string, string> = {
    pendente: '#6b7280',
    processando: '#3b82f6',
    concluido: '#22c55e',
    falhou: '#ef4444',
    cancelado: '#f59e0b',
  };
  return cores[status] || '#6b7280';
}
