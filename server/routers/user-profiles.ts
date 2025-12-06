/**
 * Router para user_profiles
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/user-profiles";

export const user_profilesRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getUserProfilesById(input.id);
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
      return await dal.getUserProfiless(input || {});
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
      return await dal.createUserProfiles(input);
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
      return await dal.updateUserProfiles(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteUserProfiles(input.id, input.deleted_by);
    }),
});
