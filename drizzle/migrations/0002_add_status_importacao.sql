-- ============================================================================
-- MIGRATION: Adicionar status de importação
-- Data: 2025-12-01
-- Descrição: Adicionar 3 status para importação (Ativo, Inativo, Prospect)
-- ============================================================================

-- Adicionar novos status
INSERT INTO dim_status_qualificacao (codigo, nome, descricao, cor, ordem, created_by) VALUES
('ativo', 'Ativo', 'Cliente ativo', '#22c55e', 1, 'sistema'),
('inativo', 'Inativo', 'Cliente inativo', '#6b7280', 2, 'sistema'),
('prospect', 'Prospect', 'Potencial cliente (a qualificar)', '#3b82f6', 3, 'sistema')
ON CONFLICT (codigo) DO NOTHING;

-- Comentários
COMMENT ON COLUMN dim_status_qualificacao.codigo IS 'Código único do status (ativo, inativo, prospect, quente, morno, frio, descartado)';
COMMENT ON TABLE dim_status_qualificacao IS 'Status de qualificação: Importação (ativo/inativo/prospect) + Enriquecimento (quente/morno/frio/descartado)';
