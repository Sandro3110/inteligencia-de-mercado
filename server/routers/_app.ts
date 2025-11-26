/**
 * App Router - Router principal do tRPC
 * Agrega todos os sub-routers da aplicação
 */

import { createTRPCRouter } from '@/lib/trpc/server';

// Importar todos os routers
import { authRouter } from './auth';
import { usersRouter } from './users';
import { geocodingRouter } from './geocoding';
import { territorialRouter } from './territorial';
import { reportsRouter } from './reports';
import { exportRouter } from './export';
import { unifiedMapRouter } from './unifiedMap';
import { emailConfigRouter } from './emailConfig';
import { projectsRouter } from './projects';
import { pesquisasRouter } from './pesquisas';
import { mercadosRouter } from './mercados';
import { leadsRouter } from './leads';
import { dashboardRouter } from './dashboard';
import { analyticsRouter } from './analytics';
import { enrichmentRouter } from './enrichment';
import { alertsRouter } from './alerts';

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

  // Alerts
  alerts: alertsRouter,
});

/**
 * Tipo do router para uso no cliente
 */
export type AppRouter = typeof appRouter;
