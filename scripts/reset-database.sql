-- ============================================================================
-- SCRIPT DE RESET DO BANCO DE DADOS - IntelMarket
-- ============================================================================
-- Objetivo: 
-- 1. Aprovar e configurar sandrodireto@gmail.com como admin
-- 2. Apagar todos os outros usuários e dados de teste
-- 3. Resetar banco para começar do zero
-- ============================================================================

BEGIN;

-- ============================================================================
-- PASSO 1: APROVAR E CONFIGURAR ADMIN (sandrodireto@gmail.com)
-- ============================================================================

-- Atualizar usuário sandrodireto@gmail.com
UPDATE users 
SET 
  ativo = 1,                    -- Aprovar usuário
  role = 'admin',               -- Definir como admin
  liberado_por = id,            -- Auto-aprovado
  liberado_em = NOW()           -- Data de aprovação
WHERE email = 'sandrodireto@gmail.com';

-- Verificar se foi atualizado
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM users WHERE email = 'sandrodireto@gmail.com';
  IF v_count = 0 THEN
    RAISE NOTICE 'AVISO: Usuário sandrodireto@gmail.com não encontrado!';
  ELSE
    RAISE NOTICE 'OK: Usuário sandrodireto@gmail.com configurado como admin';
  END IF;
END $$;

-- ============================================================================
-- PASSO 2: APAGAR TODOS OS OUTROS USUÁRIOS
-- ============================================================================

-- Listar usuários que serão apagados (para log)
DO $$
DECLARE
  v_email TEXT;
BEGIN
  FOR v_email IN 
    SELECT email FROM users WHERE email != 'sandrodireto@gmail.com'
  LOOP
    RAISE NOTICE 'Apagando usuário: %', v_email;
  END LOOP;
END $$;

-- Apagar todos os usuários EXCETO sandrodireto@gmail.com
DELETE FROM users 
WHERE email != 'sandrodireto@gmail.com';

-- ============================================================================
-- PASSO 3: LIMPAR DADOS DE TESTE
-- ============================================================================

-- Apagar dados relacionados a projetos de teste
-- (CASCADE vai apagar automaticamente dados relacionados)

-- Listar projetos que serão apagados
DO $$
DECLARE
  v_projeto TEXT;
BEGIN
  FOR v_projeto IN 
    SELECT nome FROM projects
  LOOP
    RAISE NOTICE 'Apagando projeto: %', v_projeto;
  END LOOP;
END $$;

-- Apagar todos os projetos
DELETE FROM projects;

-- Listar pesquisas que serão apagadas
DO $$
DECLARE
  v_pesquisa TEXT;
BEGIN
  FOR v_pesquisa IN 
    SELECT nome FROM pesquisas
  LOOP
    RAISE NOTICE 'Apagando pesquisa: %', v_pesquisa;
  END LOOP;
END $$;

-- Apagar todas as pesquisas
DELETE FROM pesquisas;

-- Apagar mercados de teste
DELETE FROM mercados;

-- Apagar leads de teste
DELETE FROM leads;

-- Apagar clientes de teste
DELETE FROM clientes;

-- Apagar concorrentes de teste
DELETE FROM concorrentes;

-- Apagar atividades de teste
DELETE FROM activities;

-- Apagar logs de teste
DELETE FROM logs;

-- Apagar notificações de teste
DELETE FROM notifications;

-- Apagar alertas de teste
DELETE FROM alerts;

-- Apagar exports de teste
DELETE FROM exports;

-- Apagar filtros salvos de teste
DELETE FROM saved_filters_export;

-- Apagar histórico de pesquisas
DELETE FROM search_history;

-- Apagar drafts de pesquisas
DELETE FROM research_drafts;

-- Apagar geocoding cache
DELETE FROM geocoding_cache;

-- Apagar enrichment queue
DELETE FROM enrichment_queue;

-- Apagar enrichment history
DELETE FROM enrichment_history;

-- Apagar territorial analysis
DELETE FROM territorial_analysis;

-- Apagar market comparisons
DELETE FROM market_comparisons;

-- ============================================================================
-- PASSO 4: RESETAR SEQUENCES (AUTO INCREMENT)
-- ============================================================================

-- Resetar sequences para começar do 1
ALTER SEQUENCE projects_id_seq RESTART WITH 1;
ALTER SEQUENCE pesquisas_id_seq RESTART WITH 1;
ALTER SEQUENCE mercados_id_seq RESTART WITH 1;
ALTER SEQUENCE leads_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE concorrentes_id_seq RESTART WITH 1;
ALTER SEQUENCE activities_id_seq RESTART WITH 1;
ALTER SEQUENCE logs_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE alerts_id_seq RESTART WITH 1;
ALTER SEQUENCE exports_id_seq RESTART WITH 1;
ALTER SEQUENCE saved_filters_export_id_seq RESTART WITH 1;
ALTER SEQUENCE search_history_id_seq RESTART WITH 1;
ALTER SEQUENCE research_drafts_id_seq RESTART WITH 1;
ALTER SEQUENCE geocoding_cache_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_queue_id_seq RESTART WITH 1;
ALTER SEQUENCE enrichment_history_id_seq RESTART WITH 1;
ALTER SEQUENCE territorial_analysis_id_seq RESTART WITH 1;
ALTER SEQUENCE market_comparisons_id_seq RESTART WITH 1;

-- ============================================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- ============================================================================

-- Contar usuários restantes
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM users;
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RESUMO DA LIMPEZA:';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Usuários restantes: %', v_count;
  
  IF v_count = 1 THEN
    RAISE NOTICE 'OK: Apenas 1 usuário (admin) no banco';
  ELSE
    RAISE WARNING 'ATENÇÃO: Mais de 1 usuário no banco!';
  END IF;
END $$;

-- Verificar admin
DO $$
DECLARE
  v_email TEXT;
  v_role TEXT;
  v_ativo INTEGER;
BEGIN
  SELECT email, role, ativo INTO v_email, v_role, v_ativo 
  FROM users 
  WHERE email = 'sandrodireto@gmail.com';
  
  RAISE NOTICE '--------------------------------------------';
  RAISE NOTICE 'ADMIN CONFIGURADO:';
  RAISE NOTICE '--------------------------------------------';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'Role: %', v_role;
  RAISE NOTICE 'Ativo: %', v_ativo;
  RAISE NOTICE '--------------------------------------------';
  
  IF v_role = 'admin' AND v_ativo = 1 THEN
    RAISE NOTICE 'OK: Admin configurado corretamente!';
  ELSE
    RAISE WARNING 'ERRO: Admin não está configurado corretamente!';
  END IF;
END $$;

-- Contar registros em tabelas principais
DO $$
DECLARE
  v_projects INTEGER;
  v_pesquisas INTEGER;
  v_mercados INTEGER;
  v_leads INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_projects FROM projects;
  SELECT COUNT(*) INTO v_pesquisas FROM pesquisas;
  SELECT COUNT(*) INTO v_mercados FROM mercados;
  SELECT COUNT(*) INTO v_leads FROM leads;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'DADOS RESTANTES:';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Projetos: %', v_projects;
  RAISE NOTICE 'Pesquisas: %', v_pesquisas;
  RAISE NOTICE 'Mercados: %', v_mercados;
  RAISE NOTICE 'Leads: %', v_leads;
  RAISE NOTICE '============================================';
  
  IF v_projects = 0 AND v_pesquisas = 0 AND v_mercados = 0 AND v_leads = 0 THEN
    RAISE NOTICE 'OK: Banco de dados limpo!';
  ELSE
    RAISE WARNING 'ATENÇÃO: Ainda existem dados no banco!';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
