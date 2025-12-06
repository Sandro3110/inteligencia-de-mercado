/**
 * Router para alertas_seguranca
 * Sincronizado 100% com DAL e Schema PostgreSQL (11 campos)
 * 
 * Funções DAL:
 * - getAlertasSeguranca(filters)
 * - getAlertaSegurancaById(id)
 * - createAlertaSeguranca(data)
 * - updateAlertaSeguranca(id, data)
 * - resolverAlertaSeguranca(id)
 * - countAlertasSeguranca(filters)
 * 
 * Nota: Tabela de log de segurança não tem soft delete
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as alertasSegurancaDAL from "../dal/sistema/alertas-seguranca";

export const alertasSegurancaRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await alertasSegurancaDAL.getAlertaSegurancaById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        user_id: z.string().optional(),
        tipo: z.string().optional(),
        severidade: z.string().optional(),
        resolvido: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await alertasSegurancaDAL.getAlertasSeguranca(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        user_id: z.string().optional(),
        tipo: z.string().optional(),
        resolvido: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await alertasSegurancaDAL.countAlertasSeguranca(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        tipo: z.string(),
        user_id: z.string().optional(),
        descricao: z.string().optional(),
        ip_origem: z.string().optional(),
        severidade: z.string().optional(),
        resolvido: z.boolean().optional(),
        data_resolucao: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await alertasSegurancaDAL.createAlertaSeguranca(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          tipo: z.string().optional(),
          descricao: z.string().optional(),
          ip_origem: z.string().optional(),
          severidade: z.string().optional(),
          resolvido: z.boolean().optional(),
          data_resolucao: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await alertasSegurancaDAL.updateAlertaSeguranca(input.id, input.data);
    }),

  resolver: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await alertasSegurancaDAL.resolverAlertaSeguranca(input.id);
    }),
});
