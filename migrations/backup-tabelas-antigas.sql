-- ============================================================================
-- BACKUP DAS TABELAS ANTIGAS
-- Data: 2025-12-01
-- Objetivo: Preservar estrutura e dados antes da re-arquitetura
-- ============================================================================

-- Tamanhos atuais:
-- concorrentes: 2208 kB
-- leads: 1712 kB
-- clientes: 784 kB
-- produtos: 720 kB
-- mercados_unicos: 360 kB
-- pesquisas: 80 kB
-- clientes_mercados: 72 kB
-- projects: 32 kB
-- TOTAL: ~5.9 MB

-- ============================================================================
-- PASSO 1: Criar tabelas de backup (cópia estrutura + dados)
-- ============================================================================

-- Backup: clientes
CREATE TABLE clientes_backup_20251201 AS 
SELECT * FROM clientes;

-- Backup: leads
CREATE TABLE leads_backup_20251201 AS 
SELECT * FROM leads;

-- Backup: concorrentes
CREATE TABLE concorrentes_backup_20251201 AS 
SELECT * FROM concorrentes;

-- Backup: produtos
CREATE TABLE produtos_backup_20251201 AS 
SELECT * FROM produtos;

-- Backup: clientes_mercados
CREATE TABLE clientes_mercados_backup_20251201 AS 
SELECT * FROM clientes_mercados;

-- Backup: mercados_unicos
CREATE TABLE mercados_unicos_backup_20251201 AS 
SELECT * FROM mercados_unicos;

-- Backup: pesquisas
CREATE TABLE pesquisas_backup_20251201 AS 
SELECT * FROM pesquisas;

-- Backup: projects
CREATE TABLE projects_backup_20251201 AS 
SELECT * FROM projects;

-- ============================================================================
-- PASSO 2: Verificar contagens
-- ============================================================================

SELECT 'clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'clientes_backup', COUNT(*) FROM clientes_backup_20251201
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'leads_backup', COUNT(*) FROM leads_backup_20251201
UNION ALL
SELECT 'concorrentes', COUNT(*) FROM concorrentes
UNION ALL
SELECT 'concorrentes_backup', COUNT(*) FROM concorrentes_backup_20251201
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos
UNION ALL
SELECT 'produtos_backup', COUNT(*) FROM produtos_backup_20251201
UNION ALL
SELECT 'clientes_mercados', COUNT(*) FROM clientes_mercados
UNION ALL
SELECT 'clientes_mercados_backup', COUNT(*) FROM clientes_mercados_backup_20251201
UNION ALL
SELECT 'mercados_unicos', COUNT(*) FROM mercados_unicos
UNION ALL
SELECT 'mercados_unicos_backup', COUNT(*) FROM mercados_unicos_backup_20251201;

-- ============================================================================
-- PASSO 3: Exportar estrutura das tabelas antigas (para referência)
-- ============================================================================

-- Esta query gera o DDL de cada tabela (executar manualmente se necessário)
-- SELECT 
--   'CREATE TABLE ' || table_name || ' (' || 
--   string_agg(column_name || ' ' || data_type, ', ') || 
--   ');' as ddl
-- FROM information_schema.columns
-- WHERE table_name IN ('clientes', 'leads', 'concorrentes', 'produtos', 'clientes_mercados', 'mercados_unicos')
-- GROUP BY table_name;

-- ============================================================================
-- NOTA: Após confirmar backup bem-sucedido, executar:
-- DROP TABLE clientes_backup_20251201;
-- DROP TABLE leads_backup_20251201;
-- etc.
-- ============================================================================
