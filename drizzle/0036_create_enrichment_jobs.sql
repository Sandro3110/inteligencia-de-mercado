-- Migration: Create enrichment_jobs table
-- Created: 2025-01-29
-- Description: Tabela para gerenciar jobs de enriquecimento em batch

CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  "totalClientes" INTEGER NOT NULL,
  "processedClientes" INTEGER DEFAULT 0 NOT NULL,
  "successClientes" INTEGER DEFAULT 0 NOT NULL,
  "failedClientes" INTEGER DEFAULT 0 NOT NULL,
  "currentBatch" INTEGER DEFAULT 0 NOT NULL,
  "totalBatches" INTEGER NOT NULL,
  "batchSize" INTEGER DEFAULT 5 NOT NULL,
  "checkpointInterval" INTEGER DEFAULT 50 NOT NULL,
  "startedAt" TIMESTAMP,
  "pausedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "estimatedTimeRemaining" INTEGER,
  "lastClienteId" INTEGER,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_project ON enrichment_jobs("projectId");
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status ON enrichment_jobs(status);

-- Comentários
COMMENT ON TABLE enrichment_jobs IS 'Jobs de enriquecimento em batch';
COMMENT ON COLUMN enrichment_jobs."projectId" IS 'ID do projeto';
COMMENT ON COLUMN enrichment_jobs.status IS 'Status do job: pending, running, paused, completed, error';
COMMENT ON COLUMN enrichment_jobs."totalClientes" IS 'Total de clientes a enriquecer';
COMMENT ON COLUMN enrichment_jobs."processedClientes" IS 'Clientes já processados';
COMMENT ON COLUMN enrichment_jobs."successClientes" IS 'Clientes enriquecidos com sucesso';
COMMENT ON COLUMN enrichment_jobs."failedClientes" IS 'Clientes que falharam';
