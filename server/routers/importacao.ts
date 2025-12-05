import { z } from 'zod';
import { router } from './index';
import { requirePermission } from '../middleware/auth';
import { Permission } from '@shared/types/permissions';
import * as importacaoDAL from '../dal/importacao';
import { processarImportacaoCompleta, DadosEntidade } from '../lib/processar-importacao';

/**
 * Router de Importação
 * FASE 1 - Sessão 1.3: RBAC aplicado
 */
export const importacaoRouter = router({
  // Criar importação
  // Permissão: IMPORTACAO_CREATE
  create: requirePermission(Permission.IMPORTACAO_CREATE)
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
        createdBy: ctx.userId,
      });
    }),

  // Listar importações
  // Permissão: IMPORTACAO_READ
  list: requirePermission(Permission.IMPORTACAO_READ)
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
  // Permissão: IMPORTACAO_READ
  getById: requirePermission(Permission.IMPORTACAO_READ)
    .input(z.number())
    .query(async ({ input }) => {
      return await importacaoDAL.getImportacaoById(input);
    }),

  // Iniciar processamento
  // Permissão: IMPORTACAO_CREATE
  start: requirePermission(Permission.IMPORTACAO_CREATE)
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      return await importacaoDAL.iniciarImportacao(input, ctx.userId);
    }),

  // Atualizar progresso
  // Permissão: IMPORTACAO_CREATE (sistema interno)
  updateProgress: requirePermission(Permission.IMPORTACAO_CREATE)
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
  // Permissão: IMPORTACAO_CREATE
  complete: requirePermission(Permission.IMPORTACAO_CREATE)
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      return await importacaoDAL.concluirImportacao(input, ctx.userId);
    }),

  // Falhar
  // Permissão: IMPORTACAO_CREATE
  fail: requirePermission(Permission.IMPORTACAO_CREATE)
    .input(z.object({ id: z.number(), erro: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await importacaoDAL.falharImportacao(input.id, input.erro, ctx.userId);
    }),

  // Cancelar
  // Permissão: IMPORTACAO_DELETE
  cancel: requirePermission(Permission.IMPORTACAO_DELETE)
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      return await importacaoDAL.cancelarImportacao(input, ctx.userId);
    }),

  // Buscar erros
  // Permissão: IMPORTACAO_READ
  getErros: requirePermission(Permission.IMPORTACAO_READ)
    .input(z.object({ importacaoId: z.number(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await importacaoDAL.getErrosByImportacao(input.importacaoId, input.limit);
    }),

  // Estatísticas
  // Permissão: IMPORTACAO_READ
  getEstatisticas: requirePermission(Permission.IMPORTACAO_READ)
    .input(z.number())
    .query(async ({ input }) => {
      return await importacaoDAL.getEstatisticasImportacao(input);
    }),

  // Entidades da importação
  // Permissão: IMPORTACAO_READ
  getEntidades: requirePermission(Permission.IMPORTACAO_READ)
    .input(z.object({ importacaoId: z.number(), limit: z.number().default(100) }))
    .query(async ({ input }) => {
      return await importacaoDAL.getEntidadesByImportacao(input.importacaoId, input.limit);
    }),

  // Processar importação (INSERT de entidades)
  // Permissão: IMPORTACAO_CREATE
  processar: requirePermission(Permission.IMPORTACAO_CREATE)
    .input(
      z.object({
        importacaoId: z.number(),
        linhas: z.array(
          z.object({
            nome: z.string(),
            tipo_entidade: z.enum(['cliente', 'lead', 'concorrente']),
            cnpj: z.string().optional(),
            cpf: z.string().optional(),
            email: z.string().optional(),
            telefone: z.string().optional(),
            cidade: z.string().optional(),
            uf: z.string().optional(),
            endereco: z.string().optional(),
            website: z.string().optional(),
            porte: z.string().optional(),
            setor: z.string().optional(),
            faturamento_estimado: z.number().optional(),
            num_funcionarios: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const resultado = await processarImportacaoCompleta(
        input.importacaoId,
        input.linhas as DadosEntidade[],
        ctx.userId
      );
      return resultado;
    }),
});
