/**
 * Router para dim_mercado
 * Sincronizado 100% com DAL e Schema PostgreSQL (21 campos)
 * 
 * Funções DAL:
 * - getMercados(filters)
 * - getMercadoById(id)
 * - createMercado(data)
 * - updateMercado(id, data)
 * - deleteMercado(id, deleted_by?)
 * - countMercados(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as mercadoDAL from "../dal/dimensoes/mercado";

export const mercadoRouter = router({
  // ============================================================================
  // READ
  // ============================================================================
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await mercadoDAL.getMercadoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        // Paginação
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        
        // Filtros (MercadoFilters - 5 campos)
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        nome: z.string().optional(),
        categoria: z.string().optional(),
        segmentacao: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        
        // Ordenação
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await mercadoDAL.getMercados(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await mercadoDAL.countMercados(input || {});
    }),

  // ============================================================================
  // CREATE
  // ============================================================================
  
  create: publicProcedure
    .input(
      z.object({
        // Campos obrigatórios
        entidade_id: z.number(),
        nome: z.string(),
        created_by: z.string(),
        
        // Campos opcionais (CreateMercadoData - 11 campos)
        categoria: z.string().optional(),
        segmentacao: z.string().optional(),
        tamanho_mercado: z.string().optional(),
        crescimento_anual: z.string().optional(),
        tendencias: z.string().optional(),
        principais_players: z.string().optional(),
        sentimento: z.string().optional(),
        score_atratividade: z.number().optional(),
        nivel_saturacao: z.string().optional(),
        oportunidades: z.string().optional(),
        riscos: z.string().optional(),
        recomendacao_estrategica: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await mercadoDAL.createMercado(input);
    }),

  // ============================================================================
  // UPDATE
  // ============================================================================
  
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          // UpdateMercadoData (todos opcionais - 14 campos)
          nome: z.string().optional(),
          categoria: z.string().optional(),
          segmentacao: z.string().optional(),
          tamanho_mercado: z.string().optional(),
          crescimento_anual: z.string().optional(),
          tendencias: z.string().optional(),
          principais_players: z.string().optional(),
          updated_by: z.string().optional(),
          sentimento: z.string().optional(),
          score_atratividade: z.number().optional(),
          nivel_saturacao: z.string().optional(),
          oportunidades: z.string().optional(),
          riscos: z.string().optional(),
          recomendacao_estrategica: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await mercadoDAL.updateMercado(input.id, input.data);
    }),

  // ============================================================================
  // DELETE (Soft Delete)
  // ============================================================================
  
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await mercadoDAL.deleteMercado(input.id, input.deleted_by);
    }),
});
