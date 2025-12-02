import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { obterUsuarioDoToken, extrairTokenDoHeader, type Usuario } from './helpers/auth';

export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Extrair token do header Authorization
  const authHeader = req.headers.authorization;
  const token = extrairTokenDoHeader(authHeader);

  // Obter usuário autenticado
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

export type Context = Awaited<ReturnType<typeof createContext>>;
