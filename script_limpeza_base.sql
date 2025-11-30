-- ============================================================================
-- SCRIPT DE LIMPEZA DA BASE DE DADOS
-- Projeto: Intelmarket (TechFilms)
-- Objetivo: Preparar base para implementação do Sistema V2
-- Data: 30 de novembro de 2024
-- ============================================================================
--
-- ATENÇÃO: Este script apaga 18.293+ registros da base de dados!
--
-- O QUE SERÁ MANTIDO:
-- ✅ Projeto TechFilms (ID: 1)
-- ✅ Pesquisa Base Inicial (ID: 1)
-- ✅ 807 clientes da pesquisa Base Inicial
-- ✅ Todas as tabelas de sistema (users, projects, pesquisas, system_settings, etc.)
--
-- O QUE SERÁ APAGADO:
-- ❌ 5.226 leads
-- ❌ 8.710 concorrentes
-- ❌ 2.613 produtos
-- ❌ 870 mercados
-- ❌ 871 relacionamentos cliente-mercado
-- ❌ Jobs e runs de enriquecimento antigos
-- ❌ Tags órfãs (entity_tags sem cliente válido)
--
-- TOTAL: ~18.293 registros
-- ============================================================================

-- Iniciar transação (rollback automático em caso de erro)
BEGIN;

-- ============================================================================
-- FASE 1: VALIDAÇÕES DE SEGURANÇA
-- ============================================================================

DO $$
DECLARE
    v_project_count INTEGER;
    v_pesquisa_count INTEGER;
    v_clientes_count INTEGER;
BEGIN
    -- Validar que projeto TechFilms existe
    SELECT COUNT(*) INTO v_project_count
    FROM projects
    WHERE id = 1 AND nome = 'TechFilms';
    
    IF v_project_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Projeto TechFilms (ID: 1) não encontrado!';
    END IF;
    
    -- Validar que pesquisa Base Inicial existe
    SELECT COUNT(*) INTO v_pesquisa_count
    FROM pesquisas
    WHERE id = 1 AND nome = 'Base Inicial' AND "projectId" = 1;
    
    IF v_pesquisa_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Pesquisa Base Inicial (ID: 1) não encontrada!';
    END IF;
    
    -- Validar que existem 807 clientes
    SELECT COUNT(*) INTO v_clientes_count
    FROM clientes
    WHERE "pesquisaId" = 1;
    
    IF v_clientes_count != 807 THEN
        RAISE EXCEPTION 'ERRO: Esperado 807 clientes, encontrado %', v_clientes_count;
    END IF;
    
    RAISE NOTICE '✅ Validações de segurança OK';
    RAISE NOTICE '   - Projeto TechFilms: encontrado';
    RAISE NOTICE '   - Pesquisa Base Inicial: encontrada';
    RAISE NOTICE '   - Clientes: % registros', v_clientes_count;
END $$;

-- ============================================================================
-- FASE 2: CONTAGEM PRÉ-LIMPEZA (para log)
-- ============================================================================

DO $$
DECLARE
    v_leads_count INTEGER;
    v_concorrentes_count INTEGER;
    v_produtos_count INTEGER;
    v_mercados_count INTEGER;
    v_clientes_mercados_count INTEGER;
    v_enrichment_jobs_count INTEGER;
    v_enrichment_runs_count INTEGER;
    v_entity_tags_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_leads_count FROM leads WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_concorrentes_count FROM concorrentes WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_produtos_count FROM produtos WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_mercados_count FROM mercados_unicos WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_clientes_mercados_count FROM clientes_mercados;
    SELECT COUNT(*) INTO v_enrichment_jobs_count FROM enrichment_jobs;
    SELECT COUNT(*) INTO v_enrichment_runs_count FROM enrichment_runs;
    
    -- Entity tags órfãs (entityId não existe em clientes da pesquisa 1)
    SELECT COUNT(*) INTO v_entity_tags_count
    FROM entity_tags et
    WHERE et."entityType" = 'cliente'
      AND NOT EXISTS (
          SELECT 1 FROM clientes c 
          WHERE c.id = et."entityId" AND c."pesquisaId" = 1
      );
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 CONTAGEM PRÉ-LIMPEZA:';
    RAISE NOTICE '   Leads: %', v_leads_count;
    RAISE NOTICE '   Concorrentes: %', v_concorrentes_count;
    RAISE NOTICE '   Produtos: %', v_produtos_count;
    RAISE NOTICE '   Mercados: %', v_mercados_count;
    RAISE NOTICE '   Clientes-Mercados: %', v_clientes_mercados_count;
    RAISE NOTICE '   Enrichment Jobs: %', v_enrichment_jobs_count;
    RAISE NOTICE '   Enrichment Runs: %', v_enrichment_runs_count;
    RAISE NOTICE '   Entity Tags Órfãs: %', v_entity_tags_count;
    RAISE NOTICE '   TOTAL: %', 
        v_leads_count + v_concorrentes_count + v_produtos_count + 
        v_mercados_count + v_clientes_mercados_count + 
        v_enrichment_jobs_count + v_enrichment_runs_count + v_entity_tags_count;
END $$;

-- ============================================================================
-- FASE 3: LIMPEZA DE TABELAS AUXILIARES (sem foreign keys)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '🧹 FASE 3: Limpando tabelas auxiliares...';

-- 3.1 Limpar relacionamentos cliente-mercado
DELETE FROM clientes_mercados;
RAISE NOTICE '   ✅ clientes_mercados: % registros apagados', 
    (SELECT COUNT(*) FROM clientes_mercados);

-- 3.2 Limpar jobs de enriquecimento
DELETE FROM enrichment_jobs;
RAISE NOTICE '   ✅ enrichment_jobs: apagados';

-- 3.3 Limpar runs de enriquecimento
DELETE FROM enrichment_runs;
RAISE NOTICE '   ✅ enrichment_runs: apagados';

-- 3.4 Limpar queue de enriquecimento (se houver)
DELETE FROM enrichment_queue;
RAISE NOTICE '   ✅ enrichment_queue: apagados';

-- 3.5 Limpar cache de enriquecimento (se houver)
DELETE FROM enrichment_cache;
RAISE NOTICE '   ✅ enrichment_cache: apagados';

-- ============================================================================
-- FASE 4: LIMPEZA DE ENTIDADES ENRIQUECIDAS
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '🧹 FASE 4: Limpando entidades enriquecidas...';

-- 4.1 Apagar produtos da pesquisa Base Inicial
DELETE FROM produtos WHERE "pesquisaId" = 1;
RAISE NOTICE '   ✅ produtos: % registros apagados', 
    (SELECT pg_catalog.count(*) FROM produtos WHERE "pesquisaId" = 1);

-- 4.2 Apagar leads da pesquisa Base Inicial
DELETE FROM leads WHERE "pesquisaId" = 1;
RAISE NOTICE '   ✅ leads: apagados';

-- 4.3 Apagar concorrentes da pesquisa Base Inicial
DELETE FROM concorrentes WHERE "pesquisaId" = 1;
RAISE NOTICE '   ✅ concorrentes: apagados';

-- 4.4 Apagar mercados da pesquisa Base Inicial
DELETE FROM mercados_unicos WHERE "pesquisaId" = 1;
RAISE NOTICE '   ✅ mercados_unicos: apagados';

-- ============================================================================
-- FASE 5: LIMPEZA DE TAGS ÓRFÃS
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '🧹 FASE 5: Limpando tags órfãs...';

-- 5.1 Apagar entity_tags que referenciam clientes que não existem ou não são da pesquisa 1
DELETE FROM entity_tags
WHERE "entityType" = 'cliente'
  AND NOT EXISTS (
      SELECT 1 FROM clientes c 
      WHERE c.id = entity_tags."entityId" AND c."pesquisaId" = 1
  );
RAISE NOTICE '   ✅ entity_tags órfãs: apagadas';

-- 5.2 Apagar tags que não têm mais nenhuma associação
DELETE FROM tags
WHERE id NOT IN (SELECT DISTINCT "tagId" FROM entity_tags WHERE "tagId" IS NOT NULL);
RAISE NOTICE '   ✅ tags sem associação: apagadas';

-- ============================================================================
-- FASE 6: LIMPEZA DE ANALYTICS (dados calculados)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '🧹 FASE 6: Limpando dados de analytics...';

-- 6.1 Limpar analytics de mercados
DELETE FROM analytics_mercados WHERE "projectId" = 1 OR "pesquisaId" = 1;
RAISE NOTICE '   ✅ analytics_mercados: apagados';

-- 6.2 Limpar analytics de pesquisas
DELETE FROM analytics_pesquisas WHERE "projectId" = 1 OR "pesquisaId" = 1;
RAISE NOTICE '   ✅ analytics_pesquisas: apagados';

-- 6.3 Limpar analytics de dimensões
DELETE FROM analytics_dimensoes WHERE "projectId" = 1 OR "pesquisaId" = 1;
RAISE NOTICE '   ✅ analytics_dimensoes: apagados';

-- 6.4 Limpar analytics de timeline
DELETE FROM analytics_timeline WHERE "projectId" = 1;
RAISE NOTICE '   ✅ analytics_timeline: apagados';

-- ============================================================================
-- FASE 7: RESETAR STATUS DA PESQUISA
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '🔄 FASE 7: Resetando status da pesquisa...';

-- 7.1 Resetar pesquisa para estado inicial
UPDATE pesquisas
SET 
    status = 'rascunho',
    "clientesEnriquecidos" = 0,
    "updatedAt" = NOW()
WHERE id = 1;

RAISE NOTICE '   ✅ Pesquisa Base Inicial resetada para status "rascunho"';

-- ============================================================================
-- FASE 8: VALIDAÇÕES PÓS-LIMPEZA
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '✅ FASE 8: Validações pós-limpeza...';

DO $$
DECLARE
    v_clientes_count INTEGER;
    v_leads_count INTEGER;
    v_concorrentes_count INTEGER;
    v_produtos_count INTEGER;
    v_mercados_count INTEGER;
BEGIN
    -- Validar que clientes estão intactos
    SELECT COUNT(*) INTO v_clientes_count FROM clientes WHERE "pesquisaId" = 1;
    
    IF v_clientes_count != 807 THEN
        RAISE EXCEPTION 'ERRO: Clientes foram afetados! Esperado 807, encontrado %', v_clientes_count;
    END IF;
    
    -- Validar que entidades foram apagadas
    SELECT COUNT(*) INTO v_leads_count FROM leads WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_concorrentes_count FROM concorrentes WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_produtos_count FROM produtos WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_mercados_count FROM mercados_unicos WHERE "pesquisaId" = 1;
    
    IF v_leads_count > 0 OR v_concorrentes_count > 0 OR v_produtos_count > 0 OR v_mercados_count > 0 THEN
        RAISE EXCEPTION 'ERRO: Entidades não foram completamente apagadas!';
    END IF;
    
    RAISE NOTICE '   ✅ Clientes: % (intactos)', v_clientes_count;
    RAISE NOTICE '   ✅ Leads: % (limpo)', v_leads_count;
    RAISE NOTICE '   ✅ Concorrentes: % (limpo)', v_concorrentes_count;
    RAISE NOTICE '   ✅ Produtos: % (limpo)', v_produtos_count;
    RAISE NOTICE '   ✅ Mercados: % (limpo)', v_mercados_count;
END $$;

-- ============================================================================
-- FASE 9: COMMIT DA TRANSAÇÃO
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '💾 FASE 9: Commitando transação...';

COMMIT;

RAISE NOTICE '';
RAISE NOTICE '✅✅✅ LIMPEZA CONCLUÍDA COM SUCESSO! ✅✅✅';
RAISE NOTICE '';
RAISE NOTICE '📊 RESUMO:';
RAISE NOTICE '   ✅ 807 clientes preservados';
RAISE NOTICE '   ✅ ~18.293 registros apagados';
RAISE NOTICE '   ✅ Base pronta para Sistema V2';
RAISE NOTICE '';
RAISE NOTICE '🚀 Próximos passos:';
RAISE NOTICE '   1. Validar aplicação (verificar se continua funcionando)';
RAISE NOTICE '   2. Iniciar Fase 1 do Rollout V2 (50 clientes)';
RAISE NOTICE '';

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
