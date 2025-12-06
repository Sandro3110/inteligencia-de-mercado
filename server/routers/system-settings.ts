/**
 * Router para system_settings
 * Sincronizado 100% com DAL e Schema PostgreSQL (9 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as systemSettingsDAL from "../dal/sistema/system-settings";

export const systemSettingsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await systemSettingsDAL.getSystemSettingById(input.id);
    }),

  getByChave: publicProcedure
    .input(z.object({ chave: z.string() }))
    .query(async ({ input }) => {
      return await systemSettingsDAL.getSystemSettingByChave(input.chave);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        chave: z.string().optional(),
        categoria: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await systemSettingsDAL.getSystemSettings(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        categoria: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await systemSettingsDAL.countSystemSettings(input || {});
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
      return await systemSettingsDAL.createSystemSetting(input);
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
      return await systemSettingsDAL.updateSystemSetting(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await systemSettingsDAL.deleteSystemSetting(input.id, input.deleted_by);
    }),
});
