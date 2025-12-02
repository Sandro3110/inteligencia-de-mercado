-- ============================================================================
-- DROP TABELAS ANTIGAS - IntelMarket v3.0
-- Data: 01/12/2025
-- Objetivo: Limpar banco para recriar com modelo dimensional final
-- ============================================================================

-- IMPORTANTE: Manter apenas users, cidades_brasil, system_settings

-- DROP tabelas de dados (ordem reversa de dependências)
DROP TABLE IF EXISTS fato_entidades_history CASCADE;
DROP TABLE IF EXISTS fato_entidades CASCADE;
DROP TABLE IF EXISTS entidade_competidores CASCADE;
DROP TABLE IF EXISTS entidade_produtos CASCADE;
DROP TABLE IF EXISTS dim_produtos CASCADE;
DROP TABLE IF EXISTS dim_mercados CASCADE;
DROP TABLE IF EXISTS dim_geografia CASCADE;
DROP TABLE IF EXISTS pesquisas CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- DROP tabelas auxiliares
DROP TABLE IF EXISTS enrichment_queue CASCADE;
DROP TABLE IF EXISTS scheduled_enrichments CASCADE;
DROP TABLE IF EXISTS lead_conversions CASCADE;

-- DROP tabelas de analytics
DROP TABLE IF EXISTS analytics_timeline CASCADE;
DROP TABLE IF EXISTS analytics_pesquisas CASCADE;
DROP TABLE IF EXISTS analytics_mercados CASCADE;
DROP TABLE IF EXISTS analytics_dimensoes CASCADE;

-- DROP tabelas de alertas
DROP TABLE IF EXISTS intelligent_alerts_history CASCADE;
DROP TABLE IF EXISTS intelligent_alerts_configs CASCADE;
DROP TABLE IF EXISTS operational_alerts CASCADE;
DROP TABLE IF EXISTS alert_history CASCADE;
DROP TABLE IF EXISTS alert_configs CASCADE;

-- DROP tabelas de reports/exports
DROP TABLE IF EXISTS report_schedules CASCADE;
DROP TABLE IF EXISTS saved_filters_export CASCADE;
DROP TABLE IF EXISTS saved_filters CASCADE;
DROP TABLE IF EXISTS research_drafts CASCADE;

-- DROP tabelas de tags
DROP TABLE IF EXISTS entity_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- DROP tabelas de integrações
DROP TABLE IF EXISTS salesforce_sync_log CASCADE;
DROP TABLE IF EXISTS project_templates CASCADE;

-- DROP tabelas de notificações
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- DROP tabelas de logs
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS hibernation_warnings CASCADE;

-- DROP tabelas de autenticação (exceto users)
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS user_invites CASCADE;

-- DROP tabelas de configuração (exceto system_settings)
DROP TABLE IF EXISTS llm_provider_configs CASCADE;
DROP TABLE IF EXISTS email_config CASCADE;

-- DROP tabelas de recomendações
DROP TABLE IF EXISTS recommendations CASCADE;

-- ============================================================================
-- TABELAS MANTIDAS:
-- - users (autenticação)
-- - cidades_brasil (seed de geografia)
-- - system_settings (configurações do sistema)
-- ============================================================================

-- Verificar tabelas restantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE' 
ORDER BY table_name;
