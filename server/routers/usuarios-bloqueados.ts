/**
 * Router para usuarios_bloqueados
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/usuarios-bloqueados";

export const usuarios_bloqueadosRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getUsuariosBloqueadosById(input.id);
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
      return await dal.getUsuariosBloqueadoss(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        motivo: z.string().optional(),
        data_bloqueio: z.date(),
        data_desbloqueio: z.date().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createUsuariosBloqueados(input);
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
      return await dal.updateUsuariosBloqueados(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteUsuariosBloqueados(input.id, input.deleted_by);
    }),
});
