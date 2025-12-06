/**
 * Configuração base do tRPC
 * Arquivo separado para evitar dependências circulares
 */

import { initTRPC } from '@trpc/server';
import { Context } from '../context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
