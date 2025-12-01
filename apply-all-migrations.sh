#!/bin/bash

# Script para aplicar todas as migrations da nova estrutura
# Uso: ./apply-all-migrations.sh

set -e  # Parar em caso de erro

PROJECT_ID="ecnzlynmuerbmqingyfl"

echo "🚀 Aplicando migrations da nova estrutura..."

# dim_mercados
echo "📦 Criando dim_mercados..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE TABLE dim_mercados (id SERIAL PRIMARY KEY, mercado_hash VARCHAR(255) UNIQUE, nome VARCHAR(255) NOT NULL, categoria VARCHAR(100) NOT NULL, segmentacao VARCHAR(50), tamanho_mercado TEXT, crescimento_anual TEXT, tendencias TEXT, principais_players TEXT, pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());"
}'

echo "📦 Criando índices em dim_mercados..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE INDEX idx_dim_mercados_pesquisa ON dim_mercados(pesquisa_id); CREATE INDEX idx_dim_mercados_project ON dim_mercados(project_id); CREATE INDEX idx_dim_mercados_categoria ON dim_mercados(categoria); CREATE INDEX idx_dim_mercados_hash ON dim_mercados(mercado_hash); CREATE INDEX idx_dim_mercados_pesquisa_categoria ON dim_mercados(pesquisa_id, categoria);"
}'

# dim_produtos
echo "📦 Criando dim_produtos..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE TABLE dim_produtos (id SERIAL PRIMARY KEY, produto_hash VARCHAR(255) UNIQUE, nome VARCHAR(255) NOT NULL, categoria VARCHAR(100) NOT NULL, descricao TEXT, preco TEXT, unidade VARCHAR(50), ativo BOOLEAN DEFAULT TRUE, mercado_id INTEGER REFERENCES dim_mercados(id) ON DELETE SET NULL, pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());"
}'

echo "📦 Criando índices em dim_produtos..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE INDEX idx_dim_produtos_pesquisa ON dim_produtos(pesquisa_id); CREATE INDEX idx_dim_produtos_project ON dim_produtos(project_id); CREATE INDEX idx_dim_produtos_categoria ON dim_produtos(categoria); CREATE INDEX idx_dim_produtos_mercado ON dim_produtos(mercado_id); CREATE INDEX idx_dim_produtos_hash ON dim_produtos(produto_hash); CREATE INDEX idx_dim_produtos_pesquisa_categoria ON dim_produtos(pesquisa_id, categoria);"
}'

# fato_entidades
echo "📊 Criando fato_entidades..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE TABLE fato_entidades (id SERIAL PRIMARY KEY, tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('\''cliente'\'', '\''lead'\'', '\''concorrente'\'')), entidade_hash VARCHAR(255) UNIQUE, nome VARCHAR(255) NOT NULL, cnpj VARCHAR(20), pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, geografia_id INTEGER NOT NULL REFERENCES dim_geografia(id), mercado_id INTEGER NOT NULL REFERENCES dim_mercados(id), email VARCHAR(500), telefone VARCHAR(50), site_oficial VARCHAR(500), linkedin VARCHAR(500), instagram VARCHAR(500), cnae VARCHAR(20), porte VARCHAR(50), segmentacao_b2b_b2c VARCHAR(10), faturamento_declarado TEXT, faturamento_estimado TEXT, numero_estabelecimentos TEXT, qualidade_score INTEGER CHECK (qualidade_score >= 0 AND qualidade_score <= 100), qualidade_classificacao VARCHAR(50), validation_status VARCHAR(50), validation_notes TEXT, validated_by VARCHAR(64), validated_at TIMESTAMP, lead_stage VARCHAR(50), stage_updated_at TIMESTAMP, cliente_origem_id INTEGER REFERENCES fato_entidades(id), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());"
}'

echo "📊 Criando índices em fato_entidades (parte 1)..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE INDEX idx_fato_entidades_tipo ON fato_entidades(tipo_entidade); CREATE INDEX idx_fato_entidades_pesquisa ON fato_entidades(pesquisa_id); CREATE INDEX idx_fato_entidades_project ON fato_entidades(project_id); CREATE INDEX idx_fato_entidades_geografia ON fato_entidades(geografia_id); CREATE INDEX idx_fato_entidades_mercado ON fato_entidades(mercado_id); CREATE INDEX idx_fato_entidades_hash ON fato_entidades(entidade_hash);"
}'

echo "📊 Criando índices em fato_entidades (parte 2)..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE INDEX idx_fato_entidades_qualidade ON fato_entidades(qualidade_score); CREATE INDEX idx_fato_entidades_cnpj ON fato_entidades(cnpj); CREATE INDEX idx_fato_entidades_tipo_pesquisa ON fato_entidades(tipo_entidade, pesquisa_id); CREATE INDEX idx_fato_entidades_tipo_mercado ON fato_entidades(tipo_entidade, mercado_id); CREATE INDEX idx_fato_entidades_cliente_origem ON fato_entidades(cliente_origem_id); CREATE INDEX idx_fato_entidades_geografia_mercado ON fato_entidades(geografia_id, mercado_id);"
}'

# entidade_produtos
echo "🔗 Criando entidade_produtos..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE TABLE entidade_produtos (id SERIAL PRIMARY KEY, entidade_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE, produto_id INTEGER NOT NULL REFERENCES dim_produtos(id) ON DELETE CASCADE, tipo_relacao VARCHAR(50), created_at TIMESTAMP DEFAULT NOW(), UNIQUE(entidade_id, produto_id));"
}'

echo "🔗 Criando índices em entidade_produtos..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE INDEX idx_entidade_produtos_entidade ON entidade_produtos(entidade_id); CREATE INDEX idx_entidade_produtos_produto ON entidade_produtos(produto_id); CREATE INDEX idx_entidade_produtos_tipo ON entidade_produtos(tipo_relacao);"
}'

# entidade_competidores
echo "🔗 Criando entidade_competidores..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE TABLE entidade_competidores (id SERIAL PRIMARY KEY, entidade_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE, competidor_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE, mercado_id INTEGER NOT NULL REFERENCES dim_mercados(id), nivel_competicao VARCHAR(50), created_at TIMESTAMP DEFAULT NOW(), UNIQUE(entidade_id, competidor_id, mercado_id), CHECK (entidade_id != competidor_id));"
}'

echo "🔗 Criando índices em entidade_competidores..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE INDEX idx_entidade_competidores_entidade ON entidade_competidores(entidade_id); CREATE INDEX idx_entidade_competidores_competidor ON entidade_competidores(competidor_id); CREATE INDEX idx_entidade_competidores_mercado ON entidade_competidores(mercado_id);"
}'

# fato_entidades_history
echo "📜 Criando fato_entidades_history..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE TABLE fato_entidades_history (id SERIAL PRIMARY KEY, entidade_id INTEGER NOT NULL, data_snapshot JSONB NOT NULL, change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('\''created'\'', '\''updated'\'', '\''deleted'\'')), changed_by VARCHAR(64), changed_at TIMESTAMP DEFAULT NOW());"
}'

echo "📜 Criando índices em fato_entidades_history..."
manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "CREATE INDEX idx_fato_entidades_history_entidade ON fato_entidades_history(entidade_id); CREATE INDEX idx_fato_entidades_history_changed_at ON fato_entidades_history(changed_at); CREATE INDEX idx_fato_entidades_history_change_type ON fato_entidades_history(change_type);"
}'

echo "✅ Todas as migrations aplicadas com sucesso!"
echo "📊 Verificando tabelas criadas..."

manus-mcp-cli tool call execute_sql --server supabase --input '{
  "project_id": "'$PROJECT_ID'",
  "query": "SELECT table_name FROM information_schema.tables WHERE table_schema = '\''public'\'' AND table_name IN ('\''dim_geografia'\'', '\''dim_mercados'\'', '\''dim_produtos'\'', '\''fato_entidades'\'', '\''entidade_produtos'\'', '\''entidade_competidores'\'', '\''fato_entidades_history'\'') ORDER BY table_name;"
}'

echo "🎉 Nova estrutura padronizada criada!"
