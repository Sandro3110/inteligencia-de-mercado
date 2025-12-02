import { z } from 'zod';
import { router } from './index';
import { requirePermission } from '../middleware/auth';
import { Permission } from '@shared/types/permissions';
import * as DAL from '../dal';
import { logCreate, logUpdate, logDelete, AuditResource } from '../helpers/audit';

/**
 * Router de Projetos
 * FASE 1 - Sessão 1.3: RBAC aplicado
 */
export const projetosRouter = router({
  // Listar projetos do usuário
  // Permissão: PROJETO_READ
  list: requirePermission(Permission.PROJETO_READ)
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
      const ownerId = ctx.userId;

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
  // Permissão: PROJETO_READ
  getById: requirePermission(Permission.PROJETO_READ)
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const projeto = await DAL.Projeto.getProjetoById(input.id);
      if (!projeto) {
        throw new Error('Projeto não encontrado');
      }
      return projeto;
    }),

  // Criar projeto
  // Permissão: PROJETO_CREATE
  create: requirePermission(Permission.PROJETO_CREATE)
    .input(
      z.object({
        nome: z.string().min(1, 'Nome é obrigatório'),
        descricao: z.string().optional(),
        objetivo: z.string().optional(),
        status: z.enum(['ativo', 'inativo', 'arquivado']).default('ativo'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ownerId = ctx.userId;

      const novoProjeto = await DAL.Projeto.createProjeto({
        nome: input.nome,
        descricao: input.descricao,
        objetivo: input.objetivo,
        status: input.status,
        owner_id: ownerId,
      });

      // Auditoria
      await logCreate(
        ctx.userId,
        AuditResource.PROJETO,
        novoProjeto.id.toString(),
        novoProjeto.nome,
        { status: novoProjeto.status }
      );

      return novoProjeto;
    }),

  // Atualizar projeto
  // Permissão: PROJETO_UPDATE
  update: requirePermission(Permission.PROJETO_UPDATE)
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        objetivo: z.string().optional(),
        status: z.enum(['ativo', 'inativo', 'arquivado']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Buscar projeto antes da atualização
      const projetoAntes = await DAL.Projeto.getProjetoById(input.id);
      
      const projetoAtualizado = await DAL.Projeto.updateProjeto(input.id, {
        nome: input.nome,
        descricao: input.descricao,
        objetivo: input.objetivo,
        status: input.status,
      });

      if (!projetoAtualizado) {
        throw new Error('Projeto não encontrado');
      }

      // Auditoria
      await logUpdate(
        ctx.userId,
        AuditResource.PROJETO,
        input.id.toString(),
        { before: projetoAntes, after: projetoAtualizado }
      );

      return projetoAtualizado;
    }),

  // Deletar projeto
  // Permissão: PROJETO_DELETE
  delete: requirePermission(Permission.PROJETO_DELETE)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Buscar projeto antes de deletar
      const projeto = await DAL.Projeto.getProjetoById(input.id);
      
      const deletado = await DAL.Projeto.deleteProjeto(input.id);
      if (!deletado) {
        throw new Error('Projeto não encontrado');
      }

      // Auditoria
      await logDelete(
        ctx.userId,
        AuditResource.PROJETO,
        input.id.toString(),
        projeto?.nome
      );

      return { success: true };
    }),
});
