/**
 * Router para fato_entidade_competidor
 * Sincronizado 100% com DAL e Schema PostgreSQL (11 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as entidadeCompetidorDAL from "../dal/fatos/entidade-competidor";

export const entidadeCompetidorRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await entidadeCompetidorDAL.getEntidadeCompetidorById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        competidor_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeCompetidorDAL.getEntidadeCompetidores(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        competidor_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeCompetidorDAL.countEntidadeCompetidores(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        competidor_id: z.number(),
        data_analise: z.date(),
        created_by: z.string(),
        nivel_ameaca: z.string().optional(),
        analise_comparativa: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeCompetidorDAL.createEntidadeCompetidor(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          data_analise: z.date().optional(),
          nivel_ameaca: z.string().optional(),
          analise_comparativa: z.string().optional(),
          updated_by: z.string().optional(),
          observacoes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeCompetidorDAL.updateEntidadeCompetidor(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeCompetidorDAL.deleteEntidadeCompetidor(input.id, input.deleted_by);
    }),
});
