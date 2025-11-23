import { EventEmitter } from "events";

export interface EnrichmentProgress {
  jobId: string;
  step: number;
  totalSteps: number;
  currentStepName: string;
  message: string;
  progress: number; // 0-100 for current step
  totalProgress: number; // 0-100 overall
  status: "running" | "completed" | "error";
  error?: string;
}

class JobManager extends EventEmitter {
  private jobs: Map<string, EnrichmentProgress> = new Map();

  createJob(jobId: string, totalSteps: number): void {
    this.jobs.set(jobId, {
      jobId,
      step: 0,
      totalSteps,
      currentStepName: "Iniciando...",
      message: "Preparando processamento",
      progress: 0,
      totalProgress: 0,
      status: "running",
    });
    this.emit(`job:${jobId}`, this.jobs.get(jobId));
  }

  updateJob(jobId: string, update: Partial<EnrichmentProgress>): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const updated = { ...job, ...update };

    // Calcular progresso total
    if (updated.step !== undefined && updated.totalSteps) {
      const stepProgress = (updated.step / updated.totalSteps) * 100;
      const currentStepContribution =
        (updated.progress || 0) / updated.totalSteps;
      updated.totalProgress = Math.min(
        100,
        stepProgress + currentStepContribution
      );
    }

    this.jobs.set(jobId, updated);
    this.emit(`job:${jobId}`, updated);
  }

  completeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const completed: EnrichmentProgress = {
      ...job,
      status: "completed",
      totalProgress: 100,
      progress: 100,
      message: "Processamento concluído com sucesso!",
    };

    this.jobs.set(jobId, completed);
    this.emit(`job:${jobId}`, completed);

    // Limpar job após 5 minutos
    setTimeout(
      () => {
        this.jobs.delete(jobId);
      },
      5 * 60 * 1000
    );
  }

  errorJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const errored: EnrichmentProgress = {
      ...job,
      status: "error",
      error,
      message: `Erro: ${error}`,
    };

    this.jobs.set(jobId, errored);
    this.emit(`job:${jobId}`, errored);

    // Limpar job após 5 minutos
    setTimeout(
      () => {
        this.jobs.delete(jobId);
      },
      5 * 60 * 1000
    );
  }

  getJob(jobId: string): EnrichmentProgress | undefined {
    return this.jobs.get(jobId);
  }

  subscribeToJob(
    jobId: string,
    callback: (progress: EnrichmentProgress) => void
  ): () => void {
    const listener = (progress: EnrichmentProgress) => callback(progress);
    this.on(`job:${jobId}`, listener);

    // Retornar função de cleanup
    return () => {
      this.off(`job:${jobId}`, listener);
    };
  }
}

export const jobManager = new JobManager();
