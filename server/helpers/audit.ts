/**
 * Helper de Auditoria
 * FASE 1 - Sessão 1.5
 * 
 * Funções para registrar ações no log de auditoria
 */

import { db } from '../db';
import { auditLogs } from '@/drizzle/audit_logs.schema';

/**
 * Tipos de ação auditáveis
 */
export enum AuditAction {
  // Autenticação
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  
  // CRUD
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  
  // Operações especiais
  EXPORT = 'export',
  IMPORT = 'import',
  ENRICH = 'enrich',
  MERGE = 'merge',
  
  // Administração
  ROLE_CHANGE = 'role_change',
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  
  // Segurança
  ACCESS_DENIED = 'access_denied',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

/**
 * Tipos de recurso auditáveis
 */
export enum AuditResource {
  USER = 'user',
  PROJETO = 'projeto',
  PESQUISA = 'pesquisa',
  IMPORTACAO = 'importacao',
  ENTIDADE = 'entidade',
  ANALISE = 'analise',
  SISTEMA = 'sistema',
}

/**
 * Status da ação
 */
export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
}

/**
 * Interface para dados de auditoria
 */
export interface AuditLogData {
  // Usuário (obrigatório)
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  
  // Ação (obrigatório)
  action: AuditAction;
  resourceType: AuditResource;
  resourceId?: string;
  
  // Detalhes
  description?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: Record<string, any>;
  
  // Resultado
  status: AuditStatus;
  errorMessage?: string;
  
  // Contexto (opcional, pode ser extraído do request)
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Registrar log de auditoria
 * 
 * @param data - Dados do log de auditoria
 * @returns ID do log criado
 * 
 * @example
 * await logAudit({
 *   userId: ctx.userId,
 *   userName: ctx.userName,
 *   userRole: ctx.userRole,
 *   action: AuditAction.CREATE,
 *   resourceType: AuditResource.PROJETO,
 *   resourceId: projeto.id.toString(),
 *   description: `Criou projeto "${projeto.nome}"`,
 *   status: AuditStatus.SUCCESS,
 *   metadata: { projetoNome: projeto.nome }
 * });
 */
export async function logAudit(data: AuditLogData): Promise<number> {
  try {
    const [log] = await db.insert(auditLogs).values({
      user_id: data.userId,
      user_name: data.userName,
      user_email: data.userEmail,
      user_role: data.userRole,
      
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      
      description: data.description,
      changes: data.changes as any,
      metadata: data.metadata as any,
      
      status: data.status,
      error_message: data.errorMessage,
      
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    }).returning({ id: auditLogs.id });
    
    return log.id;
  } catch (error) {
    // Não lançar erro - auditoria não deve quebrar a aplicação
    console.error('❌ Erro ao registrar log de auditoria:', error);
    return -1;
  }
}

/**
 * Helper: Registrar criação de recurso
 */
export async function logCreate(
  userId: string,
  resourceType: AuditResource,
  resourceId: string,
  resourceName: string,
  metadata?: Record<string, any>
) {
  return logAudit({
    userId,
    action: AuditAction.CREATE,
    resourceType,
    resourceId,
    description: `Criou ${resourceType} "${resourceName}"`,
    status: AuditStatus.SUCCESS,
    metadata,
  });
}

/**
 * Helper: Registrar atualização de recurso
 */
export async function logUpdate(
  userId: string,
  resourceType: AuditResource,
  resourceId: string,
  changes: { before: any; after: any },
  metadata?: Record<string, any>
) {
  return logAudit({
    userId,
    action: AuditAction.UPDATE,
    resourceType,
    resourceId,
    description: `Atualizou ${resourceType} #${resourceId}`,
    changes,
    status: AuditStatus.SUCCESS,
    metadata,
  });
}

/**
 * Helper: Registrar deleção de recurso
 */
export async function logDelete(
  userId: string,
  resourceType: AuditResource,
  resourceId: string,
  resourceName?: string,
  metadata?: Record<string, any>
) {
  return logAudit({
    userId,
    action: AuditAction.DELETE,
    resourceType,
    resourceId,
    description: resourceName 
      ? `Deletou ${resourceType} "${resourceName}"`
      : `Deletou ${resourceType} #${resourceId}`,
    status: AuditStatus.SUCCESS,
    metadata,
  });
}

/**
 * Helper: Registrar exportação
 */
export async function logExport(
  userId: string,
  resourceType: AuditResource,
  count: number,
  metadata?: Record<string, any>
) {
  return logAudit({
    userId,
    action: AuditAction.EXPORT,
    resourceType,
    description: `Exportou ${count} ${resourceType}(s)`,
    status: AuditStatus.SUCCESS,
    metadata: { ...metadata, count },
  });
}

/**
 * Helper: Registrar acesso negado
 */
export async function logAccessDenied(
  userId: string,
  action: string,
  resourceType: AuditResource,
  resourceId?: string,
  reason?: string
) {
  return logAudit({
    userId,
    action: AuditAction.ACCESS_DENIED,
    resourceType,
    resourceId,
    description: `Acesso negado: ${action} em ${resourceType}`,
    status: AuditStatus.FAILURE,
    errorMessage: reason,
  });
}

/**
 * Helper: Registrar erro
 */
export async function logError(
  userId: string,
  action: AuditAction,
  resourceType: AuditResource,
  error: Error,
  metadata?: Record<string, any>
) {
  return logAudit({
    userId,
    action,
    resourceType,
    description: `Erro ao executar ${action} em ${resourceType}`,
    status: AuditStatus.ERROR,
    errorMessage: error.message,
    metadata: { ...metadata, stack: error.stack },
  });
}
