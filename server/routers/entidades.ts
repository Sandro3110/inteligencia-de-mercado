import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as entidadeDAL from '../dal/dimensoes/entidade';

export const entidadesRouter = router({
  // Listar entidades
  list: publicProcedure
    .input(
      z.object({
        busca: z.string().optional(),
        tipo: z.enum(['cliente', 'lead', 'concorrente']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await entidadeDAL.getEntidades({
        busca: input.busca,
        tipoEntidade: input.tipo,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  // Buscar por ID
  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await entidadeDAL.getEntidadeById(input);
  }),

  // Buscar por CNPJ
  getByCNPJ: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await entidadeDAL.getEntidadeByCNPJ(input);
  }),

  // Criar entidade
  create: publicProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        tipoEntidade: z.enum(['cliente', 'lead', 'concorrente']),
        cnpj: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        site: z.string().url().optional(),
        importacaoId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await entidadeDAL.createEntidade({
        ...input,
        origemTipo: 'manual',
        createdBy: ctx.userId || 'sistema',
      });
    }),

  // Atualizar entidade
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        cnpj: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await entidadeDAL.updateEntidade(id, data);
    }),

  // Deletar entidade
  delete: publicProcedure.input(z.number()).mutation(async ({ input }) => {
    await entidadeDAL.deleteEntidade(input);
    return { success: true };
  }),

  // Sugerir merge (deduplicação)
  suggestMerge: publicProcedure.input(z.number()).query(async ({ input }) => {
    const entidade = await entidadeDAL.getEntidadeById(input);
    if (!entidade) throw new Error('Entidade não encontrada');
    return await entidadeDAL.sugerirMerge(entidade);
  }),
});
