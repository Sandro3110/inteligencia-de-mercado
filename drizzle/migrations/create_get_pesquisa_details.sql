-- Stored Procedure: get_pesquisa_details
-- Substitui 9 queries de pesquisas.getByIdWithCounts
-- Ganho esperado: 80% de redução (1.0s → 0.2s)
-- Status: ✅ TESTADA E VALIDADA

DROP FUNCTION IF EXISTS get_pesquisa_details(integer);

CREATE FUNCTION get_pesquisa_details(p_pesquisa_id INTEGER)
RETURNS TABLE(
  -- Dados da pesquisa
  pesquisa_id INTEGER,
  project_id INTEGER,
  pesquisa_nome VARCHAR,
  pesquisa_descricao TEXT,
  pesquisa_status VARCHAR,
  -- Contadores de clientes
  total_clientes INTEGER,
  clientes_enriquecidos INTEGER,
  -- Contadores de entidades
  leads_count INTEGER,
  mercados_count INTEGER,
  produtos_count INTEGER,
  concorrentes_count INTEGER,
  -- Qualidade média (arredondada para inteiro)
  clientes_qualidade_media INTEGER,
  leads_qualidade_media INTEGER,
  concorrentes_qualidade_media INTEGER,
  -- Enriquecimento geográfico total
  geo_total INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH pesquisa_base AS (
    -- Buscar dados básicos da pesquisa
    SELECT 
      p.id,
      p."projectId",
      p.nome,
      p.descricao,
      p.status,
      p."totalClientes",
      p."clientesEnriquecidos"
    FROM pesquisas p
    WHERE p.id = p_pesquisa_id
    LIMIT 1
  ),
  clientes_stats AS (
    -- Estatísticas de clientes
    SELECT 
      COUNT(*) AS total,
      ROUND(AVG(c."qualidadeScore"))::INTEGER AS qualidade_media,
      COUNT(CASE WHEN c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN 1 END) AS geo_count
    FROM clientes c
    WHERE c."pesquisaId" = p_pesquisa_id
  ),
  leads_stats AS (
    -- Estatísticas de leads
    SELECT 
      COUNT(*) AS total,
      ROUND(AVG(l."qualidadeScore"))::INTEGER AS qualidade_media,
      COUNT(CASE WHEN l.latitude IS NOT NULL AND l.longitude IS NOT NULL THEN 1 END) AS geo_count
    FROM leads l
    WHERE l."pesquisaId" = p_pesquisa_id
  ),
  concorrentes_stats AS (
    -- Estatísticas de concorrentes
    SELECT 
      COUNT(*) AS total,
      ROUND(AVG(co."qualidadeScore"))::INTEGER AS qualidade_media,
      COUNT(CASE WHEN co.latitude IS NOT NULL AND co.longitude IS NOT NULL THEN 1 END) AS geo_count
    FROM concorrentes co
    WHERE co."pesquisaId" = p_pesquisa_id
  ),
  mercados_stats AS (
    -- Contagem de mercados
    SELECT COUNT(*) AS total
    FROM mercados_unicos m
    WHERE m."pesquisaId" = p_pesquisa_id
  ),
  produtos_stats AS (
    -- Contagem de produtos
    SELECT COUNT(*) AS total
    FROM produtos pr
    WHERE pr."pesquisaId" = p_pesquisa_id
  )
  -- Combinar todos os dados
  SELECT 
    pb.id,
    pb."projectId",
    pb.nome,
    pb.descricao,
    pb.status,
    -- Usar dados da pesquisa ou calcular se necessário
    COALESCE(pb."totalClientes", cs.total)::INTEGER AS total_clientes,
    COALESCE(pb."clientesEnriquecidos", 0)::INTEGER AS clientes_enriquecidos,
    -- Contadores
    COALESCE(ls.total, 0)::INTEGER AS leads_count,
    COALESCE(ms.total, 0)::INTEGER AS mercados_count,
    COALESCE(ps.total, 0)::INTEGER AS produtos_count,
    COALESCE(cos.total, 0)::INTEGER AS concorrentes_count,
    -- Qualidade média (já arredondada)
    COALESCE(cs.qualidade_media, 0)::INTEGER AS clientes_qualidade_media,
    COALESCE(ls.qualidade_media, 0)::INTEGER AS leads_qualidade_media,
    COALESCE(cos.qualidade_media, 0)::INTEGER AS concorrentes_qualidade_media,
    -- Total de enriquecimento geográfico
    (COALESCE(cs.geo_count, 0) + COALESCE(ls.geo_count, 0) + COALESCE(cos.geo_count, 0))::INTEGER AS geo_total
  FROM pesquisa_base pb
  CROSS JOIN clientes_stats cs
  CROSS JOIN leads_stats ls
  CROSS JOIN concorrentes_stats cos
  CROSS JOIN mercados_stats ms
  CROSS JOIN produtos_stats ps;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentários explicativos
COMMENT ON FUNCTION get_pesquisa_details(INTEGER) IS 
'Retorna detalhes completos de uma pesquisa com todas as estatísticas agregadas.
Substitui 9 queries individuais por 1 query otimizada.
Usa CTEs para organizar lógica e índices existentes para performance.
Ganho esperado: 80% de redução no tempo de resposta (1.0s → 0.2s).

NOTA: Campo enriquecido não existe na tabela clientes, usa clientesEnriquecidos da tabela pesquisas.

Testado com pesquisa ID 1:
- total_clientes: 807
- clientes_enriquecidos: 807
- leads_count: 5455
- mercados_count: 900
- produtos_count: 2726
- concorrentes_count: 9079
- clientes_qualidade_media: 95
- leads_qualidade_media: 67
- concorrentes_qualidade_media: 65
- geo_total: 1036';

-- Query de teste
-- SELECT * FROM get_pesquisa_details(1);
