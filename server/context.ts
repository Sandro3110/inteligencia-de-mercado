/**
 * tRPC Context
 * Suporta tanto Express (dev local) quanto Fetch (Vercel serverless)
 */

import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { obterUsuarioDoToken, extrairTokenDoHeader, type Usuario } from './helpers/auth';

/**
 * Context para Express (desenvolvimento local)
 */
export async function createExpressContext({ req, res }: CreateExpressContextOptions) {
  const authHeader = req.headers.authorization;
  const token = extrairTokenDoHeader(authHeader);

  let user: Usuario | null = null;
  if (token) {
    user = await obterUsuarioDoToken(token);
  }

  return {
    req,
    res,
    user,
    userId: user?.id || null
  };
}

/**
 * Context para Fetch (Vercel serverless)
 */
export async function createFetchContext({ req }: FetchCreateContextFnOptions) {
  const authHeader = req.headers.get('authorization');
  const token = extrairTokenDoHeader(authHeader || undefined);

  let user: Usuario | null = null;
  if (token) {
    user = await obterUsuarioDoToken(token);
  }

  return {
    req,
    user,
    userId: user?.id || null
  };
}

/**
 * Context unificado
 * Detecta automaticamente o tipo de requisição
 */
export async function createContext(
  opts: CreateExpressContextOptions | FetchCreateContextFnOptions
): Promise<Context> {
  // Detectar tipo de requisição
  if ('res' in opts) {
    // Express context
    return createExpressContext(opts as CreateExpressContextOptions);
  } else {
    // Fetch context
    return createFetchContext(opts as FetchCreateContextFnOptions);
  }
}

export type Context = Awaited<ReturnType<typeof createExpressContext>> | Awaited<ReturnType<typeof createFetchContext>>;
