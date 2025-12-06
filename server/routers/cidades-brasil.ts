/**
 * Router para cidades_brasil
 * Sincronizado 100% com DAL e Schema PostgreSQL (9 campos)
 * 
 * Nota: Tabela de referência - apenas create e read
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as cidadesBrasilDAL from "../dal/sistema/cidades-brasil";

export const cidadesBrasilRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await cidadesBrasilDAL.getCidadeBrasilById(input.id);
    }),

  getByCodigoIBGE: publicProcedure
    .input(z.object({ codigo_ibge: z.string() }))
    .query(async ({ input }) => {
      return await cidadesBrasilDAL.getCidadeBrasilByCodigoIBGE(input.codigo_ibge);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        nome: z.string().optional(),
        uf: z.string().optional(),
        codigo_ibge: z.string().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await cidadesBrasilDAL.getCidadesBrasil(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        uf: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await cidadesBrasilDAL.countCidadesBrasil(input || {});
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
      return await cidadesBrasilDAL.createCidadeBrasil(input);
    }),
});
