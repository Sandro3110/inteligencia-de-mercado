import { z } from 'zod';
import { router } from './index';
import { requirePermission } from '../middleware/auth';
import { Permission } from '@shared/types/permissions';
import * as entidadeDAL from '../dal/dimensoes/entidade';

/**
 * Router de Entidades (Lista)
 * FASE 1 - Sessão 1.3: RBAC aplicado
 */
export const entidadesRouter = router({
  // Listar entidades
  // Permissão: ENTIDADE_READ
  list: requirePermission(Permission.ENTIDADE_READ)
    .input(
      z.object({
        busca: z.string().optional(),
        tipo: z.enum(['cliente', 'lead', 'concorrente']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // Converter offset para page (page começa em 1)
      const page = Math.floor(input.offset / input.limit) + 1;
      return await entidadeDAL.getEntidades({
        busca: input.busca,
        tipoEntidade: input.tipo,
        limit: input.limit,
        page: page,
      });
    }),

  // Buscar por ID
  // Permissão: ENTIDADE_READ
  getById: requirePermission(Permission.ENTIDADE_READ)
    .input(z.number())
    .query(async ({ input }) => {
      return await entidadeDAL.getEntidadeById(input);
    }),

  // Buscar por CNPJ
  // Permissão: ENTIDADE_READ
  getByCNPJ: requirePermission(Permission.ENTIDADE_READ)
    .input(z.string())
    .query(async ({ input }) => {
      return await entidadeDAL.getEntidadeByCNPJ(input);
    }),

  // Criar entidade
  // Permissão: ENTIDADE_UPDATE (criar = editar)
  create: requirePermission(Permission.ENTIDADE_UPDATE)
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
        createdBy: ctx.userId,
      });
    }),

  // Atualizar entidade
  // Permissão: ENTIDADE_UPDATE
  update: requirePermission(Permission.ENTIDADE_UPDATE)
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
  // Permissão: ENTIDADE_DELETE
  delete: requirePermission(Permission.ENTIDADE_DELETE)
    .input(z.number())
    .mutation(async ({ input }) => {
      await entidadeDAL.deleteEntidade(input);
      return { success: true };
    }),

  // Sugerir merge (deduplicação)
  // Permissão: ENTIDADE_READ
  suggestMerge: requirePermission(Permission.ENTIDADE_READ)
    .input(z.number())
    .query(async ({ input }) => {
      const entidade = await entidadeDAL.getEntidadeById(input);
      if (!entidade) throw new Error('Entidade não encontrada');
      return await entidadeDAL.sugerirMerge(entidade);
    }),
});
