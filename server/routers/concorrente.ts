/**
 * Router para dim_concorrente
 * Sincronizado 100% com DAL e Schema PostgreSQL (26 campos)
 * 
 * Funções DAL:
 * - getConcorrentes(filters)
 * - getConcorrenteById(id)
 * - createConcorrente(data)
 * - updateConcorrente(id, data)
 * - deleteConcorrente(id, deleted_by?)
 * - countConcorrentes(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as concorrenteDAL from "../dal/dimensoes/concorrente";

export const concorrenteRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await concorrenteDAL.getConcorrenteById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        nome: z.string().optional(),
        tipo: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await concorrenteDAL.getConcorrentes(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await concorrenteDAL.countConcorrentes(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        nome: z.string(),
        created_by: z.string(),
        tipo: z.string().optional(),
        descricao: z.string().optional(),
        site: z.string().optional(),
        produtos_servicos: z.string().optional(),
        pontos_fortes: z.string().optional(),
        pontos_fracos: z.string().optional(),
        participacao_mercado: z.string().optional(),
        estrategia_principal: z.string().optional(),
        faturamento_estimado: z.string().optional(),
        numero_funcionarios: z.number().optional(),
        localizacao_principal: z.string().optional(),
        canais_venda: z.string().optional(),
        diferenciais: z.string().optional(),
        ameacas: z.string().optional(),
        nivel_ameaca: z.string().optional(),
        posicionamento: z.string().optional(),
        publico_alvo: z.string().optional(),
        estrategia_preco: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await concorrenteDAL.createConcorrente(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          tipo: z.string().optional(),
          descricao: z.string().optional(),
          site: z.string().optional(),
          produtos_servicos: z.string().optional(),
          pontos_fortes: z.string().optional(),
          pontos_fracos: z.string().optional(),
          participacao_mercado: z.string().optional(),
          estrategia_principal: z.string().optional(),
          updated_by: z.string().optional(),
          faturamento_estimado: z.string().optional(),
          numero_funcionarios: z.number().optional(),
          localizacao_principal: z.string().optional(),
          canais_venda: z.string().optional(),
          diferenciais: z.string().optional(),
          ameacas: z.string().optional(),
          nivel_ameaca: z.string().optional(),
          posicionamento: z.string().optional(),
          publico_alvo: z.string().optional(),
          estrategia_preco: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await concorrenteDAL.updateConcorrente(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await concorrenteDAL.deleteConcorrente(input.id, input.deleted_by);
    }),
});
