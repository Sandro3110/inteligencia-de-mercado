-- Migration 002: Adicionar campos temporais ao fato_entidade_contexto
-- Data: 2025-12-02
-- Descrição: Adicionar tempo_id e data_qualificacao para análises temporais

-- Adicionar colunas
ALTER TABLE fato_entidade_contexto 
  ADD COLUMN IF NOT EXISTS tempo_id INTEGER REFERENCES dim_tempo(id),
  ADD COLUMN IF NOT EXISTS data_qualificacao DATE NOT NULL DEFAULT CURRENT_DATE;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_fato_contexto_tempo ON fato_entidade_contexto(tempo_id);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_data ON fato_entidade_contexto(data_qualificacao);

-- Popular tempo_id baseado em data_qualificacao para registros existentes
UPDATE fato_entidade_contexto 
SET tempo_id = (SELECT id FROM dim_tempo WHERE data = fato_entidade_contexto.data_qualificacao)
WHERE tempo_id IS NULL;

-- Comentários
COMMENT ON COLUMN fato_entidade_contexto.tempo_id IS 'FK para dim_tempo - permite análises temporais';
COMMENT ON COLUMN fato_entidade_contexto.data_qualificacao IS 'Data de qualificação do lead/cliente';
