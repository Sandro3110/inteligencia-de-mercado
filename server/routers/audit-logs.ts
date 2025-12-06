/**
 * Router para audit_logs
 * Sincronizado 100% com DAL e Schema PostgreSQL (10 campos)
 * 
 * Nota: Tabela de auditoria - apenas create e read
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as auditLogsDAL from "../dal/audit/audit-logs";

export const auditLogsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await auditLogsDAL.getAuditLogById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        user_id: z.string().optional(),
        tabela: z.string().optional(),
        operacao: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.getAuditLogs(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        tabela: z.string().optional(),
        operacao: z.string().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.countAuditLogs(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        tabela: z.string(),
        operacao: z.string(),
        user_id: z.string().optional(),
        registro_id: z.number().optional(),
        dados_anteriores: z.string().optional(),
        dados_novos: z.string().optional(),
        ip_origem: z.string().optional(),
        user_agent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await auditLogsDAL.createAuditLog(input);
    }),
});
