/**
 * Router para rate_limits
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/rate-limits";

export const rate_limitsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getRateLimitsById(input.id);
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
      return await dal.getRateLimitss(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        endpoint: z.string(),
        requests_count: z.number(),
        window_start: z.date(),
        window_end: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createRateLimits(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
        requests_count: z.number().optional(),
        window_start: z.date().optional(),
        window_end: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.updateRateLimits(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteRateLimits(input.id, input.deleted_by);
    }),
});
