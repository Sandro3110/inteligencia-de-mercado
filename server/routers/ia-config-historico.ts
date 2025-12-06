/**
 * Router para ia_config_historico
 * Sincronizado 100% com DAL e Schema PostgreSQL (8 campos)
 * 
 * Funções DAL:
 * - getIAConfigHistoricos(filters)
 * - getIAConfigHistoricoById(id)
 * - createIAConfigHistorico(data)
 * - countIAConfigHistoricos(filters)
 * 
 * Nota: Tabela de histórico não tem update/delete
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as iaConfigHistoricoDAL from "../dal/ia/config-historico";

export const iaConfigHistoricoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await iaConfigHistoricoDAL.getIAConfigHistoricoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        config_id: z.number().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaConfigHistoricoDAL.getIAConfigHistoricos(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        config_id: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaConfigHistoricoDAL.countIAConfigHistoricos(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        config_id: z.number(),
        chave: z.string(),
        valor_anterior: z.string(),
        valor_novo: z.string(),
        alterado_por: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await iaConfigHistoricoDAL.createIAConfigHistorico(input);
    }),
});
