-- Stored Procedure para Análise de Produtos
-- Otimiza ranking de produtos usando CTEs no PostgreSQL

CREATE OR REPLACE FUNCTION get_product_ranking(
  p_pesquisa_ids INTEGER[]
)
RETURNS TABLE (
  nome TEXT,
  categoria TEXT,
  clientes INTEGER
) 
LANGUAGE sql
STABLE
AS $$
  WITH produto_clientes AS (
    SELECT 
      p.nome,
      p.categoria,
      COUNT(DISTINCT c.id)::INTEGER as clientes
    FROM produtos p
    LEFT JOIN clientes c ON c."produtoId" = p.id 
      AND c."pesquisaId" = ANY(p_pesquisa_ids)
    WHERE p."pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY p.nome, p.categoria
  )
  SELECT 
    nome,
    COALESCE(categoria, 'Não Classificado') as categoria,
    clientes
  FROM produto_clientes
  WHERE clientes > 0
  ORDER BY clientes DESC, nome ASC;
$$;
