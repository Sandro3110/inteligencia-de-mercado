/**
 * Index principal de routers tRPC
 * Criado do zero - 100% sincronizado com:
 * - PostgreSQL (33 tabelas, 477 campos)
 * - Schema Drizzle ORM
 * - 33 DALs reconstruídos
 * - Índices otimizados
 * - 33 Routers criados manualmente
 * 
 * Estrutura:
 * - Dimensões: 13 routers
 * - Fatos: 3 routers
 * - IA: 5 routers
 * - Sistema: 9 routers
 * - Audit: 2 routers
 * - Backup: 1 router
 */

import { router } from "./trpc";

// ========== DASHBOARD ==========
import { dashboardRouter } from "./dashboard";

// ========== ROUTERS PLURAIS (legados) ==========
import { projetosRouter } from "./projetos";
import { pesquisasRouter } from "./pesquisas";
import { entidadesRouter } from "./entidades";

// ========== DIMENSÕES (13) ==========
import { entidadeRouter } from "./entidade";
import { geografiaRouter } from "./geografia";
import { mercadoRouter } from "./mercado";
import { produtoRouter } from "./produto";
import { projetoRouter } from "./projeto";
import { pesquisaRouter } from "./pesquisa";
import { concorrenteRouter } from "./concorrente";
import { canalRouter } from "./canal";
import { leadRouter } from "./lead";
import { tempoRouter } from "./tempo";
import { importacaoRouter } from "./importacao";
import { statusQualificacaoRouter } from "./status-qualificacao";
import { produtoCatalogoRouter } from "./produto-catalogo";

// ========== FATOS (3) ==========
import { entidadeProdutoRouter } from "./entidade-produto";
import { entidadeCompetidorRouter } from "./entidade-competidor";
import { entidadeContextoRouter } from "./entidade-contexto";

// ========== IA (5) ==========
import { iaAlertasRouter } from "./ia-alertas";
import { iaCacheRouter } from "./ia-cache";
import { iaConfigRouter } from "./ia-config";
import { iaConfigHistoricoRouter } from "./ia-config-historico";
import { iaUsageRouter } from "./ia-usage";

// ========== SISTEMA (9) ==========
import { usersRouter } from "./users";
import { userProfilesRouter } from "./user-profiles";
import { rolesRouter } from "./roles";
import { systemSettingsRouter } from "./system-settings";
import { rateLimitsRouter } from "./rate-limits";
import { alertasSegurancaRouter } from "./alertas-seguranca";
import { usuariosBloqueadosRouter } from "./usuarios-bloqueados";
import { importacaoErrosRouter } from "./importacao-erros";
import { cidadesBrasilRouter } from "./cidades-brasil";

// ========== AUDIT (2) ==========
import { auditLogsRouter } from "./audit-logs";
import { dataAuditLogsRouter } from "./data-audit-logs";

// ========== BACKUP (1) ==========
import { produtoOldBackupRouter } from "./produto-old-backup";

/**
 * Router principal da aplicação
 * Agrega todos os 33 routers em uma única interface tRPC
 */
export const appRouter = router({
  // Dashboard
  dashboard: dashboardRouter,

  // Routers plurais (legados - manter compatibilidade)
  projetos: projetosRouter,
  pesquisas: pesquisasRouter,
  entidades: entidadesRouter,

  // Dimensões (13)
  entidade: entidadeRouter,
  geografia: geografiaRouter,
  mercado: mercadoRouter,
  produto: produtoRouter,
  projeto: projetoRouter,
  pesquisa: pesquisaRouter,
  concorrente: concorrenteRouter,
  canal: canalRouter,
  lead: leadRouter,
  tempo: tempoRouter,
  importacao: importacaoRouter,
  statusQualificacao: statusQualificacaoRouter,
  produtoCatalogo: produtoCatalogoRouter,

  // Fatos (3)
  entidadeProduto: entidadeProdutoRouter,
  entidadeCompetidor: entidadeCompetidorRouter,
  entidadeContexto: entidadeContextoRouter,

  // IA (5)
  iaAlertas: iaAlertasRouter,
  iaCache: iaCacheRouter,
  iaConfig: iaConfigRouter,
  iaConfigHistorico: iaConfigHistoricoRouter,
  iaUsage: iaUsageRouter,

  // Sistema (9)
  users: usersRouter,
  userProfiles: userProfilesRouter,
  roles: rolesRouter,
  systemSettings: systemSettingsRouter,
  rateLimits: rateLimitsRouter,
  alertasSeguranca: alertasSegurancaRouter,
  usuariosBloqueados: usuariosBloqueadosRouter,
  importacaoErros: importacaoErrosRouter,
  cidadesBrasil: cidadesBrasilRouter,

  // Audit (2)
  auditLogs: auditLogsRouter,
  dataAuditLogs: dataAuditLogsRouter,

  // Backup (1)
  produtoOldBackup: produtoOldBackupRouter,
});

/**
 * Tipo exportado para uso no cliente tRPC
 */
export type AppRouter = typeof appRouter;
