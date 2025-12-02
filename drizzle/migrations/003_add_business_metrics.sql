-- Migration 003: Adicionar métricas de negócio ao fato_entidade_contexto
-- Data: 2025-12-02
-- Descrição: Adicionar métricas financeiras, scores e segmentação para BI

-- Métricas Financeiras
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  receita_potencial_anual DECIMAL(15,2);
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  ticket_medio_estimado DECIMAL(12,2);
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  ltv_estimado DECIMAL(15,2); -- Lifetime Value
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  cac_estimado DECIMAL(12,2); -- Custo de Aquisição de Cliente

-- Scores e Probabilidades
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  score_fit INTEGER;
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  probabilidade_conversao DECIMAL(5,2);
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  score_priorizacao INTEGER;

-- Adicionar constraints após adicionar colunas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fato_entidade_contexto_score_fit_check') THEN
    ALTER TABLE fato_entidade_contexto ADD CONSTRAINT fato_entidade_contexto_score_fit_check 
      CHECK (score_fit IS NULL OR (score_fit BETWEEN 0 AND 100));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fato_entidade_contexto_probabilidade_conversao_check') THEN
    ALTER TABLE fato_entidade_contexto ADD CONSTRAINT fato_entidade_contexto_probabilidade_conversao_check 
      CHECK (probabilidade_conversao IS NULL OR (probabilidade_conversao BETWEEN 0 AND 100));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fato_entidade_contexto_score_priorizacao_check') THEN
    ALTER TABLE fato_entidade_contexto ADD CONSTRAINT fato_entidade_contexto_score_priorizacao_check 
      CHECK (score_priorizacao IS NULL OR (score_priorizacao BETWEEN 0 AND 100));
  END IF;
END$$;

-- Ciclo de Venda
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  ciclo_venda_estimado_dias INTEGER;

-- Segmentação
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  segmento_rfm VARCHAR(3); -- AAA, AAB, etc
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  segmento_abc VARCHAR(1);
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  eh_cliente_ideal BOOLEAN DEFAULT FALSE;

-- Adicionar constraint para segmento_abc
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fato_entidade_contexto_segmento_abc_check') THEN
    ALTER TABLE fato_entidade_contexto ADD CONSTRAINT fato_entidade_contexto_segmento_abc_check 
      CHECK (segmento_abc IS NULL OR segmento_abc IN ('A', 'B', 'C'));
  END IF;
END$$;

-- Flags de Conversão
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  convertido_em_cliente BOOLEAN DEFAULT FALSE;
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  data_conversao DATE;

-- Observações Enriquecidas
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  justificativa_score TEXT;
ALTER TABLE fato_entidade_contexto ADD COLUMN IF NOT EXISTS
  recomendacoes TEXT;

-- Criar índices para queries analíticas
CREATE INDEX IF NOT EXISTS idx_fato_contexto_score_fit ON fato_entidade_contexto(score_fit);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_receita ON fato_entidade_contexto(receita_potencial_anual);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_segmento ON fato_entidade_contexto(segmento_abc);
CREATE INDEX IF NOT EXISTS idx_fato_contexto_convertido ON fato_entidade_contexto(convertido_em_cliente);

-- Comentários
COMMENT ON COLUMN fato_entidade_contexto.receita_potencial_anual IS 'Receita anual estimada que este lead pode gerar';
COMMENT ON COLUMN fato_entidade_contexto.ticket_medio_estimado IS 'Ticket médio estimado por transação';
COMMENT ON COLUMN fato_entidade_contexto.ltv_estimado IS 'Lifetime Value - valor total estimado do cliente';
COMMENT ON COLUMN fato_entidade_contexto.cac_estimado IS 'Custo de Aquisição de Cliente estimado';
COMMENT ON COLUMN fato_entidade_contexto.score_fit IS 'Score de fit produto-mercado (0-100)';
COMMENT ON COLUMN fato_entidade_contexto.probabilidade_conversao IS 'Probabilidade de conversão em cliente (0-100%)';
COMMENT ON COLUMN fato_entidade_contexto.score_priorizacao IS 'Score de priorização para ações comerciais (0-100)';
COMMENT ON COLUMN fato_entidade_contexto.ciclo_venda_estimado_dias IS 'Ciclo de venda estimado em dias';
COMMENT ON COLUMN fato_entidade_contexto.segmento_rfm IS 'Segmentação RFM (Recência, Frequência, Monetário)';
COMMENT ON COLUMN fato_entidade_contexto.segmento_abc IS 'Segmentação ABC (A=alto valor, B=médio, C=baixo)';
COMMENT ON COLUMN fato_entidade_contexto.eh_cliente_ideal IS 'Flag indicando se é um cliente ideal (ICP)';
