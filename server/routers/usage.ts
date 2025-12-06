/**
 * Router para ia_usage
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/ia/usage";

export const usageRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getUsageById(input.id);
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
      return await dal.getUsages(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        operacao: z.string(),
        modelo: z.string().optional(),
        tokens_entrada: z.number().optional(),
        tokens_saida: z.number().optional(),
        custo_estimado: z.string().optional(),
        duracao_ms: z.number().optional(),
        sucesso: z.boolean().optional(),
        erro: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createUsage(input);
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
      return await dal.updateUsage(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteUsage(input.id, input.deleted_by);
    }),
});
