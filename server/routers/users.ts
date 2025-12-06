/**
 * Router para users
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/users";

export const usersRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getUsersById(input.id);
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
      return await dal.getUserss(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string(),
        password_hash: z.string(),
        name: z.string().optional(),
        role: z.string().optional(),
        created_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createUsers(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
        email: z.string().optional(),
        password_hash: z.string().optional(),
        name: z.string().optional(),
        role: z.string().optional(),
        last_login: z.date().optional(),
        updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.updateUsers(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteUsers(input.id, input.deleted_by);
    }),
});
