/**
 * Router para fato_entidade_contexto
 * Sincronizado 100% com DAL e Schema PostgreSQL (13 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as entidadeContextoDAL from "../dal/fatos/entidade-contexto";

export const entidadeContextoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await entidadeContextoDAL.getEntidadeContextoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        tipo_contexto: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeContextoDAL.getEntidadeContextos(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        tipo_contexto: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeContextoDAL.countEntidadeContextos(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        tipo_contexto: z.string(),
        data_registro: z.date(),
        created_by: z.string(),
        descricao: z.string().optional(),
        relevancia: z.string().optional(),
        fonte: z.string().optional(),
        tags: z.string().optional(),
        impacto: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeContextoDAL.createEntidadeContexto(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          tipo_contexto: z.string().optional(),
          descricao: z.string().optional(),
          data_registro: z.date().optional(),
          relevancia: z.string().optional(),
          fonte: z.string().optional(),
          updated_by: z.string().optional(),
          tags: z.string().optional(),
          impacto: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeContextoDAL.updateEntidadeContexto(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeContextoDAL.deleteEntidadeContexto(input.id, input.deleted_by);
    }),
});
