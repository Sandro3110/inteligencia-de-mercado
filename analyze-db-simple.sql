-- Projetos sem pesquisas
SELECT 
  'PROJETOS SEM PESQUISAS' as tipo,
  p.id, p.nome, p.status,
  COUNT(ps.id) as pesquisas_count
FROM projects p
LEFT JOIN pesquisas ps ON ps.projectId = p.id
GROUP BY p.id, p.nome, p.status
HAVING pesquisas_count = 0;

-- Pesquisas sem dados
SELECT 
  'PESQUISAS SEM DADOS' as tipo,
  p.id, p.nome, p.projectId, p.status,
  (SELECT COUNT(*) FROM clientes WHERE pesquisaId = p.id) as clientes,
  (SELECT COUNT(*) FROM concorrentes WHERE pesquisaId = p.id) as concorrentes,
  (SELECT COUNT(*) FROM mercados_unicos WHERE pesquisaId = p.id) as mercados,
  (SELECT COUNT(*) FROM leads WHERE pesquisaId = p.id) as leads
FROM pesquisas p
HAVING clientes = 0 AND concorrentes = 0 AND mercados = 0 AND leads = 0;

-- Estatísticas gerais
SELECT 
  'ESTATISTICAS' as tipo,
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
  (SELECT COUNT(*) FROM projects WHERE status = 'hibernated') as hibernated_projects,
  (SELECT COUNT(*) FROM pesquisas) as total_pesquisas,
  (SELECT COUNT(*) FROM pesquisas WHERE status = 'concluida') as completed_pesquisas,
  (SELECT COUNT(*) FROM clientes) as total_clientes,
  (SELECT COUNT(*) FROM concorrentes) as total_concorrentes,
  (SELECT COUNT(*) FROM mercados_unicos) as total_mercados,
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM produtos) as total_produtos;
