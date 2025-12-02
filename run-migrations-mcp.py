#!/usr/bin/env python3
"""
Script para executar migrations via MCP Supabase
"""

import os
import json
import subprocess
from pathlib import Path

PROJECT_ID = "ecnzlynmuerbmqingyfl"  # Intelmarket
MIGRATIONS_DIR = Path("/home/ubuntu/inteligencia-de-mercado/drizzle/migrations")

# Migrations a executar (em ordem)
MIGRATIONS = [
    "001_create_dim_tempo.sql",
    "002_add_temporal_fields.sql",
    "003_add_business_metrics.sql",
    "004_add_hierarchies.sql",
    "005_create_dim_canal.sql",
    "006_create_indexes.sql",
    "007_add_secondary_metrics.sql",
]

def run_migration(migration_file):
    """Executa uma migration via MCP"""
    
    migration_path = MIGRATIONS_DIR / migration_file
    migration_name = migration_file.replace(".sql", "")
    
    print(f"\n{'='*80}")
    print(f"⏳ Executando: {migration_file}")
    print(f"{'='*80}")
    
    # Ler SQL
    with open(migration_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Criar JSON de input
    input_data = {
        "project_id": PROJECT_ID,
        "name": migration_name,
        "query": sql_content
    }
    
    input_json = json.dumps(input_data)
    
    # Executar via MCP
    try:
        result = subprocess.run(
            [
                "manus-mcp-cli", "tool", "call", "apply_migration",
                "--server", "supabase",
                "--input", input_json
            ],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            print(f"✅ {migration_file} - SUCESSO")
            if result.stdout:
                print(f"Output: {result.stdout[:200]}")
        else:
            print(f"❌ {migration_file} - ERRO")
            print(f"Stderr: {result.stderr}")
            
            # Continuar mesmo com erro (pode já ter sido executada)
            
    except subprocess.TimeoutExpired:
        print(f"⏱️  {migration_file} - TIMEOUT (120s)")
    except Exception as e:
        print(f"❌ {migration_file} - EXCEÇÃO: {str(e)}")

def main():
    print("🚀 Iniciando execução de migrations via MCP Supabase")
    print(f"📊 Projeto: {PROJECT_ID} (Intelmarket)")
    print(f"📁 Migrations: {len(MIGRATIONS)}\n")
    
    for migration in MIGRATIONS:
        run_migration(migration)
    
    print(f"\n{'='*80}")
    print("🎉 Processo concluído!")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    main()
