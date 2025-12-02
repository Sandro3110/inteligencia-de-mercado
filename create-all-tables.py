#!/usr/bin/env python3
import subprocess
import re

project_id = "ecnzlynmuerbmqingyfl"

# Ler SQL completo
with open('/home/ubuntu/inteligencia-de-mercado/migrations/003_criar_estrutura_completa.sql', 'r') as f:
    sql_full = f.read()

# Extrair CREATE TABLE statements
tables = re.findall(r'CREATE TABLE.*?;', sql_full, re.DOTALL)
print(f"📊 Encontradas {len(tables)} tabelas")

# Extrair CREATE INDEX statements  
indexes = re.findall(r'CREATE INDEX.*?;', sql_full, re.DOTALL)
print(f"📊 Encontrados {len(indexes)} índices")

# Executar tabelas
for i, table_sql in enumerate(tables, 1):
    table_name = re.search(r'CREATE TABLE (\w+)', table_sql).group(1)
    print(f"[{i}/{len(tables)}] Criando {table_name}...", end=' ', flush=True)
    
    # Limpar SQL
    clean_sql = ' '.join(table_sql.split())
    clean_sql = clean_sql.replace('"', '\\"')
    
    cmd = f'manus-mcp-cli tool call execute_sql --server supabase --input \'{{"project_id": "{project_id}", "query": "{clean_sql}"}}\''
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if 'error' in result.stdout.lower() or result.returncode != 0:
        print(f"❌ ERRO")
        print(result.stdout[-500:])
        break
    print("✅")

print("\n🎯 Criando índices...")

# Executar índices (em lotes de 5)
batch_size = 5
for i in range(0, len(indexes), batch_size):
    batch = indexes[i:i+batch_size]
    print(f"[{i+1}-{min(i+batch_size, len(indexes))}/{len(indexes)}] Criando índices...", end=' ', flush=True)
    
    for idx_sql in batch:
        clean_sql = ' '.join(idx_sql.split()).replace('"', '\\"')
        cmd = f'manus-mcp-cli tool call execute_sql --server supabase --input \'{{"project_id": "{project_id}", "query": "{clean_sql}"}}\''
        subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    print("✅")

print("\n✅ Estrutura completa criada!")
