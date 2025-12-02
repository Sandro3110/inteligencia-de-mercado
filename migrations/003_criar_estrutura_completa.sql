-- ============================================================================
-- CRIAR ESTRUTURA COMPLETA - IntelMarket v3.0
-- Data: 01/12/2025
-- Objetivo: Criar modelo dimensional final do zero
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 1. dim_entidade
-- ============================================================================

CREATE TABLE dim_entidade (
  id SERIAL PRIMARY KEY,
  entidade_hash VARCHAR(64) UNIQUE NOT NULL,
  tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')),
  nome VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  site VARCHAR(255),
  num_filiais INTEGER DEFAULT 0,
  num_lojas INTEGER DEFAULT 0,
  num_funcionarios INTEGER,
  origem_tipo VARCHAR(20) NOT NULL CHECK (origem_tipo IN ('importacao', 'ia_prompt', 'api', 'manual')),
  origem_arquivo VARCHAR(255),
  origem_processo VARCHAR(100),
  origem_prompt TEXT,
  origem_confianca INTEGER CHECK (origem_confianca BETWEEN 0 AND 100),
  origem_data TIMESTAMP NOT NULL DEFAULT NOW(),
  origem_usuario_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  deleted_at TIMESTAMP,
  deleted_by INTEGER,
  FOREIGN KEY (origem_usuario_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_entidade_hash ON dim_entidade(entidade_hash);
CREATE INDEX idx_entidade_tipo ON dim_entidade(tipo_entidade);
CREATE INDEX idx_entidade_cnpj ON dim_entidade(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_entidade_nome ON dim_entidade(nome);
CREATE INDEX idx_entidade_origem_tipo ON dim_entidade(origem_tipo);
CREATE INDEX idx_entidade_origem_data ON dim_entidade(origem_data);
CREATE INDEX idx_entidade_created_at ON dim_entidade(created_at);
CREATE INDEX idx_entidade_updated_at ON dim_entidade(updated_at);
CREATE INDEX idx_entidade_ativo ON dim_entidade(tipo_entidade, created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_entidade_tipo_origem ON dim_entidade(tipo_entidade, origem_tipo);

-- ============================================================================
-- 2. dim_projeto
-- ============================================================================

CREATE TABLE dim_projeto (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'arquivado', 'concluido')),
  owner_id INTEGER NOT NULL,
  unidade_negocio VARCHAR(100),
  centro_custo VARCHAR(50),
  orcamento_total DECIMAL(15,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  deleted_at TIMESTAMP,
  deleted_by INTEGER,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (nome, owner_id)
);

CREATE INDEX idx_projeto_status ON dim_projeto(status);
CREATE INDEX idx_projeto_owner ON dim_projeto(owner_id);
CREATE INDEX idx_projeto_codigo ON dim_projeto(codigo) WHERE codigo IS NOT NULL;
CREATE INDEX idx_projeto_created_at ON dim_projeto(created_at);
CREATE INDEX idx_projeto_ativo ON dim_projeto(status, owner_id) WHERE deleted_at IS NULL AND status = 'ativo';

-- ============================================================================
-- 3. dim_pesquisa
-- ============================================================================

CREATE TABLE dim_pesquisa (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  objetivo TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluida', 'falhou', 'cancelada')),
  total_entidades INTEGER DEFAULT 0,
  entidades_enriquecidas INTEGER DEFAULT 0,
  entidades_falhadas INTEGER DEFAULT 0,
  qualidade_media DECIMAL(5,2),
  started_at TIMESTAMP,
  started_by INTEGER,
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  deleted_at TIMESTAMP,
  deleted_by INTEGER,
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (started_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (nome, projeto_id)
);

CREATE INDEX idx_pesquisa_projeto ON dim_pesquisa(projeto_id);
CREATE INDEX idx_pesquisa_status ON dim_pesquisa(status);
CREATE INDEX idx_pesquisa_started_at ON dim_pesquisa(started_at);
CREATE INDEX idx_pesquisa_completed_at ON dim_pesquisa(completed_at);
CREATE INDEX idx_pesquisa_created_at ON dim_pesquisa(created_at);
CREATE INDEX idx_pesquisa_ativa ON dim_pesquisa(projeto_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_pesquisa_projeto_status ON dim_pesquisa(projeto_id, status);

-- ============================================================================
-- 4. dim_geografia
-- ============================================================================

CREATE TABLE dim_geografia (
  id SERIAL PRIMARY KEY,
  cidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  regiao VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  codigo_ibge VARCHAR(10),
  populacao INTEGER,
  pib_per_capita DECIMAL(12,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (cidade, uf)
);

CREATE INDEX idx_geografia_uf ON dim_geografia(uf);
CREATE INDEX idx_geografia_regiao ON dim_geografia(regiao);
CREATE INDEX idx_geografia_codigo_ibge ON dim_geografia(codigo_ibge) WHERE codigo_ibge IS NOT NULL;
CREATE INDEX idx_geografia_cidade_uf ON dim_geografia(cidade, uf);
CREATE INDEX idx_geografia_cidade_trgm ON dim_geografia USING gin(cidade gin_trgm_ops);

-- ============================================================================
-- 5. dim_mercado
-- ============================================================================

CREATE TABLE dim_mercado (
  id SERIAL PRIMARY KEY,
  mercado_hash VARCHAR(64) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  segmentacao VARCHAR(255),
  tamanho_mercado_br DECIMAL(15,2),
  crescimento_anual_pct DECIMAL(5,2),
  tendencias TEXT[],
  principais_players TEXT[],
  enriquecido BOOLEAN DEFAULT FALSE,
  enriquecido_em TIMESTAMP,
  enriquecido_por VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_mercado_hash ON dim_mercado(mercado_hash);
CREATE INDEX idx_mercado_categoria ON dim_mercado(categoria);
CREATE INDEX idx_mercado_nome ON dim_mercado(nome);
CREATE INDEX idx_mercado_enriquecido ON dim_mercado(enriquecido, enriquecido_em);
CREATE INDEX idx_mercado_nome_trgm ON dim_mercado USING gin(nome gin_trgm_ops);

-- ============================================================================
-- 6. dim_produto
-- ============================================================================

CREATE TABLE dim_produto (
  id SERIAL PRIMARY KEY,
  produto_hash VARCHAR(64) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  descricao TEXT,
  preco_medio DECIMAL(12,2),
  unidade VARCHAR(20),
  ncm VARCHAR(10),
  enriquecido BOOLEAN DEFAULT FALSE,
  enriquecido_em TIMESTAMP,
  enriquecido_por VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_produto_hash ON dim_produto(produto_hash);
CREATE INDEX idx_produto_categoria ON dim_produto(categoria);
CREATE INDEX idx_produto_nome ON dim_produto(nome);
CREATE INDEX idx_produto_ncm ON dim_produto(ncm) WHERE ncm IS NOT NULL;
CREATE INDEX idx_produto_enriquecido ON dim_produto(enriquecido, enriquecido_em);
CREATE INDEX idx_produto_nome_trgm ON dim_produto USING gin(nome gin_trgm_ops);

-- ============================================================================
-- 7. dim_status_qualificacao
-- ============================================================================

CREATE TABLE dim_status_qualificacao (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7),
  ordem INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_status_codigo ON dim_status_qualificacao(codigo);
CREATE INDEX idx_status_ordem ON dim_status_qualificacao(ordem);

-- ============================================================================
-- 8. fato_entidade_contexto
-- ============================================================================

CREATE TABLE fato_entidade_contexto (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL,
  projeto_id INTEGER NOT NULL,
  pesquisa_id INTEGER,
  geografia_id INTEGER,
  mercado_id INTEGER DEFAULT 1,
  status_qualificacao_id INTEGER NOT NULL,
  qualidade_score INTEGER CHECK (qualidade_score BETWEEN 0 AND 100),
  qualidade_classificacao VARCHAR(1) CHECK (qualidade_classificacao IN ('A', 'B', 'C', 'D')),
  faturamento_estimado DECIMAL(15,2),
  num_estabelecimentos INTEGER,
  num_funcionarios INTEGER,
  observacoes TEXT,
  tags TEXT[],
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  added_by INTEGER,
  enriched_at TIMESTAMP,
  enriched_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  FOREIGN KEY (entidade_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (pesquisa_id) REFERENCES dim_pesquisa(id) ON DELETE SET NULL,
  FOREIGN KEY (geografia_id) REFERENCES dim_geografia(id) ON DELETE SET NULL,
  FOREIGN KEY (mercado_id) REFERENCES dim_mercado(id) ON DELETE SET NULL,
  FOREIGN KEY (status_qualificacao_id) REFERENCES dim_status_qualificacao(id) ON DELETE RESTRICT,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (enriched_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (entidade_id, projeto_id, pesquisa_id)
);

CREATE INDEX idx_fec_entidade ON fato_entidade_contexto(entidade_id);
CREATE INDEX idx_fec_projeto ON fato_entidade_contexto(projeto_id);
CREATE INDEX idx_fec_pesquisa ON fato_entidade_contexto(pesquisa_id) WHERE pesquisa_id IS NOT NULL;
CREATE INDEX idx_fec_geografia ON fato_entidade_contexto(geografia_id) WHERE geografia_id IS NOT NULL;
CREATE INDEX idx_fec_mercado ON fato_entidade_contexto(mercado_id);
CREATE INDEX idx_fec_status ON fato_entidade_contexto(status_qualificacao_id);
CREATE INDEX idx_fec_entidade_projeto ON fato_entidade_contexto(entidade_id, projeto_id);
CREATE INDEX idx_fec_projeto_pesquisa ON fato_entidade_contexto(projeto_id, pesquisa_id);
CREATE INDEX idx_fec_entidade_projeto_pesquisa ON fato_entidade_contexto(entidade_id, projeto_id, pesquisa_id);
CREATE INDEX idx_fec_projeto_status ON fato_entidade_contexto(projeto_id, status_qualificacao_id);
CREATE INDEX idx_fec_projeto_mercado ON fato_entidade_contexto(projeto_id, mercado_id);
CREATE INDEX idx_fec_projeto_geografia ON fato_entidade_contexto(projeto_id, geografia_id);
CREATE INDEX idx_fec_added_at ON fato_entidade_contexto(added_at);
CREATE INDEX idx_fec_enriched_at ON fato_entidade_contexto(enriched_at) WHERE enriched_at IS NOT NULL;
CREATE INDEX idx_fec_qualidade ON fato_entidade_contexto(qualidade_score) WHERE qualidade_score IS NOT NULL;
CREATE INDEX idx_fec_enriquecido ON fato_entidade_contexto(projeto_id, pesquisa_id, qualidade_score) WHERE pesquisa_id IS NOT NULL AND qualidade_score IS NOT NULL;
CREATE INDEX idx_fec_tags ON fato_entidade_contexto USING gin(tags);

-- ============================================================================
-- 9. fato_entidade_produto
-- ============================================================================

CREATE TABLE fato_entidade_produto (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  projeto_id INTEGER NOT NULL,
  pesquisa_id INTEGER,
  tipo_relacao VARCHAR(20) CHECK (tipo_relacao IN ('principal', 'secundario', 'complementar')),
  volume_estimado DECIMAL(12,2),
  preco_praticado DECIMAL(12,2),
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  added_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  FOREIGN KEY (entidade_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES dim_produto(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (pesquisa_id) REFERENCES dim_pesquisa(id) ON DELETE SET NULL,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (entidade_id, produto_id, projeto_id, pesquisa_id)
);

CREATE INDEX idx_fep_entidade ON fato_entidade_produto(entidade_id);
CREATE INDEX idx_fep_produto ON fato_entidade_produto(produto_id);
CREATE INDEX idx_fep_projeto ON fato_entidade_produto(projeto_id);
CREATE INDEX idx_fep_pesquisa ON fato_entidade_produto(pesquisa_id) WHERE pesquisa_id IS NOT NULL;
CREATE INDEX idx_fep_entidade_projeto ON fato_entidade_produto(entidade_id, projeto_id);
CREATE INDEX idx_fep_produto_projeto ON fato_entidade_produto(produto_id, projeto_id);
CREATE INDEX idx_fep_tipo ON fato_entidade_produto(tipo_relacao);

-- ============================================================================
-- 10. fato_entidade_competidor
-- ============================================================================

CREATE TABLE fato_entidade_competidor (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL,
  competidor_id INTEGER NOT NULL,
  projeto_id INTEGER NOT NULL,
  pesquisa_id INTEGER,
  nivel_competicao VARCHAR(20) CHECK (nivel_competicao IN ('direto', 'indireto', 'potencial')),
  diferencial_competitivo TEXT,
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  added_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  FOREIGN KEY (entidade_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (competidor_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (pesquisa_id) REFERENCES dim_pesquisa(id) ON DELETE SET NULL,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (entidade_id, competidor_id, projeto_id, pesquisa_id),
  CHECK (entidade_id != competidor_id)
);

CREATE INDEX idx_feco_entidade ON fato_entidade_competidor(entidade_id);
CREATE INDEX idx_feco_competidor ON fato_entidade_competidor(competidor_id);
CREATE INDEX idx_feco_projeto ON fato_entidade_competidor(projeto_id);
CREATE INDEX idx_feco_pesquisa ON fato_entidade_competidor(pesquisa_id) WHERE pesquisa_id IS NOT NULL;
CREATE INDEX idx_feco_entidade_projeto ON fato_entidade_competidor(entidade_id, projeto_id);
CREATE INDEX idx_feco_competidor_projeto ON fato_entidade_competidor(competidor_id, projeto_id);
CREATE INDEX idx_feco_nivel ON fato_entidade_competidor(nivel_competicao);

-- ============================================================================
-- FIM DA CRIAÇÃO DE ESTRUTURA
-- ============================================================================
