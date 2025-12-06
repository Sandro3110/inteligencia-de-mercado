/**
 * Router para roles
 * Sincronizado 100% com DAL e Schema PostgreSQL (9 campos)
 * 
 * Funções DAL:
 * - getRoles(filters)
 * - getRoleById(id)
 * - getRoleByNome(nome)
 * - createRole(data)
 * - updateRole(id, data)
 * - deleteRole(id, deleted_by?)
 * - countRoles(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as rolesDAL from "../dal/sistema/roles";

export const rolesRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await rolesDAL.getRoleById(input.id);
    }),

  getByNome: publicProcedure
    .input(z.object({ nome: z.string() }))
    .query(async ({ input }) => {
      return await rolesDAL.getRoleByNome(input.nome);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        nome: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await rolesDAL.getRoles(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await rolesDAL.countRoles(input || {});
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
      return await rolesDAL.createRole(input);
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
      return await rolesDAL.updateRole(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await rolesDAL.deleteRole(input.id, input.deleted_by);
    }),
});
