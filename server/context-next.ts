import { obterUsuarioDoToken, extrairTokenDoHeader, type Usuario } from './helpers/auth';

export async function createContext({ req }: { req: Request }) {
  // Extrair token do header Authorization
  const authHeader = req.headers.get('authorization');
  const token = extrairTokenDoHeader(authHeader);

  // Obter usuário autenticado
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

export type Context = Awaited<ReturnType<typeof createContext>>;
