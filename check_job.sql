SELECT 
  id,
  project_id,
  status,
  total_clientes,
  success_clientes,
  current_batch,
  total_batches,
  started_at,
  completed_at,
  notified_completion
FROM enrichment_jobs 
WHERE project_id = 1
ORDER BY id DESC
LIMIT 1;
