/**
 * DAL para audit_logs
 * Gerencia histórico de alterações em todas as tabelas
 * 
 * Business Rules:
 * - Todos os INSERTs, UPDATEs e DELETEs são rastreados
 * - Dados anteriores e novos são armazenados em JSON
 * - Campos alterados são listados
 * - Usuário responsável é rastreado
 * - Retenção padrão: 365 dias
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export type TipoOperacao = 'INSERT' | 'UPDATE' | 'DELETE';

export type TabelaAuditada =
  | 'dim_entidade'
  | 'dim_produto'
  | 'dim_mercado'
  | 'dim_produto_catalogo'
  | 'fato_entidade_produto'
  | 'fato_produto_mercado'
  | 'fato_entidade_contexto'
  | 'dim_importacao';

export interface AuditLog {
  id: number;
  tabela: TabelaAuditada;
  operacao: TipoOperacao;
  registro_id: number;
  dados_anteriores: any | null;
  dados_novos: any | null;
  campos_alterados: string[] | null;
  usuario_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface AuditLogRecente extends AuditLog {
  nome_registro: string | null;
}

export interface AuditStats {
  tabela: TabelaAuditada;
  operacao: TipoOperacao;
  total_operacoes: number;
  usuarios_distintos: number;
  primeira_operacao: Date;
  ultima_operacao: Date;
}

export interface HistoricoOptions {
  tabela: TabelaAuditada;
  registroId: number;
  limite?: number;
}

export interface CompareVersionsOptions {
  tabela: TabelaAuditada;
  registroId: number;
  version1Id: number;
  version2Id: number;
}

// ============================================================================
// CONSULTAS
// ============================================================================

/**
 * Buscar logs recentes (últimas 24h)
 */
export async function getLogsRecentes(limite: number = 100): Promise<AuditLogRecente[]> {
  const result = await db.execute(sql`
    SELECT * FROM v_audit_logs_recentes
    LIMIT ${limite}
  `);

  return result.rows as AuditLogRecente[];
}

/**
 * Buscar histórico de um registro específico
 */
export async function getHistoricoRegistro(
  options: HistoricoOptions
): Promise<AuditLog[]> {
  const { tabela, registroId, limite = 50 } = options;

  const result = await db.execute(sql`
    SELECT * FROM get_audit_history(
      ${tabela},
      ${registroId},
      ${limite}
    )
  `);

  return result.rows as AuditLog[];
}

/**
 * Buscar histórico de entidade específica
 */
export async function getHistoricoEntidade(
  entidadeId: number,
  limite: number = 50
): Promise<AuditLog[]> {
  const result = await db.execute(sql`
    SELECT * FROM v_audit_entidade_historico
    WHERE entidade_id = ${entidadeId}
    LIMIT ${limite}
  `);

  return result.rows as AuditLog[];
}

/**
 * Buscar logs por usuário
 */
export async function getLogsByUsuario(
  usuarioId: string,
  limite: number = 100
): Promise<AuditLog[]> {
  const result = await db.execute(sql`
    SELECT * FROM audit_logs
    WHERE usuario_id = ${usuarioId}
    ORDER BY created_at DESC
    LIMIT ${limite}
  `);

  return result.rows as AuditLog[];
}

/**
 * Buscar logs por tabela
 */
export async function getLogsByTabela(
  tabela: TabelaAuditada,
  limite: number = 100
): Promise<AuditLog[]> {
  const result = await db.execute(sql`
    SELECT * FROM audit_logs
    WHERE tabela = ${tabela}
    ORDER BY created_at DESC
    LIMIT ${limite}
  `);

  return result.rows as AuditLog[];
}

/**
 * Buscar logs por operação
 */
export async function getLogsByOperacao(
  operacao: TipoOperacao,
  limite: number = 100
): Promise<AuditLog[]> {
  const result = await db.execute(sql`
    SELECT * FROM audit_logs
    WHERE operacao = ${operacao}
    ORDER BY created_at DESC
    LIMIT ${limite}
  `);

  return result.rows as AuditLog[];
}

/**
 * Buscar estatísticas de auditoria
 */
export async function getAuditStats(): Promise<AuditStats[]> {
  const result = await db.execute(sql`
    SELECT * FROM v_audit_stats
  `);

  return result.rows as AuditStats[];
}

/**
 * Comparar duas versões de um registro
 */
export async function compareVersions(
  options: CompareVersionsOptions
): Promise<Array<{ campo: string; valor_version1: string; valor_version2: string }>> {
  const { tabela, registroId, version1Id, version2Id } = options;

  const result = await db.execute(sql`
    SELECT * FROM compare_audit_versions(
      ${tabela},
      ${registroId},
      ${version1Id},
      ${version2Id}
    )
  `);

  return result.rows as Array<{
    campo: string;
    valor_version1: string;
    valor_version2: string;
  }>;
}

/**
 * Buscar log específico por ID
 */
export async function getLogById(id: number): Promise<AuditLog | null> {
  const result = await db.execute(sql`
    SELECT * FROM audit_logs
    WHERE id = ${id}
  `);

  return result.rows[0] as AuditLog | null;
}

/**
 * Buscar logs por período
 */
export async function getLogsByPeriodo(
  dataInicio: Date,
  dataFim: Date,
  limite: number = 1000
): Promise<AuditLog[]> {
  const result = await db.execute(sql`
    SELECT * FROM audit_logs
    WHERE created_at BETWEEN ${dataInicio} AND ${dataFim}
    ORDER BY created_at DESC
    LIMIT ${limite}
  `);

  return result.rows as AuditLog[];
}

/**
 * Buscar logs com filtros avançados
 */
export interface FiltrosAuditLog {
  tabela?: TabelaAuditada;
  operacao?: TipoOperacao;
  usuarioId?: string;
  registroId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  limite?: number;
}

export async function getLogsComFiltros(filtros: FiltrosAuditLog): Promise<AuditLog[]> {
  const { tabela, operacao, usuarioId, registroId, dataInicio, dataFim, limite = 100 } =
    filtros;

  let query = sql`SELECT * FROM audit_logs WHERE 1=1`;

  if (tabela) {
    query = sql`${query} AND tabela = ${tabela}`;
  }

  if (operacao) {
    query = sql`${query} AND operacao = ${operacao}`;
  }

  if (usuarioId) {
    query = sql`${query} AND usuario_id = ${usuarioId}`;
  }

  if (registroId) {
    query = sql`${query} AND registro_id = ${registroId}`;
  }

  if (dataInicio) {
    query = sql`${query} AND created_at >= ${dataInicio}`;
  }

  if (dataFim) {
    query = sql`${query} AND created_at <= ${dataFim}`;
  }

  query = sql`${query} ORDER BY created_at DESC LIMIT ${limite}`;

  const result = await db.execute(query);
  return result.rows as AuditLog[];
}

// ============================================================================
// MANUTENÇÃO
// ============================================================================

/**
 * Limpar logs antigos (executar periodicamente)
 * @param retentionDays Dias de retenção (padrão: 365)
 * @returns Número de logs deletados
 */
export async function cleanupOldLogs(retentionDays: number = 365): Promise<number> {
  const result = await db.execute(sql`
    SELECT cleanup_old_audit_logs(${retentionDays})
  `);

  return (result.rows[0] as any).cleanup_old_audit_logs;
}

/**
 * Contar total de logs
 */
export async function countLogs(): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*) as total FROM audit_logs
  `);

  return (result.rows[0] as any).total;
}

/**
 * Contar logs por tabela
 */
export async function countLogsByTabela(tabela: TabelaAuditada): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*) as total FROM audit_logs
    WHERE tabela = ${tabela}
  `);

  return (result.rows[0] as any).total;
}

// ============================================================================
// ANÁLISE
// ============================================================================

/**
 * Buscar usuários mais ativos
 */
export async function getUsuariosMaisAtivos(
  limite: number = 10
): Promise<Array<{ usuario_id: string; total_operacoes: number }>> {
  const result = await db.execute(sql`
    SELECT 
      usuario_id,
      COUNT(*) as total_operacoes
    FROM audit_logs
    WHERE usuario_id IS NOT NULL
    GROUP BY usuario_id
    ORDER BY total_operacoes DESC
    LIMIT ${limite}
  `);

  return result.rows as Array<{ usuario_id: string; total_operacoes: number }>;
}

/**
 * Buscar tabelas mais alteradas
 */
export async function getTabelasMaisAlteradas(
  limite: number = 10
): Promise<Array<{ tabela: TabelaAuditada; total_operacoes: number }>> {
  const result = await db.execute(sql`
    SELECT 
      tabela,
      COUNT(*) as total_operacoes
    FROM audit_logs
    GROUP BY tabela
    ORDER BY total_operacoes DESC
    LIMIT ${limite}
  `);

  return result.rows as Array<{ tabela: TabelaAuditada; total_operacoes: number }>;
}

/**
 * Buscar atividade por hora do dia
 */
export async function getAtividadePorHora(): Promise<
  Array<{ hora: number; total_operacoes: number }>
> {
  const result = await db.execute(sql`
    SELECT 
      EXTRACT(HOUR FROM created_at) as hora,
      COUNT(*) as total_operacoes
    FROM audit_logs
    GROUP BY hora
    ORDER BY hora
  `);

  return result.rows as Array<{ hora: number; total_operacoes: number }>;
}
