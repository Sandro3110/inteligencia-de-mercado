#!/bin/bash
PROJECT_ID="ecnzlynmuerbmqingyfl"

echo "[3/10] Criando dim_entidade..."
manus-mcp-cli tool call execute_sql --server supabase --input "{\"project_id\": \"$PROJECT_ID\", \"query\": \"CREATE TABLE dim_entidade (id SERIAL PRIMARY KEY, entidade_hash VARCHAR(64) UNIQUE NOT NULL, tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')), nome VARCHAR(255) NOT NULL, nome_fantasia VARCHAR(255), cnpj VARCHAR(18) UNIQUE, email VARCHAR(255), telefone VARCHAR(20), site VARCHAR(255), num_filiais INTEGER DEFAULT 0, num_lojas INTEGER DEFAULT 0, num_funcionarios INTEGER, origem_tipo VARCHAR(20) NOT NULL CHECK (origem_tipo IN ('importacao', 'ia_prompt', 'api', 'manual')), origem_arquivo VARCHAR(255), origem_processo VARCHAR(100), origem_prompt TEXT, origem_confianca INTEGER CHECK (origem_confianca BETWEEN 0 AND 100), origem_data TIMESTAMP NOT NULL DEFAULT NOW(), origem_usuario_id INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), created_by INTEGER, updated_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_by INTEGER, deleted_at TIMESTAMP, deleted_by INTEGER);\"}" > /dev/null 2>&1 && echo "✅" || echo "❌"

echo "[4/10] Criando dim_geografia..."
manus-mcp-cli tool call execute_sql --server supabase --input "{\"project_id\": \"$PROJECT_ID\", \"query\": \"CREATE TABLE dim_geografia (id SERIAL PRIMARY KEY, cidade VARCHAR(100) NOT NULL, uf VARCHAR(2) NOT NULL, regiao VARCHAR(20), latitude DECIMAL(10,8), longitude DECIMAL(11,8), codigo_ibge VARCHAR(10), populacao INTEGER, pib_per_capita DECIMAL(12,2), created_at TIMESTAMP NOT NULL DEFAULT NOW(), created_by INTEGER, updated_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_by INTEGER, UNIQUE (cidade, uf));\"}" > /dev/null 2>&1 && echo "✅" || echo "❌"

echo "[5/10] Criando dim_mercado..."
manus-mcp-cli tool call execute_sql --server supabase --input "{\"project_id\": \"$PROJECT_ID\", \"query\": \"CREATE TABLE dim_mercado (id SERIAL PRIMARY KEY, mercado_hash VARCHAR(64) UNIQUE NOT NULL, nome VARCHAR(255) NOT NULL, categoria VARCHAR(100), segmentacao VARCHAR(255), tamanho_mercado_br DECIMAL(15,2), crescimento_anual_pct DECIMAL(5,2), tendencias TEXT[], principais_players TEXT[], enriquecido BOOLEAN DEFAULT FALSE, enriquecido_em TIMESTAMP, enriquecido_por VARCHAR(50), created_at TIMESTAMP NOT NULL DEFAULT NOW(), created_by INTEGER, updated_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_by INTEGER);\"}" > /dev/null 2>&1 && echo "✅" || echo "❌"

echo "[6/10] Criando dim_produto..."
manus-mcp-cli tool call execute_sql --server supabase --input "{\"project_id\": \"$PROJECT_ID\", \"query\": \"CREATE TABLE dim_produto (id SERIAL PRIMARY KEY, produto_hash VARCHAR(64) UNIQUE NOT NULL, nome VARCHAR(255) NOT NULL, categoria VARCHAR(100), descricao TEXT, preco_medio DECIMAL(12,2), unidade VARCHAR(20), ncm VARCHAR(10), enriquecido BOOLEAN DEFAULT FALSE, enriquecido_em TIMESTAMP, enriquecido_por VARCHAR(50), created_at TIMESTAMP NOT NULL DEFAULT NOW(), created_by INTEGER, updated_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_by INTEGER);\"}" > /dev/null 2>&1 && echo "✅" || echo "❌"

echo "[7/10] Criando dim_status_qualificacao..."
manus-mcp-cli tool call execute_sql --server supabase --input "{\"project_id\": \"$PROJECT_ID\", \"query\": \"CREATE TABLE dim_status_qualificacao (id SERIAL PRIMARY KEY, codigo VARCHAR(50) UNIQUE NOT NULL, nome VARCHAR(100) NOT NULL, descricao TEXT, cor VARCHAR(7), ordem INTEGER, created_at TIMESTAMP NOT NULL DEFAULT NOW(), created_by INTEGER, updated_at TIMESTAMP NOT NULL DEFAULT NOW(), updated_by INTEGER);\"}" > /dev/null 2>&1 && echo "✅" || echo "❌"

echo "✅ 5 dimensões criadas!"
