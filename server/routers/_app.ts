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
import { mapRouter } from './map';
import { reportsRouter } from './reports';
import { reportsEnhancedRouter } from './reports-enhanced';
import { notificationsRouter } from './notifications';
import { importCidadesRouter } from './import-cidades';
import { mapHierarchicalRouter } from './map-hierarchical';
import { sectorAnalysisRouter } from './sector-analysis';
import { productAnalysisRouter } from './product-analysis';

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
  map: mapRouter,
  reports: reportsRouter,
  reportsEnhanced: reportsEnhancedRouter,
  notifications: notificationsRouter,
  importCidades: importCidadesRouter,
  mapHierarchical: mapHierarchicalRouter,
  sectorAnalysis: sectorAnalysisRouter,
  productAnalysis: productAnalysisRouter,
});

/**
 * Tipo do router para uso no cliente
 */
export type AppRouter = typeof appRouter;
