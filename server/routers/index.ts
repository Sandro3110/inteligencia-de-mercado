import { initTRPC } from '@trpc/server';
import { Context } from '../context';
import { projetosRouter } from './projetos';
import { pesquisasRouter } from './pesquisas';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  projetos: projetosRouter,
  pesquisas: pesquisasRouter,
});

export type AppRouter = typeof appRouter;
