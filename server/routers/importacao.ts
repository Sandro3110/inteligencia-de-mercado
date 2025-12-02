import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as importacaoDAL from '../dal/importacao';

export const importacaoRouter = router({
  // Criar importação
  create: publicProcedure
    .input(
      z.object({
        projetoId: z.number(),
        pesquisaId: z.number(),
        nomeArquivo: z.string(),
        tipoArquivo: z.enum(['csv', 'xlsx']),
        totalLinhas: z.number(),
        mapeamentoColunas: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await importacaoDAL.createImportacao({
        ...input,
        createdBy: ctx.userId || 'sistema',
      });
    }),

  // Listar importações
  list: publicProcedure
    .input(
      z.object({
        projetoId: z.number().optional(),
        pesquisaId: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await importacaoDAL.getImportacoes(input);
    }),

  // Buscar por ID
  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await importacaoDAL.getImportacaoById(input);
  }),

  // Iniciar processamento
  start: publicProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    return await importacaoDAL.iniciarImportacao(input, ctx.userId || 'sistema');
  }),

  // Atualizar progresso
  updateProgress: publicProcedure
    .input(
      z.object({
        id: z.number(),
        linhasProcessadas: z.number(),
        linhasSucesso: z.number(),
        linhasErro: z.number(),
        linhasDuplicadas: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await importacaoDAL.atualizarProgresso(
        id,
        data.linhasProcessadas,
        data.linhasSucesso,
        data.linhasErro,
        data.linhasDuplicadas
      );
    }),

  // Concluir
  complete: publicProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    return await importacaoDAL.concluirImportacao(input, ctx.userId || 'sistema');
  }),

  // Falhar
  fail: publicProcedure
    .input(z.object({ id: z.number(), erro: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await importacaoDAL.falharImportacao(input.id, input.erro, ctx.userId || 'sistema');
    }),

  // Cancelar
  cancel: publicProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    return await importacaoDAL.cancelarImportacao(input, ctx.userId || 'sistema');
  }),

  // Buscar erros
  getErros: publicProcedure
    .input(z.object({ importacaoId: z.number(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await importacaoDAL.getErrosByImportacao(input.importacaoId, input.limit);
    }),

  // Estatísticas
  getEstatisticas: publicProcedure.input(z.number()).query(async ({ input }) => {
    return await importacaoDAL.getEstatisticasImportacao(input);
  }),

  // Entidades da importação
  getEntidades: publicProcedure
    .input(z.object({ importacaoId: z.number(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await importacaoDAL.getEntidadesByImportacao(input.importacaoId, input.limit);
    }),
});
