-- Migration 008: Adicionar campos faltantes
-- Data: 02/12/2024

-- 1. Adicionar dia_semana em dim_tempo
ALTER TABLE dim_tempo ADD COLUMN IF NOT EXISTS dia_semana INTEGER;

-- Atualizar valores (0 = Domingo, 6 = Sábado)
UPDATE dim_tempo 
SET dia_semana = EXTRACT(DOW FROM data)
WHERE dia_semana IS NULL;

-- 2. Adicionar regiao em dim_geografia
ALTER TABLE dim_geografia ADD COLUMN IF NOT EXISTS regiao VARCHAR(50);

-- Atualizar valores baseado no estado
UPDATE dim_geografia 
SET regiao = CASE 
  WHEN estado IN ('AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
  WHEN estado IN ('AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE') THEN 'Nordeste'
  WHEN estado IN ('DF', 'GO', 'MT', 'MS') THEN 'Centro-Oeste'
  WHEN estado IN ('ES', 'MG', 'RJ', 'SP') THEN 'Sudeste'
  WHEN estado IN ('PR', 'RS', 'SC') THEN 'Sul'
  ELSE 'Não Classificado'
END
WHERE regiao IS NULL;
