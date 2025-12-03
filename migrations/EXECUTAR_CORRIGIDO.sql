-- ============================================================================
-- MIGRATIONS CORRIGIDAS - FASE 5
-- ============================================================================
-- Data: 02/12/2025
-- Objetivo: Corrigir erro de foreign keys e adicionar todas as melhorias
-- ============================================================================

-- ============================================================================
-- PARTE 1: ADICIONAR COLUNAS EM dim_entidade
-- ============================================================================

-- Adicionar colunas de enriquecimento (se não existirem)
DO $$ 
BEGIN
  -- Email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'email') THEN
    ALTER TABLE dim_entidade ADD COLUMN email VARCHAR(255);
  END IF;
  
  -- Telefone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'telefone') THEN
    ALTER TABLE dim_entidade ADD COLUMN telefone VARCHAR(50);
  END IF;
  
  -- Site
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'site') THEN
    ALTER TABLE dim_entidade ADD COLUMN site VARCHAR(500);
  END IF;
  
  -- Cidade
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'cidade') THEN
    ALTER TABLE dim_entidade ADD COLUMN cidade VARCHAR(100);
  END IF;
  
  -- UF
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'uf') THEN
    ALTER TABLE dim_entidade ADD COLUMN uf VARCHAR(2);
  END IF;
  
  -- Porte
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'porte') THEN
    ALTER TABLE dim_entidade ADD COLUMN porte VARCHAR(20) CHECK (porte IN ('Micro', 'Pequena', 'Média', 'Grande'));
  END IF;
  
  -- Setor
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'setor') THEN
    ALTER TABLE dim_entidade ADD COLUMN setor VARCHAR(100);
  END IF;
  
  -- Produto Principal
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'produto_principal') THEN
    ALTER TABLE dim_entidade ADD COLUMN produto_principal TEXT;
  END IF;
  
  -- Segmentação B2B/B2C
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'segmentacao_b2b_b2c') THEN
    ALTER TABLE dim_entidade ADD COLUMN segmentacao_b2b_b2c VARCHAR(10) CHECK (segmentacao_b2b_b2c IN ('B2B', 'B2C', 'B2B2C'));
  END IF;
  
  -- Score de Qualidade
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'score_qualidade') THEN
    ALTER TABLE dim_entidade ADD COLUMN score_qualidade INTEGER CHECK (score_qualidade >= 0 AND score_qualidade <= 100);
  END IF;
  
  -- Enriquecido Em
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'enriquecido_em') THEN
    ALTER TABLE dim_entidade ADD COLUMN enriquecido_em TIMESTAMP;
  END IF;
  
  -- Enriquecido Por
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dim_entidade' AND column_name = 'enriquecido_por') THEN
    ALTER TABLE dim_entidade ADD COLUMN enriquecido_por VARCHAR(255) REFERENCES users(id);
  END IF;
END $$;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_entidade_cidade_uf ON dim_entidade(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_entidade_porte ON dim_entidade(porte);
CREATE INDEX IF NOT EXISTS idx_entidade_setor ON dim_entidade(setor);
CREATE INDEX IF NOT EXISTS idx_entidade_segmentacao ON dim_entidade(segmentacao_b2b_b2c);
CREATE INDEX IF NOT EXISTS idx_entidade_score ON dim_entidade(score_qualidade);
CREATE INDEX IF NOT EXISTS idx_entidade_email ON dim_entidade(email);

SELECT '✅ PARTE 1: Colunas adicionadas em dim_entidade' as status;

-- ============================================================================
-- PARTE 2: CRIAR TABELAS DE IA
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

CREATE INDEX IF NOT EXISTS idx_mercado_entidade ON dim_mercado(entidade_id);
CREATE INDEX IF NOT EXISTS idx_mercado_categoria ON dim_mercado(categoria);
CREATE INDEX IF NOT EXISTS idx_mercado_segmentacao ON dim_mercado(segmentacao);

-- Tabela de Produtos/Serviços
CREATE TABLE IF NOT EXISTS dim_produto (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  
  -- Dados do produto
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  ordem INTEGER DEFAULT 1 CHECK (ordem >= 1 AND ordem <= 3),
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_produto_entidade ON dim_produto(entidade_id);
CREATE INDEX IF NOT EXISTS idx_produto_categoria ON dim_produto(categoria);
CREATE INDEX IF NOT EXISTS idx_produto_ordem ON dim_produto(entidade_id, ordem);

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
  ordem INTEGER DEFAULT 1 CHECK (ordem >= 1 AND ordem <= 5),
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_concorrente_entidade ON dim_concorrente(entidade_id);
CREATE INDEX IF NOT EXISTS idx_concorrente_cidade_uf ON dim_concorrente(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_concorrente_porte ON dim_concorrente(porte);
CREATE INDEX IF NOT EXISTS idx_concorrente_ordem ON dim_concorrente(entidade_id, ordem);

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
  ordem INTEGER DEFAULT 1 CHECK (ordem >= 1 AND ordem <= 5),
  
  -- Auditoria
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by VARCHAR(255) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_lead_entidade ON dim_lead(entidade_id);
CREATE INDEX IF NOT EXISTS idx_lead_cidade_uf ON dim_lead(cidade, uf);
CREATE INDEX IF NOT EXISTS idx_lead_status ON dim_lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_prioridade ON dim_lead(prioridade);
CREATE INDEX IF NOT EXISTS idx_lead_setor ON dim_lead(setor);
CREATE INDEX IF NOT EXISTS idx_lead_ordem ON dim_lead(entidade_id, ordem);

SELECT '✅ PARTE 2: Tabelas de IA criadas' as status;

-- ============================================================================
-- PARTE 3: TRIGGERS E MELHORIAS
-- ============================================================================

-- Function: Atualizar updated_at
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
DROP TRIGGER IF EXISTS trigger_updated_at_dim_entidade ON dim_entidade;
CREATE TRIGGER trigger_updated_at_dim_entidade
BEFORE UPDATE ON dim_entidade
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_dim_mercado ON dim_mercado;
CREATE TRIGGER trigger_updated_at_dim_mercado
BEFORE UPDATE ON dim_mercado
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

DROP TRIGGER IF EXISTS trigger_updated_at_dim_lead ON dim_lead;
CREATE TRIGGER trigger_updated_at_dim_lead
BEFORE UPDATE ON dim_lead
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

-- Tabela de Alertas
CREATE TABLE IF NOT EXISTS ia_alertas (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('budget_75', 'budget_90', 'budget_100')),
  percentual INTEGER NOT NULL CHECK (percentual IN (75, 90, 100)),
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

-- Tabela de Histórico de Configurações
CREATE TABLE IF NOT EXISTS ia_config_historico (
  id SERIAL PRIMARY KEY,
  plataforma VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  budget_mensal DECIMAL(10, 2) NOT NULL,
  alterado_por VARCHAR(255) NOT NULL REFERENCES users(id),
  alterado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  motivo TEXT
);

CREATE INDEX IF NOT EXISTS idx_ia_config_historico_alterado_em ON ia_config_historico(alterado_em);

-- Novos Status de Qualificação
INSERT INTO dim_status_qualificacao (codigo, nome, descricao, cor, ordem, created_by) VALUES
('qualificado', 'Qualificado', 'Lead qualificado e pronto para contato', '#10b981', 4, 'sistema'),
('em_negociacao', 'Em Negociação', 'Em processo de negociação/venda', '#f59e0b', 5, 'sistema'),
('convertido', 'Convertido', 'Lead convertido em cliente', '#22c55e', 6, 'sistema'),
('perdido', 'Perdido', 'Oportunidade perdida', '#ef4444', 7, 'sistema'),
('suspenso', 'Suspenso', 'Cliente suspenso temporariamente', '#6b7280', 8, 'sistema')
ON CONFLICT (codigo) DO NOTHING;

-- Adicionar colunas em users
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ultimo_acesso') THEN
    ALTER TABLE users ADD COLUMN ultimo_acesso TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_acessos') THEN
    ALTER TABLE users ADD COLUMN total_acessos INTEGER DEFAULT 0;
  END IF;
END $$;

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

SELECT '✅ PARTE 3: Triggers e melhorias criados' as status;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

SELECT '🎉 TODAS AS MIGRATIONS EXECUTADAS COM SUCESSO!' as status;

-- Verificar tabelas criadas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('dim_mercado', 'dim_produto', 'dim_concorrente', 'dim_lead', 'ia_alertas', 'ia_config_historico')
ORDER BY table_name;

-- Verificar colunas em dim_entidade
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dim_entidade'
  AND column_name IN ('email', 'telefone', 'site', 'cidade', 'uf', 'porte', 'setor', 'produto_principal', 'segmentacao_b2b_b2c', 'score_qualidade')
ORDER BY column_name;
