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
import { cacheRouter } from "./cache";
import { configRouter } from "./config";
import { config_historicoRouter } from "./config-historico";
import { usageRouter } from "./usage";

// Sistema (9)
import { usersRouter } from "./users";
import { user_profilesRouter } from "./user-profiles";
import { rolesRouter } from "./roles";
import { system_settingsRouter } from "./system-settings";
import { rate_limitsRouter } from "./rate-limits";
import { alertas_segurancaRouter } from "./alertas-seguranca";
import { usuarios_bloqueadosRouter } from "./usuarios-bloqueados";
import { importacao_errosRouter } from "./importacao-erros";
import { cidades_brasilRouter } from "./cidades-brasil";

// Audit (2)
import { audit_logsRouter } from "./audit-logs";
import { data_audit_logsRouter } from "./data-audit-logs";

// Backup (1)
import { produto_old_backupRouter } from "./produto-old-backup";

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
  iaCache: cacheRouter,
  iaConfig: configRouter,
  iaConfigHistorico: config_historicoRouter,
  iaUsage: usageRouter,
  
  // Sistema
  users: usersRouter,
  userProfiles: user_profilesRouter,
  roles: rolesRouter,
  systemSettings: system_settingsRouter,
  rateLimits: rate_limitsRouter,
  alertasSeguranca: alertas_segurancaRouter,
  usuariosBloqueados: usuarios_bloqueadosRouter,
  importacaoErros: importacao_errosRouter,
  cidadesBrasil: cidades_brasilRouter,
  
  // Audit
  auditLogs: audit_logsRouter,
  dataAuditLogs: data_audit_logsRouter,
  
  // Backup
  produtoOldBackup: produto_old_backupRouter,
});

export type AppRouter = typeof appRouter;
