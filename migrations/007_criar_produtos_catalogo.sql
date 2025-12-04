-- ============================================================================
-- MIGRATION 007: Criar Catálogo de Produtos Independente
-- ============================================================================
-- Data: 04/12/2025
-- Objetivo: Criar estrutura de produtos como entidades independentes
--           com relacionamento N:N com entidades
-- ============================================================================

-- Renomear tabela antiga para backup
ALTER TABLE IF EXISTS dim_produto RENAME TO dim_produto_old_backup;

-- Criar nova tabela de produtos (catálogo independente)
CREATE TABLE IF NOT EXISTS dim_produto_catalogo (
  produto_id SERIAL PRIMARY KEY,
  
  -- Identificação
  nome VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  ean VARCHAR(20),
  ncm VARCHAR(10),
  
  -- Classificação
  categoria VARCHAR(100),
  subcategoria VARCHAR(100),
  
  -- Precificação
  preco DECIMAL(15, 2),
  moeda VARCHAR(3) DEFAULT 'BRL',
  unidade VARCHAR(50),
  
  -- Descrição
  descricao TEXT,
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  
  -- Auditoria
  data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMP NOT NULL DEFAULT NOW(),
  criado_por VARCHAR(255),
  atualizado_por VARCHAR(255),
  fonte VARCHAR(100)
);

-- Criar tabela de relacionamento entidade-produto (N:N)
CREATE TABLE IF NOT EXISTS fato_entidade_produto (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL REFERENCES dim_entidade(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES dim_produto_catalogo(produto_id) ON DELETE CASCADE,
  
  -- Dados do relacionamento
  data_vinculo TIMESTAMP DEFAULT NOW(),
  criado_por VARCHAR(255),
  
  -- Constraint: 1 relacionamento único por entidade-produto
  CONSTRAINT unique_entidade_produto UNIQUE (entidade_id, produto_id)
);

-- Criar tabela de relacionamento produto-mercado (N:N)
CREATE TABLE IF NOT EXISTS fato_produto_mercado (
  id SERIAL PRIMARY KEY,
  produto_id INTEGER NOT NULL REFERENCES dim_produto_catalogo(produto_id) ON DELETE CASCADE,
  mercado_id INTEGER NOT NULL REFERENCES dim_mercado(id) ON DELETE CASCADE,
  
  -- Dados do relacionamento
  data_vinculo TIMESTAMP DEFAULT NOW(),
  
  -- Constraint: 1 relacionamento único por produto-mercado
  CONSTRAINT unique_produto_mercado UNIQUE (produto_id, mercado_id)
);

-- Criar índices para performance
CREATE INDEX idx_produto_catalogo_categoria ON dim_produto_catalogo(categoria);
CREATE INDEX idx_produto_catalogo_subcategoria ON dim_produto_catalogo(subcategoria);
CREATE INDEX idx_produto_catalogo_ativo ON dim_produto_catalogo(ativo);
CREATE INDEX idx_produto_catalogo_sku ON dim_produto_catalogo(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_produto_catalogo_ean ON dim_produto_catalogo(ean) WHERE ean IS NOT NULL;
CREATE INDEX idx_produto_catalogo_ncm ON dim_produto_catalogo(ncm) WHERE ncm IS NOT NULL;

CREATE INDEX idx_entidade_produto_entidade ON fato_entidade_produto(entidade_id);
CREATE INDEX idx_entidade_produto_produto ON fato_entidade_produto(produto_id);

CREATE INDEX idx_produto_mercado_produto ON fato_produto_mercado(produto_id);
CREATE INDEX idx_produto_mercado_mercado ON fato_produto_mercado(mercado_id);

-- Comentários
COMMENT ON TABLE dim_produto_catalogo IS 'Catálogo de produtos independente (não vinculado a entidades específicas)';
COMMENT ON TABLE fato_entidade_produto IS 'Relacionamento N:N entre entidades e produtos';
COMMENT ON TABLE fato_produto_mercado IS 'Relacionamento N:N entre produtos e mercados';

-- Inserir dados de teste (50 produtos)
INSERT INTO dim_produto_catalogo (nome, sku, categoria, subcategoria, preco, moeda, unidade, descricao, ativo, criado_por) VALUES
-- Tecnologia (15 produtos)
('Notebook Dell Inspiron 15', 'NB-DELL-001', 'Tecnologia', 'Computadores', 3499.00, 'BRL', 'unidade', 'Notebook Dell Inspiron 15 com Intel Core i5, 8GB RAM, 256GB SSD', true, 'system'),
('Mouse Logitech MX Master 3', 'MS-LOG-001', 'Tecnologia', 'Periféricos', 599.00, 'BRL', 'unidade', 'Mouse sem fio ergonômico com 7 botões programáveis', true, 'system'),
('Teclado Mecânico Keychron K2', 'KB-KEY-001', 'Tecnologia', 'Periféricos', 799.00, 'BRL', 'unidade', 'Teclado mecânico sem fio com switches Gateron Brown', true, 'system'),
('Monitor LG UltraWide 34"', 'MON-LG-001', 'Tecnologia', 'Monitores', 2899.00, 'BRL', 'unidade', 'Monitor ultrawide 34 polegadas QHD IPS', true, 'system'),
('Webcam Logitech C920', 'WC-LOG-001', 'Tecnologia', 'Periféricos', 499.00, 'BRL', 'unidade', 'Webcam Full HD 1080p com microfone estéreo', true, 'system'),
('SSD Samsung 1TB NVMe', 'SSD-SAM-001', 'Tecnologia', 'Armazenamento', 699.00, 'BRL', 'unidade', 'SSD NVMe M.2 1TB com velocidade de leitura 3500MB/s', true, 'system'),
('Roteador TP-Link AX3000', 'RT-TPL-001', 'Tecnologia', 'Redes', 599.00, 'BRL', 'unidade', 'Roteador Wi-Fi 6 dual band com 4 antenas', true, 'system'),
('Impressora HP LaserJet Pro', 'IMP-HP-001', 'Tecnologia', 'Impressoras', 1299.00, 'BRL', 'unidade', 'Impressora laser monocromática com Wi-Fi', true, 'system'),
('Headset HyperX Cloud II', 'HS-HYP-001', 'Tecnologia', 'Áudio', 499.00, 'BRL', 'unidade', 'Headset gamer com som surround 7.1 virtual', true, 'system'),
('Tablet Samsung Galaxy Tab S8', 'TAB-SAM-001', 'Tecnologia', 'Tablets', 3299.00, 'BRL', 'unidade', 'Tablet Android com tela de 11 polegadas e S Pen', true, 'system'),
('Smartphone Xiaomi Redmi Note 12', 'SM-XIA-001', 'Tecnologia', 'Smartphones', 1499.00, 'BRL', 'unidade', 'Smartphone Android com câmera de 50MP', true, 'system'),
('Carregador Anker PowerPort', 'CHG-ANK-001', 'Tecnologia', 'Acessórios', 149.00, 'BRL', 'unidade', 'Carregador USB-C 65W com tecnologia GaN', true, 'system'),
('Cabo HDMI 2.1 Premium 2m', 'CAB-HDM-001', 'Tecnologia', 'Cabos', 79.00, 'BRL', 'unidade', 'Cabo HDMI 2.1 com suporte a 4K 120Hz', true, 'system'),
('Hub USB-C 7 em 1', 'HUB-USB-001', 'Tecnologia', 'Acessórios', 299.00, 'BRL', 'unidade', 'Hub USB-C com HDMI, USB 3.0, leitor SD e Ethernet', true, 'system'),
('Suporte para Notebook Ajustável', 'SUP-NOT-001', 'Tecnologia', 'Acessórios', 129.00, 'BRL', 'unidade', 'Suporte ergonômico para notebook com 6 níveis de altura', true, 'system'),

-- Alimentos (10 produtos)
('Café Pilão Tradicional 500g', 'CAF-PIL-001', 'Alimentos', 'Bebidas', 18.90, 'BRL', 'pacote', 'Café torrado e moído tradicional', true, 'system'),
('Arroz Tio João Tipo 1 5kg', 'ARR-TIO-001', 'Alimentos', 'Grãos', 29.90, 'BRL', 'pacote', 'Arroz branco tipo 1 parboilizado', true, 'system'),
('Feijão Camil Preto 1kg', 'FEI-CAM-001', 'Alimentos', 'Grãos', 8.90, 'BRL', 'pacote', 'Feijão preto tipo 1', true, 'system'),
('Açúcar União Cristal 1kg', 'ACU-UNI-001', 'Alimentos', 'Açúcares', 4.50, 'BRL', 'pacote', 'Açúcar cristal refinado', true, 'system'),
('Óleo Liza Soja 900ml', 'OLE-LIZ-001', 'Alimentos', 'Óleos', 7.90, 'BRL', 'garrafa', 'Óleo de soja refinado', true, 'system'),
('Macarrão Barilla Penne 500g', 'MAC-BAR-001', 'Alimentos', 'Massas', 6.90, 'BRL', 'pacote', 'Macarrão de sêmola tipo penne', true, 'system'),
('Molho de Tomate Pomarola 520g', 'MOL-POM-001', 'Alimentos', 'Molhos', 4.90, 'BRL', 'lata', 'Molho de tomate tradicional', true, 'system'),
('Leite Integral Itambé 1L', 'LEI-ITA-001', 'Alimentos', 'Laticínios', 5.90, 'BRL', 'caixa', 'Leite UHT integral', true, 'system'),
('Iogurte Danone Natural 170g', 'IOG-DAN-001', 'Alimentos', 'Laticínios', 2.90, 'BRL', 'pote', 'Iogurte natural integral', true, 'system'),
('Biscoito Oreo Original 144g', 'BIS-ORE-001', 'Alimentos', 'Biscoitos', 4.50, 'BRL', 'pacote', 'Biscoito recheado sabor baunilha', true, 'system'),

-- Limpeza (10 produtos)
('Detergente Ypê Neutro 500ml', 'DET-YPE-001', 'Limpeza', 'Detergentes', 2.90, 'BRL', 'frasco', 'Detergente líquido neutro', true, 'system'),
('Sabão em Pó Omo 1kg', 'SAB-OMO-001', 'Limpeza', 'Sabões', 14.90, 'BRL', 'caixa', 'Sabão em pó para roupas', true, 'system'),
('Amaciante Comfort 2L', 'AMA-COM-001', 'Limpeza', 'Amaciantes', 12.90, 'BRL', 'frasco', 'Amaciante de roupas concentrado', true, 'system'),
('Desinfetante Pinho Sol 1L', 'DES-PIN-001', 'Limpeza', 'Desinfetantes', 8.90, 'BRL', 'frasco', 'Desinfetante perfumado', true, 'system'),
('Água Sanitária Qboa 1L', 'AGU-QBO-001', 'Limpeza', 'Sanitários', 3.90, 'BRL', 'frasco', 'Água sanitária 2,5% cloro ativo', true, 'system'),
('Esponja Scotch-Brite Dupla Face', 'ESP-SCO-001', 'Limpeza', 'Utensílios', 3.50, 'BRL', 'unidade', 'Esponja dupla face para limpeza', true, 'system'),
('Pano de Limpeza Multiuso', 'PAN-MUL-001', 'Limpeza', 'Utensílios', 5.90, 'BRL', 'pacote', 'Pacote com 3 panos de limpeza', true, 'system'),
('Sabonete Líquido Dove 250ml', 'SAB-DOV-001', 'Limpeza', 'Higiene Pessoal', 9.90, 'BRL', 'frasco', 'Sabonete líquido hidratante', true, 'system'),
('Shampoo Pantene 400ml', 'SHA-PAN-001', 'Limpeza', 'Higiene Pessoal', 15.90, 'BRL', 'frasco', 'Shampoo hidratação intensa', true, 'system'),
('Papel Higiênico Neve 12 rolos', 'PAP-NEV-001', 'Limpeza', 'Papel', 18.90, 'BRL', 'pacote', 'Papel higiênico folha dupla', true, 'system'),

-- Móveis (8 produtos)
('Cadeira de Escritório Presidente', 'CAD-PRE-001', 'Móveis', 'Cadeiras', 899.00, 'BRL', 'unidade', 'Cadeira presidente com apoio lombar e braços reguláveis', true, 'system'),
('Mesa de Escritório 120x60cm', 'MES-ESC-001', 'Móveis', 'Mesas', 499.00, 'BRL', 'unidade', 'Mesa de escritório em MDF com acabamento em BP', true, 'system'),
('Estante para Livros 5 Prateleiras', 'EST-LIV-001', 'Móveis', 'Estantes', 349.00, 'BRL', 'unidade', 'Estante de madeira com 5 prateleiras', true, 'system'),
('Sofá 3 Lugares Tecido Cinza', 'SOF-3LU-001', 'Móveis', 'Sofás', 1899.00, 'BRL', 'unidade', 'Sofá retrátil e reclinável 3 lugares', true, 'system'),
('Cama Box Casal Queen Size', 'CAM-QUE-001', 'Móveis', 'Camas', 2499.00, 'BRL', 'unidade', 'Cama box queen size com colchão de molas', true, 'system'),
('Guarda-Roupa 6 Portas', 'GUA-6PO-001', 'Móveis', 'Guarda-Roupas', 1599.00, 'BRL', 'unidade', 'Guarda-roupa 6 portas com espelho', true, 'system'),
('Mesa de Jantar 6 Cadeiras', 'MES-JAN-001', 'Móveis', 'Mesas', 1299.00, 'BRL', 'conjunto', 'Mesa de jantar retangular com 6 cadeiras', true, 'system'),
('Rack para TV até 55"', 'RAC-TV-001', 'Móveis', 'Racks', 599.00, 'BRL', 'unidade', 'Rack suspenso para TV com 2 portas', true, 'system'),

-- Vestuário (7 produtos)
('Camiseta Básica 100% Algodão', 'CAM-BAS-001', 'Vestuário', 'Camisetas', 39.90, 'BRL', 'unidade', 'Camiseta básica gola careca', true, 'system'),
('Calça Jeans Masculina', 'CAL-JEA-001', 'Vestuário', 'Calças', 129.90, 'BRL', 'unidade', 'Calça jeans masculina corte reto', true, 'system'),
('Tênis Esportivo Nike', 'TEN-NIK-001', 'Vestuário', 'Calçados', 399.00, 'BRL', 'par', 'Tênis esportivo para corrida', true, 'system'),
('Jaqueta Jeans Feminina', 'JAQ-JEA-001', 'Vestuário', 'Jaquetas', 189.90, 'BRL', 'unidade', 'Jaqueta jeans feminina com bolsos', true, 'system'),
('Vestido Midi Floral', 'VES-MID-001', 'Vestuário', 'Vestidos', 149.90, 'BRL', 'unidade', 'Vestido midi estampado floral', true, 'system'),
('Bermuda Moletom Masculina', 'BER-MOL-001', 'Vestuário', 'Bermudas', 79.90, 'BRL', 'unidade', 'Bermuda moletom com bolsos', true, 'system'),
('Blusa de Frio Feminina', 'BLU-FRI-001', 'Vestuário', 'Blusas', 99.90, 'BRL', 'unidade', 'Blusa de tricô manga longa', true, 'system');

-- Migrar dados antigos (se existirem)
-- INSERT INTO dim_produto_catalogo (nome, descricao, categoria, criado_por)
-- SELECT DISTINCT nome, descricao, categoria, created_by
-- FROM dim_produto_old_backup
-- WHERE nome IS NOT NULL;

-- Criar relacionamentos para dados migrados
-- INSERT INTO fato_entidade_produto (entidade_id, produto_id, criado_por)
-- SELECT dpo.entidade_id, dpc.produto_id, dpo.created_by
-- FROM dim_produto_old_backup dpo
-- JOIN dim_produto_catalogo dpc ON dpc.nome = dpo.nome
-- WHERE dpo.entidade_id IS NOT NULL;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
