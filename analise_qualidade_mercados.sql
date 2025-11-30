-- ==========================================
-- ANÁLISE DE QUALIDADE DE MERCADOS
-- ==========================================

-- 1. MERCADOS - Campos principais
SELECT 
  'MERCADOS - Campos Principais' as analise,
  COUNT(*) as total_mercados,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT("tamanhoMercado") as com_tamanho,
  COUNT(tendencia) as com_tendencia,
  COUNT(populacao) as com_populacao,
  COUNT(pib) as com_pib,
  ROUND(COUNT(cidade)::numeric / COUNT(*) * 100, 2) as perc_cidade,
  ROUND(COUNT(uf)::numeric / COUNT(*) * 100, 2) as perc_uf,
  ROUND(COUNT("tamanhoMercado")::numeric / COUNT(*) * 100, 2) as perc_tamanho,
  ROUND(COUNT(tendencia)::numeric / COUNT(*) * 100, 2) as perc_tendencia,
  ROUND(COUNT(populacao)::numeric / COUNT(*) * 100, 2) as perc_populacao,
  ROUND(COUNT(pib)::numeric / COUNT(*) * 100, 2) as perc_pib
FROM mercados
WHERE "pesquisaId" = 1;

-- 2. MERCADOS - Análise de Tamanho de Mercado
SELECT 
  'MERCADOS - Tamanho' as analise,
  COUNT(*) as total_com_tamanho,
  ROUND(AVG("tamanhoMercado"), 2) as tamanho_medio,
  MIN("tamanhoMercado") as tamanho_minimo,
  MAX("tamanhoMercado") as tamanho_maximo,
  ROUND(STDDEV("tamanhoMercado"), 2) as desvio_padrao,
  COUNT(CASE WHEN "tamanhoMercado" > 0 THEN 1 END) as tamanhos_validos,
  ROUND(COUNT(CASE WHEN "tamanhoMercado" > 0 THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_validos
FROM mercados
WHERE "pesquisaId" = 1 AND "tamanhoMercado" IS NOT NULL;

-- 3. MERCADOS - Distribuição de Tendências
SELECT 
  'MERCADOS - Tendências' as analise,
  tendencia,
  COUNT(*) as quantidade,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM mercados WHERE "pesquisaId" = 1 AND tendencia IS NOT NULL) * 100, 2) as percentual
FROM mercados
WHERE "pesquisaId" = 1 AND tendencia IS NOT NULL
GROUP BY tendencia
ORDER BY quantidade DESC;

-- 4. MERCADOS - Análise de População
SELECT 
  'MERCADOS - População' as analise,
  COUNT(*) as total_com_populacao,
  ROUND(AVG(populacao), 0) as populacao_media,
  MIN(populacao) as populacao_minima,
  MAX(populacao) as populacao_maxima,
  SUM(populacao) as populacao_total,
  COUNT(CASE WHEN populacao > 100000 THEN 1 END) as cidades_grandes,
  COUNT(CASE WHEN populacao BETWEEN 50000 AND 100000 THEN 1 END) as cidades_medias,
  COUNT(CASE WHEN populacao < 50000 THEN 1 END) as cidades_pequenas
FROM mercados
WHERE "pesquisaId" = 1 AND populacao IS NOT NULL;

-- 5. MERCADOS - Análise de PIB
SELECT 
  'MERCADOS - PIB' as analise,
  COUNT(*) as total_com_pib,
  ROUND(AVG(pib), 2) as pib_medio,
  MIN(pib) as pib_minimo,
  MAX(pib) as pib_maximo,
  SUM(pib) as pib_total,
  ROUND(STDDEV(pib), 2) as desvio_padrao
FROM mercados
WHERE "pesquisaId" = 1 AND pib IS NOT NULL;

-- 6. MERCADOS - Top 10 por Tamanho de Mercado
SELECT 
  'TOP 10 - Tamanho de Mercado' as analise,
  cidade,
  uf,
  "tamanhoMercado",
  tendencia,
  populacao,
  pib
FROM mercados
WHERE "pesquisaId" = 1 AND "tamanhoMercado" IS NOT NULL
ORDER BY "tamanhoMercado" DESC
LIMIT 10;

-- 7. MERCADOS - Top 10 por População
SELECT 
  'TOP 10 - População' as analise,
  cidade,
  uf,
  populacao,
  "tamanhoMercado",
  tendencia,
  pib
FROM mercados
WHERE "pesquisaId" = 1 AND populacao IS NOT NULL
ORDER BY populacao DESC
LIMIT 10;

-- 8. MERCADOS - Análise por UF
SELECT 
  'MERCADOS - Por UF' as analise,
  uf,
  COUNT(*) as total_mercados,
  ROUND(AVG("tamanhoMercado"), 2) as tamanho_medio,
  SUM(populacao) as populacao_total,
  ROUND(AVG(pib), 2) as pib_medio,
  COUNT(CASE WHEN tendencia = 'Crescimento' THEN 1 END) as em_crescimento,
  COUNT(CASE WHEN tendencia = 'Estável' THEN 1 END) as estaveis,
  COUNT(CASE WHEN tendencia = 'Declínio' THEN 1 END) as em_declinio
FROM mercados
WHERE "pesquisaId" = 1
GROUP BY uf
ORDER BY total_mercados DESC;

-- 9. MERCADOS - Qualidade Geral dos Dados
SELECT 
  'MERCADOS - Qualidade Geral' as analise,
  COUNT(*) as total_mercados,
  COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL AND "tamanhoMercado" IS NOT NULL AND tendencia IS NOT NULL THEN 1 END) as completos,
  ROUND(COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL AND "tamanhoMercado" IS NOT NULL AND tendencia IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_completos,
  COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END) as com_localizacao,
  ROUND(COUNT(CASE WHEN cidade IS NOT NULL AND uf IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_localizacao,
  COUNT(CASE WHEN "tamanhoMercado" IS NOT NULL AND tendencia IS NOT NULL THEN 1 END) as com_inteligencia,
  ROUND(COUNT(CASE WHEN "tamanhoMercado" IS NOT NULL AND tendencia IS NOT NULL THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_inteligencia
FROM mercados
WHERE "pesquisaId" = 1;
