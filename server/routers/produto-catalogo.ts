/**
 * Router para dim_produto_catalogo
 * Sincronizado 100% com DAL e Schema PostgreSQL (14 campos)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as produtoCatalogoDAL from "../dal/dimensoes/produto-catalogo";

export const produtoCatalogoRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await produtoCatalogoDAL.getProdutoCatalogoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        nome: z.string().optional(),
        categoria: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await produtoCatalogoDAL.getProdutosCatalogo(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        categoria: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await produtoCatalogoDAL.countProdutosCatalogo(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        nome: z.string(),
        created_by: z.string(),
        descricao: z.string().optional(),
        categoria: z.string().optional(),
        subcategoria: z.string().optional(),
        especificacoes: z.string().optional(),
        unidade_medida: z.string().optional(),
        codigo_referencia: z.string().optional(),
        marca: z.string().optional(),
        fornecedor: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await produtoCatalogoDAL.createProdutoCatalogo(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          descricao: z.string().optional(),
          categoria: z.string().optional(),
          subcategoria: z.string().optional(),
          especificacoes: z.string().optional(),
          unidade_medida: z.string().optional(),
          codigo_referencia: z.string().optional(),
          updated_by: z.string().optional(),
          marca: z.string().optional(),
          fornecedor: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await produtoCatalogoDAL.updateProdutoCatalogo(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await produtoCatalogoDAL.deleteProdutoCatalogo(input.id, input.deleted_by);
    }),
});
