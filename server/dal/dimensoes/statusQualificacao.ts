/**
 * DAL para dim_status_qualificacao
 * Gerencia status de qualificação (Quente, Morno, Frio, etc)
 * 
 * Business Rules:
 * - Populada via seed (5 status)
 * - APENAS LEITURA (não permite criar/deletar)
 * - Código único
 */

import { db } from '../../db';
import { dimStatusQualificacao } from '../../../drizzle/schema';
import { eq, asc } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export type CodigoStatus =
  | 'QUENTE'
  | 'MORNO'
  | 'FRIO'
  | 'NAO_QUALIFICADO'
  | 'NAO_CLASSIFICADO';

// ============================================================================
// CONSULTAS (APENAS LEITURA)
// ============================================================================

/**
 * Buscar status por ID
 */
export async function getStatusQualificacaoById(id: number) {
  const [status] = await db
    .select()
    .from(dimStatusQualificacao)
    .where(eq(dimStatusQualificacao.id, id))
    .limit(1);

  return status || null;
}

/**
 * Listar todos os status
 */
export async function getStatusQualificacoes() {
  return db
    .select()
    .from(dimStatusQualificacao)
    .orderBy(asc(dimStatusQualificacao.ordem));
}

/**
 * Buscar status por código
 */
export async function getStatusQualificacaoByCodigo(codigo: CodigoStatus) {
  const [status] = await db
    .select()
    .from(dimStatusQualificacao)
    .where(eq(dimStatusQualificacao.codigo, codigo))
    .limit(1);

  return status || null;
}

/**
 * Buscar status padrão ("NÃO CLASSIFICADO")
 */
export async function getStatusPadrao() {
  return getStatusQualificacaoByCodigo('NAO_CLASSIFICADO');
}

/**
 * Buscar status "QUENTE"
 */
export async function getStatusQuente() {
  return getStatusQualificacaoByCodigo('QUENTE');
}

/**
 * Buscar status "MORNO"
 */
export async function getStatusMorno() {
  return getStatusQualificacaoByCodigo('MORNO');
}

/**
 * Buscar status "FRIO"
 */
export async function getStatusFrio() {
  return getStatusQualificacaoByCodigo('FRIO');
}

/**
 * Buscar status "NÃO QUALIFICADO"
 */
export async function getStatusNaoQualificado() {
  return getStatusQualificacaoByCodigo('NAO_QUALIFICADO');
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Validar código de status
 */
export function validarCodigoStatus(codigo: string): boolean {
  const codigosValidos: CodigoStatus[] = [
    'QUENTE',
    'MORNO',
    'FRIO',
    'NAO_QUALIFICADO',
    'NAO_CLASSIFICADO',
  ];

  return codigosValidos.includes(codigo as CodigoStatus);
}

/**
 * Obter cor do status
 */
export function getCorStatus(codigo: CodigoStatus): string {
  const cores: Record<CodigoStatus, string> = {
    QUENTE: '#22c55e', // verde
    MORNO: '#eab308', // amarelo
    FRIO: '#3b82f6', // azul
    NAO_QUALIFICADO: '#ef4444', // vermelho
    NAO_CLASSIFICADO: '#6b7280', // cinza
  };

  return cores[codigo] || '#6b7280';
}

/**
 * Obter descrição amigável do status
 */
export function getDescricaoStatus(codigo: CodigoStatus): string {
  const descricoes: Record<CodigoStatus, string> = {
    QUENTE: 'Lead com alto potencial de conversão',
    MORNO: 'Lead com potencial médio de conversão',
    FRIO: 'Lead com baixo potencial de conversão',
    NAO_QUALIFICADO: 'Lead que não atende aos critérios de qualificação',
    NAO_CLASSIFICADO: 'Lead ainda não classificado',
  };

  return descricoes[codigo] || 'Status desconhecido';
}
