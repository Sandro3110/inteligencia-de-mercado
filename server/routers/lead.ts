/**
 * Router para dim_lead
 * Sincronizado 100% com DAL e Schema PostgreSQL (25 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as leadDAL from "../dal/dimensoes/lead";

export const leadRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await leadDAL.getLeadById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        nome: z.string().optional(),
        email: z.string().optional(),
        status: z.string().optional(),
        origem: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await leadDAL.getLeads(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        status: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await leadDAL.countLeads(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        nome: z.string(),
        created_by: z.string(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        empresa: z.string().optional(),
        cargo: z.string().optional(),
        origem: z.string().optional(),
        status: z.string().optional(),
        score: z.number().optional(),
        interesses: z.string().optional(),
        notas: z.string().optional(),
        data_contato: z.date().optional(),
        data_conversao: z.date().optional(),
        valor_potencial: z.string().optional(),
        produto_interesse: z.string().optional(),
        campanha_origem: z.string().optional(),
        responsavel: z.string().optional(),
        ultima_interacao: z.date().optional(),
        proximo_followup: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await leadDAL.createLead(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          email: z.string().optional(),
          telefone: z.string().optional(),
          empresa: z.string().optional(),
          cargo: z.string().optional(),
          origem: z.string().optional(),
          status: z.string().optional(),
          score: z.number().optional(),
          interesses: z.string().optional(),
          notas: z.string().optional(),
          updated_by: z.string().optional(),
          data_contato: z.date().optional(),
          data_conversao: z.date().optional(),
          valor_potencial: z.string().optional(),
          produto_interesse: z.string().optional(),
          campanha_origem: z.string().optional(),
          responsavel: z.string().optional(),
          ultima_interacao: z.date().optional(),
          proximo_followup: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await leadDAL.updateLead(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await leadDAL.deleteLead(input.id, input.deleted_by);
    }),
});
