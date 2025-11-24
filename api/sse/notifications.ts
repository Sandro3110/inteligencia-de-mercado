/**
 * Vercel Serverless Function Handler para SSE de Notifications
 * 
 * NOTA: SSE (Server-Sent Events) não funciona bem em Vercel Serverless
 * devido ao timeout de 60s. Considere usar polling ou WebSockets externos.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // SSE não é ideal para Vercel Serverless
  // Retornar erro e sugerir alternativa
  res.status(501).json({
    error: "SSE not supported in Vercel Serverless",
    message: "Use polling endpoint /api/notifications/list instead",
    suggestion: "Consider using WebSockets via external service (Pusher, Ably)"
  });
}
