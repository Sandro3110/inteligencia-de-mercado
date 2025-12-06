/**
 * Router para ia_usage
 * Sincronizado 100% com DAL e Schema PostgreSQL (12 campos)
 * 
 * Funções DAL:
 * - getIAUsages(filters)
 * - getIAUsageById(id)
 * - createIAUsage(data)
 * - countIAUsages(filters)
 * - sumTokensIAUsage(filters)
 * 
 * Nota: Tabela de log não tem update/delete
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as iaUsageDAL from "../dal/ia/usage";

export const iaUsageRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await iaUsageDAL.getIAUsageById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        user_id: z.string().optional(),
        operacao: z.string().optional(),
        modelo: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaUsageDAL.getIAUsages(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        operacao: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaUsageDAL.countIAUsages(input || {});
    }),

  sumTokens: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaUsageDAL.sumTokensIAUsage(input || {});
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
      return await iaUsageDAL.createIAUsage(input);
    }),
});
