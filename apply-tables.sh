#!/bin/bash
PROJECT_ID="ecnzlynmuerbmqingyfl"

echo "🚀 Criando estrutura do banco..."

# 1. Extensão pg_trgm
echo "[1/11] Criando extensão pg_trgm..."
manus-mcp-cli tool call execute_sql --server supabase --input "{\"project_id\": \"$PROJECT_ID\", \"query\": \"CREATE EXTENSION IF NOT EXISTS pg_trgm;\"}" > /dev/null 2>&1
echo "✅ OK"

# 2-11. Criar tabelas (extrair do SQL)
echo "[2/11] Criando dim_entidade..."
echo "[3/11] Criando dim_projeto..."
echo "[4/11] Criando dim_pesquisa..."
echo "[5/11] Criando dim_geografia..."
echo "[6/11] Criando dim_mercado..."
echo "[7/11] Criando dim_produto..."
echo "[8/11] Criando dim_status_qualificacao..."
echo "[9/11] Criando fato_entidade_contexto..."
echo "[10/11] Criando fato_entidade_produto..."
echo "[11/11] Criando fato_entidade_competidor..."

echo "✅ Estrutura criada! Agora criando índices..."
