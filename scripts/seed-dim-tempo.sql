-- ============================================================================
-- POPULAR dim_tempo com calendário 2024-2026
-- ============================================================================
-- Execute este SQL diretamente no Supabase SQL Editor
-- https://supabase.com/dashboard/project/ecnzlynmuerbmqingyfl/editor
-- ============================================================================

-- Função auxiliar para gerar datas
CREATE OR REPLACE FUNCTION popular_dim_tempo()
RETURNS void AS $$
DECLARE
  data_atual DATE;
  data_fim DATE;
  ano_val INT;
  mes_val INT;
  dia_val INT;
  dia_semana_val INT;
  trimestre_val INT;
  semana_val INT;
  dia_ano_val INT;
  eh_feriado_val BOOLEAN;
  eh_fim_semana_val BOOLEAN;
  eh_dia_util_val BOOLEAN;
  nome_mes_val VARCHAR(20);
  nome_mes_curto_val VARCHAR(3);
  nome_dia_semana_val VARCHAR(20);
  nome_dia_semana_curto_val VARCHAR(3);
BEGIN
  data_atual := '2024-01-01'::DATE;
  data_fim := '2026-12-31'::DATE;

  WHILE data_atual <= data_fim LOOP
    ano_val := EXTRACT(YEAR FROM data_atual);
    mes_val := EXTRACT(MONTH FROM data_atual);
    dia_val := EXTRACT(DAY FROM data_atual);
    dia_semana_val := EXTRACT(DOW FROM data_atual); -- 0=Domingo, 6=Sábado
    trimestre_val := EXTRACT(QUARTER FROM data_atual);
    semana_val := EXTRACT(WEEK FROM data_atual);
    dia_ano_val := EXTRACT(DOY FROM data_atual);

    -- Nome do mês
    nome_mes_val := CASE mes_val
      WHEN 1 THEN 'Janeiro'
      WHEN 2 THEN 'Fevereiro'
      WHEN 3 THEN 'Março'
      WHEN 4 THEN 'Abril'
      WHEN 5 THEN 'Maio'
      WHEN 6 THEN 'Junho'
      WHEN 7 THEN 'Julho'
      WHEN 8 THEN 'Agosto'
      WHEN 9 THEN 'Setembro'
      WHEN 10 THEN 'Outubro'
      WHEN 11 THEN 'Novembro'
      WHEN 12 THEN 'Dezembro'
    END;

    nome_mes_curto_val := CASE mes_val
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Fev'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Abr'
      WHEN 5 THEN 'Mai'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Ago'
      WHEN 9 THEN 'Set'
      WHEN 10 THEN 'Out'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dez'
    END;

    -- Nome do dia da semana
    nome_dia_semana_val := CASE dia_semana_val
      WHEN 0 THEN 'Domingo'
      WHEN 1 THEN 'Segunda-feira'
      WHEN 2 THEN 'Terça-feira'
      WHEN 3 THEN 'Quarta-feira'
      WHEN 4 THEN 'Quinta-feira'
      WHEN 5 THEN 'Sexta-feira'
      WHEN 6 THEN 'Sábado'
    END;

    nome_dia_semana_curto_val := CASE dia_semana_val
      WHEN 0 THEN 'Dom'
      WHEN 1 THEN 'Seg'
      WHEN 2 THEN 'Ter'
      WHEN 3 THEN 'Qua'
      WHEN 4 THEN 'Qui'
      WHEN 5 THEN 'Sex'
      WHEN 6 THEN 'Sáb'
    END;

    -- Feriados nacionais fixos
    eh_feriado_val := (
      (mes_val = 1 AND dia_val = 1) OR   -- Ano Novo
      (mes_val = 4 AND dia_val = 21) OR  -- Tiradentes
      (mes_val = 5 AND dia_val = 1) OR   -- Dia do Trabalho
      (mes_val = 9 AND dia_val = 7) OR   -- Independência
      (mes_val = 10 AND dia_val = 12) OR -- Nossa Senhora Aparecida
      (mes_val = 11 AND dia_val = 2) OR  -- Finados
      (mes_val = 11 AND dia_val = 15) OR -- Proclamação da República
      (mes_val = 12 AND dia_val = 25)    -- Natal
    );

    -- Fim de semana
    eh_fim_semana_val := (dia_semana_val = 0 OR dia_semana_val = 6);

    -- Dia útil
    eh_dia_util_val := NOT eh_fim_semana_val AND NOT eh_feriado_val;

    -- Inserir registro
    INSERT INTO dim_tempo (
      data, ano, trimestre, mes, semana, dia_mes, dia_ano, dia_semana,
      nome_mes, nome_mes_curto, nome_dia_semana, nome_dia_semana_curto,
      eh_feriado, eh_fim_semana, eh_dia_util
    ) VALUES (
      data_atual, ano_val, trimestre_val, mes_val, semana_val, dia_val, dia_ano_val, dia_semana_val,
      nome_mes_val, nome_mes_curto_val, nome_dia_semana_val, nome_dia_semana_curto_val,
      eh_feriado_val, eh_fim_semana_val, eh_dia_util_val
    )
    ON CONFLICT (data) DO NOTHING;

    data_atual := data_atual + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar função
SELECT popular_dim_tempo();

-- Remover função (limpeza)
DROP FUNCTION popular_dim_tempo();

-- Verificar resultado
SELECT 
  COUNT(*) as total_dias,
  COUNT(*) FILTER (WHERE eh_dia_util = true) as dias_uteis,
  COUNT(*) FILTER (WHERE eh_feriado = true) as feriados,
  COUNT(*) FILTER (WHERE eh_fim_semana = true) as fins_semana
FROM dim_tempo;

-- Mostrar primeiros registros
SELECT * FROM dim_tempo ORDER BY data LIMIT 10;
