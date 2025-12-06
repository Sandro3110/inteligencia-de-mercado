import { requirePermission } from "../middleware/auth";
import { Permission } from "@shared/types/permissions";
/**
 * Mercado Router - Análises de mercado e hierarquias
 * 100% Funcional
 */

import { z } from 'zod';
import { router, publicProcedure } from './index';
import { db } from '../db';
import { dim_mercado, dim_entidade, fato_entidade_contexto, fato_entidade_competidor } from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

// ============================================================================
// SCHEMAS
// ============================================================================

const hierarquiaSchema = z.object({
  nivel: z.enum(['setor', 'subsetor', 'nicho']),
  valor: z.string().optional()
});

// ============================================================================
// ROUTER
// ============================================================================

export const mercadoRouter = router({
  /**
   * Listar mercados com filtros
   */
  list: publicProcedure
    .input(z.object({
      busca: z.string().optional(),
      categoria: z.string().optional(),
      segmentacao: z.string().optional(),
      crescimento: z.enum(['positivo', 'estavel', 'negativo']).optional(),
      atratividade: z.enum(['alta', 'media', 'baixa']).optional(),
      saturacao: z.enum(['baixo', 'medio', 'alto']).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional()
    }))
    .query(async ({ input }) => {
      const { busca, categoria, segmentacao, crescimento, atratividade, saturacao, limit = 20, offset = 0 } = input;

      let whereConditions = [];
      let params: any[] = [];

      // Filtro de busca
      if (busca) {
        whereConditions.push(`(m.nome ILIKE $${params.length + 1} OR m.tendencias ILIKE $${params.length + 1} OR m.principais_players ILIKE $${params.length + 1})`);
        params.push(`%${busca}%`);
      }

      // Filtro de categoria
      if (categoria) {
        whereConditions.push(`m.categoria = $${params.length + 1}`);
        params.push(categoria);
      }

      // Filtro de segmentação
      if (segmentacao) {
        whereConditions.push(`m.segmentacao = $${params.length + 1}`);
        params.push(segmentacao);
      }

      // Filtro de crescimento
      if (crescimento) {
        if (crescimento === 'positivo') {
          whereConditions.push(`CAST(REGEXP_REPLACE(m.crescimento_anual, '[^0-9.-]', '', 'g') AS NUMERIC) > 5`);
        } else if (crescimento === 'estavel') {
          whereConditions.push(`CAST(REGEXP_REPLACE(m.crescimento_anual, '[^0-9.-]', '', 'g') AS NUMERIC) BETWEEN 0 AND 5`);
        } else if (crescimento === 'negativo') {
          whereConditions.push(`CAST(REGEXP_REPLACE(m.crescimento_anual, '[^0-9.-]', '', 'g') AS NUMERIC) < 0`);
        }
      }

      // Filtro de atratividade
      if (atratividade) {
        if (atratividade === 'alta') {
          whereConditions.push(`m.score_atratividade >= 80`);
        } else if (atratividade === 'media') {
          whereConditions.push(`m.score_atratividade BETWEEN 50 AND 79`);
        } else if (atratividade === 'baixa') {
          whereConditions.push(`m.score_atratividade < 50`);
        }
      }

      // Filtro de saturação
      if (saturacao) {
        whereConditions.push(`m.nivel_saturacao = $${params.length + 1}`);
        params.push(saturacao);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      params.push(limit, offset);

      const query = `
        SELECT 
          m.*,
          COUNT(*) OVER() as total_count
        FROM dim_mercado m
        ${whereClause}
        ORDER BY m.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `;

      const resultado = await db.execute(sql.raw(query, params));

      return {
        data: resultado.rows,
        total: resultado.rows[0]?.total_count || 0
      };
    }),

  /**
   * Buscar mercado por ID
   */
  getById: publicProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(async ({ input }) => {
      const mercado = await db.query.dim_mercado.findFirst({
        where: eq(dim_mercado.id, input.id)
      });

      if (!mercado) {
        throw new Error('Mercado não encontrado');
      }

      return mercado;
    }),
  /**
   * Hierarquia completa de mercados
   */
  hierarquia: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      tipo: z.enum(['arvore', 'sunburst', 'treemap']).optional(),
      metrica: z.string().optional()
    }))
    .query(async ({ input }) => {
      const { tipo = 'arvore', metrica } = input;

      // Buscar todos os mercados com suas métricas
      const query = sql`
        SELECT 
          m.id,
          m.nome,
          m.setor,
          m.subsetor,
          m.nicho,
          COUNT(DISTINCT e.id) as total_entidades,
          ${metrica ? sql.raw(`SUM(c.${metrica})`) : sql`0`} as valor
        FROM dim_mercado m
        LEFT JOIN dim_entidade e ON e.mercado_id = m.id AND e.deleted_at IS NULL
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE m.deleted_at IS NULL
        GROUP BY m.id, m.nome, m.setor, m.subsetor, m.nicho
        ORDER BY m.setor, m.subsetor, m.nicho
      `;

      const resultado = await db.execute(query);

      // Construir hierarquia baseada no tipo
      const hierarquia = construirHierarquia(resultado.rows, tipo);

      return {
        tipo,
        metrica,
        dados: hierarquia
      };
    }),

  /**
   * Drill-down por nível
   */
  drillDown: requirePermission(Permission.ANALISE_READ)
    .input(hierarquiaSchema)
    .query(async ({ input }) => {
      const { nivel, valor } = input;

      // Determinar próximo nível
      const proximoNivel = getProximoNivelMercado(nivel);

      if (!proximoNivel) {
        // Último nível - retornar entidades
        const query = sql`
          SELECT 
            e.id,
            e.nome,
            e.tipo_entidade,
            m.nome as mercado,
            c.receita_potencial_anual,
            c.score_fit
          FROM dim_entidade e
          INNER JOIN dim_mercado m ON e.mercado_id = m.id
          LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
          WHERE m.${sql.raw(nivel)} = ${valor}
            AND e.deleted_at IS NULL
            AND m.deleted_at IS NULL
          ORDER BY c.score_fit DESC
        `;

        const resultado = await db.execute(query);
        return {
          nivel: 'entidades',
          dados: resultado.rows
        };
      }

      // Próximo nível - agrupar
      const query = sql`
        SELECT 
          m.${sql.raw(proximoNivel)} as nome,
          COUNT(DISTINCT e.id) as total_entidades,
          SUM(c.receita_potencial_anual) as receita_total,
          AVG(c.score_fit) as score_medio
        FROM dim_mercado m
        LEFT JOIN dim_entidade e ON e.mercado_id = m.id AND e.deleted_at IS NULL
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE m.${sql.raw(nivel)} = ${valor}
          AND m.deleted_at IS NULL
        GROUP BY m.${sql.raw(proximoNivel)}
        HAVING COUNT(DISTINCT e.id) > 0
        ORDER BY receita_total DESC
      `;

      const resultado = await db.execute(query);

      return {
        nivel: proximoNivel,
        dados: resultado.rows
      };
    }),

  /**
   * Análise de concorrência por mercado
   */
  analiseConcorrencia: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      mercadoId: z.number(),
      incluirMetricas: z.boolean().optional()
    }))
    .query(async ({ input }) => {
      const { mercadoId, incluirMetricas = true } = input;

      // Buscar mercado
      const mercado = await db.query.dim_mercado.findFirst({
        where: eq(dim_mercado.id, mercadoId)
      });

      if (!mercado) {
        throw new Error('Mercado não encontrado');
      }

      // Buscar concorrentes
      const query = sql`
        SELECT 
          e.id,
          e.nome,
          e.tipo_entidade,
          c.receita_potencial_anual,
          c.score_fit,
          comp.share_of_voice,
          comp.vantagem_competitiva_score,
          comp.ameaca_nivel
        FROM dim_entidade e
        INNER JOIN dim_mercado m ON e.mercado_id = m.id
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        LEFT JOIN fato_entidade_competidor comp ON comp.competidor_id = e.id AND comp.deleted_at IS NULL
        WHERE m.id = ${mercadoId}
          AND e.tipo_entidade = 'concorrente'
          AND e.deleted_at IS NULL
        ORDER BY comp.share_of_voice DESC
      `;

      const concorrentes = await db.execute(query);

      // Calcular métricas do mercado
      let metricas = null;
      if (incluirMetricas) {
        const queryMetricas = sql`
          SELECT 
            COUNT(DISTINCT e.id) as total_players,
            SUM(c.receita_potencial_anual) as receita_total_mercado,
            AVG(c.score_fit) as score_medio,
            SUM(CASE WHEN e.tipo_entidade = 'cliente' THEN 1 ELSE 0 END) as total_clientes,
            SUM(CASE WHEN e.tipo_entidade = 'concorrente' THEN 1 ELSE 0 END) as total_concorrentes,
            SUM(CASE WHEN e.tipo_entidade = 'lead' THEN 1 ELSE 0 END) as total_leads
          FROM dim_entidade e
          LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
          WHERE e.mercado_id = ${mercadoId}
            AND e.deleted_at IS NULL
        `;

        const resultadoMetricas = await db.execute(queryMetricas);
        metricas = resultadoMetricas.rows[0];
      }

      return {
        mercado,
        concorrentes: concorrentes.rows,
        metricas
      };
    }),

  /**
   * Oportunidades por mercado
   */
  oportunidades: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      limite: z.number().min(1).max(100).optional(),
      filtroScore: z.number().min(0).max(100).optional()
    }))
    .query(async ({ input }) => {
      const { limite = 10, filtroScore = 70 } = input;

      const query = sql`
        SELECT 
          m.id,
          m.nome as mercado,
          m.setor,
          m.subsetor,
          COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'lead' THEN e.id END) as total_leads,
          SUM(CASE WHEN e.tipo_entidade = 'lead' THEN c.receita_potencial_anual ELSE 0 END) as receita_potencial,
          AVG(CASE WHEN e.tipo_entidade = 'lead' THEN c.score_fit END) as score_medio_leads,
          COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'concorrente' THEN e.id END) as total_concorrentes
        FROM dim_mercado m
        LEFT JOIN dim_entidade e ON e.mercado_id = m.id AND e.deleted_at IS NULL
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE m.deleted_at IS NULL
        GROUP BY m.id, m.nome, m.setor, m.subsetor
        HAVING AVG(CASE WHEN e.tipo_entidade = 'lead' THEN c.score_fit END) >= ${filtroScore}
          AND COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'lead' THEN e.id END) > 0
        ORDER BY receita_potencial DESC
        LIMIT ${limite}
      `;

      const resultado = await db.execute(query);

      return resultado.rows;
    }),

  /**
   * Comparação entre mercados
   */
  comparar: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      mercadoIds: z.array(z.number()),
      metricas: z.array(z.string()).optional()
    }))
    .query(async ({ input }) => {
      const { mercadoIds, metricas = ['receita_potencial_anual', 'score_fit'] } = input;

      const resultados = await Promise.all(
        mercadoIds.map(async (mercadoId) => {
          const mercado = await db.query.dim_mercado.findFirst({
            where: eq(dim_mercado.id, mercadoId)
          });

          const metricasSQL = metricas.map(m => 
            `AVG(c.${m}) as ${m}`
          ).join(', ');

          const query = sql`
            SELECT 
              ${sql.raw(metricasSQL)},
              COUNT(DISTINCT e.id) as total_entidades,
              COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'cliente' THEN e.id END) as total_clientes,
              COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'concorrente' THEN e.id END) as total_concorrentes,
              COUNT(DISTINCT CASE WHEN e.tipo_entidade = 'lead' THEN e.id END) as total_leads
            FROM dim_entidade e
            LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
            WHERE e.mercado_id = ${mercadoId}
              AND e.deleted_at IS NULL
          `;

          const resultado = await db.execute(query);

          return {
            mercado,
            metricas: resultado.rows[0] || {}
          };
        })
      );

      return resultados;
    }),

  /**
   * Tendências de mercado
   */
  tendencias: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      mercadoId: z.number().optional(),
      periodo: z.object({
        dataInicio: z.string().or(z.date()),
        dataFim: z.string().or(z.date())
      })
    }))
    .query(async ({ input }) => {
      const { mercadoId, periodo } = input;

      const query = sql`
        SELECT 
          t.mes,
          t.ano,
          m.nome as mercado,
          COUNT(DISTINCT e.id) as total_entidades,
          SUM(c.receita_potencial_anual) as receita_total,
          AVG(c.score_fit) as score_medio
        FROM dim_tempo t
        INNER JOIN fato_entidade_contexto c ON c.tempo_id = t.id AND c.deleted_at IS NULL
        INNER JOIN dim_entidade e ON c.entidade_id = e.id AND e.deleted_at IS NULL
        INNER JOIN dim_mercado m ON e.mercado_id = m.id
        WHERE t.data BETWEEN ${periodo.dataInicio} AND ${periodo.dataFim}
          ${mercadoId ? sql`AND m.id = ${mercadoId}` : sql``}
        GROUP BY t.mes, t.ano, m.nome
        ORDER BY t.ano, t.mes
      `;

      const resultado = await db.execute(query);

      return resultado.rows;
    })
});

// ============================================================================
// HELPERS
// ============================================================================

function getProximoNivelMercado(nivelAtual: string): string | null {
  const hierarquia = ['setor', 'subsetor', 'nicho'];
  const indiceAtual = hierarquia.indexOf(nivelAtual);
  
  if (indiceAtual === -1 || indiceAtual === hierarquia.length - 1) {
    return null;
  }

  return hierarquia[indiceAtual + 1];
}

function construirHierarquia(dados: any[], tipo: string): any {
  if (tipo === 'arvore') {
    return construirArvore(dados);
  } else if (tipo === 'sunburst' || tipo === 'treemap') {
    return construirSunburst(dados);
  }

  return dados;
}

function construirArvore(dados: any[]): any {
  const arvore: any = {
    nome: 'Mercados',
    children: []
  };

  const setores = new Map();

  dados.forEach(item => {
    // Setor
    if (!setores.has(item.setor)) {
      setores.set(item.setor, {
        nome: item.setor,
        children: [],
        total_entidades: 0,
        valor: 0
      });
    }

    const setor = setores.get(item.setor);
    setor.total_entidades += item.total_entidades;
    setor.valor += item.valor;

    // Subsetor
    let subsetor = setor.children.find((s: any) => s.nome === item.subsetor);
    if (!subsetor) {
      subsetor = {
        nome: item.subsetor,
        children: [],
        total_entidades: 0,
        valor: 0
      };
      setor.children.push(subsetor);
    }

    subsetor.total_entidades += item.total_entidades;
    subsetor.valor += item.valor;

    // Nicho
    subsetor.children.push({
      nome: item.nicho,
      mercado_id: item.id,
      total_entidades: item.total_entidades,
      valor: item.valor
    });
  });

  arvore.children = Array.from(setores.values());

  return arvore;
}

function construirSunburst(dados: any[]): any {
  // Formato para D3.js sunburst/treemap
  return construirArvore(dados);
}
