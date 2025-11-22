/**
 * Router tRPC para Sistema Unificado de Mapas
 * Endpoints para visualização de todas as entidades no mapa
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAllMapEntities, getEntityDetails } from "../db-unified-map";

export const unifiedMapRouter = router({
  /**
   * Busca todas as entidades com coordenadas para exibir no mapa
   */
  getAllEntities: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
        entityTypes: z
          .array(z.enum(["mercado", "cliente", "produto", "concorrente", "lead"]))
          .optional(),
        mercadoIds: z.array(z.number()).optional(),
        minQuality: z.number().min(0).max(100).optional(),
        validationStatus: z.string().optional(),
        searchText: z.string().optional(),
        ufs: z.array(z.string()).optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return getAllMapEntities(input);
    }),

  /**
   * Busca detalhes completos de uma entidade específica
   */
  getEntityDetails: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["mercado", "cliente", "produto", "concorrente", "lead"]),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return getEntityDetails(input.entityType, input.entityId);
    }),

  /**
   * Estatísticas agregadas das entidades no mapa
   */
  getMapStats: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const allEntities = await getAllMapEntities({
        projectId: input.projectId,
        pesquisaId: input.pesquisaId,
      });

      const stats = {
        total: allEntities.length,
        byType: {
          mercado: allEntities.filter((e) => e.type === "mercado").length,
          cliente: allEntities.filter((e) => e.type === "cliente").length,
          produto: allEntities.filter((e) => e.type === "produto").length,
          concorrente: allEntities.filter((e) => e.type === "concorrente").length,
          lead: allEntities.filter((e) => e.type === "lead").length,
        },
        byUF: {} as Record<string, number>,
        byQuality: {
          high: allEntities.filter((e) => (e.qualidadeScore || 0) >= 70).length,
          medium: allEntities.filter(
            (e) => (e.qualidadeScore || 0) >= 40 && (e.qualidadeScore || 0) < 70
          ).length,
          low: allEntities.filter((e) => (e.qualidadeScore || 0) < 40).length,
        },
      };

      // Agrupar por UF
      allEntities.forEach((entity) => {
        if (entity.uf) {
          stats.byUF[entity.uf] = (stats.byUF[entity.uf] || 0) + 1;
        }
      });

      return stats;
    }),
});
