-- FASE 3: Stored Procedure para Agregação Hierárquica
-- Testado e validado linha por linha

CREATE OR REPLACE FUNCTION get_geo_hierarchy(
  p_entity_type TEXT,
  p_pesquisa_ids INTEGER[],
  p_setor TEXT DEFAULT NULL,
  p_porte TEXT DEFAULT NULL,
  p_qualidade TEXT DEFAULT NULL
)
RETURNS TABLE (
  regiao TEXT,
  uf TEXT,
  cidade TEXT,
  city_count INTEGER,
  state_count INTEGER,
  region_count INTEGER
) 
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
  v_query TEXT;
  v_where TEXT;
  v_conditions TEXT[];
BEGIN
  -- Inicializar condições base
  v_conditions := ARRAY['uf IS NOT NULL', 'cidade IS NOT NULL'];

  -- Adicionar filtro de pesquisaIds
  IF p_pesquisa_ids IS NOT NULL AND array_length(p_pesquisa_ids, 1) > 0 THEN
    v_conditions := array_append(v_conditions, '"pesquisaId" = ANY($1)');
  END IF;

  -- Adicionar filtro de setor (apenas para leads e concorrentes)
  IF p_setor IS NOT NULL AND p_entity_type IN ('leads', 'concorrentes') THEN
    v_conditions := array_append(v_conditions, 'setor = ' || quote_literal(p_setor));
  END IF;

  -- Adicionar filtro de porte
  IF p_porte IS NOT NULL THEN
    v_conditions := array_append(v_conditions, 'porte = ' || quote_literal(p_porte));
  END IF;

  -- Adicionar filtro de qualidade (apenas para leads)
  IF p_qualidade IS NOT NULL AND p_entity_type = 'leads' THEN
    v_conditions := array_append(v_conditions, '"qualidadeClassificacao" = ' || quote_literal(p_qualidade));
  END IF;

  -- Montar cláusula WHERE
  v_where := array_to_string(v_conditions, ' AND ');

  -- Construir query dinâmica
  v_query := '
    WITH city_counts AS (
      SELECT 
        uf,
        cidade,
        COUNT(*)::INTEGER as count,
        CASE 
          WHEN uf IN (' || quote_literal('PR') || ', ' || quote_literal('RS') || ', ' || quote_literal('SC') || ') THEN ' || quote_literal('Sul') || '
          WHEN uf IN (' || quote_literal('ES') || ', ' || quote_literal('MG') || ', ' || quote_literal('RJ') || ', ' || quote_literal('SP') || ') THEN ' || quote_literal('Sudeste') || '
          WHEN uf IN (' || quote_literal('DF') || ', ' || quote_literal('GO') || ', ' || quote_literal('MS') || ', ' || quote_literal('MT') || ') THEN ' || quote_literal('Centro-Oeste') || '
          WHEN uf IN (' || quote_literal('AL') || ', ' || quote_literal('BA') || ', ' || quote_literal('CE') || ', ' || quote_literal('MA') || ', ' || quote_literal('PB') || ', ' || quote_literal('PE') || ', ' || quote_literal('PI') || ', ' || quote_literal('RN') || ', ' || quote_literal('SE') || ') THEN ' || quote_literal('Nordeste') || '
          WHEN uf IN (' || quote_literal('AC') || ', ' || quote_literal('AM') || ', ' || quote_literal('AP') || ', ' || quote_literal('PA') || ', ' || quote_literal('RO') || ', ' || quote_literal('RR') || ', ' || quote_literal('TO') || ') THEN ' || quote_literal('Norte') || '
          ELSE ' || quote_literal('Outros') || '
        END as regiao
      FROM ' || quote_ident(p_entity_type) || '
      WHERE ' || v_where || '
      GROUP BY uf, cidade
    ),
    state_counts AS (
      SELECT 
        regiao,
        uf,
        SUM(count)::INTEGER as count
      FROM city_counts
      GROUP BY regiao, uf
    ),
    region_counts AS (
      SELECT 
        regiao,
        SUM(count)::INTEGER as count
      FROM city_counts
      GROUP BY regiao
    )
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
        WHEN ' || quote_literal('Sul') || ' THEN 1
        WHEN ' || quote_literal('Sudeste') || ' THEN 2
        WHEN ' || quote_literal('Centro-Oeste') || ' THEN 3
        WHEN ' || quote_literal('Nordeste') || ' THEN 4
        WHEN ' || quote_literal('Norte') || ' THEN 5
        ELSE 6
      END,
      c.uf,
      c.cidade';

  -- Executar query
  IF p_pesquisa_ids IS NOT NULL AND array_length(p_pesquisa_ids, 1) > 0 THEN
    RETURN QUERY EXECUTE v_query USING p_pesquisa_ids;
  ELSE
    RETURN QUERY EXECUTE v_query;
  END IF;
END;
$function$;
