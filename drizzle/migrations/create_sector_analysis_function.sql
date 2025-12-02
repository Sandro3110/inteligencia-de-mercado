-- Stored Procedure para Análise de Setores
-- Otimiza agregação de dados por setor usando CTEs no PostgreSQL

CREATE OR REPLACE FUNCTION get_sector_summary(
  p_pesquisa_ids INTEGER[]
)
RETURNS TABLE (
  setor TEXT,
  clientes INTEGER,
  leads INTEGER,
  concorrentes INTEGER,
  score NUMERIC
) 
LANGUAGE sql
STABLE
AS $$
  WITH clientes_count AS (
    SELECT 
      setor,
      COUNT(*)::INTEGER as count
    FROM clientes
    WHERE setor IS NOT NULL 
      AND "pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY setor
  ),
  leads_count AS (
    SELECT 
      setor,
      COUNT(*)::INTEGER as count
    FROM leads
    WHERE setor IS NOT NULL 
      AND "pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY setor
  ),
  concorrentes_count AS (
    SELECT 
      setor,
      COUNT(*)::INTEGER as count
    FROM concorrentes
    WHERE setor IS NOT NULL 
      AND "pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY setor
  ),
  all_setores AS (
    SELECT DISTINCT setor FROM clientes_count
    UNION
    SELECT DISTINCT setor FROM leads_count
    UNION
    SELECT DISTINCT setor FROM concorrentes_count
  )
  SELECT 
    s.setor,
    COALESCE(c.count, 0) as clientes,
    COALESCE(l.count, 0) as leads,
    COALESCE(co.count, 0) as concorrentes,
    -- Score = (leads / max(concorrentes, 1)) * 10
    ROUND((COALESCE(l.count, 0)::NUMERIC / GREATEST(COALESCE(co.count, 0), 1)::NUMERIC) * 10, 2) as score
  FROM all_setores s
  LEFT JOIN clientes_count c ON s.setor = c.setor
  LEFT JOIN leads_count l ON s.setor = l.setor
  LEFT JOIN concorrentes_count co ON s.setor = co.setor
  ORDER BY score DESC, leads DESC;
$$;
