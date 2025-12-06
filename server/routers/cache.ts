/**
 * Router para ia_cache
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/ia/cache";

export const cacheRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getCacheById(input.id);
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
      return await dal.getCaches(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        chave: z.string(),
        valor: z.string(),
        tipo: z.string().optional(),
        expiracao: z.date().optional(),
        created_by: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createCache(input);
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
      return await dal.updateCache(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteCache(input.id, input.deleted_by);
    }),
});
