import { initTRPC } from '@trpc/server';
import { Context } from '../context';
import { projetosRouter } from './projetos';
import { pesquisasRouter } from './pesquisas';
import { entidadesRouter } from './entidades';
import { importacaoRouter } from './importacao';
import { cuboRouter } from './cubo';
import { temporalRouter } from './temporal';
import { geografiaRouter } from './geografia';
import { mercadoRouter } from './mercado';
import { entidadeRouter } from './entidade';
import { dashboardRouter } from './dashboard';
import { produtoRouter } from './produto';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

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
  dashboard: dashboardRouter,
  produto: produtoRouter,
});

export type AppRouter = typeof appRouter;
