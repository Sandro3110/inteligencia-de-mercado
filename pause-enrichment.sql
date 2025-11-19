-- Pausar enrichment run ativo
UPDATE enrichment_runs 
SET status = 'paused' 
WHERE status = 'running';

-- Pausar projeto para evitar novos enriquecimentos
UPDATE projects 
SET isPaused = 1 
WHERE id = 1;

-- Verificar status
SELECT 'Enrichment Runs:' as info;
SELECT id, projectId, status, processedClients, totalClients, startedAt 
FROM enrichment_runs 
WHERE id = 1;

SELECT 'Projects:' as info;
SELECT id, nome, isPaused, executionMode 
FROM projects 
WHERE id = 1;
