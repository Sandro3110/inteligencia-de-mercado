-- ============================================================================
-- MIGRATION 002: Criar Nova Estrutura Padronizada
-- Data: 2025-12-01
-- Objetivo: Criar tabelas dimensionais + fato com campos padronizados
-- ============================================================================

-- ============================================================================
-- DIMENSÃO 1: GEOGRAFIA (Normalizada)
-- ============================================================================

CREATE TABLE dim_geografia (
  id SERIAL PRIMARY KEY,
  
  -- Campos padronizados
  cidade VARCHAR(255) NOT NULL,
  uf CHAR(2) NOT NULL,
  regiao VARCHAR(50) NOT NULL,
  
  -- Coordenadas
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  
  -- Metadados padronizados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(cidade, uf)
);

-- Índices otimizados
CREATE INDEX idx_dim_geografia_uf ON dim_geografia(uf);
CREATE INDEX idx_dim_geografia_regiao ON dim_geografia(regiao);
CREATE INDEX idx_dim_geografia_cidade_uf ON dim_geografia(cidade, uf);

COMMENT ON TABLE dim_geografia IS 'Dimensão geográfica normalizada (região → estado → cidade)';

-- ============================================================================
-- DIMENSÃO 2: MERCADOS (Setores)
-- ============================================================================

CREATE TABLE dim_mercados (
  id SERIAL PRIMARY KEY,
  
  -- Identificação
  mercado_hash VARCHAR(255) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  
  -- Classificação padronizada
  categoria VARCHAR(100) NOT NULL,
  segmentacao VARCHAR(50),
  
  -- Informações de mercado
  tamanho_mercado TEXT,
  crescimento_anual TEXT,
  tendencias TEXT,
  principais_players TEXT,
  
  -- Relacionamentos obrigatórios
  pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Metadados padronizados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices otimizados
CREATE INDEX idx_dim_mercados_pesquisa ON dim_mercados(pesquisa_id);
CREATE INDEX idx_dim_mercados_project ON dim_mercados(project_id);
CREATE INDEX idx_dim_mercados_categoria ON dim_mercados(categoria);
CREATE INDEX idx_dim_mercados_hash ON dim_mercados(mercado_hash);
CREATE INDEX idx_dim_mercados_pesquisa_categoria ON dim_mercados(pesquisa_id, categoria);

COMMENT ON TABLE dim_mercados IS 'Dimensão de mercados/setores com categorização';

-- ============================================================================
-- DIMENSÃO 3: PRODUTOS
-- ============================================================================

CREATE TABLE dim_produtos (
  id SERIAL PRIMARY KEY,
  
  -- Identificação
  produto_hash VARCHAR(255) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  
  -- Classificação padronizada
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  
  -- Atributos comerciais
  preco TEXT,
  unidade VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Relacionamentos
  mercado_id INTEGER REFERENCES dim_mercados(id) ON DELETE SET NULL,
  pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Metadados padronizados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices otimizados
CREATE INDEX idx_dim_produtos_pesquisa ON dim_produtos(pesquisa_id);
CREATE INDEX idx_dim_produtos_project ON dim_produtos(project_id);
CREATE INDEX idx_dim_produtos_categoria ON dim_produtos(categoria);
CREATE INDEX idx_dim_produtos_mercado ON dim_produtos(mercado_id);
CREATE INDEX idx_dim_produtos_hash ON dim_produtos(produto_hash);
CREATE INDEX idx_dim_produtos_pesquisa_categoria ON dim_produtos(pesquisa_id, categoria);

COMMENT ON TABLE dim_produtos IS 'Dimensão de produtos com categorização';

-- ============================================================================
-- TABELA FATO: ENTIDADES (Clientes + Leads + Concorrentes UNIFICADOS)
-- ============================================================================

CREATE TABLE fato_entidades (
  id SERIAL PRIMARY KEY,
  
  -- Tipo de entidade padronizado
  tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')),
  
  -- Hash único padronizado
  entidade_hash VARCHAR(255) UNIQUE,
  
  -- Identificação padronizada
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  
  -- Relacionamentos obrigatórios padronizados
  pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  geografia_id INTEGER NOT NULL REFERENCES dim_geografia(id),
  mercado_id INTEGER NOT NULL REFERENCES dim_mercados(id),
  
  -- Contato padronizado
  email VARCHAR(500),
  telefone VARCHAR(50),
  site_oficial VARCHAR(500),
  linkedin VARCHAR(500),
  instagram VARCHAR(500),
  
  -- Classificação padronizada
  cnae VARCHAR(20),
  porte VARCHAR(50),
  segmentacao_b2b_b2c VARCHAR(10),
  
  -- Financeiro padronizado
  faturamento_declarado TEXT,
  faturamento_estimado TEXT,
  numero_estabelecimentos TEXT,
  
  -- Qualidade padronizada
  qualidade_score INTEGER CHECK (qualidade_score >= 0 AND qualidade_score <= 100),
  qualidade_classificacao VARCHAR(50),
  
  -- Validação padronizada
  validation_status VARCHAR(50),
  validation_notes TEXT,
  validated_by VARCHAR(64),
  validated_at TIMESTAMP,
  
  -- Campos específicos de leads
  lead_stage VARCHAR(50),
  stage_updated_at TIMESTAMP,
  cliente_origem_id INTEGER REFERENCES fato_entidades(id), -- Conversão lead → cliente
  
  -- Metadados padronizados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices otimizados (performance crítica)
CREATE INDEX idx_fato_entidades_tipo ON fato_entidades(tipo_entidade);
CREATE INDEX idx_fato_entidades_pesquisa ON fato_entidades(pesquisa_id);
CREATE INDEX idx_fato_entidades_project ON fato_entidades(project_id);
CREATE INDEX idx_fato_entidades_geografia ON fato_entidades(geografia_id);
CREATE INDEX idx_fato_entidades_mercado ON fato_entidades(mercado_id);
CREATE INDEX idx_fato_entidades_hash ON fato_entidades(entidade_hash);
CREATE INDEX idx_fato_entidades_qualidade ON fato_entidades(qualidade_score);
CREATE INDEX idx_fato_entidades_cnpj ON fato_entidades(cnpj);
CREATE INDEX idx_fato_entidades_tipo_pesquisa ON fato_entidades(tipo_entidade, pesquisa_id);
CREATE INDEX idx_fato_entidades_tipo_mercado ON fato_entidades(tipo_entidade, mercado_id);
CREATE INDEX idx_fato_entidades_cliente_origem ON fato_entidades(cliente_origem_id);
CREATE INDEX idx_fato_entidades_geografia_mercado ON fato_entidades(geografia_id, mercado_id);

COMMENT ON TABLE fato_entidades IS 'Tabela fato unificada: clientes, leads e concorrentes com campos padronizados';

-- ============================================================================
-- RELACIONAMENTO N:N: ENTIDADE ↔ PRODUTOS
-- ============================================================================

CREATE TABLE entidade_produtos (
  id SERIAL PRIMARY KEY,
  
  -- Relacionamentos
  entidade_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES dim_produtos(id) ON DELETE CASCADE,
  
  -- Tipo de relacionamento
  tipo_relacao VARCHAR(50), -- 'fabricante', 'distribuidor', 'consumidor', etc.
  
  -- Metadados padronizados
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint único
  UNIQUE(entidade_id, produto_id)
);

-- Índices otimizados
CREATE INDEX idx_entidade_produtos_entidade ON entidade_produtos(entidade_id);
CREATE INDEX idx_entidade_produtos_produto ON entidade_produtos(produto_id);
CREATE INDEX idx_entidade_produtos_tipo ON entidade_produtos(tipo_relacao);

COMMENT ON TABLE entidade_produtos IS 'Relacionamento N:N entre entidades e produtos';

-- ============================================================================
-- RELACIONAMENTO N:N: ENTIDADE ↔ COMPETIDORES (Análise Competitiva)
-- ============================================================================

CREATE TABLE entidade_competidores (
  id SERIAL PRIMARY KEY,
  
  -- Relacionamentos
  entidade_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE,
  competidor_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE,
  mercado_id INTEGER NOT NULL REFERENCES dim_mercados(id),
  
  -- Análise competitiva
  nivel_competicao VARCHAR(50), -- 'direto', 'indireto', 'potencial'
  
  -- Metadados padronizados
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(entidade_id, competidor_id, mercado_id),
  CHECK (entidade_id != competidor_id)
);

-- Índices otimizados
CREATE INDEX idx_entidade_competidores_entidade ON entidade_competidores(entidade_id);
CREATE INDEX idx_entidade_competidores_competidor ON entidade_competidores(competidor_id);
CREATE INDEX idx_entidade_competidores_mercado ON entidade_competidores(mercado_id);

COMMENT ON TABLE entidade_competidores IS 'Relacionamento N:N para análise competitiva';

-- ============================================================================
-- HISTÓRICO: AUDITORIA DE ENTIDADES
-- ============================================================================

CREATE TABLE fato_entidades_history (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL,
  
  -- Snapshot completo (JSONB para flexibilidade)
  data_snapshot JSONB NOT NULL,
  
  -- Tipo de mudança padronizado
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted')),
  changed_by VARCHAR(64),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Índices otimizados
CREATE INDEX idx_fato_entidades_history_entidade ON fato_entidades_history(entidade_id);
CREATE INDEX idx_fato_entidades_history_changed_at ON fato_entidades_history(changed_at);
CREATE INDEX idx_fato_entidades_history_change_type ON fato_entidades_history(change_type);

COMMENT ON TABLE fato_entidades_history IS 'Histórico de mudanças em entidades (auditoria)';

-- ============================================================================
-- POPULAR dim_geografia COM DADOS DE cidades_brasil
-- ============================================================================

INSERT INTO dim_geografia (cidade, uf, regiao, latitude, longitude)
SELECT DISTINCT 
  nome as cidade,
  uf,
  CASE 
    WHEN uf IN ('AC','AM','AP','PA','RO','RR','TO') THEN 'Norte'
    WHEN uf IN ('AL','BA','CE','MA','PB','PE','PI','RN','SE') THEN 'Nordeste'
    WHEN uf IN ('DF','GO','MS','MT') THEN 'Centro-Oeste'
    WHEN uf IN ('ES','MG','RJ','SP') THEN 'Sudeste'
    WHEN uf IN ('PR','RS','SC') THEN 'Sul'
    ELSE 'Desconhecido'
  END as regiao,
  latitude,
  longitude
FROM cidades_brasil
WHERE nome IS NOT NULL AND uf IS NOT NULL
ON CONFLICT (cidade, uf) DO NOTHING;

-- ============================================================================
-- VERIFICAR CRIAÇÃO
-- ============================================================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('dim_geografia', 'dim_mercados', 'dim_produtos', 'fato_entidades', 'entidade_produtos', 'entidade_competidores', 'fato_entidades_history')
ORDER BY table_name;

SELECT 'dim_geografia' as tabela, COUNT(*) as registros FROM dim_geografia;

-- ============================================================================
-- SUCESSO! Nova estrutura padronizada criada.
-- ============================================================================
