import { z } from 'zod';
import { router, publicProcedure } from './index';
import * as DAL from '../dal';

export const projetosRouter = router({
  // Listar projetos do usuário
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        busca: z.string().optional(),
        status: z.enum(['ativo', 'inativo', 'arquivado']).optional(),
        orderBy: z.enum(['nome', 'created_at']).default('created_at'),
        orderDirection: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ input, ctx }) => {
      // TODO: Pegar ownerId do ctx.user quando autenticação estiver implementada
      const ownerId = 'temp-owner-id';

      const result = await DAL.Projeto.getProjetos({
        ownerId,
        page: input.page,
        limit: input.limit,
        busca: input.busca,
        status: input.status,
        orderBy: input.orderBy,
        orderDirection: input.orderDirection,
      });

      return result;
    }),

  // Buscar projeto por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const projeto = await DAL.Projeto.getProjetoById(input.id);
      if (!projeto) {
        throw new Error('Projeto não encontrado');
      }
      return projeto;
    }),

  // Criar projeto
  create: publicProcedure
    .input(
      z.object({
        nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
        codigo: z.string().min(2).max(20).optional(),
        descricao: z.string().max(500).optional(),
        centroCusto: z.string().max(50).optional(),
        unidadeNegocio: z.string().max(100).optional(),
        orcamento: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Pegar ownerId do ctx.user
      const ownerId = 'temp-owner-id';

      const projeto = await DAL.Projeto.createProjeto({
        nome: input.nome,
        codigo: input.codigo,
        descricao: input.descricao,
        centro_custo: input.centroCusto,
        unidade_negocio: input.unidadeNegocio,
        orcamento: input.orcamento,
        owner_id: ownerId,
      });

      return projeto;
    }),

  // Atualizar projeto
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(3).max(100).optional(),
        descricao: z.string().max(500).optional(),
        centroCusto: z.string().max(50).optional(),
        unidadeNegocio: z.string().max(100).optional(),
        orcamento: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Pegar userId do ctx.user
      const userId = 'temp-user-id';

      const projeto = await DAL.Projeto.updateProjeto(
        input.id,
        {
          nome: input.nome,
          descricao: input.descricao,
          centro_custo: input.centroCusto,
          unidade_negocio: input.unidadeNegocio,
          orcamento: input.orcamento,
        },
        userId
      );

      return projeto;
    }),

  // Arquivar projeto
  archive: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Pegar userId do ctx.user
      const userId = 'temp-user-id';

      const projeto = await DAL.Projeto.arquivarProjeto(input.id, userId);
      return projeto;
    }),

  // Ativar projeto
  activate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Pegar userId do ctx.user
      const userId = 'temp-user-id';

      const projeto = await DAL.Projeto.ativarProjeto(input.id, userId);
      return projeto;
    }),

  // Inativar projeto
  deactivate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Pegar userId do ctx.user
      const userId = 'temp-user-id';

      const projeto = await DAL.Projeto.inativarProjeto(input.id, userId);
      return projeto;
    }),

  // Deletar projeto (soft delete)
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Pegar userId do ctx.user
      const userId = 'temp-user-id';

      await DAL.Projeto.deleteProjeto(input.id, userId);
      return { success: true };
    }),

  // Listar projetos ativos
  listAtivos: publicProcedure.query(async ({ ctx }) => {
    // TODO: Pegar ownerId do ctx.user
    const ownerId = 'temp-owner-id';

    const projetos = await DAL.Projeto.getProjetosAtivos(ownerId);
    return projetos;
  }),
});
