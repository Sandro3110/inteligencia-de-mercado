-- Adicionar campos de geolocalização em clientes
ALTER TABLE clientes 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN geocodedAt TIMESTAMP;

-- Adicionar campos de geolocalização em concorrentes
ALTER TABLE concorrentes 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN geocodedAt TIMESTAMP;

-- Adicionar campos de geolocalização em leads
ALTER TABLE leads 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN geocodedAt TIMESTAMP;
