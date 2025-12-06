/**
 * Router para system_settings
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/system-settings";

export const system_settingsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getSystemSettingsById(input.id);
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
      return await dal.getSystemSettingss(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        chave: z.string(),
        valor: z.string(),
        descricao: z.string().optional(),
        categoria: z.string().optional(),
        created_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createSystemSettings(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
        chave: z.string().optional(),
        valor: z.string().optional(),
        descricao: z.string().optional(),
        categoria: z.string().optional(),
        updated_by: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.updateSystemSettings(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteSystemSettings(input.id, input.deleted_by);
    }),
});
