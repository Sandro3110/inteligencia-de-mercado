-- Atualizar lastActivityAt de 2 projetos para 25 dias atrás
UPDATE projects 
SET lastActivityAt = DATE_SUB(NOW(), INTERVAL 25 DAY)
WHERE id IN (
  SELECT id FROM (
    SELECT id FROM projects WHERE status = 'active' LIMIT 2
  ) AS temp
);

-- Inserir avisos de hibernação
INSERT INTO hibernation_warnings (projectId, scheduledFor, notified, hibernated, createdAt)
SELECT 
  id,
  DATE_ADD(NOW(), INTERVAL 5 DAY) as scheduledFor,
  1 as notified,
  0 as hibernated,
  NOW() as createdAt
FROM projects 
WHERE status = 'active' 
  AND lastActivityAt < DATE_SUB(NOW(), INTERVAL 20 DAY)
LIMIT 2;

-- Mostrar resultados
SELECT p.id, p.nome, p.lastActivityAt, 
       hw.scheduledFor, hw.notified, hw.hibernated
FROM projects p
LEFT JOIN hibernation_warnings hw ON p.id = hw.projectId
WHERE hw.id IS NOT NULL
ORDER BY hw.createdAt DESC;
