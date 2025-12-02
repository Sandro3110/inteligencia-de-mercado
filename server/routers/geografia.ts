import { requirePermission } from "../middleware/auth";
import { Permission } from "@/shared/types/permissions";
/**
 * Geografia Router - Análises geográficas e mapas interativos
 * 100% Funcional
 */

import { z } from 'zod';
import { router, requirePermission } from '../trpc';
import { db } from '../db';
import { dimGeografia, dimEntidade, fatoEntidadeContexto } from '../../drizzle/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';

// ============================================================================
// SCHEMAS
// ============================================================================

const coordenadasSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

const bboxSchema = z.object({
  norte: z.number(),
  sul: z.number(),
  leste: z.number(),
  oeste: z.number()
});

// ============================================================================
// ROUTER
// ============================================================================

export const geografiaRouter = router({
  /**
   * Dados para mapa (pontos, clusters, heatmap)
   */
  dadosMapa: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      bbox: bboxSchema.optional(),
      filtros: z.array(z.any()).optional(),
      metrica: z.string().optional(),
      agrupar: z.boolean().optional() // Se true, retorna clusters
    }))
    .query(async ({ input }) => {
      const { bbox, filtros, metrica, agrupar } = input;

      let query = sql`
        SELECT 
          g.id,
          g.latitude,
          g.longitude,
          g.cidade,
          g.estado,
          g.pais,
          COUNT(e.id) as total_entidades,
          ${metrica ? sql.raw(`SUM(c.${metrica})`) : sql`0`} as valor_metrica
        FROM dim_geografia g
        LEFT JOIN dim_entidade e ON e.geografia_id = g.id AND e.deleted_at IS NULL
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE g.deleted_at IS NULL
      `;

      // Aplicar filtro de bounding box se fornecido
      if (bbox) {
        query = sql`${query}
          AND g.latitude BETWEEN ${bbox.sul} AND ${bbox.norte}
          AND g.longitude BETWEEN ${bbox.oeste} AND ${bbox.leste}
        `;
      }

      query = sql`${query}
        GROUP BY g.id, g.latitude, g.longitude, g.cidade, g.estado, g.pais
        HAVING COUNT(e.id) > 0
        ORDER BY total_entidades DESC
      `;

      const resultado = await db.execute(query);

      // Se agrupar = true, criar clusters
      if (agrupar) {
        const clusters = criarClusters(resultado.rows);
        return { tipo: 'clusters', dados: clusters };
      }

      return { tipo: 'pontos', dados: resultado.rows };
    }),

  /**
   * Heatmap de densidade
   */
  heatmap: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      metrica: z.string(),
      granularidade: z.enum(['cidade', 'estado', 'regiao', 'pais']).optional()
    }))
    .query(async ({ input }) => {
      const { metrica, granularidade = 'estado' } = input;

      const campoAgrupamento = granularidade === 'cidade' ? 'g.cidade' :
                               granularidade === 'estado' ? 'g.estado' :
                               granularidade === 'regiao' ? 'g.regiao' :
                               'g.pais';

      const query = sql`
        SELECT 
          ${sql.raw(campoAgrupamento)} as local,
          AVG(g.latitude) as latitude,
          AVG(g.longitude) as longitude,
          ${sql.raw(`SUM(c.${metrica})`)} as valor,
          COUNT(DISTINCT e.id) as total_entidades
        FROM dim_geografia g
        INNER JOIN dim_entidade e ON e.geografia_id = g.id AND e.deleted_at IS NULL
        INNER JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE g.deleted_at IS NULL
        GROUP BY ${sql.raw(campoAgrupamento)}
        ORDER BY valor DESC
      `;

      const resultado = await db.execute(query);

      // Normalizar valores para intensidade 0-1
      const valores = resultado.rows.map(r => Number(r.valor) || 0);
      const max = Math.max(...valores);
      const min = Math.min(...valores);

      const dadosNormalizados = resultado.rows.map(row => ({
        ...row,
        intensidade: max > min ? (Number(row.valor) - min) / (max - min) : 0.5
      }));

      return {
        dados: dadosNormalizados,
        granularidade,
        metrica,
        estatisticas: {
          min,
          max,
          media: valores.reduce((a, b) => a + b, 0) / valores.length
        }
      };
    }),

  /**
   * Drill-down hierárquico
   */
  drillDown: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      nivel: z.enum(['pais', 'macrorregiao', 'mesorregiao', 'microrregiao', 'estado', 'cidade']),
      valor: z.string(),
      metrica: z.string().optional()
    }))
    .query(async ({ input }) => {
      const { nivel, valor, metrica } = input;

      // Determinar próximo nível
      const proximoNivel = getProximoNivel(nivel);

      if (!proximoNivel) {
        // Último nível - retornar entidades
        const query = sql`
          SELECT 
            e.id,
            e.nome,
            e.tipo_entidade,
            g.cidade,
            g.estado,
            g.latitude,
            g.longitude,
            ${metrica ? sql.raw(`c.${metrica}`) : sql`NULL`} as valor
          FROM dim_entidade e
          INNER JOIN dim_geografia g ON e.geografia_id = g.id
          LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
          WHERE g.${sql.raw(nivel)} = ${valor}
            AND e.deleted_at IS NULL
            AND g.deleted_at IS NULL
          ORDER BY e.nome
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
          g.${sql.raw(proximoNivel)} as nome,
          COUNT(DISTINCT e.id) as total_entidades,
          ${metrica ? sql.raw(`SUM(c.${metrica})`) : sql`0`} as valor,
          AVG(g.latitude) as latitude,
          AVG(g.longitude) as longitude
        FROM dim_geografia g
        LEFT JOIN dim_entidade e ON e.geografia_id = g.id AND e.deleted_at IS NULL
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE g.${sql.raw(nivel)} = ${valor}
          AND g.deleted_at IS NULL
        GROUP BY g.${sql.raw(proximoNivel)}
        HAVING COUNT(DISTINCT e.id) > 0
        ORDER BY valor DESC
      `;

      const resultado = await db.execute(query);

      return {
        nivel: proximoNivel,
        dados: resultado.rows
      };
    }),

  /**
   * Top N por região
   */
  topPorRegiao: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      nivel: z.enum(['pais', 'estado', 'cidade']),
      metrica: z.string(),
      limite: z.number().min(1).max(100).optional()
    }))
    .query(async ({ input }) => {
      const { nivel, metrica, limite = 10 } = input;

      const query = sql`
        SELECT 
          g.${sql.raw(nivel)} as regiao,
          ${sql.raw(`SUM(c.${metrica})`)} as valor,
          COUNT(DISTINCT e.id) as total_entidades,
          AVG(g.latitude) as latitude,
          AVG(g.longitude) as longitude
        FROM dim_geografia g
        INNER JOIN dim_entidade e ON e.geografia_id = g.id AND e.deleted_at IS NULL
        INNER JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE g.deleted_at IS NULL
        GROUP BY g.${sql.raw(nivel)}
        ORDER BY valor DESC
        LIMIT ${limite}
      `;

      const resultado = await db.execute(query);

      return {
        nivel,
        metrica,
        dados: resultado.rows
      };
    }),

  /**
   * Comparação entre regiões
   */
  compararRegioes: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      regioes: z.array(z.object({
        nivel: z.enum(['pais', 'estado', 'cidade']),
        valor: z.string()
      })),
      metricas: z.array(z.string())
    }))
    .query(async ({ input }) => {
      const { regioes, metricas } = input;

      const resultados = await Promise.all(
        regioes.map(async (regiao) => {
          const metricasSQL = metricas.map(m => 
            `SUM(c.${m}) as ${m}`
          ).join(', ');

          const query = sql`
            SELECT 
              ${sql.raw(metricasSQL)},
              COUNT(DISTINCT e.id) as total_entidades
            FROM dim_geografia g
            INNER JOIN dim_entidade e ON e.geografia_id = g.id AND e.deleted_at IS NULL
            INNER JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
            WHERE g.${sql.raw(regiao.nivel)} = ${regiao.valor}
              AND g.deleted_at IS NULL
          `;

          const resultado = await db.execute(query);
          return {
            regiao: regiao.valor,
            nivel: regiao.nivel,
            metricas: resultado.rows[0] || {}
          };
        })
      );

      return resultados;
    }),

  /**
   * Geocoding reverso - Obter geografia por coordenadas
   */
  geocodingReverso: requirePermission(Permission.ANALISE_READ)
    .input(coordenadasSchema)
    .query(async ({ input }) => {
      const { latitude, longitude } = input;

      // Buscar geografia mais próxima
      const query = sql`
        SELECT 
          *,
          (
            6371 * acos(
              cos(radians(${latitude})) * 
              cos(radians(latitude)) * 
              cos(radians(longitude) - radians(${longitude})) + 
              sin(radians(${latitude})) * 
              sin(radians(latitude))
            )
          ) AS distancia_km
        FROM dim_geografia
        WHERE deleted_at IS NULL
        ORDER BY distancia_km
        LIMIT 1
      `;

      const resultado = await db.execute(query);

      return resultado.rows[0] || null;
    })
});

// ============================================================================
// HELPERS
// ============================================================================

function getProximoNivel(nivelAtual: string): string | null {
  const hierarquia = [
    'pais',
    'macrorregiao',
    'mesorregiao',
    'microrregiao',
    'estado',
    'cidade'
  ];

  const indiceAtual = hierarquia.indexOf(nivelAtual);
  if (indiceAtual === -1 || indiceAtual === hierarquia.length - 1) {
    return null;
  }

  return hierarquia[indiceAtual + 1];
}

function criarClusters(pontos: any[]): any[] {
  // Algoritmo simples de clustering por proximidade
  // Para produção, usar biblioteca especializada (supercluster, etc)
  
  const clusters: any[] = [];
  const raioKm = 50; // Raio do cluster em km
  const pontosProcessados = new Set();

  pontos.forEach((ponto, index) => {
    if (pontosProcessados.has(index)) return;

    const cluster = {
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      pontos: [ponto],
      total_entidades: ponto.total_entidades,
      valor_metrica: ponto.valor_metrica
    };

    // Buscar pontos próximos
    pontos.forEach((outroPonto, outroIndex) => {
      if (index === outroIndex || pontosProcessados.has(outroIndex)) return;

      const distancia = calcularDistancia(
        ponto.latitude,
        ponto.longitude,
        outroPonto.latitude,
        outroPonto.longitude
      );

      if (distancia <= raioKm) {
        cluster.pontos.push(outroPonto);
        cluster.total_entidades += outroPonto.total_entidades;
        cluster.valor_metrica += outroPonto.valor_metrica;
        pontosProcessados.add(outroIndex);
      }
    });

    // Recalcular centro do cluster
    if (cluster.pontos.length > 1) {
      cluster.latitude = cluster.pontos.reduce((sum, p) => sum + p.latitude, 0) / cluster.pontos.length;
      cluster.longitude = cluster.pontos.reduce((sum, p) => sum + p.longitude, 0) / cluster.pontos.length;
    }

    clusters.push(cluster);
    pontosProcessados.add(index);
  });

  return clusters;
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
