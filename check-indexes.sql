-- Verificar índices nas tabelas clientes, leads e concorrentes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('clientes', 'leads', 'concorrentes')
ORDER BY tablename, indexname;

-- Verificar estrutura das colunas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('clientes', 'leads', 'concorrentes')
    AND column_name IN ('pesquisaId', 'cnae', 'setor', 'produto')
ORDER BY table_name, column_name;
