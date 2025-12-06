/**
 * Router para dim_importacao
 * Sincronizado 100% com DAL e Schema PostgreSQL (17 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as importacaoDAL from "../dal/dimensoes/importacao";

export const importacaoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await importacaoDAL.getImportacaoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        nome_arquivo: z.string().optional(),
        status: z.string().optional(),
        tipo: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await importacaoDAL.getImportacoes(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await importacaoDAL.countImportacoes(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        nome_arquivo: z.string(),
        tipo: z.string(),
        status: z.string(),
        data_importacao: z.date(),
        total_registros: z.number(),
        registros_sucesso: z.number(),
        registros_erro: z.number(),
        created_by: z.string(),
        observacoes: z.string().optional(),
        caminho_arquivo: z.string().optional(),
        tamanho_arquivo: z.number().optional(),
        duracao_segundos: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await importacaoDAL.createImportacao(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nome_arquivo: z.string().optional(),
          tipo: z.string().optional(),
          status: z.string().optional(),
          data_importacao: z.date().optional(),
          total_registros: z.number().optional(),
          registros_sucesso: z.number().optional(),
          registros_erro: z.number().optional(),
          updated_by: z.string().optional(),
          observacoes: z.string().optional(),
          caminho_arquivo: z.string().optional(),
          tamanho_arquivo: z.number().optional(),
          duracao_segundos: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await importacaoDAL.updateImportacao(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await importacaoDAL.deleteImportacao(input.id, input.deleted_by);
    }),
});
