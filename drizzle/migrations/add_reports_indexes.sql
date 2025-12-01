-- Índices para Otimizar Reports
-- Otimizar queries de reports.generateProjectReport
-- Ganho esperado: 30% de redução (5s → 3.5s)

-- 1. Otimizar agregação por UF
-- Query: SELECT uf, COUNT(*) FROM clientes WHERE pesquisaId IN (...) GROUP BY uf
CREATE INDEX IF NOT EXISTS idx_clientes_pesquisa_uf 
ON clientes("pesquisaId", uf);

COMMENT ON INDEX idx_clientes_pesquisa_uf IS 
'Otimiza agregação de clientes por UF em reports.
Usado em: top10Estados, distribuicaoGeografica.
Ganho esperado: 40% de redução (0.3s → 0.18s).';

-- 2. Otimizar agregação por Cidade
-- Query: SELECT cidade, COUNT(*) FROM clientes WHERE pesquisaId IN (...) GROUP BY cidade
CREATE INDEX IF NOT EXISTS idx_clientes_pesquisa_cidade 
ON clientes("pesquisaId", cidade);

COMMENT ON INDEX idx_clientes_pesquisa_cidade IS 
'Otimiza agregação de clientes por cidade em reports.
Usado em: top10Cidades.
Ganho esperado: 40% de redução (0.3s → 0.18s).';

-- 3. Otimizar agregação por Produto Principal
-- Query: SELECT produtoPrincipal, COUNT(*) FROM clientes WHERE pesquisaId IN (...) GROUP BY produtoPrincipal
CREATE INDEX IF NOT EXISTS idx_clientes_pesquisa_produto 
ON clientes("pesquisaId", "produtoPrincipal");

COMMENT ON INDEX idx_clientes_pesquisa_produto IS 
'Otimiza agregação de clientes por produto em reports.
Usado em: top20Produtos.
Ganho esperado: 50% de redução (0.5s → 0.25s).';

-- 4. Otimizar JOIN de distribuição geográfica (Leads)
-- Query: LEFT JOIN leads ON leads.uf = clientes.uf AND leads.pesquisaId IN (...)
CREATE INDEX IF NOT EXISTS idx_leads_pesquisa_uf 
ON leads("pesquisaId", uf);

COMMENT ON INDEX idx_leads_pesquisa_uf IS 
'Otimiza JOIN de leads por UF em distribuição geográfica.
Usado em: distribuicaoGeografica.
Ganho esperado: 30% de redução (1.0s → 0.7s).';

-- 5. Otimizar JOIN de distribuição geográfica (Concorrentes)
-- Query: LEFT JOIN concorrentes ON concorrentes.uf = clientes.uf AND concorrentes.pesquisaId IN (...)
CREATE INDEX IF NOT EXISTS idx_concorrentes_pesquisa_uf 
ON concorrentes("pesquisaId", uf);

COMMENT ON INDEX idx_concorrentes_pesquisa_uf IS 
'Otimiza JOIN de concorrentes por UF em distribuição geográfica.
Usado em: distribuicaoGeografica.
Ganho esperado: 30% de redução (1.0s → 0.7s).';

-- Verificar índices criados
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE indexname LIKE 'idx_%_pesquisa_%' 
-- ORDER BY indexname;
