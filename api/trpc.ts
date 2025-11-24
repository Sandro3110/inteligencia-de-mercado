/**
 * Vercel Serverless Function Handler para tRPC
 * 
 * Este arquivo adapta o backend Express/tRPC para rodar como
 * Vercel Serverless Function.
 */

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

// Criar middleware tRPC
const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

// Handler para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Adaptar req/res do Vercel para Express
  const expressReq = req as any;
  const expressRes = res as any;

  // Executar middleware tRPC
  return trpcMiddleware(expressReq, expressRes);
}
