/**
 * Router para user_profiles
 * Sincronizado 100% com DAL e Schema PostgreSQL (11 campos)
 * 
 * Funções DAL:
 * - getUserProfiles(filters)
 * - getUserProfileById(id)
 * - getUserProfileByUserId(user_id)
 * - createUserProfile(data)
 * - updateUserProfile(id, data)
 * - deleteUserProfile(id, deleted_by?)
 * - countUserProfiles(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as userProfilesDAL from "../dal/sistema/user-profiles";

export const userProfilesRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await userProfilesDAL.getUserProfileById(input.id);
    }),

  getByUserId: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input }) => {
      return await userProfilesDAL.getUserProfileByUserId(input.user_id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        user_id: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await userProfilesDAL.getUserProfiles(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await userProfilesDAL.countUserProfiles(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        avatar_url: z.string().optional(),
        bio: z.string().optional(),
        telefone: z.string().optional(),
        empresa: z.string().optional(),
        cargo: z.string().optional(),
        created_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await userProfilesDAL.createUserProfile(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          avatar_url: z.string().optional(),
          bio: z.string().optional(),
          telefone: z.string().optional(),
          empresa: z.string().optional(),
          cargo: z.string().optional(),
          updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await userProfilesDAL.updateUserProfile(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await userProfilesDAL.deleteUserProfile(input.id, input.deleted_by);
    }),
});
