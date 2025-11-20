-- Verificar dados órfãos (sem pesquisaId)
SELECT 'clientes' as tabela, COUNT(*) as total, 
       SUM(CASE WHEN pesquisaId IS NULL THEN 1 ELSE 0 END) as sem_pesquisaId
FROM clientes
UNION ALL
SELECT 'mercados_unicos', COUNT(*), 
       SUM(CASE WHEN pesquisaId IS NULL THEN 1 ELSE 0 END)
FROM mercados_unicos
UNION ALL
SELECT 'produtos', COUNT(*), 
       SUM(CASE WHEN pesquisaId IS NULL THEN 1 ELSE 0 END)
FROM produtos
UNION ALL
SELECT 'concorrentes', COUNT(*), 
       SUM(CASE WHEN pesquisaId IS NULL THEN 1 ELSE 0 END)
FROM concorrentes
UNION ALL
SELECT 'leads', COUNT(*), 
       SUM(CASE WHEN pesquisaId IS NULL THEN 1 ELSE 0 END)
FROM leads;
