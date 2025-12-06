/**
 * Router para dim_produto_old_backup
 * Sincronizado 100% com DAL e Schema PostgreSQL (22 campos)
 * 
 * ⚠️ TABELA DE BACKUP - Não usar em produção
 * 
 * Funções DAL:
 * - getProdutosOldBackup(filters)
 * - getProdutoOldBackupById(id)
 * - createProdutoOldBackup(data)
 * - updateProdutoOldBackup(id, data)
 * - deleteProdutoOldBackup(id, deleted_by?)
 * - countProdutosOldBackup(filters)
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as produtoOldBackupDAL from "../dal/backup/produto-old-backup";

export const produtoOldBackupRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await produtoOldBackupDAL.getProdutoOldBackupById(input.id);
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        id: z.number().optional(),
        entidade_id: z.number().optional(),
        nome: z.string().optional(),
        categoria: z.string().optional(),
        status: z.string().optional(),
        incluirInativos: z.boolean().optional(),
        orderBy: z.string().optional(),
        orderDirection: z.enum(['asc', 'desc']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await produtoOldBackupDAL.getProdutosOldBackup(input || {});
    }),

  count: publicProcedure
    .input(
      z.object({
        entidade_id: z.number().optional(),
        incluirInativos: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await produtoOldBackupDAL.countProdutosOldBackup(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        nome: z.string(),
        created_by: z.string(),
        categoria: z.string().optional(),
        descricao: z.string().optional(),
        preco: z.string().optional(),
        moeda: z.string().optional(),
        disponibilidade: z.string().optional(),
        especificacoes_tecnicas: z.string().optional(),
        diferenciais_competitivos: z.string().optional(),
        publico_alvo: z.string().optional(),
        canais_distribuicao: z.string().optional(),
        status: z.string().optional(),
        data_lancamento: z.date().optional(),
        ciclo_vida: z.string().optional(),
        margem_lucro: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await produtoOldBackupDAL.createProdutoOldBackup(input);
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          categoria: z.string().optional(),
          descricao: z.string().optional(),
          preco: z.string().optional(),
          moeda: z.string().optional(),
          disponibilidade: z.string().optional(),
          especificacoes_tecnicas: z.string().optional(),
          diferenciais_competitivos: z.string().optional(),
          updated_by: z.string().optional(),
          publico_alvo: z.string().optional(),
          canais_distribuicao: z.string().optional(),
          status: z.string().optional(),
          data_lancamento: z.date().optional(),
          ciclo_vida: z.string().optional(),
          margem_lucro: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await produtoOldBackupDAL.updateProdutoOldBackup(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await produtoOldBackupDAL.deleteProdutoOldBackup(input.id, input.deleted_by);
    }),
});
