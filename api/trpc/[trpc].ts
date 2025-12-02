/**
 * Vercel Serverless Function para tRPC
 * Converte o backend Express para Vercel Functions
 */

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../../server/routers';
import { createContext } from '../../server/context';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Criar handler Express para tRPC
const trpcHandler = createExpressMiddleware({
  router: appRouter,
  createContext,
});

// Exportar como Vercel Function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Converter VercelRequest para Express-like request
  const expressReq = req as any;
  const expressRes = res as any;

  // Executar handler tRPC
  return trpcHandler(expressReq, expressRes);
}
