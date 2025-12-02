import { requirePermission } from "../middleware/auth";
import { Permission } from "@shared/types/permissions";
/**
 * Entidade Router - Detalhes 360° de entidades
 * 100% Funcional
 */

import { z } from 'zod';
import { router } from './index';
import { db } from '../db';
import {
  dimEntidade,
  dimGeografia,
  dimMercado,
  dimProduto,
  fatoEntidadeContexto,
  fatoEntidadeProduto,
  fatoEntidadeCompetidor
} from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

// ============================================================================
// ROUTER
// ============================================================================

export const entidadeRouter = router({
  /**
   * Detalhes completos 360° de uma entidade
   */
  detalhes360: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      entidadeId: z.number()
    }))
    .query(async ({ input }) => {
      const { entidadeId } = input;

      // Buscar entidade com relacionamentos
      const entidade = await db.query.dimEntidade.findFirst({
        where: eq(dimEntidade.id, entidadeId),
        with: {
          geografia: true,
          mercado: true
        }
      });

      if (!entidade) {
        throw new Error('Entidade não encontrada');
      }

      // Buscar contexto
      const contexto = await db.query.fatoEntidadeContexto.findFirst({
        where: eq(fatoEntidadeContexto.entidadeId, entidadeId)
      });

      // Buscar produtos
      const produtos = await db.query.fatoEntidadeProduto.findMany({
        where: eq(fatoEntidadeProduto.entidadeId, entidadeId),
        with: {
          produto: true
        }
      });

      // Buscar concorrentes (se for cliente)
      let concorrentes = null;
      if (entidade.tipoEntidade === 'cliente') {
        const queryConcorrentes = sql`
          SELECT 
            e.id,
            e.nome,
            comp.*
          FROM fato_entidade_competidor comp
          INNER JOIN dim_entidade e ON comp.competidor_id = e.id
          WHERE comp.cliente_id = ${entidadeId}
            AND comp.deleted_at IS NULL
            AND e.deleted_at IS NULL
          ORDER BY comp.share_of_voice DESC
        `;

        const resultadoConcorrentes = await db.execute(queryConcorrentes);
        concorrentes = resultadoConcorrentes.rows;
      }

      // Buscar leads (se for cliente)
      let leads = null;
      if (entidade.tipoEntidade === 'cliente') {
        const queryLeads = sql`
          SELECT 
            e.id,
            e.nome,
            c.receita_potencial_anual,
            c.score_fit,
            c.probabilidade_conversao,
            c.segmento_abc
          FROM dim_entidade e
          INNER JOIN fato_entidade_contexto c ON c.entidade_id = e.id
          WHERE e.tipo_entidade = 'lead'
            AND e.mercado_id = ${entidade.mercadoId}
            AND e.deleted_at IS NULL
            AND c.deleted_at IS NULL
          ORDER BY c.score_fit DESC
          LIMIT 10
        `;

        const resultadoLeads = await db.execute(queryLeads);
        leads = resultadoLeads.rows;
      }

      // Buscar histórico temporal
      const queryHistorico = sql`
        SELECT 
          t.data,
          t.mes,
          t.ano,
          c.receita_potencial_anual,
          c.score_fit,
          c.probabilidade_conversao
        FROM fato_entidade_contexto c
        INNER JOIN dim_tempo t ON c.tempo_id = t.id
        WHERE c.entidade_id = ${entidadeId}
          AND c.deleted_at IS NULL
        ORDER BY t.data DESC
        LIMIT 12
      `;

      const resultadoHistorico = await db.execute(queryHistorico);
      const historico = resultadoHistorico.rows;

      return {
        entidade,
        contexto,
        produtos,
        concorrentes,
        leads,
        historico
      };
    }),

  /**
   * Listar entidades com filtros e paginação
   */
  listar: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      tipo: z.enum(['cliente', 'concorrente', 'lead']).optional(),
      mercadoId: z.number().optional(),
      geografiaId: z.number().optional(),
      filtros: z.array(z.any()).optional(),
      ordenacao: z.object({
        campo: z.string(),
        direcao: z.enum(['ASC', 'DESC'])
      }).optional(),
      pagina: z.number().min(1).optional(),
      porPagina: z.number().min(1).max(100).optional()
    }))
    .query(async ({ input }) => {
      const {
        tipo,
        mercadoId,
        geografiaId,
        ordenacao,
        pagina = 1,
        porPagina = 25
      } = input;

      const offset = (pagina - 1) * porPagina;

      let query = sql`
        SELECT 
          e.*,
          g.cidade,
          g.estado,
          g.pais,
          m.nome as mercado_nome,
          c.receita_potencial_anual,
          c.score_fit,
          c.probabilidade_conversao,
          c.segmento_abc
        FROM dim_entidade e
        LEFT JOIN dim_geografia g ON e.geografia_id = g.id
        LEFT JOIN dim_mercado m ON e.mercado_id = m.id
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE e.deleted_at IS NULL
      `;

      if (tipo) {
        query = sql`${query} AND e.tipo_entidade = ${tipo}`;
      }

      if (mercadoId) {
        query = sql`${query} AND e.mercado_id = ${mercadoId}`;
      }

      if (geografiaId) {
        query = sql`${query} AND e.geografia_id = ${geografiaId}`;
      }

      if (ordenacao) {
        const campo = ordenacao.campo.includes('.') 
          ? ordenacao.campo 
          : `e.${ordenacao.campo}`;
        query = sql`${query} ORDER BY ${sql.raw(campo)} ${sql.raw(ordenacao.direcao)}`;
      } else {
        query = sql`${query} ORDER BY c.score_fit DESC`;
      }

      query = sql`${query} LIMIT ${porPagina} OFFSET ${offset}`;

      const resultado = await db.execute(query);

      // Contar total
      let queryCount = sql`
        SELECT COUNT(*) as total
        FROM dim_entidade e
        WHERE e.deleted_at IS NULL
      `;

      if (tipo) {
        queryCount = sql`${queryCount} AND e.tipo_entidade = ${tipo}`;
      }

      if (mercadoId) {
        queryCount = sql`${queryCount} AND e.mercado_id = ${mercadoId}`;
      }

      if (geografiaId) {
        queryCount = sql`${queryCount} AND e.geografia_id = ${geografiaId}`;
      }

      const resultadoCount = await db.execute(queryCount);
      const total = Number(resultadoCount.rows[0]?.total || 0);

      return {
        dados: resultado.rows,
        paginacao: {
          pagina,
          porPagina,
          total,
          totalPaginas: Math.ceil(total / porPagina)
        }
      };
    }),

  /**
   * Buscar entidades similares
   */
  similares: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      entidadeId: z.number(),
      limite: z.number().min(1).max(50).optional()
    }))
    .query(async ({ input }) => {
      const { entidadeId, limite = 10 } = input;

      // Buscar entidade de referência
      const entidade = await db.query.dimEntidade.findFirst({
        where: eq(dimEntidade.id, entidadeId)
      });

      if (!entidade) {
        throw new Error('Entidade não encontrada');
      }

      // Buscar similares (mesmo mercado, tipo diferente)
      const query = sql`
        SELECT 
          e.*,
          g.cidade,
          g.estado,
          m.nome as mercado_nome,
          c.receita_potencial_anual,
          c.score_fit,
          c.probabilidade_conversao,
          (
            CASE 
              WHEN e.mercado_id = ${entidade.mercadoId} THEN 50
              ELSE 0
            END +
            CASE 
              WHEN e.geografia_id = ${entidade.geografiaId} THEN 30
              ELSE 0
            END +
            CASE 
              WHEN ABS(c.receita_potencial_anual - (
                SELECT receita_potencial_anual 
                FROM fato_entidade_contexto 
                WHERE entidade_id = ${entidadeId}
              )) < 1000000 THEN 20
              ELSE 0
            END
          ) as score_similaridade
        FROM dim_entidade e
        LEFT JOIN dim_geografia g ON e.geografia_id = g.id
        LEFT JOIN dim_mercado m ON e.mercado_id = m.id
        LEFT JOIN fato_entidade_contexto c ON c.entidade_id = e.id AND c.deleted_at IS NULL
        WHERE e.id != ${entidadeId}
          AND e.deleted_at IS NULL
        ORDER BY score_similaridade DESC, c.score_fit DESC
        LIMIT ${limite}
      `;

      const resultado = await db.execute(query);

      return resultado.rows;
    }),

  /**
   * Recomendações acionáveis
   */
  recomendacoes: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      entidadeId: z.number()
    }))
    .query(async ({ input }) => {
      const { entidadeId } = input;

      // Buscar contexto
      const contexto = await db.query.fatoEntidadeContexto.findFirst({
        where: eq(fatoEntidadeContexto.entidadeId, entidadeId)
      });

      if (!contexto) {
        return [];
      }

      const recomendacoes: any[] = [];

      // Recomendação 1: Score baixo
      if (contexto.scoreFit && contexto.scoreFit < 50) {
        recomendacoes.push({
          tipo: 'alerta',
          prioridade: 'alta',
          titulo: 'Score de fit baixo',
          descricao: `O score de fit (${contexto.scoreFit}) está abaixo do ideal. Considere revisar o perfil ou desqualificar.`,
          acoes: [
            'Revisar perfil da empresa',
            'Atualizar informações',
            'Desqualificar lead'
          ]
        });
      }

      // Recomendação 2: Alta probabilidade de conversão
      if (contexto.probabilidadeConversao && contexto.probabilidadeConversao > 70) {
        recomendacoes.push({
          tipo: 'oportunidade',
          prioridade: 'alta',
          titulo: 'Alta probabilidade de conversão',
          descricao: `Probabilidade de conversão de ${contexto.probabilidadeConversao}%. Priorize o contato.`,
          acoes: [
            'Agendar reunião',
            'Enviar proposta',
            'Fazer follow-up'
          ]
        });
      }

      // Recomendação 3: Segmento A
      if (contexto.segmentoAbc === 'A') {
        recomendacoes.push({
          tipo: 'destaque',
          prioridade: 'media',
          titulo: 'Cliente premium (Segmento A)',
          descricao: 'Este é um cliente de alto valor. Mantenha relacionamento próximo.',
          acoes: [
            'Agendar QBR',
            'Oferecer upsell',
            'Solicitar case de sucesso'
          ]
        });
      }

      // Recomendação 4: Receita potencial alta
      if (contexto.receitaPotencialAnual && contexto.receitaPotencialAnual > 5000000) {
        recomendacoes.push({
          tipo: 'oportunidade',
          prioridade: 'alta',
          titulo: 'Alto potencial de receita',
          descricao: `Receita potencial de R$ ${(contexto.receitaPotencialAnual / 1000000).toFixed(1)}M. Grande oportunidade.`,
          acoes: [
            'Envolver executivo',
            'Preparar proposta customizada',
            'Mapear stakeholders'
          ]
        });
      }

      // Recomendação 5: Cliente ideal
      if (contexto.ehClienteIdeal) {
        recomendacoes.push({
          tipo: 'destaque',
          prioridade: 'alta',
          titulo: 'Cliente ideal identificado',
          descricao: 'Esta empresa se encaixa perfeitamente no perfil de cliente ideal (ICP).',
          acoes: [
            'Priorizar na prospecção',
            'Alocar SDR senior',
            'Preparar abordagem personalizada'
          ]
        });
      }

      return recomendacoes;
    }),

  /**
   * Rastreabilidade - Origem dos dados
   */
  rastreabilidade: requirePermission(Permission.ANALISE_READ)
    .input(z.object({
      entidadeId: z.number()
    }))
    .query(async ({ input }) => {
      const { entidadeId } = input;

      // Buscar entidade
      const entidade = await db.query.dimEntidade.findFirst({
        where: eq(dimEntidade.id, entidadeId)
      });

      if (!entidade) {
        throw new Error('Entidade não encontrada');
      }

      // Buscar contexto
      const contexto = await db.query.fatoEntidadeContexto.findFirst({
        where: eq(fatoEntidadeContexto.entidadeId, entidadeId)
      });

      return {
        entidade: {
          origem: entidade.origem,
          criadoEm: entidade.createdAt,
          criadoPor: entidade.createdBy,
          atualizadoEm: entidade.updatedAt,
          atualizadoPor: entidade.updatedBy
        },
        contexto: contexto ? {
          origem: contexto.origem,
          criadoEm: contexto.createdAt,
          criadoPor: contexto.createdBy,
          atualizadoEm: contexto.updatedAt,
          atualizadoPor: contexto.updatedBy
        } : null
      };
    })
});
