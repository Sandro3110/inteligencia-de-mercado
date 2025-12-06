/**
 * Router para ia_config_historico
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/ia/config-historico";

export const config_historicoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getConfigHistoricoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await dal.getConfigHistoricos(input || {});
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
      return await dal.createConfigHistorico(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({

        }),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.updateConfigHistorico(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteConfigHistorico(input.id, input.deleted_by);
    }),
});
