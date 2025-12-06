/**
 * Router para rate_limits
 * Sincronizado 100% com DAL e Schema PostgreSQL (8 campos)
 * 
 * Funções DAL:
 * - getRateLimits(filters)
 * - getRateLimitById(id)
 * - getCurrentRateLimit(user_id, endpoint)
 * - createRateLimit(data)
 * - updateRateLimit(id, data)
 * - incrementRateLimit(id)
 * - deleteExpiredRateLimits()
 * - countRateLimits(filters)
 * 
 * Nota: Tabela de controle de rate limit não tem soft delete
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as rateLimitsDAL from "../dal/sistema/rate-limits";

export const rateLimitsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await rateLimitsDAL.getRateLimitById(input.id);
    }),

  getCurrent: publicProcedure
    .input(z.object({ 
      user_id: z.string(),
      endpoint: z.string()
    }))
    .query(async ({ input }) => {
      return await rateLimitsDAL.getCurrentRateLimit(input.user_id, input.endpoint);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        user_id: z.string().optional(),
        endpoint: z.string().optional(),
        dataInicio: z.date().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await rateLimitsDAL.getRateLimits(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        endpoint: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await rateLimitsDAL.countRateLimits(input || {});
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
      return await rateLimitsDAL.createRateLimit(input);
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
      return await rateLimitsDAL.updateRateLimit(input.id, input.data);
    }),

  increment: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await rateLimitsDAL.incrementRateLimit(input.id);
    }),

  deleteExpired: publicProcedure
    .mutation(async () => {
      return await rateLimitsDAL.deleteExpiredRateLimits();
    }),
});
