/**
 * Router para alertas_seguranca
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/alertas-seguranca";

export const alertas_segurancaRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getAlertasSegurancaById(input.id);
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
      return await dal.getAlertasSegurancas(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        tipo: z.string(),
        descricao: z.string().optional(),
        ip_origem: z.string().optional(),
        severidade: z.string().optional(),
        resolvido: z.boolean().optional(),
        data_resolucao: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createAlertasSeguranca(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
        tipo: z.string().optional(),
        descricao: z.string().optional(),
        ip_origem: z.string().optional(),
        severidade: z.string().optional(),
        resolvido: z.boolean().optional(),
        data_resolucao: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.updateAlertasSeguranca(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteAlertasSeguranca(input.id, input.deleted_by);
    }),
});
