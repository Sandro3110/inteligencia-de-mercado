-- Migration: Add critical indexes for drill-down performance
-- Created: 2025-12-01
-- Purpose: Fix 500 errors in sector and product drill-down by adding missing indexes

-- Clientes: Add indexes for pesquisaId and cnae
CREATE INDEX IF NOT EXISTS idx_clientes_pesquisaId ON clientes(pesquisaId);
CREATE INDEX IF NOT EXISTS idx_clientes_cnae ON clientes(cnae);

-- Leads: Add indexes for pesquisaId and setor
CREATE INDEX IF NOT EXISTS idx_leads_pesquisaId ON leads(pesquisaId);
CREATE INDEX IF NOT EXISTS idx_leads_setor ON leads(setor);

-- Concorrentes: Add indexes for pesquisaId and setor
CREATE INDEX IF NOT EXISTS idx_concorrentes_pesquisaId ON concorrentes(pesquisaId);
CREATE INDEX IF NOT EXISTS idx_concorrentes_setor ON concorrentes(setor);
