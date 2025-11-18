-- Adicionar campos faltantes na tabela clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS porte varchar(50) AFTER cnae,
ADD COLUMN IF NOT EXISTS qualidadeScore int AFTER porte,
ADD COLUMN IF NOT EXISTS qualidadeClassificacao varchar(50) AFTER qualidadeScore;
