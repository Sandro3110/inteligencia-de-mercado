/**
 * Schema de Auditoria
 * FASE 1 - Sessão 1.5
 * 
 * Registra todas as ações críticas do sistema para:
 * - Compliance (LGPD, SOC 2)
 * - Rastreabilidade
 * - Detecção de fraudes
 * - Investigação de incidentes
 */

import { pgTable, serial, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  
  // Quem fez a ação
  user_id: varchar('user_id', { length: 255 }).notNull(),
  user_name: text('user_name'),
  user_email: varchar('user_email', { length: 255 }),
  user_role: varchar('user_role', { length: 50 }),
  
  // O que foi feito
  action: varchar('action', { length: 100 }).notNull(), // 'create', 'update', 'delete', 'login', 'export', etc
  resource_type: varchar('resource_type', { length: 100 }).notNull(), // 'projeto', 'pesquisa', 'entidade', etc
  resource_id: varchar('resource_id', { length: 255 }), // ID do recurso afetado
  
  // Detalhes da ação
  description: text('description'), // Descrição legível da ação
  changes: jsonb('changes'), // Objeto com { before: {...}, after: {...} }
  metadata: jsonb('metadata'), // Dados adicionais (IP, user agent, etc)
  
  // Resultado
  status: varchar('status', { length: 20 }).notNull(), // 'success', 'failure', 'error'
  error_message: text('error_message'), // Se status = 'error'
  
  // Contexto
  ip_address: varchar('ip_address', { length: 45 }), // IPv4 ou IPv6
  user_agent: text('user_agent'),
  
  // Timestamp
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Índices para performance
// CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
// CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
// CREATE INDEX idx_audit_logs_action ON audit_logs(action);
// CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
