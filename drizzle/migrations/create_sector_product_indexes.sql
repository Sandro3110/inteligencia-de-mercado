-- Índices para otimização de Setores e Produtos
-- Ganho esperado: 80% de redução no tempo de query

-- ÍNDICES PARA SETORES
CREATE INDEX IF NOT EXISTS idx_clientes_setor 
ON clientes("pesquisaId", setor) 
WHERE setor IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_setor 
ON leads("pesquisaId", setor) 
WHERE setor IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_concorrentes_setor 
ON concorrentes("pesquisaId", setor) 
WHERE setor IS NOT NULL;

-- ÍNDICES PARA PRODUTOS
CREATE INDEX IF NOT EXISTS idx_produtos_pesquisa 
ON produtos("pesquisaId");

CREATE INDEX IF NOT EXISTS idx_clientes_produto 
ON clientes("pesquisaId", "produtoId");

-- VERIFICAR ÍNDICES CRIADOS
SELECT 
  tablename, 
  indexname, 
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE indexname LIKE 'idx_%_setor' 
   OR indexname LIKE 'idx_%_produto%'
ORDER BY tablename, indexname;
