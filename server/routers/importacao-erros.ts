/**
 * Router para importacao_erros
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/importacao-erros";

export const importacao_errosRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getImportacaoErrosById(input.id);
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
      return await dal.getImportacaoErross(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        importacao_id: z.number(),
        linha: z.number().optional(),
        coluna: z.string().optional(),
        tipo_erro: z.string().optional(),
        mensagem_erro: z.string().optional(),
        dados_linha: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createImportacaoErros(input);
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
      return await dal.updateImportacaoErros(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteImportacaoErros(input.id, input.deleted_by);
    }),
});
