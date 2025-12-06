/**
 * Router para dim_entidade
 * Sincronizado 100% com DAL e Schema PostgreSQL (49 campos)
 * 
 * Funções DAL:
 * - getEntidades(filters)
 * - getEntidadeById(id)
 * - getEntidadeByHash(hash)
 * - createEntidade(data)
 * - updateEntidade(id, data)
 * - deleteEntidade(id, deleted_by?)
 * - countEntidades(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as entidadeDAL from "../dal/dimensoes/entidade";

export const entidadeRouter = router({
  // ============================================================================
  // READ
  // ============================================================================
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await entidadeDAL.getEntidadeById(input.id);
    }),

  getByHash: publicProcedure
    .input(z.object({ hash: z.string() }))
    .query(async ({ input }) => {
      return await entidadeDAL.getEntidadeByHash(input.hash);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        // Paginação
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        
        // Filtros (EntidadeFilters)
        id: z.number().optional(),
        entidade_hash: z.string().optional(),
        tipo_entidade: z.string().optional(),
        nome: z.string().optional(),
        cnpj: z.string().optional(),
        email: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().optional(),
        porte: z.string().optional(),
        setor: z.string().optional(),
        segmentacao_b2b_b2c: z.string().optional(),
        status_qualificacao_id: z.number().optional(),
        enriquecido: z.boolean().optional(),
        incluirInativos: z.boolean().optional(),
        
        // Ordenação
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeDAL.getEntidades(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        tipo_entidade: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().optional(),
        enriquecido: z.boolean().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await entidadeDAL.countEntidades(input || {});
    }),

  // ============================================================================
  // CREATE
  // ============================================================================
  
  create: publicProcedure
    .input(
      z.object({
        // Campos obrigatórios
        entidade_hash: z.string(),
        tipo_entidade: z.string(),
        nome: z.string(),
        origem_tipo: z.string(),
        origem_data: z.date(),
        
        // Campos opcionais (CreateEntidadeData)
        nome_fantasia: z.string().optional(),
        cnpj: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        site: z.string().optional(),
        num_filiais: z.number().optional(),
        num_lojas: z.number().optional(),
        num_funcionarios: z.number().optional(),
        origem_arquivo: z.string().optional(),
        origem_processo: z.string().optional(),
        origem_prompt: z.string().optional(),
        origem_confianca: z.number().optional(),
        origem_usuario_id: z.number().optional(),
        created_by: z.string().optional(),
        importacao_id: z.number().optional(),
        cnpj_hash: z.string().optional(),
        cpf_hash: z.string().optional(),
        email_hash: z.string().optional(),
        telefone_hash: z.string().optional(),
        cidade: z.string().optional(),
        uf: z.string().optional(),
        porte: z.string().optional(),
        setor: z.string().optional(),
        produto_principal: z.string().optional(),
        segmentacao_b2b_b2c: z.string().optional(),
        score_qualidade: z.number().optional(),
        enriquecido_em: z.date().optional(),
        enriquecido_por: z.string().optional(),
        cache_hit: z.boolean().optional(),
        cache_expires_at: z.date().optional(),
        score_qualidade_dados: z.number().optional(),
        validacao_cnpj: z.boolean().optional(),
        validacao_email: z.boolean().optional(),
        validacao_telefone: z.boolean().optional(),
        campos_faltantes: z.string().optional(),
        ultima_validacao: z.date().optional(),
        status_qualificacao_id: z.number().optional(),
        enriquecido: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeDAL.createEntidade(input);
    }),

  // ============================================================================
  // UPDATE
  // ============================================================================
  
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          // UpdateEntidadeData (todos opcionais)
          nome: z.string().optional(),
          nome_fantasia: z.string().optional(),
          cnpj: z.string().optional(),
          email: z.string().optional(),
          telefone: z.string().optional(),
          site: z.string().optional(),
          num_filiais: z.number().optional(),
          num_lojas: z.number().optional(),
          num_funcionarios: z.number().optional(),
          updated_by: z.string().optional(),
          cnpj_hash: z.string().optional(),
          cpf_hash: z.string().optional(),
          email_hash: z.string().optional(),
          telefone_hash: z.string().optional(),
          cidade: z.string().optional(),
          uf: z.string().optional(),
          porte: z.string().optional(),
          setor: z.string().optional(),
          produto_principal: z.string().optional(),
          segmentacao_b2b_b2c: z.string().optional(),
          score_qualidade: z.number().optional(),
          enriquecido_em: z.date().optional(),
          enriquecido_por: z.string().optional(),
          cache_hit: z.boolean().optional(),
          cache_expires_at: z.date().optional(),
          score_qualidade_dados: z.number().optional(),
          validacao_cnpj: z.boolean().optional(),
          validacao_email: z.boolean().optional(),
          validacao_telefone: z.boolean().optional(),
          campos_faltantes: z.string().optional(),
          ultima_validacao: z.date().optional(),
          status_qualificacao_id: z.number().optional(),
          enriquecido: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await entidadeDAL.updateEntidade(input.id, input.data);
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
      return await entidadeDAL.deleteEntidade(input.id, input.deleted_by);
    }),
});
