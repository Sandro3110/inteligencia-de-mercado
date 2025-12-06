/**
 * Router para ia_alertas
 * Sincronizado 100% com DAL e Schema PostgreSQL (14 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as iaAlertasDAL from "../dal/ia/alertas";

export const iaAlertasRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await iaAlertasDAL.getIAAlertaById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        tipo: z.string().optional(),
        severidade: z.string().optional(),
        status: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaAlertasDAL.getIAAlertas(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        tipo: z.string().optional(),
        status: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaAlertasDAL.countIAAlertas(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        tipo: z.string(),
        titulo: z.string(),
        severidade: z.string(),
        status: z.string(),
        data_deteccao: z.date(),
        created_by: z.string(),
        descricao: z.string().optional(),
        entidade_relacionada: z.number().optional(),
        acao_recomendada: z.string().optional(),
        data_resolucao: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await iaAlertasDAL.createIAAlerta(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          tipo: z.string().optional(),
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          severidade: z.string().optional(),
          status: z.string().optional(),
          entidade_relacionada: z.number().optional(),
          data_deteccao: z.date().optional(),
          updated_by: z.string().optional(),
          acao_recomendada: z.string().optional(),
          data_resolucao: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await iaAlertasDAL.updateIAAlerta(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await iaAlertasDAL.deleteIAAlerta(input.id, input.deleted_by);
    }),
});
