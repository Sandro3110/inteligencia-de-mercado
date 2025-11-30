-- ==========================================
-- ANÁLISE DE QUALIDADE DE DOCUMENTOS (CNPJ/CPF)
-- ==========================================

-- 1. CLIENTES - Análise de CNPJ
SELECT 
  'CLIENTES' as tabela,
  COUNT(*) as total,
  COUNT(cnpj) as com_cnpj,
  COUNT(*) - COUNT(cnpj) as sem_cnpj,
  ROUND(COUNT(cnpj)::numeric / COUNT(*) * 100, 2) as percentual_preenchido,
  COUNT(DISTINCT cnpj) as cnpj_unicos,
  COUNT(*) - COUNT(DISTINCT cnpj) as cnpj_duplicados
FROM clientes
WHERE "pesquisaId" = 1;

-- 2. CLIENTES - Validação de formato CNPJ (14 dígitos)
SELECT 
  'CLIENTES - Formato CNPJ' as analise,
  COUNT(*) as total_com_cnpj,
  COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) = 14 THEN 1 END) as formato_valido,
  COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) != 14 THEN 1 END) as formato_invalido,
  ROUND(COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) = 14 THEN 1 END)::numeric / COUNT(*) * 100, 2) as percentual_valido
FROM clientes
WHERE "pesquisaId" = 1 AND cnpj IS NOT NULL;

-- 3. LEADS - Análise de CNPJ
SELECT 
  'LEADS' as tabela,
  COUNT(*) as total,
  COUNT(cnpj) as com_cnpj,
  COUNT(*) - COUNT(cnpj) as sem_cnpj,
  ROUND(COUNT(cnpj)::numeric / COUNT(*) * 100, 2) as percentual_preenchido,
  COUNT(DISTINCT cnpj) as cnpj_unicos,
  COUNT(*) - COUNT(DISTINCT cnpj) as cnpj_duplicados
FROM leads
WHERE "pesquisaId" = 1;

-- 4. LEADS - Validação de formato CNPJ
SELECT 
  'LEADS - Formato CNPJ' as analise,
  COUNT(*) as total_com_cnpj,
  COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) = 14 THEN 1 END) as formato_valido,
  COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) != 14 THEN 1 END) as formato_invalido,
  ROUND(COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) = 14 THEN 1 END)::numeric / COUNT(*) * 100, 2) as percentual_valido
FROM leads
WHERE "pesquisaId" = 1 AND cnpj IS NOT NULL;

-- 5. CONCORRENTES - Análise de CNPJ
SELECT 
  'CONCORRENTES' as tabela,
  COUNT(*) as total,
  COUNT(cnpj) as com_cnpj,
  COUNT(*) - COUNT(cnpj) as sem_cnpj,
  ROUND(COUNT(cnpj)::numeric / COUNT(*) * 100, 2) as percentual_preenchido,
  COUNT(DISTINCT cnpj) as cnpj_unicos,
  COUNT(*) - COUNT(DISTINCT cnpj) as cnpj_duplicados
FROM concorrentes
WHERE "pesquisaId" = 1;

-- 6. CONCORRENTES - Validação de formato CNPJ
SELECT 
  'CONCORRENTES - Formato CNPJ' as analise,
  COUNT(*) as total_com_cnpj,
  COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) = 14 THEN 1 END) as formato_valido,
  COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) != 14 THEN 1 END) as formato_invalido,
  ROUND(COUNT(CASE WHEN LENGTH(REGEXP_REPLACE(cnpj, '[^0-9]', '', 'g')) = 14 THEN 1 END)::numeric / COUNT(*) * 100, 2) as percentual_valido
FROM concorrentes
WHERE "pesquisaId" = 1 AND cnpj IS NOT NULL;

-- 7. RESUMO CONSOLIDADO
SELECT 
  'RESUMO GERAL' as analise,
  (SELECT COUNT(*) FROM clientes WHERE "pesquisaId" = 1) + 
  (SELECT COUNT(*) FROM leads WHERE "pesquisaId" = 1) + 
  (SELECT COUNT(*) FROM concorrentes WHERE "pesquisaId" = 1) as total_entidades,
  (SELECT COUNT(cnpj) FROM clientes WHERE "pesquisaId" = 1) + 
  (SELECT COUNT(cnpj) FROM leads WHERE "pesquisaId" = 1) + 
  (SELECT COUNT(cnpj) FROM concorrentes WHERE "pesquisaId" = 1) as total_com_cnpj,
  ROUND(
    ((SELECT COUNT(cnpj) FROM clientes WHERE "pesquisaId" = 1) + 
     (SELECT COUNT(cnpj) FROM leads WHERE "pesquisaId" = 1) + 
     (SELECT COUNT(cnpj) FROM concorrentes WHERE "pesquisaId" = 1))::numeric / 
    ((SELECT COUNT(*) FROM clientes WHERE "pesquisaId" = 1) + 
     (SELECT COUNT(*) FROM leads WHERE "pesquisaId" = 1) + 
     (SELECT COUNT(*) FROM concorrentes WHERE "pesquisaId" = 1)) * 100, 2
  ) as percentual_preenchido;
