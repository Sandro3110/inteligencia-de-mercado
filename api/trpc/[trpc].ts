/**
 * Vercel Serverless Function - tRPC Handler Unificado
 * 
 * Este handler substitui todos os 36 arquivos api/*.js legados
 * Reutiliza server/routers/ e server/dal/ para manter type-safety
 * 
 * Arquitetura:
 * - Runtime: Edge (0ms cold start)
 * - Região: São Paulo (gru1)
 * - Adapter: Fetch (Vercel otimizado)
 * - Type-Safety: 100% (TypeScript)
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../server/routers';
import { createContext } from '../../server/context';

// Configuração do Edge Runtime
export const config = {
  runtime: 'edge',
};

/**
 * Handler principal
 * Processa todas as requisições tRPC
 */
export default async function handler(req: Request) {
  // Log para debug (remover em produção)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[tRPC] ${req.method} ${req.url}`);
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => createContext({ req }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `[tRPC] Error in ${path ?? '<no-path>'}:`,
              error
            );
          }
        : undefined,
  });
}
