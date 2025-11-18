-- Quick Win 1: Adicionar índices estratégicos para melhorar performance
-- Impacto esperado: +70% velocidade nas queries

-- Índice para junction table (clientes_mercados)
CREATE INDEX IF NOT EXISTS idx_clientes_mercado ON clientes_mercados(mercadoId, clienteId);

-- Índice para concorrentes por mercado
CREATE INDEX IF NOT EXISTS idx_concorrentes_mercado ON concorrentes(mercadoId);

-- Índice para leads por mercado
CREATE INDEX IF NOT EXISTS idx_leads_mercado ON leads(mercadoId);

-- Índice para filtro por status de validação
CREATE INDEX IF NOT EXISTS idx_clientes_validation ON clientes(validationStatus);
CREATE INDEX IF NOT EXISTS idx_concorrentes_validation ON concorrentes(validationStatus);
CREATE INDEX IF NOT EXISTS idx_leads_validation ON leads(validationStatus);

-- Índice para busca por CNPJ
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX IF NOT EXISTS idx_concorrentes_cnpj ON concorrentes(cnpj);
CREATE INDEX IF NOT EXISTS idx_leads_cnpj ON leads(cnpj);

-- Índice para busca por nome de mercado
CREATE INDEX IF NOT EXISTS idx_mercados_nome ON mercados_unicos(nome);

-- Mostrar índices criados
SHOW INDEX FROM clientes_mercados;
SHOW INDEX FROM concorrentes;
SHOW INDEX FROM leads;
SHOW INDEX FROM clientes;
