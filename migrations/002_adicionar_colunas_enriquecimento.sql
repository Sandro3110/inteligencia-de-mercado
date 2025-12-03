-- ============================================================================
-- MIGRATION 002: Adicionar Colunas de Enriquecimento em dim_entidade
-- ============================================================================
-- Data: 02/12/2025
-- Objetivo: Permitir salvar dados enriquecidos pela IA na tabela de entidades
-- ============================================================================

-- Adicionar colunas de enriquecimento
ALTER TABLE dim_entidade 
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS site VARCHAR(500),
  ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
  ADD COLUMN IF NOT EXISTS uf VARCHAR(2),
  ADD COLUMN IF NOT EXISTS porte VARCHAR(20) CHECK (porte IN ('Micro', 'Pequena', 'Média', 'Grande')),
  ADD COLUMN IF NOT EXISTS setor VARCHAR(100),
  ADD COLUMN IF NOT EXISTS produto_principal TEXT,
  ADD COLUMN IF NOT EXISTS segmentacao_b2b_b2c VARCHAR(10) CHECK (segmentacao_b2b_b2c IN ('B2B', 'B2C', 'B2B2C')),
  ADD COLUMN IF NOT EXISTS score_qualidade INTEGER CHECK (score_qualidade >= 0 AND score_qualidade <= 100),
  ADD COLUMN IF NOT EXISTS enriquecido_em TIMESTAMP,
  ADD COLUMN IF NOT EXISTS enriquecido_por VARCHAR(255) REFERENCES users(id);

-- Índices para buscas
CREATE INDEX IF NOT EXISTS idx_entidade_cidade_uf ON dim_entidade(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_entidade_porte ON dim_entidade(porte);
CREATE INDEX IF NOT EXISTS idx_entidade_setor ON dim_entidade(setor);
CREATE INDEX IF NOT EXISTS idx_entidade_segmentacao ON dim_entidade(segmentacao_b2b_b2c);
CREATE INDEX IF NOT EXISTS idx_entidade_score ON dim_entidade(score_qualidade);
CREATE INDEX IF NOT EXISTS idx_entidade_email ON dim_entidade(email);

-- Comentários
COMMENT ON COLUMN dim_entidade.email IS 'Email corporativo (enriquecido pela IA)';
COMMENT ON COLUMN dim_entidade.telefone IS 'Telefone (enriquecido pela IA)';
COMMENT ON COLUMN dim_entidade.site IS 'Site oficial (enriquecido pela IA)';
COMMENT ON COLUMN dim_entidade.cidade IS 'Cidade sede (obrigatório após enriquecimento)';
COMMENT ON COLUMN dim_entidade.uf IS 'Estado (obrigatório após enriquecimento)';
COMMENT ON COLUMN dim_entidade.porte IS 'Porte da empresa (Micro/Pequena/Média/Grande)';
COMMENT ON COLUMN dim_entidade.setor IS 'Setor de atuação';
COMMENT ON COLUMN dim_entidade.produto_principal IS 'Principal produto/serviço (campo dissertativo)';
COMMENT ON COLUMN dim_entidade.segmentacao_b2b_b2c IS 'Segmentação de mercado (B2B/B2C/B2B2C)';
COMMENT ON COLUMN dim_entidade.score_qualidade IS 'Score de qualidade dos dados (0-100)';
COMMENT ON COLUMN dim_entidade.enriquecido_em IS 'Data/hora do último enriquecimento';
COMMENT ON COLUMN dim_entidade.enriquecido_por IS 'Usuário que executou o enriquecimento';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT 'Colunas adicionadas com sucesso!' as status;

SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'dim_entidade'
  AND column_name IN ('email', 'telefone', 'site', 'cidade', 'uf', 'porte', 'setor', 'produto_principal', 'segmentacao_b2b_b2c', 'score_qualidade', 'enriquecido_em', 'enriquecido_por')
ORDER BY column_name;
