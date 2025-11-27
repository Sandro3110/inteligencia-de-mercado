-- ============================================================================
-- LIMPEZA PROFUNDA COMPLETA - IntelMarket
-- ============================================================================
-- Objetivo: 
-- 1. Aprovar sandrodireto@gmail.com como admin
-- 2. Apagar TODOS os outros usuários
-- 3. Apagar TODOS os dados relacionados a outros usuários
-- 4. Apagar TODOS os dados de teste
-- 5. Resetar sequences
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: IDENTIFICAR ADMIN
-- ============================================================================

DO $$
DECLARE
  v_admin_id VARCHAR(64);
  v_admin_email VARCHAR(320);
BEGIN
  -- Buscar ID do admin
  SELECT id, email INTO v_admin_id, v_admin_email
  FROM users 
  WHERE email = 'sandrodireto@gmail.com'
  LIMIT 1;
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'ERRO: Admin sandrodireto@gmail.com não encontrado!';
  ELSE
    RAISE NOTICE '✅ Admin encontrado: % (ID: %)', v_admin_email, v_admin_id;
  END IF;
  
  -- Armazenar em variável temporária
  CREATE TEMP TABLE temp_admin AS
  SELECT id, email FROM users WHERE email = 'sandrodireto@gmail.com';
END $$;

-- ============================================================================
-- PASSO 2: CONTAR DADOS ANTES DE APAGAR
-- ============================================================================

DO $$
DECLARE
  v_users INTEGER;
  v_projects INTEGER;
  v_pesquisas INTEGER;
  v_mercados INTEGER;
  v_leads INTEGER;
  v_clientes INTEGER;
  v_concorrentes INTEGER;
  v_notifications INTEGER;
  v_export_history INTEGER;
  v_saved_filters INTEGER;
  v_research_drafts INTEGER;
  v_user_invites INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_users FROM users;
  SELECT COUNT(*) INTO v_projects FROM projects;
  SELECT COUNT(*) INTO v_pesquisas FROM pesquisas;
  SELECT COUNT(*) INTO v_mercados FROM mercados_unicos;
  SELECT COUNT(*) INTO v_leads FROM leads;
  SELECT COUNT(*) INTO v_clientes FROM clientes;
  SELECT COUNT(*) INTO v_concorrentes FROM concorrentes;
  SELECT COUNT(*) INTO v_notifications FROM notifications;
  SELECT COUNT(*) INTO v_export_history FROM export_history;
  SELECT COUNT(*) INTO v_saved_filters FROM saved_filters;
  SELECT COUNT(*) INTO v_research_drafts FROM research_drafts;
  SELECT COUNT(*) INTO v_user_invites FROM user_invites;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'DADOS ANTES DA LIMPEZA:';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Usuários: %', v_users;
  RAISE NOTICE 'Projetos: %', v_projects;
  RAISE NOTICE 'Pesquisas: %', v_pesquisas;
  RAISE NOTICE 'Mercados: %', v_mercados;
  RAISE NOTICE 'Leads: %', v_leads;
  RAISE NOTICE 'Clientes: %', v_clientes;
  RAISE NOTICE 'Concorrentes: %', v_concorrentes;
  RAISE NOTICE 'Notificações: %', v_notifications;
  RAISE NOTICE 'Export History: %', v_export_history;
  RAISE NOTICE 'Filtros Salvos: %', v_saved_filters;
  RAISE NOTICE 'Rascunhos: %', v_research_drafts;
  RAISE NOTICE 'Convites: %', v_user_invites;
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PASSO 3: APAGAR DADOS DE OUTROS USUÁRIOS
-- ============================================================================

RAISE NOTICE 'PASSO 3: Apagando dados de outros usuários...';

-- 3.1 Export History
DELETE FROM export_history 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.2 Saved Filters Export
DELETE FROM saved_filters_export 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.3 Notifications
DELETE FROM notifications 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.4 Notification Preferences
DELETE FROM notification_preferences 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.5 Project Audit Log
DELETE FROM project_audit_log 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.6 Saved Filters
DELETE FROM saved_filters 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.7 Research Drafts
DELETE FROM research_drafts 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.8 Push Subscriptions
DELETE FROM push_subscriptions 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.9 Report Schedules
DELETE FROM report_schedules 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

-- 3.10 Password Resets
DELETE FROM password_resets 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

RAISE NOTICE '✅ Dados de outros usuários apagados';

-- ============================================================================
-- PASSO 4: APAGAR CONVITES E LOGIN ATTEMPTS
-- ============================================================================

RAISE NOTICE 'PASSO 4: Apagando convites e tentativas de login...';

-- 4.1 User Invites (TODOS)
DELETE FROM user_invites;

-- 4.2 Login Attempts (se existir coluna userId)
DELETE FROM login_attempts 
WHERE "userId" NOT IN (SELECT id FROM temp_admin);

RAISE NOTICE '✅ Convites e login attempts apagados';

-- ============================================================================
-- PASSO 5: APAGAR TODOS OS DADOS DE TESTE
-- ============================================================================

RAISE NOTICE 'PASSO 5: Apagando TODOS os dados de teste...';

-- 5.1 Histórico e Analytics (ordem importa por foreign keys)
DELETE FROM activity_log;
DELETE FROM alert_history;
DELETE FROM alert_configs;
DELETE FROM analytics_timeline;
DELETE FROM analytics_pesquisas;
DELETE FROM analytics_mercados;
DELETE FROM analytics_dimensoes;
DELETE FROM clientes_history;
DELETE FROM clientes_mercados;
DELETE FROM concorrentes_history;
DELETE FROM leads_history;
DELETE FROM mercados_history;

-- 5.2 Dados principais
DELETE FROM lead_conversions;
DELETE FROM leads;
DELETE FROM clientes;
DELETE FROM concorrentes;
DELETE FROM produtos;
DELETE FROM mercados_unicos;
DELETE FROM pesquisas;
DELETE FROM projects;

-- 5.3 Sistema e Configuração
DELETE FROM enrichment_cache;
DELETE FROM enrichment_configs;
DELETE FROM enrichment_jobs;
DELETE FROM enrichment_queue;
DELETE FROM enrichment_runs;
DELETE FROM entity_tags;
DELETE FROM hibernation_warnings;
DELETE FROM intelligent_alerts_configs;
DELETE FROM intelligent_alerts_history;
DELETE FROM operational_alerts;
DELETE FROM recommendations;
DELETE FROM salesforce_sync_log;
DELETE FROM scheduled_enrichments;

RAISE NOTICE '✅ Todos os dados de teste apagados';

-- ============================================================================
-- PASSO 6: APAGAR OUTROS USUÁRIOS
-- ============================================================================

RAISE NOTICE 'PASSO 6: Apagando outros usuários...';

DO $$
DECLARE
  v_deleted INTEGER;
  v_email TEXT;
BEGIN
  -- Listar usuários que serão apagados
  FOR v_email IN 
    SELECT email FROM users WHERE email != 'sandrodireto@gmail.com'
  LOOP
    RAISE NOTICE '  Apagando: %', v_email;
  END LOOP;
  
  -- Apagar
  DELETE FROM users 
  WHERE email != 'sandrodireto@gmail.com';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '✅ % usuários apagados', v_deleted;
END $$;

-- ============================================================================
-- PASSO 7: APROVAR E CONFIGURAR ADMIN
-- ============================================================================

RAISE NOTICE 'PASSO 7: Configurando admin...';

UPDATE users 
SET 
  ativo = 1,
  role = 'admin',
  liberado_por = id,
  liberado_em = NOW()
WHERE email = 'sandrodireto@gmail.com';

RAISE NOTICE '✅ Admin configurado';

-- ============================================================================
-- PASSO 8: RESETAR SEQUENCES
-- ============================================================================

RAISE NOTICE 'PASSO 8: Resetando sequences...';

ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE pesquisas_id_seq RESTART WITH 1;
ALTER SEQUENCE mercados_unicos_id_seq RESTART WITH 1;
ALTER SEQUENCE leads_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE concorrentes_id_seq RESTART WITH 1;
ALTER SEQUENCE produtos_id_seq RESTART WITH 1;
ALTER SEQUENCE activity_log_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE alert_configs_id_seq RESTART WITH 1;
ALTER SEQUENCE alert_history_id_seq RESTART WITH 1;
ALTER SEQUENCE saved_filters_export_id_seq RESTART WITH 1;
ALTER SEQUENCE saved_filters_id_seq RESTART WITH 1;
ALTER SEQUENCE research_drafts_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_cache_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_queue_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_jobs_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_runs_id_seq RESTART WITH 1;
ALTER SEQUENCE export_history_id_seq RESTART WITH 1;
ALTER SEQUENCE user_invites_id_seq RESTART WITH 1;
ALTER SEQUENCE login_attempts_id_seq RESTART WITH 1;
ALTER SEQUENCE password_resets_id_seq RESTART WITH 1;
ALTER SEQUENCE push_subscriptions_id_seq RESTART WITH 1;
ALTER SEQUENCE report_schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE project_audit_log_id_seq RESTART WITH 1;
ALTER SEQUENCE notification_preferences_id_seq RESTART WITH 1;
ALTER SEQUENCE entity_tags_id_seq RESTART WITH 1;
ALTER SEQUENCE hibernation_warnings_id_seq RESTART WITH 1;
ALTER SEQUENCE intelligent_alerts_configs_id_seq RESTART WITH 1;
ALTER SEQUENCE intelligent_alerts_history_id_seq RESTART WITH 1;
ALTER SEQUENCE lead_conversions_id_seq RESTART WITH 1;
ALTER SEQUENCE operational_alerts_id_seq RESTART WITH 1;
ALTER SEQUENCE recommendations_id_seq RESTART WITH 1;
ALTER SEQUENCE salesforce_sync_log_id_seq RESTART WITH 1;
ALTER SEQUENCE scheduled_enrichments_id_seq RESTART WITH 1;
ALTER SEQUENCE analytics_dimensoes_id_seq RESTART WITH 1;
ALTER SEQUENCE analytics_mercados_id_seq RESTART WITH 1;
ALTER SEQUENCE analytics_pesquisas_id_seq RESTART WITH 1;
ALTER SEQUENCE analytics_timeline_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_history_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_mercados_id_seq RESTART WITH 1;
ALTER SEQUENCE concorrentes_history_id_seq RESTART WITH 1;
ALTER SEQUENCE leads_history_id_seq RESTART WITH 1;
ALTER SEQUENCE mercados_history_id_seq RESTART WITH 1;

RAISE NOTICE '✅ Sequences resetadas';

-- ============================================================================
-- PASSO 9: VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  v_users INTEGER;
  v_projects INTEGER;
  v_pesquisas INTEGER;
  v_mercados INTEGER;
  v_leads INTEGER;
  v_clientes INTEGER;
  v_concorrentes INTEGER;
  v_notifications INTEGER;
  v_export_history INTEGER;
  v_saved_filters INTEGER;
  v_research_drafts INTEGER;
  v_user_invites INTEGER;
  v_admin_email TEXT;
  v_admin_role TEXT;
  v_admin_ativo INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_users FROM users;
  SELECT COUNT(*) INTO v_projects FROM projects;
  SELECT COUNT(*) INTO v_pesquisas FROM pesquisas;
  SELECT COUNT(*) INTO v_mercados FROM mercados_unicos;
  SELECT COUNT(*) INTO v_leads FROM leads;
  SELECT COUNT(*) INTO v_clientes FROM clientes;
  SELECT COUNT(*) INTO v_concorrentes FROM concorrentes;
  SELECT COUNT(*) INTO v_notifications FROM notifications;
  SELECT COUNT(*) INTO v_export_history FROM export_history;
  SELECT COUNT(*) INTO v_saved_filters FROM saved_filters;
  SELECT COUNT(*) INTO v_research_drafts FROM research_drafts;
  SELECT COUNT(*) INTO v_user_invites FROM user_invites;
  
  SELECT email, role, ativo INTO v_admin_email, v_admin_role, v_admin_ativo
  FROM users 
  WHERE email = 'sandrodireto@gmail.com';
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'VERIFICAÇÃO FINAL:';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 ADMIN CONFIGURADO:';
  RAISE NOTICE '  Email: %', v_admin_email;
  RAISE NOTICE '  Role: %', v_admin_role;
  RAISE NOTICE '  Ativo: %', v_admin_ativo;
  RAISE NOTICE '';
  RAISE NOTICE '📊 USUÁRIOS:';
  RAISE NOTICE '  Total: %', v_users;
  RAISE NOTICE '';
  RAISE NOTICE '📊 DADOS RESTANTES:';
  RAISE NOTICE '  Projetos: %', v_projects;
  RAISE NOTICE '  Pesquisas: %', v_pesquisas;
  RAISE NOTICE '  Mercados: %', v_mercados;
  RAISE NOTICE '  Leads: %', v_leads;
  RAISE NOTICE '  Clientes: %', v_clientes;
  RAISE NOTICE '  Concorrentes: %', v_concorrentes;
  RAISE NOTICE '  Notificações: %', v_notifications;
  RAISE NOTICE '  Export History: %', v_export_history;
  RAISE NOTICE '  Filtros Salvos: %', v_saved_filters;
  RAISE NOTICE '  Rascunhos: %', v_research_drafts;
  RAISE NOTICE '  Convites: %', v_user_invites;
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  
  -- Validações
  IF v_users != 1 THEN
    RAISE WARNING '⚠️  ATENÇÃO: Mais de 1 usuário no banco!';
  END IF;
  
  IF v_admin_role != 'admin' OR v_admin_ativo != 1 THEN
    RAISE WARNING '⚠️  ATENÇÃO: Admin não está configurado corretamente!';
  END IF;
  
  IF v_projects > 0 OR v_pesquisas > 0 OR v_mercados > 0 OR v_leads > 0 THEN
    RAISE WARNING '⚠️  ATENÇÃO: Ainda existem dados no banco!';
  END IF;
  
  IF v_users = 1 AND v_admin_role = 'admin' AND v_admin_ativo = 1 AND 
     v_projects = 0 AND v_pesquisas = 0 AND v_mercados = 0 AND v_leads = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅✅✅ LIMPEZA CONCLUÍDA COM SUCESSO! ✅✅✅';
    RAISE NOTICE '';
  END IF;
END $$;

-- Limpar tabela temporária
DROP TABLE IF EXISTS temp_admin;

COMMIT;

-- ============================================================================
-- CONSULTAS DE VERIFICAÇÃO
-- ============================================================================

-- Ver admin
SELECT 
  'Admin Configurado' as status,
  email, 
  nome, 
  role, 
  ativo,
  liberado_em
FROM users 
WHERE email = 'sandrodireto@gmail.com';

-- Ver total de usuários
SELECT 
  'Total de Usuários' as info,
  COUNT(*) as total 
FROM users;

-- Ver dados restantes
SELECT 
  'Dados Restantes' as info,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM pesquisas) as pesquisas,
  (SELECT COUNT(*) FROM mercados_unicos) as mercados,
  (SELECT COUNT(*) FROM leads) as leads,
  (SELECT COUNT(*) FROM clientes) as clientes,
  (SELECT COUNT(*) FROM concorrentes) as concorrentes,
  (SELECT COUNT(*) FROM notifications) as notifications,
  (SELECT COUNT(*) FROM export_history) as export_history,
  (SELECT COUNT(*) FROM saved_filters) as saved_filters,
  (SELECT COUNT(*) FROM research_drafts) as research_drafts,
  (SELECT COUNT(*) FROM user_invites) as user_invites;
