-- ============================================================================
-- SCRIPT DE LIMPEZA DA BASE DE DADOS (V2 - Compatível com Supabase)
-- Projeto: Intelmarket (TechFilms)
-- Objetivo: Preparar base para implementação do Sistema V2
-- Data: 30 de novembro de 2024
-- ============================================================================

BEGIN;

-- FASE 1: VALIDAÇÕES DE SEGURANÇA
DO $$
DECLARE
    v_project_count INTEGER;
    v_pesquisa_count INTEGER;
    v_clientes_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_project_count FROM projects WHERE id = 1 AND nome = 'TechFilms';
    IF v_project_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Projeto TechFilms (ID: 1) não encontrado!';
    END IF;
    
    SELECT COUNT(*) INTO v_pesquisa_count FROM pesquisas WHERE id = 1 AND nome = 'Base Inicial' AND "projectId" = 1;
    IF v_pesquisa_count = 0 THEN
        RAISE EXCEPTION 'ERRO: Pesquisa Base Inicial (ID: 1) não encontrada!';
    END IF;
    
    SELECT COUNT(*) INTO v_clientes_count FROM clientes WHERE "pesquisaId" = 1;
    IF v_clientes_count != 807 THEN
        RAISE EXCEPTION 'ERRO: Esperado 807 clientes, encontrado %', v_clientes_count;
    END IF;
    
    RAISE NOTICE '✅ FASE 1: Validações OK - Projeto, Pesquisa e % clientes encontrados', v_clientes_count;
END $$;

-- FASE 2: CONTAGEM PRÉ-LIMPEZA
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
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_leads_count FROM leads WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_concorrentes_count FROM concorrentes WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_produtos_count FROM produtos WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_mercados_count FROM mercados_unicos WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_clientes_mercados_count FROM clientes_mercados;
    SELECT COUNT(*) INTO v_enrichment_jobs_count FROM enrichment_jobs;
    SELECT COUNT(*) INTO v_enrichment_runs_count FROM enrichment_runs;
    
    SELECT COUNT(*) INTO v_entity_tags_count
    FROM entity_tags et
    WHERE et."entityType" = 'cliente'
      AND NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id = et."entityId" AND c."pesquisaId" = 1);
    
    v_total := v_leads_count + v_concorrentes_count + v_produtos_count + v_mercados_count + 
               v_clientes_mercados_count + v_enrichment_jobs_count + v_enrichment_runs_count + v_entity_tags_count;
    
    RAISE NOTICE '📊 FASE 2: Contagem - Leads:%, Concorrentes:%, Produtos:%, Mercados:%, Total:%', 
        v_leads_count, v_concorrentes_count, v_produtos_count, v_mercados_count, v_total;
END $$;

-- FASE 3: LIMPEZA DE TABELAS AUXILIARES
DELETE FROM clientes_mercados;
DELETE FROM enrichment_jobs;
DELETE FROM enrichment_runs;
DELETE FROM enrichment_queue;
DELETE FROM enrichment_cache;

-- FASE 4: LIMPEZA DE ENTIDADES ENRIQUECIDAS
DELETE FROM produtos WHERE "pesquisaId" = 1;
DELETE FROM leads WHERE "pesquisaId" = 1;
DELETE FROM concorrentes WHERE "pesquisaId" = 1;
DELETE FROM mercados_unicos WHERE "pesquisaId" = 1;

-- FASE 5: LIMPEZA DE TAGS ÓRFÃS
DELETE FROM entity_tags
WHERE "entityType" = 'cliente'
  AND NOT EXISTS (SELECT 1 FROM clientes c WHERE c.id = entity_tags."entityId" AND c."pesquisaId" = 1);

DELETE FROM tags
WHERE id NOT IN (SELECT DISTINCT "tagId" FROM entity_tags WHERE "tagId" IS NOT NULL);

-- FASE 6: LIMPEZA DE ANALYTICS
DELETE FROM analytics_mercados WHERE "projectId" = 1 OR "pesquisaId" = 1;
DELETE FROM analytics_pesquisas WHERE "projectId" = 1 OR "pesquisaId" = 1;
DELETE FROM analytics_dimensoes WHERE "projectId" = 1 OR "pesquisaId" = 1;
DELETE FROM analytics_timeline WHERE "projectId" = 1;

-- FASE 7: RESETAR STATUS DA PESQUISA
UPDATE pesquisas
SET status = 'rascunho', "clientesEnriquecidos" = 0, "updatedAt" = NOW()
WHERE id = 1;

-- FASE 8: VALIDAÇÕES PÓS-LIMPEZA
DO $$
DECLARE
    v_clientes_count INTEGER;
    v_leads_count INTEGER;
    v_concorrentes_count INTEGER;
    v_produtos_count INTEGER;
    v_mercados_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_clientes_count FROM clientes WHERE "pesquisaId" = 1;
    IF v_clientes_count != 807 THEN
        RAISE EXCEPTION 'ERRO: Clientes foram afetados! Esperado 807, encontrado %', v_clientes_count;
    END IF;
    
    SELECT COUNT(*) INTO v_leads_count FROM leads WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_concorrentes_count FROM concorrentes WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_produtos_count FROM produtos WHERE "pesquisaId" = 1;
    SELECT COUNT(*) INTO v_mercados_count FROM mercados_unicos WHERE "pesquisaId" = 1;
    
    IF v_leads_count > 0 OR v_concorrentes_count > 0 OR v_produtos_count > 0 OR v_mercados_count > 0 THEN
        RAISE EXCEPTION 'ERRO: Entidades não foram completamente apagadas!';
    END IF;
    
    RAISE NOTICE '✅ FASE 8: Validações OK - Clientes:% (intactos), Entidades:0 (limpas)', v_clientes_count;
END $$;

COMMIT;

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '✅✅✅ LIMPEZA CONCLUÍDA COM SUCESSO! Base pronta para Sistema V2.';
END $$;
