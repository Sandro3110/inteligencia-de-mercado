import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export async function createContext({ req, res }: CreateExpressContextOptions) {
  return {
    req,
    res,
    user: null, // TODO: Implementar autenticação Supabase
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
