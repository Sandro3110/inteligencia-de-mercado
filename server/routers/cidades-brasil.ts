/**
 * Router para cidades_brasil
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/sistema/cidades-brasil";

export const cidades_brasilRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getCidadesBrasilById(input.id);
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
      return await dal.getCidadesBrasils(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        nome: z.string(),
        uf: z.string(),
        codigo_ibge: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        populacao: z.number().optional(),
        regiao: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createCidadesBrasil(input);
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
      return await dal.updateCidadesBrasil(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteCidadesBrasil(input.id, input.deleted_by);
    }),
});
