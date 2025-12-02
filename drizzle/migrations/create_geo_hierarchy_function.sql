-- Migration: Stored Procedure para agregação hierárquica de geoposição
-- FASE 3: Performance crítica para volumes >50k registros
-- Ganho esperado: +50-70% (de 0.3s para 0.1s)

-- ============================================================================
-- FUNÇÃO: get_geo_hierarchy
-- ============================================================================

CREATE OR REPLACE FUNCTION get_geo_hierarchy(
  p_entity_type TEXT,           -- 'clientes', 'leads', 'concorrentes'
  p_pesquisa_ids INTEGER[],     -- Array de IDs de pesquisas
  p_setor TEXT DEFAULT NULL,    -- Filtro opcional
  p_porte TEXT DEFAULT NULL,    -- Filtro opcional
  p_qualidade TEXT DEFAULT NULL -- Filtro opcional (apenas leads)
)
RETURNS TABLE (
  regiao TEXT,
  uf TEXT,
  cidade TEXT,
  city_count INTEGER,
  state_count INTEGER,
  region_count INTEGER
) AS $$
DECLARE
  v_query TEXT;
  v_where_conditions TEXT[];
BEGIN
  -- Construir condições WHERE dinamicamente
  v_where_conditions := ARRAY[
    'uf IS NOT NULL',
    'cidade IS NOT NULL'
  ];

  -- Filtro por pesquisaIds
  IF p_pesquisa_ids IS NOT NULL AND array_length(p_pesquisa_ids, 1) > 0 THEN
    v_where_conditions := array_append(
      v_where_conditions,
      format('"pesquisaId" = ANY($1)')
    );
  END IF;

  -- Filtro por setor (apenas se tabela tiver o campo)
  IF p_setor IS NOT NULL AND p_entity_type IN ('leads', 'concorrentes') THEN
    v_where_conditions := array_append(
      v_where_conditions,
      format('setor = %L', p_setor)
    );
  END IF;

  -- Filtro por porte
  IF p_porte IS NOT NULL THEN
    v_where_conditions := array_append(
      v_where_conditions,
      format('porte = %L', p_porte)
    );
  END IF;

  -- Filtro por qualidade (apenas leads)
  IF p_qualidade IS NOT NULL AND p_entity_type = 'leads' THEN
    v_where_conditions := array_append(
      v_where_conditions,
      format('"qualidadeClassificacao" = %L', p_qualidade)
    );
  END IF;

  -- Construir query com CTEs
  v_query := format('
    WITH city_counts AS (
      -- Contar por cidade
      SELECT 
        uf,
        cidade,
        COUNT(*)::INTEGER as count,
        CASE 
          WHEN uf IN (''PR'', ''RS'', ''SC'') THEN ''Sul''
          WHEN uf IN (''ES'', ''MG'', ''RJ'', ''SP'') THEN ''Sudeste''
          WHEN uf IN (''DF'', ''GO'', ''MS'', ''MT'') THEN ''Centro-Oeste''
          WHEN uf IN (''AL'', ''BA'', ''CE'', ''MA'', ''PB'', ''PE'', ''PI'', ''RN'', ''SE'') THEN ''Nordeste''
          WHEN uf IN (''AC'', ''AM'', ''AP'', ''PA'', ''RO'', ''RR'', ''TO'') THEN ''Norte''
          ELSE ''Outros''
        END as regiao
      FROM %I
      WHERE %s
      GROUP BY uf, cidade
    ),
    state_counts AS (
      -- Contar por estado
      SELECT 
        regiao,
        uf,
        SUM(count)::INTEGER as count
      FROM city_counts
      GROUP BY regiao, uf
    ),
    region_counts AS (
      -- Contar por região
      SELECT 
        regiao,
        SUM(count)::INTEGER as count
      FROM city_counts
      GROUP BY regiao
    )
    -- Retornar dados estruturados
    SELECT 
      c.regiao,
      c.uf,
      c.cidade,
      c.count as city_count,
      s.count as state_count,
      r.count as region_count
    FROM city_counts c
    JOIN state_counts s ON c.regiao = s.regiao AND c.uf = s.uf
    JOIN region_counts r ON c.regiao = r.regiao
    ORDER BY 
      CASE c.regiao
        WHEN ''Sul'' THEN 1
        WHEN ''Sudeste'' THEN 2
        WHEN ''Centro-Oeste'' THEN 3
        WHEN ''Nordeste'' THEN 4
        WHEN ''Norte'' THEN 5
        ELSE 6
      END,
      c.uf,
      c.cidade
  ',
    p_entity_type,
    array_to_string(v_where_conditions, ' AND ')
  );

  -- Executar query
  IF p_pesquisa_ids IS NOT NULL AND array_length(p_pesquisa_ids, 1) > 0 THEN
    RETURN QUERY EXECUTE v_query USING p_pesquisa_ids;
  ELSE
    RETURN QUERY EXECUTE v_query;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION get_geo_hierarchy IS 
'Agrega dados de clientes/leads/concorrentes hierarquicamente (Região→Estado→Cidade).
Otimizado para volumes >50k registros.
Usa CTEs para processamento eficiente no banco de dados.';

-- ============================================================================
-- EXEMPLO DE USO
-- ============================================================================

-- Buscar hierarquia de clientes para pesquisas 1 e 2
-- SELECT * FROM get_geo_hierarchy('clientes', ARRAY[1, 2], NULL, NULL, NULL);

-- Buscar hierarquia de leads com filtros
-- SELECT * FROM get_geo_hierarchy('leads', ARRAY[1], 'Tecnologia', 'Grande', 'Alta');

-- ============================================================================
-- TESTES DE PERFORMANCE
-- ============================================================================

-- Testar com EXPLAIN ANALYZE
-- EXPLAIN ANALYZE
-- SELECT * FROM get_geo_hierarchy('clientes', ARRAY[1], NULL, NULL, NULL);

-- ============================================================================
-- ROLLBACK (se necessário)
-- ============================================================================

-- DROP FUNCTION IF EXISTS get_geo_hierarchy(TEXT, INTEGER[], TEXT, TEXT, TEXT);
