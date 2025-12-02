-- Tabela de configuração de IA
CREATE TABLE IF NOT EXISTS ia_config (
  id SERIAL PRIMARY KEY,
  plataforma VARCHAR(50) NOT NULL DEFAULT 'openai', -- openai, google, anthropic
  modelo VARCHAR(100) NOT NULL DEFAULT 'gpt-4o-mini',
  budget_mensal DECIMAL(10, 2) DEFAULT 150.00,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO ia_config (plataforma, modelo, budget_mensal)
VALUES ('openai', 'gpt-4o-mini', 150.00)
ON CONFLICT DO NOTHING;

-- Tabela de uso de IA
CREATE TABLE IF NOT EXISTS ia_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  processo VARCHAR(100) NOT NULL, -- 'enriquecimento', 'analise_mercado', 'sugestoes'
  plataforma VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  custo DECIMAL(10, 6) NOT NULL,
  duracao_ms INTEGER NOT NULL,
  entidade_id INTEGER, -- opcional, se for enriquecimento
  projeto_id INTEGER, -- opcional, se for análise
  sucesso BOOLEAN DEFAULT TRUE,
  erro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ia_usage_user ON ia_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_usage_processo ON ia_usage(processo);
CREATE INDEX IF NOT EXISTS idx_ia_usage_created ON ia_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ia_usage_user_processo ON ia_usage(user_id, processo);

-- View para estatísticas diárias
CREATE OR REPLACE VIEW ia_stats_daily AS
SELECT
  DATE(created_at) as data,
  processo,
  COUNT(*) as total_chamadas,
  SUM(total_tokens) as total_tokens,
  SUM(custo) as custo_total,
  AVG(duracao_ms) as duracao_media
FROM ia_usage
WHERE sucesso = TRUE
GROUP BY DATE(created_at), processo
ORDER BY data DESC;

-- View para estatísticas mensais
CREATE OR REPLACE VIEW ia_stats_monthly AS
SELECT
  DATE_TRUNC('month', created_at) as mes,
  processo,
  COUNT(*) as total_chamadas,
  SUM(total_tokens) as total_tokens,
  SUM(custo) as custo_total,
  AVG(duracao_ms) as duracao_media
FROM ia_usage
WHERE sucesso = TRUE
GROUP BY DATE_TRUNC('month', created_at), processo
ORDER BY mes DESC;

-- View para consumo por usuário
CREATE OR REPLACE VIEW ia_stats_by_user AS
SELECT
  u.user_id,
  up.nome as usuario_nome,
  up.email as usuario_email,
  COUNT(*) as total_chamadas,
  SUM(u.total_tokens) as total_tokens,
  SUM(u.custo) as custo_total
FROM ia_usage u
LEFT JOIN user_profiles up ON u.user_id = up.id
WHERE u.sucesso = TRUE
  AND u.created_at >= DATE_TRUNC('month', NOW())
GROUP BY u.user_id, up.nome, up.email
ORDER BY custo_total DESC;

-- View para consumo por processo
CREATE OR REPLACE VIEW ia_stats_by_processo AS
SELECT
  processo,
  COUNT(*) as total_chamadas,
  SUM(total_tokens) as total_tokens,
  SUM(custo) as custo_total,
  AVG(duracao_ms) as duracao_media
FROM ia_usage
WHERE sucesso = TRUE
  AND created_at >= DATE_TRUNC('month', NOW())
GROUP BY processo
ORDER BY custo_total DESC;

-- Função para obter uso do mês atual
CREATE OR REPLACE FUNCTION get_monthly_usage()
RETURNS TABLE (
  total_chamadas BIGINT,
  total_tokens BIGINT,
  custo_total NUMERIC,
  budget NUMERIC,
  percentual_usado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_chamadas,
    SUM(ia_usage.total_tokens)::BIGINT as total_tokens,
    SUM(ia_usage.custo) as custo_total,
    (SELECT budget_mensal FROM ia_config WHERE ativo = TRUE LIMIT 1) as budget,
    ROUND((SUM(ia_usage.custo) / (SELECT budget_mensal FROM ia_config WHERE ativo = TRUE LIMIT 1)) * 100, 2) as percentual_usado
  FROM ia_usage
  WHERE sucesso = TRUE
    AND created_at >= DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;
