-- Verificar clientes com coordenadas
SELECT 
  'clientes' as tabela,
  COUNT(*) as total,
  COUNT(latitude) as com_latitude,
  COUNT(longitude) as com_longitude,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_ambos
FROM clientes;

-- Verificar concorrentes com coordenadas
SELECT 
  'concorrentes' as tabela,
  COUNT(*) as total,
  COUNT(latitude) as com_latitude,
  COUNT(longitude) as com_longitude,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_ambos
FROM concorrentes;

-- Verificar leads com coordenadas
SELECT 
  'leads' as tabela,
  COUNT(*) as total,
  COUNT(latitude) as com_latitude,
  COUNT(longitude) as com_longitude,
  COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_ambos
FROM leads;

-- Verificar se há googleMapsApiKey configurado
SELECT 
  projectId,
  CASE WHEN googleMapsApiKey IS NOT NULL THEN 'Configurado' ELSE 'Não configurado' END as status_api
FROM enrichment_configs;
