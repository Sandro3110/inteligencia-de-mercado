-- Migration: Add notifiedCompletion field to enrichment_jobs
-- Purpose: Track if completion notification was sent

ALTER TABLE enrichment_jobs 
ADD COLUMN IF NOT EXISTS notified_completion INTEGER DEFAULT 0 NOT NULL;

-- Add comment
COMMENT ON COLUMN enrichment_jobs.notified_completion IS 'Flag to track if completion notification was sent (0=not sent, 1=sent)';
