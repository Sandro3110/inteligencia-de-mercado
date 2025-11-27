-- ============================================================================
-- SCRIPT PARA EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================================
-- Como executar:
-- 1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- 2. Cole este script completo
-- 3. Clique em "RUN"
-- ============================================================================

BEGIN;

-- PASSO 1: Aprovar e configurar sandrodireto@gmail.com como admin
UPDATE users 
SET 
  ativo = 1,
  role = 'admin',
  liberado_por = id,
  liberado_em = NOW()
WHERE email = 'sandrodireto@gmail.com';

-- PASSO 2: Apagar todos os outros usuários
DELETE FROM users 
WHERE email != 'sandrodireto@gmail.com';

-- PASSO 3: Limpar todos os dados de teste
DELETE FROM activity_log;
DELETE FROM alert_history;
DELETE FROM alert_configs;
DELETE FROM analytics_timeline;
DELETE FROM analytics_pesquisas;
DELETE FROM analytics_mercados;
DELETE FROM analytics_dimensoes;
DELETE FROM clientes_history;
DELETE FROM clientes_mercados;
DELETE FROM clientes;
DELETE FROM concorrentes_history;
DELETE FROM concorrentes;
DELETE FROM enrichment_cache;
DELETE FROM enrichment_configs;
DELETE FROM enrichment_jobs;
DELETE FROM enrichment_queue;
DELETE FROM enrichment_runs;
DELETE FROM entity_tags;
DELETE FROM hibernation_warnings;
DELETE FROM intelligent_alerts_history;
DELETE FROM intelligent_alerts_configs;
DELETE FROM lead_conversions;
DELETE FROM leads_history;
DELETE FROM leads;
DELETE FROM mercados_history;
DELETE FROM mercados_unicos;
DELETE FROM notifications;
DELETE FROM pesquisa_fields;
DELETE FROM pesquisa_results;
DELETE FROM pesquisas;
DELETE FROM project_members;
DELETE FROM projects;
DELETE FROM research_drafts;
DELETE FROM saved_filters_export;
DELETE FROM search_history;
DELETE FROM territorial_analysis;
DELETE FROM territorial_comparisons;

-- PASSO 4: Resetar sequences
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE pesquisas_id_seq RESTART WITH 1;
ALTER SEQUENCE mercados_unicos_id_seq RESTART WITH 1;
ALTER SEQUENCE leads_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE concorrentes_id_seq RESTART WITH 1;
ALTER SEQUENCE activity_log_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE alert_configs_id_seq RESTART WITH 1;
ALTER SEQUENCE alert_history_id_seq RESTART WITH 1;
ALTER SEQUENCE saved_filters_export_id_seq RESTART WITH 1;
ALTER SEQUENCE search_history_id_seq RESTART WITH 1;
ALTER SEQUENCE research_drafts_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_cache_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_queue_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_jobs_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_runs_id_seq RESTART WITH 1;
ALTER SEQUENCE territorial_analysis_id_seq RESTART WITH 1;
ALTER SEQUENCE territorial_comparisons_id_seq RESTART WITH 1;

COMMIT;

-- Verificação
SELECT 
  'Admin configurado' as status,
  email, 
  nome, 
  role, 
  ativo 
FROM users 
WHERE email = 'sandrodireto@gmail.com';

SELECT 
  'Total de usuários' as info,
  COUNT(*) as total 
FROM users;

SELECT 
  'Dados restantes' as info,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM pesquisas) as pesquisas,
  (SELECT COUNT(*) FROM mercados_unicos) as mercados,
  (SELECT COUNT(*) FROM leads) as leads;
