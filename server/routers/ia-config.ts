/**
 * Router para ia_config
 * Sincronizado 100% com DAL e Schema PostgreSQL (10 campos)
 * 
 * Funções DAL:
 * - getIAConfigs(filters)
 * - getIAConfigById(id)
 * - getIAConfigByChave(chave)
 * - createIAConfig(data)
 * - updateIAConfig(id, data)
 * - deleteIAConfig(id, deleted_by?)
 * - countIAConfigs(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as iaConfigDAL from "../dal/ia/config";

export const iaConfigRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await iaConfigDAL.getIAConfigById(input.id);
    }),

  getByChave: publicProcedure
    .input(z.object({ chave: z.string() }))
    .query(async ({ input }) => {
      return await iaConfigDAL.getIAConfigByChave(input.chave);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        chave: z.string().optional(),
        categoria: z.string().optional(),
        ativo: z.boolean().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaConfigDAL.getIAConfigs(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        categoria: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaConfigDAL.countIAConfigs(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        chave: z.string(),
        valor: z.string(),
        created_by: z.string(),
        descricao: z.string().optional(),
        categoria: z.string().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await iaConfigDAL.createIAConfig(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          chave: z.string().optional(),
          valor: z.string().optional(),
          descricao: z.string().optional(),
          categoria: z.string().optional(),
          ativo: z.boolean().optional(),
          updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await iaConfigDAL.updateIAConfig(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await iaConfigDAL.deleteIAConfig(input.id, input.deleted_by);
    }),
});
