-- Migration: Adicionar índices compostos para otimização de queries de geoposição
-- Data: 2025-11-30
-- Objetivo: Reduzir tempo de query em 60-80% (de ~2s para ~0.4s)
-- Impacto: CRÍTICO - Performance do drill-down Região→Estado→Cidade

-- ============================================================================
-- CLIENTES - Índices para Geoposição
-- ============================================================================

-- Índice principal: pesquisaId + uf + cidade (query base)
CREATE INDEX IF NOT EXISTS idx_clientes_geo_pesquisa 
ON clientes(pesquisaId, uf, cidade) 
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- Índice com filtros: pesquisaId + setor + porte + uf + cidade
CREATE INDEX IF NOT EXISTS idx_clientes_geo_filtros 
ON clientes(pesquisaId, setor, porte, uf, cidade) 
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- ============================================================================
-- LEADS - Índices para Geoposição
-- ============================================================================

-- Índice principal: pesquisaId + uf + cidade (query base)
CREATE INDEX IF NOT EXISTS idx_leads_geo_pesquisa 
ON leads(pesquisaId, uf, cidade) 
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- Índice com filtros: pesquisaId + setor + porte + qualidade + uf + cidade
CREATE INDEX IF NOT EXISTS idx_leads_geo_filtros 
ON leads(pesquisaId, setor, porte, "qualidadeClassificacao", uf, cidade) 
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- ============================================================================
-- CONCORRENTES - Índices para Geoposição
-- ============================================================================

-- Índice principal: pesquisaId + uf + cidade (query base)
CREATE INDEX IF NOT EXISTS idx_concorrentes_geo_pesquisa 
ON concorrentes(pesquisaId, uf, cidade) 
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- Índice com filtros: pesquisaId + setor + porte + uf + cidade
CREATE INDEX IF NOT EXISTS idx_concorrentes_geo_filtros 
ON concorrentes(pesquisaId, setor, porte, uf, cidade) 
WHERE uf IS NOT NULL AND cidade IS NOT NULL;

-- ============================================================================
-- PESQUISAS - Índice para subquery de projectId
-- ============================================================================

-- Índice para otimizar subquery: pesquisaId IN (SELECT id FROM pesquisas WHERE projectId = ?)
CREATE INDEX IF NOT EXISTS idx_pesquisas_projectId 
ON pesquisas("projectId");

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar índices criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname LIKE 'idx_%_geo_%' OR indexname = 'idx_pesquisas_projectId'
ORDER BY tablename, indexname;

-- ============================================================================
-- ANÁLISE DE IMPACTO
-- ============================================================================

-- Testar query ANTES dos índices (comentar após primeira execução)
-- EXPLAIN ANALYZE
-- SELECT uf, cidade, COUNT(*)::int as count
-- FROM clientes
-- WHERE 
--   uf IS NOT NULL 
--   AND cidade IS NOT NULL
--   AND pesquisaId IN (SELECT id FROM pesquisas WHERE "projectId" = 1)
-- GROUP BY uf, cidade
-- ORDER BY uf, cidade;

-- Testar query DEPOIS dos índices
-- EXPLAIN ANALYZE
-- SELECT uf, cidade, COUNT(*)::int as count
-- FROM clientes
-- WHERE 
--   uf IS NOT NULL 
--   AND cidade IS NOT NULL
--   AND pesquisaId IN (SELECT id FROM pesquisas WHERE "projectId" = 1)
-- GROUP BY uf, cidade
-- ORDER BY uf, cidade;

-- ============================================================================
-- NOTAS TÉCNICAS
-- ============================================================================

-- 1. Índices parciais (WHERE uf IS NOT NULL AND cidade IS NOT NULL):
--    - Reduzem tamanho do índice (ignora registros sem geolocalização)
--    - Melhoram performance de INSERT/UPDATE (menos registros indexados)
--    - Mantêm performance de SELECT (query sempre filtra por IS NOT NULL)

-- 2. Ordem das colunas no índice:
--    - pesquisaId primeiro (maior seletividade, filtra 90%+ dos dados)
--    - setor/porte depois (filtros opcionais, seletividade média)
--    - uf/cidade por último (usado em GROUP BY e ORDER BY)

-- 3. Dois índices por tabela (pesquisa vs filtros):
--    - idx_*_geo_pesquisa: query sem filtros adicionais (mais comum)
--    - idx_*_geo_filtros: query com setor/porte (menos comum, mas crítica)
--    - PostgreSQL escolhe automaticamente o melhor índice

-- 4. Tamanho estimado dos índices:
--    - ~100 registros: <1 MB por índice
--    - ~1000 registros: ~5 MB por índice
--    - ~10000 registros: ~50 MB por índice
--    - Total: ~300 MB para 10k registros (aceitável)

-- ============================================================================
-- ROLLBACK (se necessário)
-- ============================================================================

-- DROP INDEX IF EXISTS idx_clientes_geo_pesquisa;
-- DROP INDEX IF EXISTS idx_clientes_geo_filtros;
-- DROP INDEX IF EXISTS idx_leads_geo_pesquisa;
-- DROP INDEX IF EXISTS idx_leads_geo_filtros;
-- DROP INDEX IF EXISTS idx_concorrentes_geo_pesquisa;
-- DROP INDEX IF EXISTS idx_concorrentes_geo_filtros;
-- DROP INDEX IF EXISTS idx_pesquisas_projectId;
