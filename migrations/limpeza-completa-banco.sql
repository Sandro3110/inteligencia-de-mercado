-- ============================================================================
-- LIMPEZA COMPLETA DO BANCO DE DADOS
-- Data: 2025-12-01
-- Objetivo: Apagar todos os dados de pesquisa/projeto e tabelas auxiliares
-- Manter apenas: users, system_settings, cidades_brasil
-- ============================================================================

-- ============================================================================
-- PASSO 1: TRUNCAR TABELAS DE DADOS (CASCADE para dependências)
-- ============================================================================

-- Dados principais
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE concorrentes CASCADE;
TRUNCATE TABLE produtos CASCADE;
TRUNCATE TABLE mercados_unicos CASCADE;
TRUNCATE TABLE clientes_mercados CASCADE;
TRUNCATE TABLE pesquisas CASCADE;
TRUNCATE TABLE projects CASCADE;

-- ============================================================================
-- PASSO 2: TRUNCAR TABELAS DE HISTÓRICO
-- ============================================================================

TRUNCATE TABLE clientes_history CASCADE;
TRUNCATE TABLE leads_history CASCADE;
TRUNCATE TABLE concorrentes_history CASCADE;
TRUNCATE TABLE mercados_history CASCADE;

-- ============================================================================
-- PASSO 3: TRUNCAR TABELAS DE JOBS E LOGS
-- ============================================================================

TRUNCATE TABLE enrichment_jobs CASCADE;
TRUNCATE TABLE enrichment_runs CASCADE;
TRUNCATE TABLE enrichment_cache CASCADE;
TRUNCATE TABLE geocoding_jobs CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE user_activity_log CASCADE;
TRUNCATE TABLE project_audit_log CASCADE;
TRUNCATE TABLE performance_metrics CASCADE;

-- ============================================================================
-- PASSO 4: TRUNCAR TABELAS AUXILIARES
-- ============================================================================

TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE export_history CASCADE;
TRUNCATE TABLE user_invites CASCADE;
TRUNCATE TABLE login_attempts CASCADE;
TRUNCATE TABLE password_resets CASCADE;

-- ============================================================================
-- PASSO 5: RESETAR SEQUENCES (AUTO_INCREMENT)
-- ============================================================================

-- Resetar IDs para começar do 1
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE leads_id_seq RESTART WITH 1;
ALTER SEQUENCE concorrentes_id_seq RESTART WITH 1;
ALTER SEQUENCE produtos_id_seq RESTART WITH 1;
ALTER SEQUENCE mercados_unicos_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_mercados_id_seq RESTART WITH 1;
ALTER SEQUENCE pesquisas_id_seq RESTART WITH 1;
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_jobs_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

-- ============================================================================
-- PASSO 6: VERIFICAR LIMPEZA
-- ============================================================================

SELECT 
  'clientes' as tabela, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'concorrentes', COUNT(*) FROM concorrentes
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos
UNION ALL
SELECT 'mercados_unicos', COUNT(*) FROM mercados_unicos
UNION ALL
SELECT 'clientes_mercados', COUNT(*) FROM clientes_mercados
UNION ALL
SELECT 'pesquisas', COUNT(*) FROM pesquisas
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'enrichment_jobs', COUNT(*) FROM enrichment_jobs
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- ============================================================================
-- TABELAS MANTIDAS (NÃO APAGAR):
-- - users (usuários do sistema)
-- - system_settings (configurações)
-- - cidades_brasil (dados geográficos)
-- - email_config (configuração de email)
-- - enrichment_configs (configurações de enriquecimento)
-- ============================================================================

SELECT 
  'users' as tabela_mantida, COUNT(*) as registros FROM users
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL
SELECT 'cidades_brasil', COUNT(*) FROM cidades_brasil;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Todas as tabelas de dados: 0 registros
-- - Tabelas mantidas: > 0 registros
-- - Banco limpo e pronto para re-arquitetura
-- ============================================================================
