/**
 * Router para dim_tempo
 * Sincronizado 100% com DAL e Schema PostgreSQL (16 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as tempoDAL from "../dal/dimensoes/tempo";

export const tempoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await tempoDAL.getTempoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        data: z.date().optional(),
        ano: z.number().optional(),
        mes: z.number().optional(),
        trimestre: z.number().optional(),
        semestre: z.number().optional(),
        dia_semana: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await tempoDAL.getTempos(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        ano: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await tempoDAL.countTempos(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.date(),
        ano: z.number(),
        mes: z.number(),
        dia: z.number(),
        trimestre: z.number(),
        semestre: z.number(),
        dia_semana: z.string(),
        semana_ano: z.number(),
        dia_ano: z.number(),
        created_by: z.string(),
        nome_mes: z.string().optional(),
        eh_feriado: z.boolean().optional(),
        eh_fim_semana: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await tempoDAL.createTempo(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          data: z.date().optional(),
          ano: z.number().optional(),
          mes: z.number().optional(),
          dia: z.number().optional(),
          trimestre: z.number().optional(),
          semestre: z.number().optional(),
          dia_semana: z.string().optional(),
          semana_ano: z.number().optional(),
          dia_ano: z.number().optional(),
          updated_by: z.string().optional(),
          nome_mes: z.string().optional(),
          eh_feriado: z.boolean().optional(),
          eh_fim_semana: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await tempoDAL.updateTempo(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await tempoDAL.deleteTempo(input.id, input.deleted_by);
    }),
});
