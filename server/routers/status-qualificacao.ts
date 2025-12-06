/**
 * Router para dim_status_qualificacao
 * Sincronizado 100% com DAL e Schema PostgreSQL (10 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as statusQualificacaoDAL from "../dal/dimensoes/status-qualificacao";

export const statusQualificacaoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await statusQualificacaoDAL.getStatusQualificacaoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        nome: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await statusQualificacaoDAL.getStatusQualificacoes(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await statusQualificacaoDAL.countStatusQualificacoes(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        nome: z.string(),
        created_by: z.string(),
        descricao: z.string().optional(),
        cor: z.string().optional(),
        ordem: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await statusQualificacaoDAL.createStatusQualificacao(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          descricao: z.string().optional(),
          cor: z.string().optional(),
          ordem: z.number().optional(),
          updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await statusQualificacaoDAL.updateStatusQualificacao(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await statusQualificacaoDAL.deleteStatusQualificacao(input.id, input.deleted_by);
    }),
});
