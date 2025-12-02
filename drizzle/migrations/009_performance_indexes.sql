-- Migration 009: Índices de performance
-- Data: 02/12/2024

-- Índices compostos para queries frequentes

-- 1. Entidades por tipo e mercado
CREATE INDEX IF NOT EXISTS idx_entidade_tipo_mercado 
ON dim_entidade(tipo_entidade, mercado_id) 
WHERE deleted_at IS NULL;

-- 2. Entidades por tipo e geografia
CREATE INDEX IF NOT EXISTS idx_entidade_tipo_geografia 
ON dim_entidade(tipo_entidade, geografia_id) 
WHERE deleted_at IS NULL;

-- 3. Contexto por score (ordenação DESC)
CREATE INDEX IF NOT EXISTS idx_contexto_score_fit 
ON fato_entidade_contexto(score_fit DESC) 
WHERE deleted_at IS NULL;

-- 4. Contexto por segmento ABC
CREATE INDEX IF NOT EXISTS idx_contexto_segmento 
ON fato_entidade_contexto(segmento_abc) 
WHERE deleted_at IS NULL;

-- 5. Tempo por data
CREATE INDEX IF NOT EXISTS idx_tempo_data 
ON dim_tempo(data);

-- 6. Tempo por mês e ano
CREATE INDEX IF NOT EXISTS idx_tempo_mes_ano 
ON dim_tempo(ano, mes);

-- 7. Geografia por estado
CREATE INDEX IF NOT EXISTS idx_geografia_estado 
ON dim_geografia(estado) 
WHERE deleted_at IS NULL;

-- 8. Mercado por setor
CREATE INDEX IF NOT EXISTS idx_mercado_setor 
ON dim_mercado(setor) 
WHERE deleted_at IS NULL;

-- 9. Contexto por probabilidade de conversão
CREATE INDEX IF NOT EXISTS idx_contexto_prob_conversao 
ON fato_entidade_contexto(probabilidade_conversao DESC) 
WHERE deleted_at IS NULL;

-- 10. Geografia por região
CREATE INDEX IF NOT EXISTS idx_geografia_regiao 
ON dim_geografia(regiao) 
WHERE deleted_at IS NULL;
