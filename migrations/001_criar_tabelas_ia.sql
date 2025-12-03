-- ============================================================================
-- MIGRATION 001: Criar Tabelas de IA (Mercado, Produtos, Concorrentes, Leads)
-- ============================================================================
-- Data: 02/12/2025
-- Objetivo: Permitir salvar dados gerados pela IA no banco de dados
-- ============================================================================

-- Tabela de Mercados
CREATE TABLE IF NOT EXISTS dim_mercado (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  
  -- Dados do mercado
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) CHECK (categoria IN ('Indústria', 'Comércio', 'Serviços', 'Tecnologia')),
  segmentacao VARCHAR(10) CHECK (segmentacao IN ('B2B', 'B2C', 'B2B2C')),
  tamanho_mercado TEXT,
  crescimento_anual VARCHAR(100),
  tendencias TEXT,
  principais_players TEXT,
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) REFERENCES users(id),
  
  -- Constraint: 1 mercado por entidade
  CONSTRAINT unique_mercado_entidade UNIQUE (entidade_id)
);

CREATE INDEX idx_mercado_entidade ON dim_mercado(entidade_id);
CREATE INDEX idx_mercado_categoria ON dim_mercado(categoria);
CREATE INDEX idx_mercado_segmentacao ON dim_mercado(segmentacao);

COMMENT ON TABLE dim_mercado IS 'Mercados identificados pela IA para cada entidade';
COMMENT ON COLUMN dim_mercado.tendencias IS 'Tendências atuais do mercado (campo dissertativo)';
COMMENT ON COLUMN dim_mercado.principais_players IS 'Principais empresas do mercado (campo dissertativo)';

-- ============================================================================

-- Tabela de Produtos/Serviços
CREATE TABLE IF NOT EXISTS dim_produto (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  
  -- Dados do produto
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  
  -- Ordem (1, 2, 3)
  ordem INTEGER DEFAULT 1 CHECK (ordem >= 1 AND ordem <= 3),
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_produto_entidade ON dim_produto(entidade_id);
CREATE INDEX idx_produto_categoria ON dim_produto(categoria);
CREATE INDEX idx_produto_ordem ON dim_produto(entidade_id, ordem);

COMMENT ON TABLE dim_produto IS 'Produtos/serviços identificados pela IA (3 por entidade)';
COMMENT ON COLUMN dim_produto.descricao IS 'Descrição detalhada do produto (campo dissertativo)';

-- ============================================================================

-- Tabela de Concorrentes
CREATE TABLE IF NOT EXISTS dim_concorrente (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  
  -- Dados do concorrente
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  cidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  produto_principal TEXT,
  site VARCHAR(500),
  porte VARCHAR(20) CHECK (porte IN ('Micro', 'Pequena', 'Média', 'Grande')),
  
  -- Ordem (1-5)
  ordem INTEGER DEFAULT 1 CHECK (ordem >= 1 AND ordem <= 5),
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_concorrente_entidade ON dim_concorrente(entidade_id);
CREATE INDEX idx_concorrente_cidade_uf ON dim_concorrente(cidade, uf);
CREATE INDEX idx_concorrente_porte ON dim_concorrente(porte);
CREATE INDEX idx_concorrente_ordem ON dim_concorrente(entidade_id, ordem);

COMMENT ON TABLE dim_concorrente IS 'Concorrentes identificados pela IA (5 por entidade)';
COMMENT ON COLUMN dim_concorrente.produto_principal IS 'Principal produto/serviço do concorrente (campo dissertativo)';

-- ============================================================================

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS dim_lead (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  
  -- Dados do lead
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  cidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  produto_interesse TEXT,
  setor VARCHAR(100),
  site VARCHAR(500),
  porte VARCHAR(20) CHECK (porte IN ('Micro', 'Pequena', 'Média', 'Grande')),
  
  -- Qualificação
  score_qualificacao INTEGER CHECK (score_qualificacao >= 0 AND score_qualificacao <= 100),
  prioridade VARCHAR(10) CHECK (prioridade IN ('Alta', 'Média', 'Baixa')),
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'convertido', 'perdido')),
  
  -- Ordem (1-5)
  ordem INTEGER DEFAULT 1 CHECK (ordem >= 1 AND ordem <= 5),
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) REFERENCES users(id)
);

CREATE INDEX idx_lead_entidade ON dim_lead(entidade_id);
CREATE INDEX idx_lead_cidade_uf ON dim_lead(cidade, uf);
CREATE INDEX idx_lead_status ON dim_lead(status);
CREATE INDEX idx_lead_prioridade ON dim_lead(prioridade);
CREATE INDEX idx_lead_setor ON dim_lead(setor);
CREATE INDEX idx_lead_ordem ON dim_lead(entidade_id, ordem);

COMMENT ON TABLE dim_lead IS 'Leads qualificados identificados pela IA (5 por entidade)';
COMMENT ON COLUMN dim_lead.produto_interesse IS 'Produto/serviço de interesse do lead (campo dissertativo)';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT 'Tabelas criadas com sucesso!' as status;

SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('dim_mercado', 'dim_produto', 'dim_concorrente', 'dim_lead')
ORDER BY table_name;
