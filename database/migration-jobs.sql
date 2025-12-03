-- Migration: Criar tabela para rastrear jobs de enriquecimento
-- Melhoria #6: Funis animados com progresso em tempo real

CREATE TABLE IF NOT EXISTS ia_jobs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  entidade_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'enriquecimento_completo', 'gerar_concorrentes', 'gerar_leads'
  status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  progresso INTEGER DEFAULT 0, -- 0-100
  etapa_atual VARCHAR(50), -- 'cliente', 'mercado', 'produtos', 'concorrentes', 'leads'
  etapas_completas TEXT, -- JSON array
  dados_parciais TEXT, -- JSON object
  tempo_inicio TIMESTAMP DEFAULT NOW(),
  tempo_fim TIMESTAMP,
  duracao_ms INTEGER,
  custo DECIMAL(10, 6),
  erro TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ia_jobs_user_id ON ia_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ia_jobs_entidade_id ON ia_jobs(entidade_id);
CREATE INDEX IF NOT EXISTS idx_ia_jobs_status ON ia_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ia_jobs_created_at ON ia_jobs(created_at);

-- Comentários
COMMENT ON TABLE ia_jobs IS 'Rastreamento de jobs de enriquecimento para exibição de progresso';
COMMENT ON COLUMN ia_jobs.progresso IS 'Percentual de conclusão (0-100)';
COMMENT ON COLUMN ia_jobs.etapas_completas IS 'Array JSON com etapas completadas';
COMMENT ON COLUMN ia_jobs.dados_parciais IS 'Dados parciais para exibição em tempo real';
