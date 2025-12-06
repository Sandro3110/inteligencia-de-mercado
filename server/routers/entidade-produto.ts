/**
 * Router para fato_entidade_produto
 * Sincronizado 100% com DAL e Schema PostgreSQL (11 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as entidadeProdutoDAL from "../dal/fatos/entidade-produto";

export const entidadeProdutoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await entidadeProdutoDAL.getEntidadeProdutoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        produto_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeProdutoDAL.getEntidadeProdutos(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        produto_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeProdutoDAL.countEntidadeProdutos(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        produto_id: z.number(),
        data_associacao: z.date(),
        created_by: z.string(),
        quantidade: z.number().optional(),
        valor_unitario: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeProdutoDAL.createEntidadeProduto(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          data_associacao: z.date().optional(),
          quantidade: z.number().optional(),
          valor_unitario: z.string().optional(),
          updated_by: z.string().optional(),
          observacoes: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeProdutoDAL.updateEntidadeProduto(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeProdutoDAL.deleteEntidadeProduto(input.id, input.deleted_by);
    }),
});
