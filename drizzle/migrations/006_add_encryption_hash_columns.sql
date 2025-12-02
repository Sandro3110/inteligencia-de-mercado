-- FASE 1 - Sessão 1.6: Criptografia de Dados Sensíveis
-- Migration: 006_add_encryption_hash_columns
-- Data: 2025-12-02

-- Adicionar colunas de hash para busca de dados criptografados
-- Hash permite buscar sem descriptografar todos os registros

-- Tabela: dim_entidade
ALTER TABLE dim_entidade 
ADD COLUMN IF NOT EXISTS cnpj_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS telefone_hash VARCHAR(64);

-- Índices para performance de busca
CREATE INDEX IF NOT EXISTS idx_dim_entidade_cnpj_hash ON dim_entidade(cnpj_hash);
CREATE INDEX IF NOT EXISTS idx_dim_entidade_email_hash ON dim_entidade(email_hash);
CREATE INDEX IF NOT EXISTS idx_dim_entidade_telefone_hash ON dim_entidade(telefone_hash);

-- Comentários
COMMENT ON COLUMN dim_entidade.cnpj_hash IS 'Hash HMAC-SHA256 do CNPJ para busca sem descriptografar';
COMMENT ON COLUMN dim_entidade.email_hash IS 'Hash HMAC-SHA256 do email para busca sem descriptografar';
COMMENT ON COLUMN dim_entidade.telefone_hash IS 'Hash HMAC-SHA256 do telefone para busca sem descriptografar';

-- Nota: Os dados existentes precisam ser migrados manualmente
-- usando o script de migração de dados (migration-script.ts)
