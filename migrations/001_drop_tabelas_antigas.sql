-- ============================================================================
-- MIGRATION 001: Apagar Tabelas Antigas
-- Data: 2025-12-01
-- Objetivo: Remover tabelas antigas para criar estrutura nova padronizada
-- ============================================================================

-- ============================================================================
-- PASSO 1: Apagar tabelas de dados antigas
-- ============================================================================

DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS concorrentes CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS mercados_unicos CASCADE;
DROP TABLE IF EXISTS clientes_mercados CASCADE;

-- ============================================================================
-- PASSO 2: Apagar tabelas de histórico antigas
-- ============================================================================

DROP TABLE IF EXISTS clientes_history CASCADE;
DROP TABLE IF EXISTS leads_history CASCADE;
DROP TABLE IF EXISTS concorrentes_history CASCADE;
DROP TABLE IF EXISTS mercados_history CASCADE;

-- ============================================================================
-- PASSO 3: Apagar tabelas auxiliares antigas
-- ============================================================================

DROP TABLE IF EXISTS enrichment_jobs CASCADE;
DROP TABLE IF EXISTS enrichment_runs CASCADE;
DROP TABLE IF EXISTS enrichment_cache CASCADE;
DROP TABLE IF EXISTS enrichment_configs CASCADE;
DROP TABLE IF EXISTS geocoding_jobs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS project_audit_log CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS export_history CASCADE;

-- ============================================================================
-- PASSO 4: Listar tabelas restantes
-- ============================================================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- TABELAS MANTIDAS:
-- - users (usuários do sistema)
-- - system_settings (configurações)
-- - cidades_brasil (dados geográficos)
-- - email_config (configuração de email)
-- - notifications (notificações)
-- - password_resets (reset de senha)
-- - user_invites (convites)
-- - login_attempts (tentativas de login)
-- - pesquisas (será recriada)
-- - projects (será recriada)
-- ============================================================================
