import { z } from 'zod';
import { router } from './index';
import { requirePermission } from '../middleware/auth';
import { Permission } from '@/shared/types/permissions';
import * as DAL from '../dal';

/**
 * Router de Pesquisas
 * FASE 1 - Sessão 1.3: RBAC aplicado
 */
export const pesquisasRouter = router({
  // Listar pesquisas
  // Permissão: PESQUISA_READ
  list: requirePermission(Permission.PESQUISA_READ)
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
  // Permissão: PESQUISA_READ
  getById: requirePermission(Permission.PESQUISA_READ)
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const pesquisa = await DAL.Pesquisa.getPesquisaById(input.id);
      if (!pesquisa) {
        throw new Error('Pesquisa não encontrada');
      }
      return pesquisa;
    }),

  // Listar pesquisas de um projeto
  // Permissão: PESQUISA_READ
  getByProjeto: requirePermission(Permission.PESQUISA_READ)
    .input(z.object({ projetoId: z.number() }))
    .query(async ({ input }) => {
      const pesquisas = await DAL.Pesquisa.getPesquisasByProjeto(input.projetoId);
      return pesquisas;
    }),

  // Criar pesquisa
  // Permissão: PESQUISA_CREATE
  create: requirePermission(Permission.PESQUISA_CREATE)
    .input(
      z.object({
        projetoId: z.number(),
        nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
        descricao: z.string().max(500).optional(),
        tipo: z.enum(['clientes', 'concorrentes', 'leads', 'fornecedores', 'outros']).optional(),
        limiteResultados: z.number().min(1).max(10000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Construir objetivo com tipo e limite
      const objetivoParts = [];
      if (input.tipo) {
        objetivoParts.push(`Tipo: ${input.tipo}`);
      }
      if (input.limiteResultados) {
        objetivoParts.push(`Limite: ${input.limiteResultados} resultados`);
      }
      const objetivo = objetivoParts.length > 0 ? objetivoParts.join(' | ') : undefined;

      const novaPesquisa = await DAL.Pesquisa.createPesquisa({
        projetoId: input.projetoId,
        nome: input.nome,
        descricao: input.descricao,
        objetivo,
        status: 'pendente',
        createdBy: 1, // TODO: Implementar mapeamento de user UUID para integer ID
      });

      return novaPesquisa;
    }),

  // Atualizar pesquisa
  // Permissão: PESQUISA_UPDATE
  update: requirePermission(Permission.PESQUISA_UPDATE)
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(3).max(100).optional(),
        descricao: z.string().max(500).optional(),
        fontes: z.array(z.string()).optional(),
        palavras_chave: z.array(z.string()).optional(),
        filtros: z.record(z.any()).optional(),
        status: z
          .enum(['pendente', 'em_progresso', 'concluida', 'falhou', 'cancelada'])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const pesquisaAtualizada = await DAL.Pesquisa.updatePesquisa(input.id, {
        nome: input.nome,
        descricao: input.descricao,
        fontes: input.fontes,
        palavras_chave: input.palavras_chave,
        filtros: input.filtros,
        status: input.status,
      });

      if (!pesquisaAtualizada) {
        throw new Error('Pesquisa não encontrada');
      }

      return pesquisaAtualizada;
    }),

  // Deletar pesquisa
  // Permissão: PESQUISA_DELETE
  delete: requirePermission(Permission.PESQUISA_DELETE)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const deletado = await DAL.Pesquisa.deletePesquisa(input.id);
      if (!deletado) {
        throw new Error('Pesquisa não encontrada');
      }
      return { success: true };
    }),

  // Iniciar pesquisa
  // Permissão: PESQUISA_START
  start: requirePermission(Permission.PESQUISA_START)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const pesquisa = await DAL.Pesquisa.updatePesquisa(input.id, {
        status: 'em_progresso',
      });

      if (!pesquisa) {
        throw new Error('Pesquisa não encontrada');
      }

      // TODO: Iniciar job de pesquisa em background

      return pesquisa;
    }),

  // Parar pesquisa
  // Permissão: PESQUISA_STOP
  stop: requirePermission(Permission.PESQUISA_STOP)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const pesquisa = await DAL.Pesquisa.updatePesquisa(input.id, {
        status: 'cancelada',
      });

      if (!pesquisa) {
        throw new Error('Pesquisa não encontrada');
      }

      // TODO: Cancelar job de pesquisa em background

      return pesquisa;
    }),
});
