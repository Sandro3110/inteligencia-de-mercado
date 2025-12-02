-- Migration 004: Adicionar hierarquias dimensionais
-- Data: 2025-12-02
-- Descrição: Adicionar hierarquias para drill-down/up em geografia e mercado

-- ============================================================================
-- HIERARQUIA GEOGRÁFICA: País → Macrorregião → UF → Cidade
-- ============================================================================

ALTER TABLE dim_geografia ADD COLUMN IF NOT EXISTS
  pais VARCHAR(50) DEFAULT 'Brasil';
ALTER TABLE dim_geografia ADD COLUMN IF NOT EXISTS
  macrorregiao VARCHAR(50);
ALTER TABLE dim_geografia ADD COLUMN IF NOT EXISTS
  mesorregiao VARCHAR(100);
ALTER TABLE dim_geografia ADD COLUMN IF NOT EXISTS
  microrregiao VARCHAR(100);

-- Popular macrorregiao baseado em UF
UPDATE dim_geografia SET macrorregiao = CASE
  WHEN uf IN ('AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
  WHEN uf IN ('AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE') THEN 'Nordeste'
  WHEN uf IN ('DF', 'GO', 'MT', 'MS') THEN 'Centro-Oeste'
  WHEN uf IN ('ES', 'MG', 'RJ', 'SP') THEN 'Sudeste'
  WHEN uf IN ('PR', 'RS', 'SC') THEN 'Sul'
  ELSE 'Não Classificado'
END
WHERE macrorregiao IS NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_geografia_macrorregiao ON dim_geografia(macrorregiao);
CREATE INDEX IF NOT EXISTS idx_geografia_pais ON dim_geografia(pais);

-- ============================================================================
-- HIERARQUIA DE MERCADO: Setor → Subsetor → Nicho → Mercado
-- ============================================================================

ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS
  setor VARCHAR(100);
ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS
  subsetor VARCHAR(100);
ALTER TABLE dim_mercado ADD COLUMN IF NOT EXISTS
  nicho VARCHAR(100);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_mercado_setor ON dim_mercado(setor);
CREATE INDEX IF NOT EXISTS idx_mercado_subsetor ON dim_mercado(subsetor);
CREATE INDEX IF NOT EXISTS idx_mercado_nicho ON dim_mercado(nicho);

-- Atualizar mercados existentes com hierarquia (exemplos)
-- Tecnologia
UPDATE dim_mercado SET 
  setor = 'Tecnologia',
  subsetor = 'Software',
  nicho = 'Gestão Empresarial'
WHERE (nome ILIKE '%ERP%' OR nome ILIKE '%Gestão%' OR nome ILIKE '%Software%')
  AND setor IS NULL;

-- Indústria
UPDATE dim_mercado SET 
  setor = 'Indústria',
  subsetor = 'Manufatura',
  nicho = 'Produção'
WHERE (nome ILIKE '%Indústria%' OR nome ILIKE '%Manufatura%' OR nome ILIKE '%Produção%')
  AND setor IS NULL;

-- Comércio
UPDATE dim_mercado SET 
  setor = 'Comércio',
  subsetor = 'Varejo',
  nicho = 'E-commerce'
WHERE (nome ILIKE '%Varejo%' OR nome ILIKE '%E-commerce%' OR nome ILIKE '%Loja%')
  AND setor IS NULL;

-- Serviços
UPDATE dim_mercado SET 
  setor = 'Serviços',
  subsetor = 'Consultoria',
  nicho = 'Consultoria Empresarial'
WHERE (nome ILIKE '%Consultoria%' OR nome ILIKE '%Serviços%')
  AND setor IS NULL;

-- Comentários
COMMENT ON COLUMN dim_geografia.pais IS 'País (sempre Brasil)';
COMMENT ON COLUMN dim_geografia.macrorregiao IS 'Macrorregião (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)';
COMMENT ON COLUMN dim_geografia.mesorregiao IS 'Mesorregião IBGE';
COMMENT ON COLUMN dim_geografia.microrregiao IS 'Microrregião IBGE';

COMMENT ON COLUMN dim_mercado.setor IS 'Setor econômico (Tecnologia, Indústria, Comércio, Serviços)';
COMMENT ON COLUMN dim_mercado.subsetor IS 'Subsetor dentro do setor';
COMMENT ON COLUMN dim_mercado.nicho IS 'Nicho específico de mercado';
