/**
 * App Router - Router principal do tRPC
 * Agrega todos os sub-routers da aplicação
 */

import { createTRPCRouter } from '@/lib/trpc/server';

// Importar todos os routers
import { authRouter } from './authRouter';
import { usersRouter } from './usersRouter';
import { geocodingRouter } from './geocodingRouter';
import { territorialRouter } from './territorialRouter';
import { reportsRouter } from './reportsRouter';
import { exportRouter } from './exportRouter';
import { unifiedMapRouter } from './unifiedMapRouter';
import { emailConfigRouter } from './emailConfigRouter';
import { projectsRouter } from './projects';
import { pesquisasRouter } from './pesquisas';
import { mercadosRouter } from './mercados';
import { leadsRouter } from './leads';
import { dashboardRouter } from './dashboard';
import { analyticsRouter } from './analytics';
import { enrichmentRouter } from './enrichment';
import { recommendationsRouter } from './recommendations';
import { alertsRouter } from './alerts';
import { clientesRouter } from './clientes';
import { concorrentesRouter } from './concorrentes';
import { reportsRouter as premiumReportsRouter } from './reports';
import { settingsRouter } from './settings';

/**
 * Router raiz da aplicação
 * Todos os routers são agregados aqui
 */
export const appRouter = createTRPCRouter({
  // Autenticação e usuários
  auth: authRouter,
  users: usersRouter,

  // Geocodificação e mapas
  geocoding: geocodingRouter,
  territorial: territorialRouter,
  unifiedMap: unifiedMapRouter,

  // Relatórios e exportação
  reports: reportsRouter,
  export: exportRouter,

  // Configurações
  emailConfig: emailConfigRouter,

  // Projetos
  projects: projectsRouter,

  // Pesquisas
  pesquisas: pesquisasRouter,

  // Mercados
  mercados: mercadosRouter,

  // Leads
  leads: leadsRouter,

  // Dashboard
  dashboard: dashboardRouter,

  // Analytics
  analytics: analyticsRouter,

  // Enrichment
  enrichment: enrichmentRouter,

  // Recommendations
  recommendations: recommendationsRouter,

  // Premium Reports
  premiumReports: premiumReportsRouter,

  // Alerts
  alerts: alertsRouter,

  // Clientes
  clientes: clientesRouter,

  // Concorrentes
  concorrentes: concorrentesRouter,

  // Settings
  settings: settingsRouter,
});

/**
 * Tipo do router para uso no cliente
 */
export type AppRouter = typeof appRouter;
