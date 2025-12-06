/**
 * DAL para dim_produto_old_backup
 * Sincronizado 100% com schema (22 campos)
 * TABELA DE BACKUP - Não usar em produção
 */

import { db } from '../../db';
import { dim_produto_old_backup } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

export interface ProdutoOldBackupFilters {
  id?: number;
  entidade_id?: number;
  nome?: string;
  categoria?: string;
  status?: string;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_produto_old_backup;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateProdutoOldBackupData {
  entidade_id: number;
  nome: string;
  categoria?: string;
  descricao?: string;
  preco?: string;
  moeda?: string;
  disponibilidade?: string;
  especificacoes_tecnicas?: string;
  diferenciais_competitivos?: string;
  created_by: string;
  publico_alvo?: string;
  canais_distribuicao?: string;
  status?: string;
  data_lancamento?: Date;
  ciclo_vida?: string;
  margem_lucro?: string;
}

export interface UpdateProdutoOldBackupData {
  nome?: string;
  categoria?: string;
  descricao?: string;
  preco?: string;
  moeda?: string;
  disponibilidade?: string;
  especificacoes_tecnicas?: string;
  diferenciais_competitivos?: string;
  updated_by?: string;
  publico_alvo?: string;
  canais_distribuicao?: string;
  status?: string;
  data_lancamento?: Date;
  ciclo_vida?: string;
  margem_lucro?: string;
}

export async function getProdutosOldBackup(filters: ProdutoOldBackupFilters = {}) {
  const conditions: any[] = [];
  if (filters.id) conditions.push(eq(dim_produto_old_backup.id, filters.id));
  if (filters.entidade_id) conditions.push(eq(dim_produto_old_backup.entidade_id, filters.entidade_id));
  if (filters.nome) conditions.push(like(dim_produto_old_backup.nome, `%${filters.nome}%`));
  if (filters.categoria) conditions.push(eq(dim_produto_old_backup.categoria, filters.categoria));
  if (filters.status) conditions.push(eq(dim_produto_old_backup.status, filters.status));
  if (!filters.incluirInativos) conditions.push(isNull(dim_produto_old_backup.deleted_at));

  let query = db.select().from(dim_produto_old_backup).where(conditions.length > 0 ? and(...conditions) : undefined);

  if (filters.orderBy) {
    const orderColumn = dim_produto_old_backup[filters.orderBy];
    if (orderColumn) query = query.orderBy(filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)) as any;
  } else {
    query = query.orderBy(desc(dim_produto_old_backup.created_at)) as any;
  }

  if (filters.limit) query = query.limit(filters.limit) as any;
  if (filters.offset) query = query.offset(filters.offset) as any;

  return query;
}

export async function getProdutoOldBackupById(id: number) {
  const result = await db.select().from(dim_produto_old_backup).where(and(eq(dim_produto_old_backup.id, id), isNull(dim_produto_old_backup.deleted_at))).limit(1);
  return result[0] || null;
}

export async function createProdutoOldBackup(data: CreateProdutoOldBackupData) {
  const result = await db.insert(dim_produto_old_backup).values({ ...data, created_at: sql`now()`, updated_at: sql`now()` }).returning();
  return result[0];
}

export async function updateProdutoOldBackup(id: number, data: UpdateProdutoOldBackupData) {
  const result = await db.update(dim_produto_old_backup).set({ ...data, updated_at: sql`now()` }).where(eq(dim_produto_old_backup.id, id)).returning();
  return result[0] || null;
}

export async function deleteProdutoOldBackup(id: number, deleted_by?: string) {
  const result = await db.update(dim_produto_old_backup).set({ deleted_at: sql`now()`, deleted_by }).where(eq(dim_produto_old_backup.id, id)).returning();
  return result[0] || null;
}

export async function countProdutosOldBackup(filters: ProdutoOldBackupFilters = {}) {
  const conditions: any[] = [];
  if (filters.entidade_id) conditions.push(eq(dim_produto_old_backup.entidade_id, filters.entidade_id));
  if (!filters.incluirInativos) conditions.push(isNull(dim_produto_old_backup.deleted_at));
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(dim_produto_old_backup).where(conditions.length > 0 ? and(...conditions) : undefined);
  return result[0]?.count || 0;
}
