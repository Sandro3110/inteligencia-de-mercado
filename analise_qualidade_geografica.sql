-- ==========================================
-- ANÁLISE DE QUALIDADE GEOGRÁFICA
-- ==========================================

-- 1. CLIENTES - Coordenadas
SELECT 
  'CLIENTES - Geolocalização' as analise,
  COUNT(*) as total,
  COUNT(latitude) as com_latitude,
  COUNT(longitude) as com_longitude,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas_completas,
  ROUND(COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_geocodificado,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as com_localizacao_textual,
  ROUND(COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_localizacao
FROM clientes
WHERE "pesquisaId" = 1;

-- 2. LEADS - Coordenadas
SELECT 
  'LEADS - Geolocalização' as analise,
  COUNT(*) as total,
  COUNT(latitude) as com_latitude,
  COUNT(longitude) as com_longitude,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas_completas,
  ROUND(COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_geocodificado,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as com_localizacao_textual,
  ROUND(COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_localizacao
FROM leads
WHERE "pesquisaId" = 1;

-- 3. CONCORRENTES - Coordenadas
SELECT 
  'CONCORRENTES - Geolocalização' as analise,
  COUNT(*) as total,
  COUNT(latitude) as com_latitude,
  COUNT(longitude) as com_longitude,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas_completas,
  ROUND(COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_geocodificado,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as com_localizacao_textual,
  ROUND(COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_localizacao
FROM concorrentes
WHERE "pesquisaId" = 1;

-- 4. RESUMO CONSOLIDADO DE GEOLOCALIZAÇÃO
SELECT 
  'RESUMO GEOLOCALIZAÇÃO' as analise,
  SUM(total) as total_entidades,
  SUM(com_coordenadas) as total_geocodificado,
  SUM(total) - SUM(com_coordenadas) as total_sem_coordenadas,
  ROUND(SUM(com_coordenadas)::numeric / SUM(total) * 100, 2) as perc_geocodificado,
  SUM(com_localizacao) as total_com_cidade_uf,
  SUM(total) - SUM(com_localizacao) as potencial_geocodificacao,
  ROUND((SUM(total) - SUM(com_localizacao))::numeric / SUM(total) * 100, 2) as perc_potencial
FROM (
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas,
    COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as com_localizacao
  FROM clientes WHERE "pesquisaId" = 1
  UNION ALL
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas,
    COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as com_localizacao
  FROM leads WHERE "pesquisaId" = 1
  UNION ALL
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas,
    COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as com_localizacao
  FROM concorrentes WHERE "pesquisaId" = 1
) sub;

-- 5. DISTRIBUIÇÃO GEOGRÁFICA - Por UF
SELECT 
  'DISTRIBUIÇÃO POR UF' as analise,
  uf,
  COUNT(*) as total_entidades,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as geocodificados,
  ROUND(COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_geocodificado
FROM (
  SELECT uf, latitude, longitude FROM clientes WHERE "pesquisaId" = 1
  UNION ALL
  SELECT uf, latitude, longitude FROM leads WHERE "pesquisaId" = 1
  UNION ALL
  SELECT uf, latitude, longitude FROM concorrentes WHERE "pesquisaId" = 1
) sub
WHERE uf IS NOT NULL
GROUP BY uf
ORDER BY total_entidades DESC;

-- 6. CIDADES COM MAIS ENTIDADES
SELECT 
  'TOP 20 CIDADES' as analise,
  cidade,
  uf,
  COUNT(*) as total_entidades,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as geocodificados,
  ROUND(COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_geocodificado
FROM (
  SELECT cidade, uf, latitude, longitude FROM clientes WHERE "pesquisaId" = 1
  UNION ALL
  SELECT cidade, uf, latitude, longitude FROM leads WHERE "pesquisaId" = 1
  UNION ALL
  SELECT cidade, uf, latitude, longitude FROM concorrentes WHERE "pesquisaId" = 1
) sub
WHERE cidade IS NOT NULL
GROUP BY cidade, uf
ORDER BY total_entidades DESC
LIMIT 20;

-- 7. VALIDAÇÃO DE COORDENADAS (Brasil: lat -33 a 5, long -74 a -34)
SELECT 
  'VALIDAÇÃO DE COORDENADAS' as analise,
  COUNT(*) as total_com_coordenadas,
  COUNT(CASE WHEN latitude BETWEEN -33 AND 5 AND longitude BETWEEN -74 AND -34 THEN 1 END) as coordenadas_validas,
  COUNT(CASE WHEN latitude NOT BETWEEN -33 AND 5 OR longitude NOT BETWEEN -74 AND -34 THEN 1 END) as coordenadas_invalidas,
  ROUND(COUNT(CASE WHEN latitude BETWEEN -33 AND 5 AND longitude BETWEEN -74 AND -34 THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_validas
FROM (
  SELECT latitude, longitude FROM clientes WHERE "pesquisaId" = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
  UNION ALL
  SELECT latitude, longitude FROM leads WHERE "pesquisaId" = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
  UNION ALL
  SELECT latitude, longitude FROM concorrentes WHERE "pesquisaId" = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
) sub;

-- 8. POTENCIAL DE GEOCODIFICAÇÃO (tem cidade/UF mas não tem coordenadas)
SELECT 
  'POTENCIAL DE GEOCODIFICAÇÃO' as analise,
  tipo,
  COUNT(*) as total_sem_coordenadas,
  COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as pode_geocodificar,
  ROUND(COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_pode_geocodificar
FROM (
  SELECT 'CLIENTES' as tipo, cidade, uf FROM clientes WHERE "pesquisaId" = 1 AND (latitude IS NULL OR longitude IS NULL)
  UNION ALL
  SELECT 'LEADS' as tipo, cidade, uf FROM leads WHERE "pesquisaId" = 1 AND (latitude IS NULL OR longitude IS NULL)
  UNION ALL
  SELECT 'CONCORRENTES' as tipo, cidade, uf FROM concorrentes WHERE "pesquisaId" = 1 AND (latitude IS NULL OR longitude IS NULL)
) sub
GROUP BY tipo;
