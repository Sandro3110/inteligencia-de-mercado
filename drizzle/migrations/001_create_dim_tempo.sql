-- Migration 001: Criar dim_tempo
-- Data: 2025-12-02
-- Descrição: Criar dimensão temporal completa (2020-2030)

CREATE TABLE IF NOT EXISTS dim_tempo (
  id SERIAL PRIMARY KEY,
  data DATE UNIQUE NOT NULL,
  ano INTEGER NOT NULL,
  trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 53),
  dia_mes INTEGER NOT NULL CHECK (dia_mes BETWEEN 1 AND 31),
  dia_ano INTEGER NOT NULL CHECK (dia_ano BETWEEN 1 AND 366),
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo
  nome_mes VARCHAR(20) NOT NULL,
  nome_mes_curto VARCHAR(3) NOT NULL,
  nome_dia_semana VARCHAR(20) NOT NULL,
  nome_dia_semana_curto VARCHAR(3) NOT NULL,
  eh_feriado BOOLEAN DEFAULT FALSE,
  eh_fim_semana BOOLEAN DEFAULT FALSE,
  eh_dia_util BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tempo_data ON dim_tempo(data);
CREATE INDEX IF NOT EXISTS idx_tempo_ano_mes ON dim_tempo(ano, mes);
CREATE INDEX IF NOT EXISTS idx_tempo_ano_trimestre ON dim_tempo(ano, trimestre);

-- Popular dim_tempo (2020-2030)
INSERT INTO dim_tempo (data, ano, trimestre, mes, semana, dia_mes, dia_ano, dia_semana, nome_mes, nome_mes_curto, nome_dia_semana, nome_dia_semana_curto, eh_fim_semana, eh_dia_util)
SELECT 
  d::date AS data,
  EXTRACT(YEAR FROM d)::INTEGER AS ano,
  EXTRACT(QUARTER FROM d)::INTEGER AS trimestre,
  EXTRACT(MONTH FROM d)::INTEGER AS mes,
  EXTRACT(WEEK FROM d)::INTEGER AS semana,
  EXTRACT(DAY FROM d)::INTEGER AS dia_mes,
  EXTRACT(DOY FROM d)::INTEGER AS dia_ano,
  EXTRACT(DOW FROM d)::INTEGER AS dia_semana,
  CASE EXTRACT(MONTH FROM d)
    WHEN 1 THEN 'Janeiro' WHEN 2 THEN 'Fevereiro' WHEN 3 THEN 'Março'
    WHEN 4 THEN 'Abril' WHEN 5 THEN 'Maio' WHEN 6 THEN 'Junho'
    WHEN 7 THEN 'Julho' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Setembro'
    WHEN 10 THEN 'Outubro' WHEN 11 THEN 'Novembro' WHEN 12 THEN 'Dezembro'
  END AS nome_mes,
  CASE EXTRACT(MONTH FROM d)
    WHEN 1 THEN 'Jan' WHEN 2 THEN 'Fev' WHEN 3 THEN 'Mar'
    WHEN 4 THEN 'Abr' WHEN 5 THEN 'Mai' WHEN 6 THEN 'Jun'
    WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago' WHEN 9 THEN 'Set'
    WHEN 10 THEN 'Out' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dez'
  END AS nome_mes_curto,
  CASE EXTRACT(DOW FROM d)
    WHEN 0 THEN 'Domingo' WHEN 1 THEN 'Segunda-feira' WHEN 2 THEN 'Terça-feira'
    WHEN 3 THEN 'Quarta-feira' WHEN 4 THEN 'Quinta-feira' WHEN 5 THEN 'Sexta-feira'
    WHEN 6 THEN 'Sábado'
  END AS nome_dia_semana,
  CASE EXTRACT(DOW FROM d)
    WHEN 0 THEN 'Dom' WHEN 1 THEN 'Seg' WHEN 2 THEN 'Ter'
    WHEN 3 THEN 'Qua' WHEN 4 THEN 'Qui' WHEN 5 THEN 'Sex'
    WHEN 6 THEN 'Sáb'
  END AS nome_dia_semana_curto,
  EXTRACT(DOW FROM d) IN (0, 6) AS eh_fim_semana,
  EXTRACT(DOW FROM d) NOT IN (0, 6) AS eh_dia_util
FROM generate_series('2020-01-01'::date, '2030-12-31'::date, '1 day'::interval) d
ON CONFLICT (data) DO NOTHING;

-- Marcar feriados nacionais brasileiros
UPDATE dim_tempo SET eh_feriado = TRUE, eh_dia_util = FALSE 
WHERE (mes = 1 AND dia_mes = 1) -- Ano Novo
   OR (mes = 4 AND dia_mes = 21) -- Tiradentes
   OR (mes = 5 AND dia_mes = 1) -- Dia do Trabalho
   OR (mes = 9 AND dia_mes = 7) -- Independência
   OR (mes = 10 AND dia_mes = 12) -- Nossa Senhora Aparecida
   OR (mes = 11 AND dia_mes = 2) -- Finados
   OR (mes = 11 AND dia_mes = 15) -- Proclamação da República
   OR (mes = 12 AND dia_mes = 25); -- Natal
