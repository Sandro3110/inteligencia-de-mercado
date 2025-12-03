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
-- ============================================================================
-- MIGRATION 003: Triggers e Melhorias
-- ============================================================================
-- Data: 02/12/2025
-- Objetivo: Adicionar automações e melhorias no sistema
-- ============================================================================

-- ============================================================================
-- 1. TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas relevantes
CREATE TRIGGER trigger_updated_at_dim_entidade
BEFORE UPDATE ON dim_entidade
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_updated_at_dim_mercado
BEFORE UPDATE ON dim_mercado
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_updated_at_dim_lead
BEFORE UPDATE ON dim_lead
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

-- ============================================================================
-- 2. TABELA: Alertas de Budget de IA
-- ============================================================================

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

CREATE INDEX idx_ia_alertas_tipo ON ia_alertas(tipo);
CREATE INDEX idx_ia_alertas_enviado ON ia_alertas(enviado);
CREATE INDEX idx_ia_alertas_created_at ON ia_alertas(created_at);

COMMENT ON TABLE ia_alertas IS 'Alertas de budget de IA (75%, 90%, 100%)';

-- ============================================================================
-- 3. FUNCTION: Verificar Budget de IA
-- ============================================================================

CREATE OR REPLACE FUNCTION verificar_budget_ia()
RETURNS TRIGGER AS $$
DECLARE
  budget_total DECIMAL(10, 2);
  custo_usado DECIMAL(10, 6);
  percentual_usado DECIMAL(5, 2);
  mes_atual DATE;
BEGIN
  -- Obter budget configurado
  SELECT budget_mensal INTO budget_total 
  FROM ia_config 
  WHERE ativo = true 
  LIMIT 1;
  
  IF budget_total IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calcular custo usado no mês atual
  mes_atual := DATE_TRUNC('month', NOW());
  
  SELECT COALESCE(SUM(custo), 0) INTO custo_usado
  FROM ia_usage
  WHERE DATE_TRUNC('month', created_at) = mes_atual;
  
  percentual_usado := (custo_usado / budget_total) * 100;
  
  -- Alerta 75%
  IF percentual_usado >= 75 AND percentual_usado < 90 AND NOT EXISTS (
    SELECT 1 FROM ia_alertas 
    WHERE tipo = 'budget_75' 
    AND DATE_TRUNC('month', created_at) = mes_atual
  ) THEN
    INSERT INTO ia_alertas (tipo, percentual, mensagem, custo_atual, budget_total)
    VALUES (
      'budget_75', 
      75, 
      'Budget de IA atingiu 75% ($' || custo_usado || ' de $' || budget_total || ')',
      custo_usado,
      budget_total
    );
  END IF;
  
  -- Alerta 90%
  IF percentual_usado >= 90 AND percentual_usado < 100 AND NOT EXISTS (
    SELECT 1 FROM ia_alertas 
    WHERE tipo = 'budget_90' 
    AND DATE_TRUNC('month', created_at) = mes_atual
  ) THEN
    INSERT INTO ia_alertas (tipo, percentual, mensagem, custo_atual, budget_total)
    VALUES (
      'budget_90', 
      90, 
      'ATENÇÃO: Budget de IA atingiu 90% ($' || custo_usado || ' de $' || budget_total || ')',
      custo_usado,
      budget_total
    );
  END IF;
  
  -- Alerta 100%
  IF percentual_usado >= 100 AND NOT EXISTS (
    SELECT 1 FROM ia_alertas 
    WHERE tipo = 'budget_100' 
    AND DATE_TRUNC('month', created_at) = mes_atual
  ) THEN
    INSERT INTO ia_alertas (tipo, percentual, mensagem, custo_atual, budget_total)
    VALUES (
      'budget_100', 
      100, 
      'CRÍTICO: Budget de IA ESGOTADO ($' || custo_usado || ' de $' || budget_total || ')',
      custo_usado,
      budget_total
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER trigger_verificar_budget
AFTER INSERT ON ia_usage
FOR EACH ROW
EXECUTE FUNCTION verificar_budget_ia();

-- ============================================================================
-- 4. TABELA: Histórico de Configurações de IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS ia_config_historico (
  id SERIAL PRIMARY KEY,
  plataforma VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  budget_mensal DECIMAL(10, 2) NOT NULL,
  alterado_por VARCHAR(255) NOT NULL REFERENCES users(id),
  alterado_em TIMESTAMP NOT NULL DEFAULT NOW(),
  motivo TEXT
);

CREATE INDEX idx_ia_config_historico_alterado_em ON ia_config_historico(alterado_em);

COMMENT ON TABLE ia_config_historico IS 'Histórico de alterações na configuração de IA';

-- ============================================================================
-- 5. TRIGGER: Registrar Histórico de Configurações
-- ============================================================================

CREATE OR REPLACE FUNCTION registrar_historico_ia_config()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (
    OLD.plataforma != NEW.plataforma OR 
    OLD.modelo != NEW.modelo OR 
    OLD.budget_mensal != NEW.budget_mensal
  ) THEN
    INSERT INTO ia_config_historico (
      plataforma, modelo, budget_mensal, alterado_por
    ) VALUES (
      OLD.plataforma, OLD.modelo, OLD.budget_mensal, NEW.updated_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historico_ia_config
AFTER UPDATE ON ia_config
FOR EACH ROW
EXECUTE FUNCTION registrar_historico_ia_config();

-- ============================================================================
-- 6. ADICIONAR: Mais Status de Qualificação
-- ============================================================================

INSERT INTO dim_status_qualificacao (codigo, nome, descricao, cor, ordem, created_by) VALUES
('qualificado', 'Qualificado', 'Lead qualificado e pronto para contato', '#10b981', 4, 'sistema'),
('em_negociacao', 'Em Negociação', 'Em processo de negociação/venda', '#f59e0b', 5, 'sistema'),
('convertido', 'Convertido', 'Lead convertido em cliente', '#22c55e', 6, 'sistema'),
('perdido', 'Perdido', 'Oportunidade perdida', '#ef4444', 7, 'sistema'),
('suspenso', 'Suspenso', 'Cliente suspenso temporariamente', '#6b7280', 8, 'sistema')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- 7. ADICIONAR: Campo de Último Acesso em Users
-- ============================================================================

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS ultimo_acesso TIMESTAMP,
  ADD COLUMN IF NOT EXISTS total_acessos INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_ultimo_acesso ON users(ultimo_acesso);

COMMENT ON COLUMN users.ultimo_acesso IS 'Data/hora do último acesso do usuário';
COMMENT ON COLUMN users.total_acessos IS 'Total de acessos do usuário';

-- ============================================================================
-- 8. VIEW: Dashboard de IA
-- ============================================================================

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

COMMENT ON VIEW vw_dashboard_ia IS 'Dashboard de uso de IA (mês atual)';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT 'Triggers e melhorias criados com sucesso!' as status;

-- Verificar triggers
SELECT 
  trigger_name, 
  event_object_table as tabela,
  action_statement as funcao
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_%'
ORDER BY event_object_table, trigger_name;

-- Verificar novos status
SELECT codigo, nome, cor, ordem
FROM dim_status_qualificacao
ORDER BY ordem;
