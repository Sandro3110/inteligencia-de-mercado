/**
 * Vercel Serverless Function Handler para tRPC
 */

import { createExpressMiddleware } from "@trpc/server/adapters/express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { appRouter } from "../server/routers.js";
import { createContext } from "../server/_core/context.js";

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

  try {
    // Adaptar req/res do Vercel para Express
    const expressReq = req as any;
    const expressRes = res as any;

    // Executar middleware tRPC
    return trpcMiddleware(expressReq, expressRes);
  } catch (error) {
    console.error("[tRPC] Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
