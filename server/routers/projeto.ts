/**
 * Router para dim_projeto
 * Sincronizado 100% com DAL e Schema PostgreSQL (19 campos)
 * 
 * Funções DAL:
 * - getProjetos(filters)
 * - getProjetoById(id)
 * - createProjeto(data)
 * - updateProjeto(id, data)
 * - deleteProjeto(id, deleted_by?)
 * - countProjetos(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as projetoDAL from "../dal/dimensoes/projeto";

export const projetoRouter = router({
  // ============================================================================
  // READ
  // ============================================================================
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await projetoDAL.getProjetoById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        // Paginação
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        
        // Filtros (ProjetoFilters - 4 campos)
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        nome: z.string().optional(),
        status: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        
        // Ordenação
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await projetoDAL.getProjetos(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await projetoDAL.countProjetos(input || {});
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
        
        // Campos opcionais (CreateProjetoData - 10 campos)
        descricao: z.string().optional(),
        status: z.string().optional(),
        data_inicio: z.date().optional(),
        data_fim: z.date().optional(),
        orcamento: z.string().optional(),
        equipe: z.string().optional(),
        objetivos: z.string().optional(),
        resultados_esperados: z.string().optional(),
        prioridade: z.string().optional(),
        progresso_percentual: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await projetoDAL.createProjeto(input);
    }),

  // ============================================================================
  // UPDATE
  // ============================================================================
  
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          // UpdateProjetoData (todos opcionais - 11 campos)
          nome: z.string().optional(),
          descricao: z.string().optional(),
          status: z.string().optional(),
          data_inicio: z.date().optional(),
          data_fim: z.date().optional(),
          orcamento: z.string().optional(),
          equipe: z.string().optional(),
          objetivos: z.string().optional(),
          resultados_esperados: z.string().optional(),
          updated_by: z.string().optional(),
          prioridade: z.string().optional(),
          progresso_percentual: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await projetoDAL.updateProjeto(input.id, input.data);
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
      return await projetoDAL.deleteProjeto(input.id, input.deleted_by);
    }),
});
