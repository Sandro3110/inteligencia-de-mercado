import { router, publicProcedure } from '../trpc';

// Re-export para retrocompatibilidade
export { router, publicProcedure };

// Imports de routers
import { projetosRouter } from './projetos';
import { pesquisasRouter } from './pesquisas';
import { entidadesRouter } from './entidades';
import { importacaoRouter } from './importacao';
import { cuboRouter } from './cubo';
import { temporalRouter } from './temporal';
import { geografiaRouter } from './geografia';
import { mercadoRouter } from './mercado';
import { entidadeRouter } from './entidade';
import { statusQualificacaoRouter } from './statusQualificacao';
import { produtoRouter } from './produto';
import { dashboardRouter } from './dashboard';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  projetos: projetosRouter,
  pesquisas: pesquisasRouter,
  entidades: entidadesRouter,
  importacao: importacaoRouter,
  cubo: cuboRouter,
  temporal: temporalRouter,
  geografia: geografiaRouter,
  mercado: mercadoRouter,
  entidade: entidadeRouter,
  statusQualificacao: statusQualificacaoRouter,
  produto: produtoRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
