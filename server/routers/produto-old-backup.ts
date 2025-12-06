/**
 * Router para dim_produto_old_backup
 * Sincronizado 100% com DAL e Schema PostgreSQL
 */

import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import * as dal from "../dal/backup/produto-old-backup";

export const produto_old_backupRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await dal.getProdutoOldBackupById(input.id);
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
      return await dal.getProdutoOldBackups(input || {});
    }),

  create: publicProcedure
    .input(
      z.object({
        entidade_id: z.number(),
        nome: z.string(),
        categoria: z.string().optional(),
        descricao: z.string().optional(),
        preco: z.string().optional(),
        moeda: z.string().optional(),
        disponibilidade: z.string().optional(),
        especificacoes_tecnicas: z.string().optional(),
        diferenciais_competitivos: z.string().optional(),
        created_by: z.string(),
        publico_alvo: z.string().optional(),
        canais_distribuicao: z.string().optional(),
        status: z.string().optional(),
        data_lancamento: z.date().optional(),
        ciclo_vida: z.string().optional(),
        margem_lucro: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.createProdutoOldBackup(input);
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
      return await dal.updateProdutoOldBackup(input.id, input.data);
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        deleted_by: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dal.deleteProdutoOldBackup(input.id, input.deleted_by);
    }),
});
