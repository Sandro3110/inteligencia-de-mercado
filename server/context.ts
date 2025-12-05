import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { obterUsuarioDoToken, extrairTokenDoHeader, type Usuario } from './helpers/auth';

/**
 * Context base (sem res) - compatível com Fetch API
 */
export type BaseContext = {
  req: Request | any;
  user: Usuario | null;
  userId: string | null;
};

/**
 * Context Express (com res) - compatível com Express adapter
 */
export type ExpressContext = BaseContext & {
  res: any;
};

/**
 * Context para Express adapter
 */
export async function createExpressContext({ req, res }: CreateExpressContextOptions): Promise<ExpressContext> {
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
 * Context para Fetch API (Next.js)
 */
export async function createFetchContext({ req }: { req: Request }): Promise<BaseContext> {
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
 * Tipo do context usado pelos routers
 * Usa BaseContext para ser compatível com ambos
 */
export type Context = BaseContext;
