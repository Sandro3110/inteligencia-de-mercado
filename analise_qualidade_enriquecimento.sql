-- ==========================================
-- ANÁLISE DE QUALIDADE DE ENRIQUECIMENTO
-- ==========================================

-- 1. CLIENTES - Campos enriquecidos
SELECT 
  'CLIENTES - Enriquecimento' as analise,
  COUNT(*) as total,
  COUNT("qualidadeScore") as com_score,
  ROUND(AVG("qualidadeScore"), 2) as score_medio,
  COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
  COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
  COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT(telefone) as com_telefone,
  COUNT(email) as com_email,
  COUNT(site) as com_site,
  ROUND(COUNT(cidade)::numeric / COUNT(*) * 100, 2) as perc_cidade,
  ROUND(COUNT(uf)::numeric / COUNT(*) * 100, 2) as perc_uf,
  ROUND(COUNT(telefone)::numeric / COUNT(*) * 100, 2) as perc_telefone,
  ROUND(COUNT(email)::numeric / COUNT(*) * 100, 2) as perc_email,
  ROUND(COUNT(site)::numeric / COUNT(*) * 100, 2) as perc_site
FROM clientes
WHERE "pesquisaId" = 1;

-- 2. LEADS - Campos enriquecidos
SELECT 
  'LEADS - Enriquecimento' as analise,
  COUNT(*) as total,
  COUNT("qualidadeScore") as com_score,
  ROUND(AVG("qualidadeScore"), 2) as score_medio,
  COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
  COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
  COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT(telefone) as com_telefone,
  COUNT(email) as com_email,
  COUNT(site) as com_site,
  ROUND(COUNT(cidade)::numeric / COUNT(*) * 100, 2) as perc_cidade,
  ROUND(COUNT(uf)::numeric / COUNT(*) * 100, 2) as perc_uf,
  ROUND(COUNT(telefone)::numeric / COUNT(*) * 100, 2) as perc_telefone,
  ROUND(COUNT(email)::numeric / COUNT(*) * 100, 2) as perc_email,
  ROUND(COUNT(site)::numeric / COUNT(*) * 100, 2) as perc_site
FROM leads
WHERE "pesquisaId" = 1;

-- 3. CONCORRENTES - Campos enriquecidos
SELECT 
  'CONCORRENTES - Enriquecimento' as analise,
  COUNT(*) as total,
  COUNT("qualidadeScore") as com_score,
  ROUND(AVG("qualidadeScore"), 2) as score_medio,
  COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
  COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
  COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT(telefone) as com_telefone,
  COUNT(email) as com_email,
  COUNT(site) as com_site,
  ROUND(COUNT(cidade)::numeric / COUNT(*) * 100, 2) as perc_cidade,
  ROUND(COUNT(uf)::numeric / COUNT(*) * 100, 2) as perc_uf,
  ROUND(COUNT(telefone)::numeric / COUNT(*) * 100, 2) as perc_telefone,
  ROUND(COUNT(email)::numeric / COUNT(*) * 100, 2) as perc_email,
  ROUND(COUNT(site)::numeric / COUNT(*) * 100, 2) as perc_site
FROM concorrentes
WHERE "pesquisaId" = 1;

-- 4. CLIENTES - Análise de campos JSON (dadosEnriquecidos)
SELECT 
  'CLIENTES - Dados JSON' as analise,
  COUNT(*) as total,
  COUNT("dadosEnriquecidos") as com_dados_json,
  ROUND(COUNT("dadosEnriquecidos")::numeric / COUNT(*) * 100, 2) as perc_com_json,
  COUNT(CASE WHEN "dadosEnriquecidos"::text != '{}' THEN 1 END) as json_nao_vazio,
  ROUND(COUNT(CASE WHEN "dadosEnriquecidos"::text != '{}' THEN 1 END)::numeric / COUNT(*) * 100, 2) as perc_json_util
FROM clientes
WHERE "pesquisaId" = 1;

-- 5. RESUMO DE QUALIDADE GERAL
SELECT 
  'RESUMO QUALIDADE GERAL' as analise,
  ROUND(AVG(score_medio), 2) as score_medio_geral,
  SUM(total) as total_entidades,
  SUM(excelente) as total_excelente,
  SUM(bom) as total_bom,
  SUM(ruim) as total_ruim,
  ROUND(SUM(excelente)::numeric / SUM(total) * 100, 2) as perc_excelente,
  ROUND(SUM(bom)::numeric / SUM(total) * 100, 2) as perc_bom,
  ROUND(SUM(ruim)::numeric / SUM(total) * 100, 2) as perc_ruim
FROM (
  SELECT 
    COUNT(*) as total,
    AVG("qualidadeScore") as score_medio,
    COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
    COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
    COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim
  FROM clientes WHERE "pesquisaId" = 1
  UNION ALL
  SELECT 
    COUNT(*) as total,
    AVG("qualidadeScore") as score_medio,
    COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
    COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
    COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim
  FROM leads WHERE "pesquisaId" = 1
  UNION ALL
  SELECT 
    COUNT(*) as total,
    AVG("qualidadeScore") as score_medio,
    COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
    COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
    COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim
  FROM concorrentes WHERE "pesquisaId" = 1
) sub;
