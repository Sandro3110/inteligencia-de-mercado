-- Adicionar coluna googleMapsApiKey na tabela enrichment_configs
ALTER TABLE enrichment_configs ADD COLUMN googleMapsApiKey TEXT NULL AFTER anthropicApiKey;
