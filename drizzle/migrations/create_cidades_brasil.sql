-- Criar tabela de cidades brasileiras com coordenadas
CREATE TABLE IF NOT EXISTS cidades_brasil (
    id SERIAL PRIMARY KEY,
    codigo_ibge INTEGER NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capital BOOLEAN DEFAULT FALSE,
    codigo_uf INTEGER NOT NULL,
    uf VARCHAR(2) NOT NULL,
    siafi_id VARCHAR(10),
    ddd INTEGER,
    fuso_horario VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para otimizar buscas
CREATE INDEX idx_cidades_nome ON cidades_brasil(nome);
CREATE INDEX idx_cidades_uf ON cidades_brasil(uf);
CREATE INDEX idx_cidades_nome_uf ON cidades_brasil(nome, uf);
CREATE INDEX idx_cidades_coordenadas ON cidades_brasil(latitude, longitude);

-- Comentários
COMMENT ON TABLE cidades_brasil IS 'Tabela de referência com coordenadas geográficas de todos os municípios brasileiros (fonte: IBGE)';
COMMENT ON COLUMN cidades_brasil.codigo_ibge IS 'Código IBGE do município';
COMMENT ON COLUMN cidades_brasil.nome IS 'Nome do município';
COMMENT ON COLUMN cidades_brasil.latitude IS 'Latitude do município (decimal)';
COMMENT ON COLUMN cidades_brasil.longitude IS 'Longitude do município (decimal)';
COMMENT ON COLUMN cidades_brasil.capital IS 'Indica se é capital estadual';
COMMENT ON COLUMN cidades_brasil.codigo_uf IS 'Código IBGE da UF';
COMMENT ON COLUMN cidades_brasil.uf IS 'Sigla da UF (estado)';
