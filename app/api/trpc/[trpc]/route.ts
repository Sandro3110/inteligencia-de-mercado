import 'server-only';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../../server/routers/index';
import { createFetchContext } from '../../../../server/context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createFetchContext({ req }),
  });

export { handler as GET, handler as POST };
