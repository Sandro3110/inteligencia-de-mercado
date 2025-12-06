/**
 * Router para data_audit_logs
 * Sincronizado 100% com DAL e Schema PostgreSQL (9 campos)
 * 
 * Nota: Tabela de auditoria de dados - apenas create e read
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dataAuditLogsDAL from "../dal/audit/data-audit-logs";

export const dataAuditLogsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dataAuditLogsDAL.getDataAuditLogById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        tabela: z.string().optional(),
        campo: z.string().optional(),
        tipo_alteracao: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await dataAuditLogsDAL.getDataAuditLogs(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        tabela: z.string().optional(),
        campo: z.string().optional(),
        tipo_alteracao: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await dataAuditLogsDAL.countDataAuditLogs(input || {});
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
      return await dataAuditLogsDAL.createDataAuditLog(input);
    }),
});
