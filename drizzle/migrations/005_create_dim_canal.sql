-- Migration 005: Criar dim_canal
-- Data: 2025-12-02
-- Descrição: Criar dimensão de canal para rastrear origem/canal de aquisição

CREATE TABLE IF NOT EXISTS dim_canal (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- importacao | enriquecimento_ia | api | manual | indicacao
  descricao TEXT,
  custo_medio DECIMAL(12,2), -- Custo médio por lead deste canal
  taxa_conversao_media DECIMAL(5,2), -- Taxa de conversão histórica (%)
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER
);

-- Popular canais padrão
INSERT INTO dim_canal (codigo, nome, tipo, descricao, custo_medio, taxa_conversao_media) VALUES
  ('import-csv', 'Importação CSV', 'importacao', 'Leads importados via arquivo CSV', 0.00, NULL),
  ('import-excel', 'Importação Excel', 'importacao', 'Leads importados via arquivo Excel', 0.00, NULL),
  ('enrich-ai', 'Enriquecimento IA', 'enriquecimento_ia', 'Leads descobertos via enriquecimento com IA', 0.006, NULL),
  ('manual', 'Cadastro Manual', 'manual', 'Leads cadastrados manualmente pela equipe', 0.00, NULL),
  ('api-externa', 'API Externa', 'api', 'Leads importados via integração com API externa', NULL, NULL),
  ('indicacao', 'Indicação', 'indicacao', 'Leads vindos de indicação de clientes', 0.00, NULL),
  ('evento', 'Evento', 'manual', 'Leads capturados em eventos e feiras', NULL, NULL),
  ('inbound', 'Inbound Marketing', 'manual', 'Leads gerados via marketing de conteúdo', NULL, NULL),
  ('outbound', 'Outbound', 'manual', 'Leads gerados via prospecção ativa', NULL, NULL)
ON CONFLICT (codigo) DO NOTHING;

-- Adicionar canal_id ao fato_entidade_contexto
ALTER TABLE fato_entidade_contexto 
  ADD COLUMN IF NOT EXISTS canal_id INTEGER REFERENCES dim_canal(id);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_fato_contexto_canal ON fato_entidade_contexto(canal_id);

-- Popular canal_id para registros existentes (assumir importação CSV)
UPDATE fato_entidade_contexto 
SET canal_id = (SELECT id FROM dim_canal WHERE codigo = 'import-csv')
WHERE canal_id IS NULL;

-- Comentários
COMMENT ON TABLE dim_canal IS 'Dimensão de canais de aquisição de leads';
COMMENT ON COLUMN dim_canal.codigo IS 'Código único do canal';
COMMENT ON COLUMN dim_canal.tipo IS 'Tipo de canal: importacao, enriquecimento_ia, api, manual, indicacao';
COMMENT ON COLUMN dim_canal.custo_medio IS 'Custo médio por lead adquirido neste canal (em R$)';
COMMENT ON COLUMN dim_canal.taxa_conversao_media IS 'Taxa de conversão média histórica deste canal (%)';
COMMENT ON COLUMN fato_entidade_contexto.canal_id IS 'FK para dim_canal - rastreia origem do lead';
