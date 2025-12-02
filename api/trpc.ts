/**
 * Vercel Serverless Function para tRPC
 * Handler único para todas as requisições tRPC
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../server/routers';
import { createContext } from '../server/context';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  try {
    // Converter VercelRequest para Web Request
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    
    const webRequest = new Request(url, {
      method: req.method || 'GET',
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Executar handler tRPC
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: webRequest,
      router: appRouter,
      createContext: async () => createContext({ req: req as any, res: res as any }),
    });

    // Copiar headers da resposta
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Enviar resposta
    res.status(response.status);
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Erro no handler tRPC:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
