-- Migration: Alinhamento de campos entre clientes, leads e concorrentes
-- Data: 2025-11-29
-- Objetivo: Adicionar campos CNAE, setor, email e telefone para padronização

-- =====================================================
-- CONCORRENTES: Adicionar campos faltantes
-- =====================================================

-- Adicionar CNAE (classificação fiscal)
ALTER TABLE concorrentes 
ADD COLUMN IF NOT EXISTS cnae VARCHAR(20);

-- Adicionar setor (segmentação de mercado)
ALTER TABLE concorrentes 
ADD COLUMN IF NOT EXISTS setor VARCHAR(100);

-- Adicionar email (contato comercial)
ALTER TABLE concorrentes 
ADD COLUMN IF NOT EXISTS email VARCHAR(320);

-- Adicionar telefone (contato comercial)
ALTER TABLE concorrentes 
ADD COLUMN IF NOT EXISTS telefone VARCHAR(50);

-- =====================================================
-- LEADS: Adicionar campos faltantes
-- =====================================================

-- Adicionar CNAE (classificação fiscal)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS cnae VARCHAR(20);

-- =====================================================
-- Criar índices para melhorar performance de filtros
-- =====================================================

-- Índice para filtro de CNAE em clientes
CREATE INDEX IF NOT EXISTS idx_clientes_cnae ON clientes(cnae) WHERE cnae IS NOT NULL;

-- Índice para filtro de CNAE em concorrentes
CREATE INDEX IF NOT EXISTS idx_concorrentes_cnae ON concorrentes(cnae) WHERE cnae IS NOT NULL;

-- Índice para filtro de CNAE em leads
CREATE INDEX IF NOT EXISTS idx_leads_cnae ON leads(cnae) WHERE cnae IS NOT NULL;

-- Índice para filtro de setor em leads
CREATE INDEX IF NOT EXISTS idx_leads_setor ON leads(setor) WHERE setor IS NOT NULL;

-- Índice para filtro de setor em concorrentes
CREATE INDEX IF NOT EXISTS idx_concorrentes_setor ON concorrentes(setor) WHERE setor IS NOT NULL;

-- =====================================================
-- Comentários nas colunas para documentação
-- =====================================================

COMMENT ON COLUMN concorrentes.cnae IS 'Classificação Nacional de Atividades Econômicas';
COMMENT ON COLUMN concorrentes.setor IS 'Setor/segmento de mercado da empresa';
COMMENT ON COLUMN concorrentes.email IS 'Email de contato comercial';
COMMENT ON COLUMN concorrentes.telefone IS 'Telefone de contato comercial';
COMMENT ON COLUMN leads.cnae IS 'Classificação Nacional de Atividades Econômicas';
