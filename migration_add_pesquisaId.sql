-- Adicionar coluna pesquisaId na tabela enrichment_jobs
ALTER TABLE enrichment_jobs 
ADD COLUMN IF NOT EXISTS "pesquisaId" INTEGER;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_pesquisaid 
ON enrichment_jobs("pesquisaId");

-- Atualizar job existente com pesquisaId = 1 (Base Inicial)
-- Assumindo que o projectId = 1 tem apenas uma pesquisa com id = 1
UPDATE enrichment_jobs 
SET "pesquisaId" = 1 
WHERE "projectId" = 1 
AND "pesquisaId" IS NULL;

-- Verificar resultado
SELECT 
  id,
  "projectId",
  "pesquisaId",
  status,
  "currentBatch",
  "totalBatches",
  "completedAt",
  "createdAt"
FROM enrichment_jobs
ORDER BY "createdAt" DESC
LIMIT 5;
