/**
 * Vercel Cron Job Handler
 * 
 * Executado diariamente às 00:00 UTC
 * Configurado em vercel.json
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificar se é uma requisição de cron do Vercel
  const authHeader = req.headers.authorization;
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Importar e executar cron jobs
    const { runDailyCronJobs } = await import("../../server/cronJobs");
    
    await runDailyCronJobs();
    
    res.status(200).json({ 
      success: true, 
      message: "Daily cron jobs executed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Cron] Error executing daily jobs:", error);
    res.status(500).json({ 
      error: "Failed to execute cron jobs",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
