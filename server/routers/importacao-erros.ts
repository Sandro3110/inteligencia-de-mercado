/**
 * Router para importacao_erros
 * Sincronizado 100% com DAL e Schema PostgreSQL (8 campos)
 * 
 * Nota: Tabela de log de erros - apenas create e read
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as importacaoErrosDAL from "../dal/sistema/importacao-erros";

export const importacaoErrosRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await importacaoErrosDAL.getImportacaoErroById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        importacao_id: z.number().optional(),
        tipo_erro: z.string().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await importacaoErrosDAL.getImportacaoErros(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        importacao_id: z.number().optional(),
        tipo_erro: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await importacaoErrosDAL.countImportacaoErros(input || {});
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
      return await importacaoErrosDAL.createImportacaoErro(input);
    }),
});
