/**
 * App Router - Router principal do tRPC
 * Agrega todos os sub-routers da aplicação
 */

import { createTRPCRouter } from '@/lib/trpc/server';

// Importar routers
import { authRouter } from './auth';
// import { usersRouter } from './users';
// import { geocodingRouter } from './geocoding';
// import { territorialRouter } from './territorial';
// import { reportsRouter } from './reports';
// import { exportRouter } from './export';
// import { unifiedMapRouter } from './unifiedMap';
// import { emailConfigRouter } from './emailConfig';

/**
 * Router raiz da aplicação
 * Todos os routers são agregados aqui
 */
export const appRouter = createTRPCRouter({
  // Auth router
  auth: authRouter,
  // users: usersRouter,
  // geocoding: geocodingRouter,
  // territorial: territorialRouter,
  // reports: reportsRouter,
  // export: exportRouter,
  // unifiedMap: unifiedMapRouter,
  // emailConfig: emailConfigRouter,
});

/**
 * Tipo do router para uso no cliente
 */
export type AppRouter = typeof appRouter;
