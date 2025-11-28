/**
 * App Router - Router principal do tRPC
 * Versão simplificada - apenas routers core
 */

import { createTRPCRouter } from '@/lib/trpc/server';

// Importar apenas routers core
import { authRouter } from './authRouter';
import { usersRouter } from './usersRouter';
import { projectsRouter } from './projects';
import { pesquisasRouter } from './pesquisas';
import { dashboardRouter } from './dashboard';
import { enrichmentRouter } from './enrichment';
import { exportRouter } from './export';
import { settingsRouter } from './settings';
import { resultsRouter } from './results';

/**
 * Router raiz da aplicação - SIMPLIFICADO
 * Apenas 8 routers essenciais
 */
export const appRouter = createTRPCRouter({
  // Autenticação e usuários
  auth: authRouter,
  users: usersRouter,

  // Core business
  projects: projectsRouter,
  pesquisas: pesquisasRouter,
  dashboard: dashboardRouter,
  enrichment: enrichmentRouter,

  // Utilidades
  export: exportRouter,
  settings: settingsRouter,
  results: resultsRouter,
});

/**
 * Tipo do router para uso no cliente
 */
export type AppRouter = typeof appRouter;
