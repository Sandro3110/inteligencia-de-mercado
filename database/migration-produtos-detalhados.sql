-- Migration: Adicionar campos detalhados à tabela dim_produto
-- Melhoria #4: Descrições de produtos mais detalhadas
-- Data: 2024-12-03

-- Adicionar novos campos
ALTER TABLE dim_produto
ADD COLUMN IF NOT EXISTS funcionalidades TEXT,
ADD COLUMN IF NOT EXISTS publico_alvo VARCHAR(500),
ADD COLUMN IF NOT EXISTS diferenciais TEXT,
ADD COLUMN IF NOT EXISTS tecnologias VARCHAR(500),
ADD COLUMN IF NOT EXISTS precificacao VARCHAR(500);

-- Adicionar comentários
COMMENT ON COLUMN dim_produto.funcionalidades IS 'Lista de funcionalidades principais (JSON array ou texto separado por vírgulas)';
COMMENT ON COLUMN dim_produto.publico_alvo IS 'Descrição do público-alvo específico do produto';
COMMENT ON COLUMN dim_produto.diferenciais IS 'Diferenciais competitivos (JSON array ou texto separado por vírgulas)';
COMMENT ON COLUMN dim_produto.tecnologias IS 'Tecnologias e metodologias utilizadas';
COMMENT ON COLUMN dim_produto.precificacao IS 'Modelo de precificação e faixa de valores';

-- Verificar estrutura atualizada
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_produto'
ORDER BY ordinal_position;
