/**
 * Router para roles
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/roles";

export const rolesRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getRolesById(input.id);
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
      return await dal.getRoless(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        permissoes: z.string().optional(),
        nivel_acesso: z.number().optional(),
        created_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createRoles(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
        nome: z.string().optional(),
        descricao: z.string().optional(),
        permissoes: z.string().optional(),
        nivel_acesso: z.number().optional(),
        updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.updateRoles(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteRoles(input.id, input.deleted_by);
    }),
});
