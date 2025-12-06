/**
 * Router para dim_geografia
 * Sincronizado 100% com DAL e Schema PostgreSQL (19 campos)
 * 
 * Funções DAL:
 * - getGeografias(filters)
 * - getGeografiaById(id)
 * - createGeografia(data)
 * - updateGeografia(id, data)
 * - deleteGeografia(id, deleted_by?)
 * - countGeografias(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as geografiaDAL from "../dal/dimensoes/geografia";

export const geografiaRouter = router({
  // ============================================================================
  // READ
  // ============================================================================
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await geografiaDAL.getGeografiaById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        // Paginação
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        
        // Filtros (GeografiaFilters - 9 campos)
        id: z.number().optional(),
        cidade: z.string().optional(),
        uf: z.string().optional(),
        regiao: z.string().optional(),
        pais: z.string().optional(),
        macrorregiao: z.string().optional(),
        mesorregiao: z.string().optional(),
        microrregiao: z.string().optional(),
        codigo_ibge: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        
        // Ordenação
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await geografiaDAL.getGeografias(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        uf: z.string().optional(),
        regiao: z.string().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await geografiaDAL.countGeografias(input || {});
    }),

  // ============================================================================
  // CREATE
  // ============================================================================
  
  create: publicProcedure
    .input(
      z.object({
        // Campos obrigatórios
        cidade: z.string(),
        uf: z.string(),
        
        // Campos opcionais (CreateGeografiaData - 11 campos)
        regiao: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        codigo_ibge: z.string().optional(),
        populacao: z.number().optional(),
        pib_per_capita: z.string().optional(),
        created_by: z.string().optional(),
        pais: z.string().optional(),
        macrorregiao: z.string().optional(),
        mesorregiao: z.string().optional(),
        microrregiao: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await geografiaDAL.createGeografia(input);
    }),

  // ============================================================================
  // UPDATE
  // ============================================================================
  
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          // UpdateGeografiaData (todos opcionais - 12 campos)
          cidade: z.string().optional(),
          uf: z.string().optional(),
          regiao: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          codigo_ibge: z.string().optional(),
          populacao: z.number().optional(),
          pib_per_capita: z.string().optional(),
          updated_by: z.string().optional(),
          pais: z.string().optional(),
          macrorregiao: z.string().optional(),
          mesorregiao: z.string().optional(),
          microrregiao: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await geografiaDAL.updateGeografia(input.id, input.data);
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
      return await geografiaDAL.deleteGeografia(input.id, input.deleted_by);
    }),
});
