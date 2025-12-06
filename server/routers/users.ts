/**
 * Router para users
 * Sincronizado 100% com DAL e Schema PostgreSQL (11 campos)
 * 
 * Funções DAL:
 * - getUsers(filters)
 * - getUserById(id)
 * - getUserByEmail(email)
 * - createUser(data)
 * - updateUser(id, data)
 * - deleteUser(id, deleted_by?)
 * - countUsers(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as usersDAL from "../dal/sistema/users";

export const usersRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await usersDAL.getUserById(input.id);
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      return await usersDAL.getUserByEmail(input.email);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.string().optional(),
        email: z.string().optional(),
        role: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await usersDAL.getUsers(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        role: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await usersDAL.countUsers(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email(),
        password_hash: z.string(),
        name: z.string().optional(),
        role: z.string().optional(),
        created_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await usersDAL.createUser(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          email: z.string().email().optional(),
          password_hash: z.string().optional(),
          name: z.string().optional(),
          role: z.string().optional(),
          last_login: z.date().optional(),
          updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await usersDAL.updateUser(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await usersDAL.deleteUser(input.id, input.deleted_by);
    }),
});
