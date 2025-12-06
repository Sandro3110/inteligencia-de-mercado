/**
 * Router para usuarios_bloqueados
 * Sincronizado 100% com DAL e Schema PostgreSQL (8 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as usuariosBloqueadosDAL from "../dal/sistema/usuarios-bloqueados";

export const usuariosBloqueadosRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await usuariosBloqueadosDAL.getUsuarioBloqueadoById(input.id);
    }),

  getByUserId: publicProcedure
    .input(z.object({ user_id: z.string() }))
    .query(async ({ input }) => {
      return await usuariosBloqueadosDAL.getUsuarioBloqueadoByUserId(input.user_id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        user_id: z.string().optional(),
        ativo: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await usuariosBloqueadosDAL.getUsuariosBloqueados(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        ativo: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await usuariosBloqueadosDAL.countUsuariosBloqueados(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        data_bloqueio: z.date(),
        motivo: z.string().optional(),
        data_desbloqueio: z.date().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await usuariosBloqueadosDAL.createUsuarioBloqueado(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          motivo: z.string().optional(),
          data_bloqueio: z.date().optional(),
          data_desbloqueio: z.date().optional(),
          ativo: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await usuariosBloqueadosDAL.updateUsuarioBloqueado(input.id, input.data);
    }),

  desbloquear: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await usuariosBloqueadosDAL.desbloquearUsuario(input.id);
    }),
});
