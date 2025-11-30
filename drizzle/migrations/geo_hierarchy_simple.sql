-- FASE 3: Stored Procedure Simplificada
-- Versão sem dynamic SQL complexo

-- Função para CLIENTES
CREATE OR REPLACE FUNCTION get_geo_hierarchy_clientes(
  p_pesquisa_ids INTEGER[]
)
RETURNS TABLE (
  regiao TEXT,
  uf TEXT,
  cidade TEXT,
  city_count INTEGER
) 
LANGUAGE sql
STABLE
AS $$
  WITH city_counts AS (
    SELECT 
      uf,
      cidade,
      COUNT(*)::INTEGER as count,
      CASE 
        WHEN uf IN ('PR', 'RS', 'SC') THEN 'Sul'
        WHEN uf IN ('ES', 'MG', 'RJ', 'SP') THEN 'Sudeste'
        WHEN uf IN ('DF', 'GO', 'MS', 'MT') THEN 'Centro-Oeste'
        WHEN uf IN ('AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE') THEN 'Nordeste'
        WHEN uf IN ('AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
        ELSE 'Outros'
      END as regiao
    FROM clientes
    WHERE uf IS NOT NULL 
      AND cidade IS NOT NULL
      AND "pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY uf, cidade
  )
  SELECT 
    regiao,
    uf,
    cidade,
    count as city_count
  FROM city_counts
  ORDER BY 
    CASE regiao
      WHEN 'Sul' THEN 1
      WHEN 'Sudeste' THEN 2
      WHEN 'Centro-Oeste' THEN 3
      WHEN 'Nordeste' THEN 4
      WHEN 'Norte' THEN 5
      ELSE 6
    END,
    uf,
    cidade;
$$;

-- Função para LEADS
CREATE OR REPLACE FUNCTION get_geo_hierarchy_leads(
  p_pesquisa_ids INTEGER[]
)
RETURNS TABLE (
  regiao TEXT,
  uf TEXT,
  cidade TEXT,
  city_count INTEGER
) 
LANGUAGE sql
STABLE
AS $$
  WITH city_counts AS (
    SELECT 
      uf,
      cidade,
      COUNT(*)::INTEGER as count,
      CASE 
        WHEN uf IN ('PR', 'RS', 'SC') THEN 'Sul'
        WHEN uf IN ('ES', 'MG', 'RJ', 'SP') THEN 'Sudeste'
        WHEN uf IN ('DF', 'GO', 'MS', 'MT') THEN 'Centro-Oeste'
        WHEN uf IN ('AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE') THEN 'Nordeste'
        WHEN uf IN ('AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
        ELSE 'Outros'
      END as regiao
    FROM leads
    WHERE uf IS NOT NULL 
      AND cidade IS NOT NULL
      AND "pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY uf, cidade
  )
  SELECT 
    regiao,
    uf,
    cidade,
    count as city_count
  FROM city_counts
  ORDER BY 
    CASE regiao
      WHEN 'Sul' THEN 1
      WHEN 'Sudeste' THEN 2
      WHEN 'Centro-Oeste' THEN 3
      WHEN 'Nordeste' THEN 4
      WHEN 'Norte' THEN 5
      ELSE 6
    END,
    uf,
    cidade;
$$;

-- Função para CONCORRENTES
CREATE OR REPLACE FUNCTION get_geo_hierarchy_concorrentes(
  p_pesquisa_ids INTEGER[]
)
RETURNS TABLE (
  regiao TEXT,
  uf TEXT,
  cidade TEXT,
  city_count INTEGER
) 
LANGUAGE sql
STABLE
AS $$
  WITH city_counts AS (
    SELECT 
      uf,
      cidade,
      COUNT(*)::INTEGER as count,
      CASE 
        WHEN uf IN ('PR', 'RS', 'SC') THEN 'Sul'
        WHEN uf IN ('ES', 'MG', 'RJ', 'SP') THEN 'Sudeste'
        WHEN uf IN ('DF', 'GO', 'MS', 'MT') THEN 'Centro-Oeste'
        WHEN uf IN ('AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE') THEN 'Nordeste'
        WHEN uf IN ('AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
        ELSE 'Outros'
      END as regiao
    FROM concorrentes
    WHERE uf IS NOT NULL 
      AND cidade IS NOT NULL
      AND "pesquisaId" = ANY(p_pesquisa_ids)
    GROUP BY uf, cidade
  )
  SELECT 
    regiao,
    uf,
    cidade,
    count as city_count
  FROM city_counts
  ORDER BY 
    CASE regiao
      WHEN 'Sul' THEN 1
      WHEN 'Sudeste' THEN 2
      WHEN 'Centro-Oeste' THEN 3
      WHEN 'Nordeste' THEN 4
      WHEN 'Norte' THEN 5
      ELSE 6
    END,
    uf,
    cidade;
$$;
