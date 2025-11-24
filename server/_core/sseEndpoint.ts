import { Request, Response } from "express";
import { jobManager, EnrichmentProgress } from "./jobManager";

export function setupSSE(req: Request, res: Response) {
  const jobId = req.params.jobId;

  if (!jobId) {
    res.status(400).json({ error: "Job ID is required" });
    return;
  }

  // Configurar headers SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Desabilitar buffering do nginx

  // Enviar comentário inicial para manter conexão
  res.write(": connected\n\n");

  // Enviar estado atual se existir
  const currentJob = jobManager.getJob(jobId);
  if (currentJob) {
    res.write(`data: ${JSON.stringify(currentJob)}\n\n`);
  }

  // Inscrever-se para atualizações
  const unsubscribe = jobManager.subscribeToJob(
    jobId,
    (progress: EnrichmentProgress) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);

      // Fechar conexão quando job completar ou falhar
      if (progress.status === "completed" || progress.status === "error") {
        setTimeout(() => {
          res.end();
        }, 1000);
      }
    }
  );

  // Cleanup quando cliente desconectar
  req.on("close", () => {
    unsubscribe();
  });

  // Heartbeat a cada 30 segundos
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
  });
}
