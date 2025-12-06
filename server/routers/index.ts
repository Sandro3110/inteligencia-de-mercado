/**
 * Index principal dos routers tRPC
 * 33 routers sincronizados 100% com PostgreSQL, Schema Drizzle e DALs
 */

import { router } from "./trpc";

// Dimensões (13)
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

// Fatos (3)
import { entidadeProdutoRouter } from "./entidade-produto";
import { entidadeCompetidorRouter } from "./entidade-competidor";
import { entidadeContextoRouter } from "./entidade-contexto";

// IA (5)
import { iaAlertasRouter } from "./ia-alertas";
import { iaCacheRouter } from "./ia-cache";
import { iaConfigRouter } from "./ia-config";
import { iaConfigHistoricoRouter } from "./ia-config-historico";
import { iaUsageRouter } from "./ia-usage";

// Sistema (9)
import { usersRouter } from "./users";
import { userProfilesRouter } from "./user-profiles";
import { rolesRouter } from "./roles";
import { systemSettingsRouter } from "./system-settings";
import { rateLimitsRouter } from "./rate-limits";
import { alertasSegurancaRouter } from "./alertas-seguranca";
import { usuariosBloqueadosRouter } from "./usuarios-bloqueados";
import { importacaoErrosRouter } from "./importacao-erros";
import { cidadesBrasilRouter } from "./cidades-brasil";

// Audit (2)
import { auditLogsRouter } from "./audit-logs";
import { dataAuditLogsRouter } from "./data-audit-logs";

// Backup (1)
import { produtoOldBackupRouter } from "./produto-old-backup";

export const appRouter = router({
  // Dimensões
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
  
  // Fatos
  entidadeProduto: entidadeProdutoRouter,
  entidadeCompetidor: entidadeCompetidorRouter,
  entidadeContexto: entidadeContextoRouter,
  
  // IA
  iaAlertas: iaAlertasRouter,
  iaCache: iaCacheRouter,
  iaConfig: iaConfigRouter,
  iaConfigHistorico: iaConfigHistoricoRouter,
  iaUsage: iaUsageRouter,
  
  // Sistema
  users: usersRouter,
  userProfiles: userProfilesRouter,
  roles: rolesRouter,
  systemSettings: systemSettingsRouter,
  rateLimits: rateLimitsRouter,
  alertasSeguranca: alertasSegurancaRouter,
  usuariosBloqueados: usuariosBloqueadosRouter,
  importacaoErros: importacaoErrosRouter,
  cidadesBrasil: cidadesBrasilRouter,
  
  // Audit
  auditLogs: auditLogsRouter,
  dataAuditLogs: dataAuditLogsRouter,
  
  // Backup
  produtoOldBackup: produtoOldBackupRouter,
});

export type AppRouter = typeof appRouter;
