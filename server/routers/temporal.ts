import { requirePermission } from "../middleware/auth";
import { Permission } from "@shared/types/permissions";
/**
 * Temporal Router - Análises temporais e tendências
 * 100% Funcional
 */

import { z } from 'zod';
import { router, publicProcedure } from './index';
import { db } from '../db';
import { dimTempo, fatoEntidadeContexto } from '../../drizzle/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { Filtro } from '../../shared/types/dimensional';

// ============================================================================
// SCHEMAS
// ============================================================================

const periodoSchema = z.object({
  dataInicio: z.string().or(z.date()),
  dataFim: z.string().or(z.date()),
  granularidade: z.enum(['dia', 'semana', 'mes', 'trimestre', 'ano']).optional()
});

const evolucaoSchema = z.object({
  metrica: z.string(),
  periodo: periodoSchema,
  filtros: z.array(z.any()).optional(),
  compararCom: periodoSchema.optional()
});

// ============================================================================
// ROUTER
// ============================================================================

export const temporalRouter = router({
  /**
   * Evolução de métrica ao longo do tempo
   */
  evolucao: requirePermission(Permission.ANALISE_READ)
    .input(evolucaoSchema)
    .query(async ({ input }) => {
      const { metrica, periodo, filtros, compararCom } = input;
      const granularidade = periodo.granularidade || 'mes';

      // Construir query de evolução
      const query = sql`
        SELECT 
          t.${sql.raw(granularidade)} as periodo,
          ${sql.raw(getAgregacao(metrica))} as valor
        FROM fato_entidade_contexto c
        INNER JOIN dim_tempo t ON c.tempo_id = t.id
        WHERE t.data BETWEEN ${periodo.dataInicio} AND ${periodo.dataFim}
          AND c.deleted_at IS NULL
        GROUP BY t.${sql.raw(granularidade)}
        ORDER BY t.${sql.raw(granularidade)}
      `;

      const resultado = await db.execute(query);

      // Se tiver comparação, buscar dados do período anterior
      let comparacao = null;
      if (compararCom) {
        const queryComparacao = sql`
          SELECT 
            t.${sql.raw(granularidade)} as periodo,
            ${sql.raw(getAgregacao(metrica))} as valor
          FROM fato_entidade_contexto c
          INNER JOIN dim_tempo t ON c.tempo_id = t.id
          WHERE t.data BETWEEN ${compararCom.dataInicio} AND ${compararCom.dataFim}
            AND c.deleted_at IS NULL
          GROUP BY t.${sql.raw(granularidade)}
          ORDER BY t.${sql.raw(granularidade)}
        `;

        const resultadoComparacao = await db.execute(queryComparacao);
        comparacao = resultadoComparacao.rows;
      }

      return {
        dados: resultado.rows,
        comparacao,
        periodo,
        granularidade
      };
    }),

  /**
   * Sazonalidade - Padrões por mês/dia da semana
   */
  sazonalidade: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      metrica: z.string(),
      tipo: z.enum(['mensal', 'semanal', 'diaria']),
      anos: z.array(z.number()).optional()
    }))
    .query(async ({ input }) => {
      const { metrica, tipo, anos } = input;

      let campoAgrupamento = 'mes';
      if (tipo === 'semanal') campoAgrupamento = 'dia_semana';
      if (tipo === 'diaria') campoAgrupamento = 'dia';

      const query = sql`
        SELECT 
          t.${sql.raw(campoAgrupamento)} as periodo,
          ${sql.raw(getAgregacao(metrica))} as valor,
          COUNT(*) as ocorrencias
        FROM fato_entidade_contexto c
        INNER JOIN dim_tempo t ON c.tempo_id = t.id
        WHERE c.deleted_at IS NULL
          ${anos && anos.length > 0 ? sql`AND t.ano IN (${sql.join(anos, sql`, `)})` : sql``}
        GROUP BY t.${sql.raw(campoAgrupamento)}
        ORDER BY t.${sql.raw(campoAgrupamento)}
      `;

      const resultado = await db.execute(query);

      return {
        dados: resultado.rows,
        tipo,
        anos
      };
    }),

  /**
   * Tendência - Análise de crescimento
   */
  tendencia: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      metrica: z.string(),
      periodo: periodoSchema,
      previsao: z.number().optional() // Meses para prever
    }))
    .query(async ({ input }) => {
      const { metrica, periodo, previsao } = input;

      // Buscar dados históricos
      const query = sql`
        SELECT 
          t.data,
          t.mes,
          t.ano,
          ${sql.raw(getAgregacao(metrica))} as valor
        FROM fato_entidade_contexto c
        INNER JOIN dim_tempo t ON c.tempo_id = t.id
        WHERE t.data BETWEEN ${periodo.dataInicio} AND ${periodo.dataFim}
          AND c.deleted_at IS NULL
        GROUP BY t.data, t.mes, t.ano
        ORDER BY t.data
      `;

      const resultado = await db.execute(query);
      const dados = resultado.rows;

      // Calcular tendência (regressão linear simples)
      const tendencia = calcularTendencia(dados);

      // Calcular previsão se solicitado
      let dadosPrevistos = null;
      if (previsao && previsao > 0) {
        dadosPrevistos = gerarPrevisao(dados, tendencia, previsao);
      }

      return {
        dados,
        tendencia,
        previsao: dadosPrevistos
      };
    }),

  /**
   * Comparação de períodos
   */
  comparacao: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      metrica: z.string(),
      periodos: z.array(z.object({
        nome: z.string(),
        dataInicio: z.string().or(z.date()),
        dataFim: z.string().or(z.date())
      }))
    }))
    .query(async ({ input }) => {
      const { metrica, periodos } = input;

      const resultados = await Promise.all(
        periodos.map(async (periodo) => {
          const query = sql`
            SELECT 
              ${sql.raw(getAgregacao(metrica))} as valor,
              COUNT(*) as registros
            FROM fato_entidade_contexto c
            INNER JOIN dim_tempo t ON c.tempo_id = t.id
            WHERE t.data BETWEEN ${periodo.dataInicio} AND ${periodo.dataFim}
              AND c.deleted_at IS NULL
          `;

          const resultado = await db.execute(query);
          return {
            nome: periodo.nome,
            periodo,
            valor: resultado.rows[0]?.valor || 0,
            registros: resultado.rows[0]?.registros || 0
          };
        })
      );

      return resultados;
    }),

  /**
   * Calendário de calor (heatmap)
   */
  calendarioCalor: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      metrica: z.string(),
      ano: z.number(),
      mes: z.number().optional()
    }))
    .query(async ({ input }) => {
      const { metrica, ano, mes } = input;

      const query = sql`
        SELECT 
          t.data,
          t.dia,
          t.mes,
          t.dia_semana,
          ${sql.raw(getAgregacao(metrica))} as valor
        FROM fato_entidade_contexto c
        INNER JOIN dim_tempo t ON c.tempo_id = t.id
        WHERE t.ano = ${ano}
          ${mes ? sql`AND t.mes = ${mes}` : sql``}
          AND c.deleted_at IS NULL
        GROUP BY t.data, t.dia, t.mes, t.dia_semana
        ORDER BY t.data
      `;

      const resultado = await db.execute(query);

      return {
        dados: resultado.rows,
        ano,
        mes
      };
    })
});

// ============================================================================
// HELPERS
// ============================================================================

function getAgregacao(metrica: string): string {
  const agregacoes: Record<string, string> = {
    'receita_potencial': 'SUM(c.receita_potencial_anual)',
    'score_fit': 'AVG(c.score_fit)',
    'probabilidade_conversao': 'AVG(c.probabilidade_conversao)',
    'ltv': 'AVG(c.ltv_estimado)',
    'cac': 'AVG(c.cac_estimado)',
    'ticket_medio': 'AVG(c.ticket_medio_estimado)',
    'count': 'COUNT(*)'
  };

  return agregacoes[metrica] || `AVG(c.${metrica})`;
}

function calcularTendencia(dados: any[]): {
  inclinacao: number;
  intercepto: number;
  r2: number;
  direcao: 'crescente' | 'decrescente' | 'estavel';
} {
  if (dados.length < 2) {
    return {
      inclinacao: 0,
      intercepto: 0,
      r2: 0,
      direcao: 'estavel'
    };
  }

  // Regressão linear simples
  const n = dados.length;
  let somaX = 0;
  let somaY = 0;
  let somaXY = 0;
  let somaX2 = 0;

  dados.forEach((ponto, index) => {
    const x = index;
    const y = Number(ponto.valor) || 0;
    somaX += x;
    somaY += y;
    somaXY += x * y;
    somaX2 += x * x;
  });

  const inclinacao = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
  const intercepto = (somaY - inclinacao * somaX) / n;

  // Calcular R²
  const mediaY = somaY / n;
  let ssTotal = 0;
  let ssResidual = 0;

  dados.forEach((ponto, index) => {
    const y = Number(ponto.valor) || 0;
    const yPrevisto = inclinacao * index + intercepto;
    ssTotal += Math.pow(y - mediaY, 2);
    ssResidual += Math.pow(y - yPrevisto, 2);
  });

  const r2 = 1 - (ssResidual / ssTotal);

  let direcao: 'crescente' | 'decrescente' | 'estavel' = 'estavel';
  if (Math.abs(inclinacao) > 0.01) {
    direcao = inclinacao > 0 ? 'crescente' : 'decrescente';
  }

  return {
    inclinacao,
    intercepto,
    r2,
    direcao
  };
}

function gerarPrevisao(
  dados: any[],
  tendencia: { inclinacao: number; intercepto: number },
  meses: number
): any[] {
  const previsao = [];
  const ultimaData = new Date(dados[dados.length - 1].data);

  for (let i = 1; i <= meses; i++) {
    const data = new Date(ultimaData);
    data.setMonth(data.getMonth() + i);

    const x = dados.length + i - 1;
    const valor = tendencia.inclinacao * x + tendencia.intercepto;

    previsao.push({
      data: data.toISOString().split('T')[0],
      valor: Math.max(0, valor), // Não permitir valores negativos
      tipo: 'previsao'
    });
  }

  return previsao;
}
