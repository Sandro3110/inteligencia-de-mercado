/**
 * Router para dim_canal
 * Sincronizado 100% com DAL e Schema PostgreSQL (17 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as canalDAL from "../dal/dimensoes/canal";

export const canalRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await canalDAL.getCanalById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        nome: z.string().optional(),
        tipo: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await canalDAL.getCanais(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await canalDAL.countCanais(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        nome: z.string(),
        created_by: z.string(),
        tipo: z.string().optional(),
        descricao: z.string().optional(),
        url: z.string().optional(),
        alcance: z.string().optional(),
        engajamento: z.string().optional(),
        custo: z.string().optional(),
        efetividade: z.string().optional(),
        status: z.string().optional(),
        metricas: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await canalDAL.createCanal(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          tipo: z.string().optional(),
          descricao: z.string().optional(),
          url: z.string().optional(),
          alcance: z.string().optional(),
          engajamento: z.string().optional(),
          custo: z.string().optional(),
          efetividade: z.string().optional(),
          updated_by: z.string().optional(),
          status: z.string().optional(),
          metricas: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await canalDAL.updateCanal(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await canalDAL.deleteCanal(input.id, input.deleted_by);
    }),
});
