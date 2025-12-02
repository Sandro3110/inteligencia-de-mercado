import { z } from 'zod';
import { router, publicProcedure } from './index';
import * as DAL from '../dal';

export const pesquisasRouter = router({
  // Listar pesquisas
  list: publicProcedure
    .input(
      z.object({
        projetoId: z.number().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        busca: z.string().optional(),
        status: z
          .enum(['pendente', 'em_progresso', 'concluida', 'falhou', 'cancelada'])
          .optional(),
        orderBy: z.enum(['nome', 'created_at']).default('created_at'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ input }) => {
      const result = await DAL.Pesquisa.getPesquisas({
        projetoId: input.projetoId,
        page: input.page,
        limit: input.limit,
        busca: input.busca,
        status: input.status,
        orderBy: input.orderBy,
        orderDirection: input.orderDirection,
      });

      return result;
    }),

  // Buscar pesquisa por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const pesquisa = await DAL.Pesquisa.getPesquisaById(input.id);
      if (!pesquisa) {
        throw new Error('Pesquisa não encontrada');
      }
      return pesquisa;
    }),

  // Listar pesquisas de um projeto
  getByProjeto: publicProcedure
    .input(z.object({ projetoId: z.number() }))
    .query(async ({ input }) => {
      const pesquisas = await DAL.Pesquisa.getPesquisasByProjeto(input.projetoId);
      return pesquisas;
    }),

  // Criar pesquisa
  create: publicProcedure
    .input(
      z.object({
        projetoId: z.number(),
        nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
        descricao: z.string().max(500).optional(),
        objetivo: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error('É necessário estar autenticado');
      }
      const userId = ctx.userId;

      const pesquisa = await DAL.Pesquisa.createPesquisa({
        projeto_id: input.projetoId,
        nome: input.nome,
        descricao: input.descricao,
        objetivo: input.objetivo,
        created_by: userId,
      });

      return pesquisa;
    }),

  // Atualizar pesquisa
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(3).max(100).optional(),
        descricao: z.string().max(500).optional(),
        objetivo: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error('É necessário estar autenticado');
      }
      const userId = ctx.userId;

      const pesquisa = await DAL.Pesquisa.updatePesquisa(
        input.id,
        {
          nome: input.nome,
          descricao: input.descricao,
          objetivo: input.objetivo,
        },
        userId
      );

      return pesquisa;
    }),

  // Iniciar pesquisa
  start: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error('É necessário estar autenticado');
      }
      const userId = ctx.userId;

      const pesquisa = await DAL.Pesquisa.iniciarPesquisa(input.id, userId);
      return pesquisa;
    }),

  // Concluir pesquisa
  complete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        totalEntidades: z.number().min(0),
        entidadesEnriquecidas: z.number().min(0),
        entidadesFalhadas: z.number().min(0),
        qualidadeMedia: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error('É necessário estar autenticado');
      }
      const userId = ctx.userId;

      const pesquisa = await DAL.Pesquisa.concluirPesquisa(
        input.id,
        {
          total_entidades: input.totalEntidades,
          entidades_enriquecidas: input.entidadesEnriquecidas,
          entidades_falhadas: input.entidadesFalhadas,
          qualidade_media: input.qualidadeMedia,
        },
        userId
      );

      return pesquisa;
    }),

  // Cancelar pesquisa
  cancel: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error('É necessário estar autenticado');
      }
      const userId = ctx.userId;

      const pesquisa = await DAL.Pesquisa.cancelarPesquisa(input.id, userId);
      return pesquisa;
    }),

  // Deletar pesquisa (soft delete)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error('É necessário estar autenticado');
      }
      const userId = ctx.userId;

      await DAL.Pesquisa.deletePesquisa(input.id, userId);
      return { success: true };
    }),

  // Listar pesquisas em progresso
  listEmProgresso: publicProcedure.query(async () => {
    const pesquisas = await DAL.Pesquisa.getPesquisasEmProgresso();
    return pesquisas;
  }),

  // Listar pesquisas concluídas
  listConcluidas: publicProcedure
    .input(z.object({ projetoId: z.number().optional() }))
    .query(async ({ input }) => {
      const pesquisas = await DAL.Pesquisa.getPesquisasConcluidas(input.projetoId);
      return pesquisas;
    }),
});
