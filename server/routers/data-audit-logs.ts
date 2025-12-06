/**
 * Router para data_audit_logs
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/audit/data-audit-logs";

export const data_audit_logsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getDataAuditLogsById(input.id);
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
      return await dal.getDataAuditLogss(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        tabela: z.string(),
        campo: z.string(),
        valor_anterior: z.string().optional(),
        valor_novo: z.string().optional(),
        tipo_alteracao: z.string().optional(),
        usuario: z.string().optional(),
        motivo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createDataAuditLogs(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({

        }),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.updateDataAuditLogs(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteDataAuditLogs(input.id, input.deleted_by);
    }),
});
