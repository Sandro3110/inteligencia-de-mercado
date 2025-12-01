-- Índices Compostos Faltantes
-- Otimizar queries específicas identificadas na auditoria

-- 1. Otimizar enrichment.getActiveJobs
-- Query: WHERE status = 'running' ORDER BY startedAt DESC
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status_started 
ON enrichment_jobs(status, "startedAt" DESC);

COMMENT ON INDEX idx_enrichment_jobs_status_started IS 
'Otimiza query de jobs ativos em enrichment.getActiveJobs.
Ganho esperado: 50% de redução (0.1s → 0.05s).';

-- 2. Otimizar projects.list
-- Query: WHERE ativo = 1 ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS idx_projects_ativo_created 
ON projects(ativo, "createdAt" DESC);

COMMENT ON INDEX idx_projects_ativo_created IS 
'Otimiza listagem de projetos ativos em projects.list.
Ganho esperado: 30% de redução (0.1s → 0.07s).';

-- Verificar índices criados
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE indexname IN ('idx_enrichment_jobs_status_started', 'idx_projects_ativo_created');
