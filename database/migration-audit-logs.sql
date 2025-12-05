-- ============================================================================
-- MIGRATION: Sistema de Audit Logs Completo
-- Descrição: Cria tabela audit_logs e triggers automáticos para rastreamento
-- Data: 05/12/2024
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELA audit_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identificação da operação
  tabela VARCHAR(100) NOT NULL,
  operacao VARCHAR(10) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id INTEGER NOT NULL,
  
  -- Dados da alteração
  dados_anteriores JSONB,
  dados_novos JSONB,
  campos_alterados TEXT[],
  
  -- Contexto da operação
  usuario_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Índices para performance
  CONSTRAINT audit_logs_tabela_operacao_check CHECK (tabela IN (
    'dim_entidade',
    'dim_produto',
    'dim_mercado',
    'dim_produto_catalogo',
    'fato_entidade_produto',
    'fato_produto_mercado',
    'fato_entidade_contexto',
    'dim_importacao'
  ))
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela_registro 
  ON audit_logs(tabela, registro_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario 
  ON audit_logs(usuario_id) WHERE usuario_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_operacao 
  ON audit_logs(operacao);

COMMENT ON TABLE audit_logs IS 'Histórico completo de alterações em todas as tabelas';
COMMENT ON COLUMN audit_logs.tabela IS 'Nome da tabela auditada';
COMMENT ON COLUMN audit_logs.operacao IS 'Tipo de operação: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN audit_logs.registro_id IS 'ID do registro alterado';
COMMENT ON COLUMN audit_logs.dados_anteriores IS 'Estado anterior do registro (JSON)';
COMMENT ON COLUMN audit_logs.dados_novos IS 'Estado novo do registro (JSON)';
COMMENT ON COLUMN audit_logs.campos_alterados IS 'Lista de campos que foram alterados';

-- ============================================================================
-- 2. FUNÇÃO GENÉRICA DE AUDITORIA
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  dados_anteriores JSONB;
  dados_novos JSONB;
  campos_alterados TEXT[];
  campo TEXT;
BEGIN
  -- Determinar dados anteriores e novos
  IF (TG_OP = 'DELETE') THEN
    dados_anteriores := row_to_json(OLD)::JSONB;
    dados_novos := NULL;
  ELSIF (TG_OP = 'UPDATE') THEN
    dados_anteriores := row_to_json(OLD)::JSONB;
    dados_novos := row_to_json(NEW)::JSONB;
    
    -- Identificar campos alterados
    FOR campo IN SELECT jsonb_object_keys(dados_novos) LOOP
      IF dados_anteriores->campo IS DISTINCT FROM dados_novos->campo THEN
        campos_alterados := array_append(campos_alterados, campo);
      END IF;
    END LOOP;
  ELSIF (TG_OP = 'INSERT') THEN
    dados_anteriores := NULL;
    dados_novos := row_to_json(NEW)::JSONB;
  END IF;

  -- Inserir log de auditoria
  INSERT INTO audit_logs (
    tabela,
    operacao,
    registro_id,
    dados_anteriores,
    dados_novos,
    campos_alterados,
    usuario_id,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    dados_anteriores,
    dados_novos,
    campos_alterados,
    COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by),
    NOW()
  );

  -- Retornar registro apropriado
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_trigger_func() IS 'Função genérica para auditoria automática de INSERT, UPDATE e DELETE';

-- ============================================================================
-- 3. CRIAR TRIGGERS PARA CADA TABELA
-- ============================================================================

-- dim_entidade
DROP TRIGGER IF EXISTS audit_dim_entidade ON dim_entidade;
CREATE TRIGGER audit_dim_entidade
  AFTER INSERT OR UPDATE OR DELETE ON dim_entidade
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- dim_produto
DROP TRIGGER IF EXISTS audit_dim_produto ON dim_produto;
CREATE TRIGGER audit_dim_produto
  AFTER INSERT OR UPDATE OR DELETE ON dim_produto
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- dim_mercado
DROP TRIGGER IF EXISTS audit_dim_mercado ON dim_mercado;
CREATE TRIGGER audit_dim_mercado
  AFTER INSERT OR UPDATE OR DELETE ON dim_mercado
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- dim_produto_catalogo
DROP TRIGGER IF EXISTS audit_dim_produto_catalogo ON dim_produto_catalogo;
CREATE TRIGGER audit_dim_produto_catalogo
  AFTER INSERT OR UPDATE OR DELETE ON dim_produto_catalogo
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- fato_entidade_produto
DROP TRIGGER IF EXISTS audit_fato_entidade_produto ON fato_entidade_produto;
CREATE TRIGGER audit_fato_entidade_produto
  AFTER INSERT OR UPDATE OR DELETE ON fato_entidade_produto
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- fato_produto_mercado
DROP TRIGGER IF EXISTS audit_fato_produto_mercado ON fato_produto_mercado;
CREATE TRIGGER audit_fato_produto_mercado
  AFTER INSERT OR UPDATE OR DELETE ON fato_produto_mercado
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- fato_entidade_contexto
DROP TRIGGER IF EXISTS audit_fato_entidade_contexto ON fato_entidade_contexto;
CREATE TRIGGER audit_fato_entidade_contexto
  AFTER INSERT OR UPDATE OR DELETE ON fato_entidade_contexto
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- dim_importacao
DROP TRIGGER IF EXISTS audit_dim_importacao ON dim_importacao;
CREATE TRIGGER audit_dim_importacao
  AFTER INSERT OR UPDATE OR DELETE ON dim_importacao
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- 4. VIEWS ÚTEIS PARA CONSULTA
-- ============================================================================

-- View: Últimas alterações (24h)
CREATE OR REPLACE VIEW v_audit_logs_recentes AS
SELECT 
  al.id,
  al.tabela,
  al.operacao,
  al.registro_id,
  al.campos_alterados,
  al.usuario_id,
  al.created_at,
  CASE 
    WHEN al.tabela = 'dim_entidade' THEN (al.dados_novos->>'nome')
    WHEN al.tabela = 'dim_produto' THEN (al.dados_novos->>'nome')
    WHEN al.tabela = 'dim_mercado' THEN (al.dados_novos->>'nome')
    ELSE NULL
  END as nome_registro
FROM audit_logs al
WHERE al.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY al.created_at DESC;

COMMENT ON VIEW v_audit_logs_recentes IS 'Últimas alterações nas últimas 24 horas';

-- View: Histórico de alterações por entidade
CREATE OR REPLACE VIEW v_audit_entidade_historico AS
SELECT 
  al.id,
  al.operacao,
  al.registro_id as entidade_id,
  al.campos_alterados,
  al.dados_anteriores,
  al.dados_novos,
  al.usuario_id,
  al.created_at
FROM audit_logs al
WHERE al.tabela = 'dim_entidade'
ORDER BY al.registro_id, al.created_at DESC;

COMMENT ON VIEW v_audit_entidade_historico IS 'Histórico completo de alterações em entidades';

-- View: Estatísticas de auditoria
CREATE OR REPLACE VIEW v_audit_stats AS
SELECT 
  al.tabela,
  al.operacao,
  COUNT(*) as total_operacoes,
  COUNT(DISTINCT al.usuario_id) as usuarios_distintos,
  MIN(al.created_at) as primeira_operacao,
  MAX(al.created_at) as ultima_operacao
FROM audit_logs al
GROUP BY al.tabela, al.operacao
ORDER BY al.tabela, al.operacao;

COMMENT ON VIEW v_audit_stats IS 'Estatísticas de operações por tabela e tipo';

-- ============================================================================
-- 5. FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função: Buscar histórico de um registro
CREATE OR REPLACE FUNCTION get_audit_history(
  p_tabela VARCHAR,
  p_registro_id INTEGER,
  p_limite INTEGER DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  operacao VARCHAR,
  campos_alterados TEXT[],
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.operacao,
    al.campos_alterados,
    al.dados_anteriores,
    al.dados_novos,
    al.usuario_id,
    al.created_at
  FROM audit_logs al
  WHERE al.tabela = p_tabela
    AND al.registro_id = p_registro_id
  ORDER BY al.created_at DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_audit_history IS 'Busca histórico completo de alterações de um registro específico';

-- Função: Comparar versões de um registro
CREATE OR REPLACE FUNCTION compare_audit_versions(
  p_tabela VARCHAR,
  p_registro_id INTEGER,
  p_version1_id BIGINT,
  p_version2_id BIGINT
)
RETURNS TABLE (
  campo TEXT,
  valor_version1 TEXT,
  valor_version2 TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH versions AS (
    SELECT 
      al.id,
      al.dados_novos
    FROM audit_logs al
    WHERE al.tabela = p_tabela
      AND al.registro_id = p_registro_id
      AND al.id IN (p_version1_id, p_version2_id)
  ),
  v1 AS (SELECT dados_novos FROM versions WHERE id = p_version1_id),
  v2 AS (SELECT dados_novos FROM versions WHERE id = p_version2_id)
  SELECT 
    key as campo,
    (v1.dados_novos->>key) as valor_version1,
    (v2.dados_novos->>key) as valor_version2
  FROM v1, v2, jsonb_object_keys(v1.dados_novos) as key
  WHERE (v1.dados_novos->>key) IS DISTINCT FROM (v2.dados_novos->>key);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION compare_audit_versions IS 'Compara duas versões de um registro e retorna diferenças';

-- ============================================================================
-- 6. POLÍTICA DE RETENÇÃO (OPCIONAL)
-- ============================================================================

-- Função para limpar logs antigos (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  p_retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Remove logs de auditoria mais antigos que X dias (padrão: 365)';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

SELECT 'Sistema de Audit Logs criado com sucesso!' as resultado;
SELECT 'Triggers automáticos ativados para 8 tabelas' as info;
SELECT 'Views e funções utilitárias disponíveis' as info2;
