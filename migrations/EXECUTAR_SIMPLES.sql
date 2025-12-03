-- ============================================================================
-- MIGRATIONS SIMPLIFICADAS - FASE 5
-- ============================================================================
-- Versão sem blocos DO $$ para execução via script Node.js
-- ============================================================================

-- PARTE 1: Adicionar colunas em dim_entidade
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS uf VARCHAR(2);
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS porte VARCHAR(20);
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS setor VARCHAR(100);
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS produto_principal TEXT;
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS segmentacao_b2b_b2c VARCHAR(10);
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS score_qualidade INTEGER;
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS enriquecido_em TIMESTAMP;
ALTER TABLE dim_entidade ADD COLUMN IF NOT EXISTS enriquecido_por VARCHAR(255);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_entidade_cidade_uf ON dim_entidade(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_entidade_porte ON dim_entidade(porte);
CREATE INDEX IF NOT EXISTS idx_entidade_setor ON dim_entidade(setor);
CREATE INDEX IF NOT EXISTS idx_entidade_segmentacao ON dim_entidade(segmentacao_b2b_b2c);
CREATE INDEX IF NOT EXISTS idx_entidade_score ON dim_entidade(score_qualidade);

-- PARTE 2: Criar tabelas de IA

-- Tabela de Mercados
CREATE TABLE IF NOT EXISTS dim_mercado (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(50),
  segmentacao VARCHAR(10),
  tamanho_mercado TEXT,
  crescimento_anual VARCHAR(100),
  tendencias TEXT,
  principais_players TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_mercado_entidade ON dim_mercado(entidade_id);
CREATE INDEX IF NOT EXISTS idx_mercado_categoria ON dim_mercado(categoria);
CREATE INDEX IF NOT EXISTS idx_mercado_segmentacao ON dim_mercado(segmentacao);

-- Tabela de Produtos/Serviços
CREATE TABLE IF NOT EXISTS dim_produto (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_produto_entidade ON dim_produto(entidade_id);
CREATE INDEX IF NOT EXISTS idx_produto_categoria ON dim_produto(categoria);
CREATE INDEX IF NOT EXISTS idx_produto_ordem ON dim_produto(entidade_id, ordem);

-- Tabela de Concorrentes
CREATE TABLE IF NOT EXISTS dim_concorrente (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  cidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  produto_principal TEXT,
  site VARCHAR(500),
  porte VARCHAR(20),
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_concorrente_entidade ON dim_concorrente(entidade_id);
CREATE INDEX IF NOT EXISTS idx_concorrente_cidade_uf ON dim_concorrente(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_concorrente_porte ON dim_concorrente(porte);
CREATE INDEX IF NOT EXISTS idx_concorrente_ordem ON dim_concorrente(entidade_id, ordem);

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS dim_lead (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  cidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  produto_interesse TEXT,
  setor VARCHAR(100),
  site VARCHAR(500),
  porte VARCHAR(20),
  score_qualificacao INTEGER,
  prioridade VARCHAR(10),
  status VARCHAR(20) DEFAULT 'novo',
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_lead_entidade ON dim_lead(entidade_id);
CREATE INDEX IF NOT EXISTS idx_lead_cidade_uf ON dim_lead(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_lead_status ON dim_lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_prioridade ON dim_lead(prioridade);
CREATE INDEX IF NOT EXISTS idx_lead_setor ON dim_lead(setor);
CREATE INDEX IF NOT EXISTS idx_lead_ordem ON dim_lead(entidade_id, ordem);

-- PARTE 3: Triggers e Melhorias

-- Function: Atualizar updated_at
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_updated_at_dim_entidade ON dim_entidade;
CREATE TRIGGER trigger_updated_at_dim_entidade BEFORE UPDATE ON dim_entidade FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_dim_mercado ON dim_mercado;
CREATE TRIGGER trigger_updated_at_dim_mercado BEFORE UPDATE ON dim_mercado FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_dim_lead ON dim_lead;
CREATE TRIGGER trigger_updated_at_dim_lead BEFORE UPDATE ON dim_lead FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- Tabela de Alertas
CREATE TABLE IF NOT EXISTS ia_alertas (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  percentual INTEGER NOT NULL,
  mensagem TEXT NOT NULL,
  custo_atual DECIMAL(10, 6) NOT NULL,
  budget_total DECIMAL(10, 2) NOT NULL,
  enviado BOOLEAN DEFAULT FALSE,
  enviado_em TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ia_alertas_tipo ON ia_alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_ia_alertas_enviado ON ia_alertas(enviado);
CREATE INDEX IF NOT EXISTS idx_ia_alertas_created_at ON ia_alertas(created_at);

-- Tabela de Histórico
CREATE TABLE IF NOT EXISTS ia_config_historico (
  id SERIAL PRIMARY KEY,
  plataforma VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  budget_mensal DECIMAL(10, 2) NOT NULL,
  alterado_por VARCHAR(255) NOT NULL,
  alterado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  motivo TEXT
);

CREATE INDEX IF NOT EXISTS idx_ia_config_historico_alterado_em ON ia_config_historico(alterado_em);

-- Novos Status
INSERT INTO dim_status_qualificacao (codigo, nome, descricao, cor, ordem, created_by) VALUES
('qualificado', 'Qualificado', 'Lead qualificado e pronto para contato', '#10b981', 4, 'sistema'),
('em_negociacao', 'Em Negociação', 'Em processo de negociação/venda', '#f59e0b', 5, 'sistema'),
('convertido', 'Convertido', 'Lead convertido em cliente', '#22c55e', 6, 'sistema'),
('perdido', 'Perdido', 'Oportunidade perdida', '#ef4444', 7, 'sistema'),
('suspenso', 'Suspenso', 'Cliente suspenso temporariamente', '#6b7280', 8, 'sistema')
ON CONFLICT (codigo) DO NOTHING;

-- Colunas em users
ALTER TABLE users ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_acessos INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_ultimo_acesso ON users(ultimo_acesso);

-- View de Dashboard
CREATE OR REPLACE VIEW vw_dashboard_ia AS
SELECT 
  DATE_TRUNC('day', created_at) as dia,
  COUNT(*) as total_chamadas,
  SUM(total_tokens) as total_tokens,
  SUM(custo) as total_custo,
  AVG(duracao_ms) as duracao_media,
  COUNT(CASE WHEN sucesso = true THEN 1 END) as chamadas_sucesso,
  COUNT(CASE WHEN sucesso = false THEN 1 END) as chamadas_erro
FROM ia_usage
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY dia DESC;
