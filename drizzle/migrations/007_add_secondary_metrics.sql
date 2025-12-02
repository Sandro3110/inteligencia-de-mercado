-- Migration 007: Adicionar métricas às tabelas fato secundárias
-- Data: 2025-12-02
-- Descrição: Adicionar métricas de negócio em fato_entidade_produto e fato_entidade_competidor

-- ============================================================================
-- MÉTRICAS EM fato_entidade_produto
-- ============================================================================

ALTER TABLE fato_entidade_produto ADD COLUMN IF NOT EXISTS
  volume_vendas_estimado DECIMAL(15,2);
ALTER TABLE fato_entidade_produto ADD COLUMN IF NOT EXISTS
  margem_estimada DECIMAL(5,2); -- %
ALTER TABLE fato_entidade_produto ADD COLUMN IF NOT EXISTS
  penetracao_mercado DECIMAL(5,2); -- %
ALTER TABLE fato_entidade_produto ADD COLUMN IF NOT EXISTS
  eh_produto_principal BOOLEAN DEFAULT FALSE;

-- Comentários
COMMENT ON COLUMN fato_entidade_produto.volume_vendas_estimado IS 'Volume de vendas estimado deste produto (R$)';
COMMENT ON COLUMN fato_entidade_produto.margem_estimada IS 'Margem de lucro estimada (%)';
COMMENT ON COLUMN fato_entidade_produto.penetracao_mercado IS 'Penetração de mercado estimada (%)';
COMMENT ON COLUMN fato_entidade_produto.eh_produto_principal IS 'Flag indicando se é o produto principal da entidade';

-- ============================================================================
-- MÉTRICAS EM fato_entidade_competidor
-- ============================================================================

ALTER TABLE fato_entidade_competidor ADD COLUMN IF NOT EXISTS
  share_of_voice DECIMAL(5,2); -- %
ALTER TABLE fato_entidade_competidor ADD COLUMN IF NOT EXISTS
  vantagem_competitiva_score INTEGER;
ALTER TABLE fato_entidade_competidor ADD COLUMN IF NOT EXISTS
  ameaca_nivel VARCHAR(20);

-- Adicionar constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fato_entidade_competidor_vantagem_score_check') THEN
    ALTER TABLE fato_entidade_competidor ADD CONSTRAINT fato_entidade_competidor_vantagem_score_check 
      CHECK (vantagem_competitiva_score IS NULL OR (vantagem_competitiva_score BETWEEN 0 AND 100));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fato_entidade_competidor_ameaca_nivel_check') THEN
    ALTER TABLE fato_entidade_competidor ADD CONSTRAINT fato_entidade_competidor_ameaca_nivel_check 
      CHECK (ameaca_nivel IS NULL OR ameaca_nivel IN ('baixa', 'media', 'alta', 'critica'));
  END IF;
END$$;

-- Comentários
COMMENT ON COLUMN fato_entidade_competidor.share_of_voice IS 'Share of voice do concorrente no mercado (%)';
COMMENT ON COLUMN fato_entidade_competidor.vantagem_competitiva_score IS 'Score de vantagem competitiva vs este concorrente (0-100)';
COMMENT ON COLUMN fato_entidade_competidor.ameaca_nivel IS 'Nível de ameaça: baixa, media, alta, critica';

-- ============================================================================
-- ANALYZE
-- ============================================================================

ANALYZE fato_entidade_produto;
ANALYZE fato_entidade_competidor;
