import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../server/routers';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Transformer para fazer unwrap da resposta da serverless function
      // A serverless retorna { result: { data } }, mas o tRPC React Query espera apenas data
      transformer: {
        input: {
          serialize: (object) => object,
          deserialize: (object) => object,
        },
        output: {
          serialize: (object) => object,
          deserialize: (object) => {
            // Se a resposta tem formato { result: { data } }, fazer unwrap
            if (object && typeof object === 'object' && 'result' in object) {
              const result = (object as any).result;
              if (result && typeof result === 'object' && 'data' in result) {
                return result.data;
              }
            }
            return object;
          },
        },
      },
    }),
  ],
});
