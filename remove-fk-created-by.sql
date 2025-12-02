-- Remover constraint de foreign key que referencia tabela inexistente
ALTER TABLE dim_pesquisa DROP CONSTRAINT IF EXISTS fk_dim_pesquisa_created_by;
ALTER TABLE dim_pesquisa DROP CONSTRAINT IF EXISTS dim_pesquisa_created_by_fkey;

-- Também remover de dim_projeto se existir
ALTER TABLE dim_projeto DROP CONSTRAINT IF EXISTS fk_dim_projeto_created_by;
ALTER TABLE dim_projeto DROP CONSTRAINT IF EXISTS dim_projeto_created_by_fkey;
