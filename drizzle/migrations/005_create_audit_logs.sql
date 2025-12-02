-- FASE 1 - Sessão 1.5: Tabela de Auditoria
-- Migration: 005_create_audit_logs
-- Data: 2025-12-02

-- Criar tabela de audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  
  -- Quem
  user_id VARCHAR(255) NOT NULL,
  user_name TEXT,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  
  -- O quê
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  
  -- Detalhes
  description TEXT,
  changes JSONB,
  metadata JSONB,
  
  -- Resultado
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  
  -- Contexto
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);

-- Comentários
COMMENT ON TABLE audit_logs IS 'Registro de auditoria de todas as ações críticas do sistema';
COMMENT ON COLUMN audit_logs.action IS 'Tipo de ação: create, update, delete, login, export, etc';
COMMENT ON COLUMN audit_logs.resource_type IS 'Tipo de recurso: projeto, pesquisa, entidade, etc';
COMMENT ON COLUMN audit_logs.status IS 'Resultado: success, failure, error';
COMMENT ON COLUMN audit_logs.changes IS 'Objeto JSON com before/after para updates';
COMMENT ON COLUMN audit_logs.metadata IS 'Dados adicionais contextuais';
