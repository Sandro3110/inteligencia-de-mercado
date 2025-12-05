-- Migration: Adicionar campos de enriquecimento em dim_entidade
-- Data: 2025-12-05
-- Descrição: Adiciona campos enriquecido, enriquecido_em e enriquecido_por na tabela dim_entidade

-- Adicionar coluna enriquecido (boolean, default false)
ALTER TABLE dim_entidade 
ADD COLUMN IF NOT EXISTS enriquecido BOOLEAN DEFAULT false;

-- Adicionar coluna enriquecido_em (timestamp, nullable)
ALTER TABLE dim_entidade 
ADD COLUMN IF NOT EXISTS enriquecido_em TIMESTAMP;

-- Adicionar coluna enriquecido_por (varchar 50, nullable)
ALTER TABLE dim_entidade 
ADD COLUMN IF NOT EXISTS enriquecido_por VARCHAR(50);

-- Criar índice para melhorar performance de queries por status de enriquecimento
CREATE INDEX IF NOT EXISTS idx_dim_entidade_enriquecido 
ON dim_entidade(enriquecido);

CREATE INDEX IF NOT EXISTS idx_dim_entidade_enriquecido_em 
ON dim_entidade(enriquecido_em);

-- Comentários
COMMENT ON COLUMN dim_entidade.enriquecido IS 'Flag indicando se a entidade foi enriquecida com IA';
COMMENT ON COLUMN dim_entidade.enriquecido_em IS 'Data e hora do último enriquecimento IA';
COMMENT ON COLUMN dim_entidade.enriquecido_por IS 'Identificador do processo/usuário que enriqueceu';

-- Atualizar entidades já enriquecidas (Magazine Luiza)
-- Se houver registros com dados enriquecidos mas flag false, atualizar
UPDATE dim_entidade 
SET enriquecido = true
WHERE enriquecido_em IS NOT NULL 
  AND enriquecido = false;
