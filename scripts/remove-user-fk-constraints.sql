-- ============================================================================
-- REMOVER FOREIGN KEY CONSTRAINTS DE USUÁRIOS
-- ============================================================================
-- Descrição: Remove constraints de foreign keys que referenciam users
--            para permitir funcionamento sem autenticação
-- ============================================================================

-- Listar todas as constraints que referenciam users
SELECT
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name IN ('owner_id', 'created_by', 'updated_by', 'deleted_by');

-- Remover constraints de dim_projeto
ALTER TABLE dim_projeto DROP CONSTRAINT IF EXISTS fk_dim_projeto_owner_id;
ALTER TABLE dim_projeto DROP CONSTRAINT IF EXISTS fk_dim_projeto_created_by;
ALTER TABLE dim_projeto DROP CONSTRAINT IF EXISTS fk_dim_projeto_updated_by;
ALTER TABLE dim_projeto DROP CONSTRAINT IF EXISTS fk_dim_projeto_deleted_by;

-- Remover constraints de dim_pesquisa
ALTER TABLE dim_pesquisa DROP CONSTRAINT IF EXISTS fk_dim_pesquisa_owner_id;
ALTER TABLE dim_pesquisa DROP CONSTRAINT IF EXISTS fk_dim_pesquisa_created_by;
ALTER TABLE dim_pesquisa DROP CONSTRAINT IF EXISTS fk_dim_pesquisa_updated_by;
ALTER TABLE dim_pesquisa DROP CONSTRAINT IF EXISTS fk_dim_pesquisa_deleted_by;

-- Remover constraints de dim_entidade
ALTER TABLE dim_entidade DROP CONSTRAINT IF EXISTS fk_dim_entidade_owner_id;
ALTER TABLE dim_entidade DROP CONSTRAINT IF EXISTS fk_dim_entidade_created_by;
ALTER TABLE dim_entidade DROP CONSTRAINT IF EXISTS fk_dim_entidade_updated_by;
ALTER TABLE dim_entidade DROP CONSTRAINT IF EXISTS fk_dim_entidade_deleted_by;

-- Remover constraints de dim_canal
ALTER TABLE dim_canal DROP CONSTRAINT IF EXISTS fk_dim_canal_created_by;
ALTER TABLE dim_canal DROP CONSTRAINT IF EXISTS fk_dim_canal_updated_by;

-- Remover constraints de dim_mercado
ALTER TABLE dim_mercado DROP CONSTRAINT IF EXISTS fk_dim_mercado_created_by;
ALTER TABLE dim_mercado DROP CONSTRAINT IF EXISTS fk_dim_mercado_updated_by;

-- Remover constraints de dim_geografia
ALTER TABLE dim_geografia DROP CONSTRAINT IF EXISTS fk_dim_geografia_created_by;
ALTER TABLE dim_geografia DROP CONSTRAINT IF EXISTS fk_dim_geografia_updated_by;

-- Verificação final
SELECT
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name IN ('owner_id', 'created_by', 'updated_by', 'deleted_by');

-- Se retornar vazio, todas as constraints foram removidas com sucesso!
