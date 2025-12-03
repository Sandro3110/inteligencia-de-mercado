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
