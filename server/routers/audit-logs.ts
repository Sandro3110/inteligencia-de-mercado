import { z } from 'zod';
import { router } from './index';
import { requirePermission } from '../middleware/auth';
import { Permission } from '@shared/types/permissions';
import * as auditLogsDAL from '../dal/audit-logs';

/**
 * Router de Audit Logs
 * Gerencia histórico de alterações
 */
export const auditLogsRouter = router({
  // Listar logs recentes
  // Permissão: ADMIN (auditoria é sensível)
  getRecentes: requirePermission(Permission.ADMIN)
    .input(z.object({ limite: z.number().default(100) }))
    .query(async ({ input }) => {
      return await auditLogsDAL.getLogsRecentes(input.limite);
    }),

  // Buscar histórico de um registro
  // Permissão: ENTIDADE_READ (pode ver histórico de entidades)
  getHistorico: requirePermission(Permission.ENTIDADE_READ)
    .input(
      z.object({
        tabela: z.enum([
          'dim_entidade',
          'dim_produto',
          'dim_mercado',
          'dim_produto_catalogo',
          'fato_entidade_produto',
          'fato_produto_mercado',
          'fato_entidade_contexto',
          'dim_importacao',
        ]),
        registroId: z.number(),
        limite: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.getHistoricoRegistro({
        tabela: input.tabela,
        registroId: input.registroId,
        limite: input.limite,
      });
    }),

  // Buscar histórico de entidade
  // Permissão: ENTIDADE_READ
  getHistoricoEntidade: requirePermission(Permission.ENTIDADE_READ)
    .input(z.object({ entidadeId: z.number(), limite: z.number().default(50) }))
    .query(async ({ input }) => {
      return await auditLogsDAL.getHistoricoEntidade(input.entidadeId, input.limite);
    }),

  // Buscar logs por usuário
  // Permissão: ADMIN
  getByUsuario: requirePermission(Permission.ADMIN)
    .input(z.object({ usuarioId: z.string(), limite: z.number().default(100) }))
    .query(async ({ input }) => {
      return await auditLogsDAL.getLogsByUsuario(input.usuarioId, input.limite);
    }),

  // Buscar logs por tabela
  // Permissão: ADMIN
  getByTabela: requirePermission(Permission.ADMIN)
    .input(
      z.object({
        tabela: z.enum([
          'dim_entidade',
          'dim_produto',
          'dim_mercado',
          'dim_produto_catalogo',
          'fato_entidade_produto',
          'fato_produto_mercado',
          'fato_entidade_contexto',
          'dim_importacao',
        ]),
        limite: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.getLogsByTabela(input.tabela, input.limite);
    }),

  // Buscar logs por operação
  // Permissão: ADMIN
  getByOperacao: requirePermission(Permission.ADMIN)
    .input(
      z.object({
        operacao: z.enum(['INSERT', 'UPDATE', 'DELETE']),
        limite: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.getLogsByOperacao(input.operacao, input.limite);
    }),

  // Buscar estatísticas
  // Permissão: ADMIN
  getStats: requirePermission(Permission.ADMIN).query(async () => {
    return await auditLogsDAL.getAuditStats();
  }),

  // Comparar versões
  // Permissão: ENTIDADE_READ
  compareVersions: requirePermission(Permission.ENTIDADE_READ)
    .input(
      z.object({
        tabela: z.enum([
          'dim_entidade',
          'dim_produto',
          'dim_mercado',
          'dim_produto_catalogo',
          'fato_entidade_produto',
          'fato_produto_mercado',
          'fato_entidade_contexto',
          'dim_importacao',
        ]),
        registroId: z.number(),
        version1Id: z.number(),
        version2Id: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.compareVersions({
        tabela: input.tabela,
        registroId: input.registroId,
        version1Id: input.version1Id,
        version2Id: input.version2Id,
      });
    }),

  // Buscar log por ID
  // Permissão: ADMIN
  getById: requirePermission(Permission.ADMIN)
    .input(z.number())
    .query(async ({ input }) => {
      return await auditLogsDAL.getLogById(input);
    }),

  // Buscar logs por período
  // Permissão: ADMIN
  getByPeriodo: requirePermission(Permission.ADMIN)
    .input(
      z.object({
        dataInicio: z.date(),
        dataFim: z.date(),
        limite: z.number().default(1000),
      })
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.getLogsByPeriodo(
        input.dataInicio,
        input.dataFim,
        input.limite
      );
    }),

  // Buscar logs com filtros avançados
  // Permissão: ADMIN
  getComFiltros: requirePermission(Permission.ADMIN)
    .input(
      z.object({
        tabela: z
          .enum([
            'dim_entidade',
            'dim_produto',
            'dim_mercado',
            'dim_produto_catalogo',
            'fato_entidade_produto',
            'fato_produto_mercado',
            'fato_entidade_contexto',
            'dim_importacao',
          ])
          .optional(),
        operacao: z.enum(['INSERT', 'UPDATE', 'DELETE']).optional(),
        usuarioId: z.string().optional(),
        registroId: z.number().optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        limite: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.getLogsComFiltros(input);
    }),

  // Contar total de logs
  // Permissão: ADMIN
  count: requirePermission(Permission.ADMIN).query(async () => {
    return await auditLogsDAL.countLogs();
  }),

  // Contar logs por tabela
  // Permissão: ADMIN
  countByTabela: requirePermission(Permission.ADMIN)
    .input(
      z.enum([
        'dim_entidade',
        'dim_produto',
        'dim_mercado',
        'dim_produto_catalogo',
        'fato_entidade_produto',
        'fato_produto_mercado',
        'fato_entidade_contexto',
        'dim_importacao',
      ])
    )
    .query(async ({ input }) => {
      return await auditLogsDAL.countLogsByTabela(input);
    }),

  // Buscar usuários mais ativos
  // Permissão: ADMIN
  getUsuariosMaisAtivos: requirePermission(Permission.ADMIN)
    .input(z.object({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      return await auditLogsDAL.getUsuariosMaisAtivos(input.limite);
    }),

  // Buscar tabelas mais alteradas
  // Permissão: ADMIN
  getTabelasMaisAlteradas: requirePermission(Permission.ADMIN)
    .input(z.object({ limite: z.number().default(10) }))
    .query(async ({ input }) => {
      return await auditLogsDAL.getTabelasMaisAlteradas(input.limite);
    }),

  // Buscar atividade por hora
  // Permissão: ADMIN
  getAtividadePorHora: requirePermission(Permission.ADMIN).query(async () => {
    return await auditLogsDAL.getAtividadePorHora();
  }),

  // Limpar logs antigos (manutenção)
  // Permissão: ADMIN
  cleanup: requirePermission(Permission.ADMIN)
    .input(z.object({ retentionDays: z.number().default(365) }))
    .mutation(async ({ input }) => {
      const deletedCount = await auditLogsDAL.cleanupOldLogs(input.retentionDays);
      return { deletedCount };
    }),
});
