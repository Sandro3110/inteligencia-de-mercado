/**
 * Router para ia_cache
 * Sincronizado 100% com DAL e Schema PostgreSQL (9 campos)
 * 
 * Funções DAL:
 * - getIACaches(filters)
 * - getIACacheById(id)
 * - getIACacheByChave(chave)
 * - createIACache(data)
 * - updateIACache(id, data)
 * - deleteIACache(id, deleted_by?)
 * - deleteExpiredCaches()
 * - countIACaches(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as iaCacheDAL from "../dal/ia/cache";

export const iaCacheRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await iaCacheDAL.getIACacheById(input.id);
    }),

  getByChave: publicProcedure
    .input(z.object({ chave: z.string() }))
    .query(async ({ input }) => {
      return await iaCacheDAL.getIACacheByChave(input.chave);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        chave: z.string().optional(),
        tipo: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        incluirExpirados: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaCacheDAL.getIACaches(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        tipo: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await iaCacheDAL.countIACaches(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        chave: z.string(),
        valor: z.string(),
        created_by: z.string(),
        tipo: z.string().optional(),
        expiracao: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await iaCacheDAL.createIACache(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          chave: z.string().optional(),
          valor: z.string().optional(),
          tipo: z.string().optional(),
          expiracao: z.date().optional(),
          updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await iaCacheDAL.updateIACache(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await iaCacheDAL.deleteIACache(input.id, input.deleted_by);
    }),

  deleteExpired: publicProcedure
    .mutation(async () => {
      return await iaCacheDAL.deleteExpiredCaches();
    }),
});
