/**
 * Router para dim_pesquisa
 * Sincronizado 100% com DAL e Schema PostgreSQL (21 campos)
 * 
 * Funções DAL:
 * - getPesquisas(filters)
 * - getPesquisaById(id)
 * - createPesquisa(data)
 * - updatePesquisa(id, data)
 * - deletePesquisa(id, deleted_by?)
 * - countPesquisas(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as pesquisaDAL from "../dal/dimensoes/pesquisa";

export const pesquisaRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await pesquisaDAL.getPesquisaById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        tipo: z.string().optional(),
        status: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await pesquisaDAL.getPesquisas(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await pesquisaDAL.countPesquisas(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        tipo: z.string(),
        created_by: z.string(),
        descricao: z.string().optional(),
        data_realizacao: z.date().optional(),
        metodologia: z.string().optional(),
        amostra: z.string().optional(),
        resultados: z.string().optional(),
        insights: z.string().optional(),
        fonte: z.string().optional(),
        confiabilidade: z.string().optional(),
        status: z.string().optional(),
        data_validade: z.date().optional(),
        custo: z.string().optional(),
        responsavel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await pesquisaDAL.createPesquisa(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          tipo: z.string().optional(),
          descricao: z.string().optional(),
          data_realizacao: z.date().optional(),
          metodologia: z.string().optional(),
          amostra: z.string().optional(),
          resultados: z.string().optional(),
          insights: z.string().optional(),
          updated_by: z.string().optional(),
          fonte: z.string().optional(),
          confiabilidade: z.string().optional(),
          status: z.string().optional(),
          data_validade: z.date().optional(),
          custo: z.string().optional(),
          responsavel: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await pesquisaDAL.updatePesquisa(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await pesquisaDAL.deletePesquisa(input.id, input.deleted_by);
    }),
});
