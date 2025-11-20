-- Migração: Adicionar colunas faltantes na tabela pesquisas
-- Data: 2025-01-20
-- Descrição: Adiciona colunas qtdConcorrentesPorMercado, qtdLeadsPorMercado, qtdProdutosPorCliente

ALTER TABLE pesquisas 
ADD COLUMN IF NOT EXISTS qtdConcorrentesPorMercado INT DEFAULT 10 COMMENT 'Quantidade de concorrentes a buscar por mercado';

ALTER TABLE pesquisas 
ADD COLUMN IF NOT EXISTS qtdLeadsPorMercado INT DEFAULT 20 COMMENT 'Quantidade de leads a buscar por mercado';

ALTER TABLE pesquisas 
ADD COLUMN IF NOT EXISTS qtdProdutosPorCliente INT DEFAULT 3 COMMENT 'Quantidade de produtos a buscar por cliente';

-- Verificar se as colunas foram criadas
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'pesquisas'
AND COLUMN_NAME IN ('qtdConcorrentesPorMercado', 'qtdLeadsPorMercado', 'qtdProdutosPorCliente');
