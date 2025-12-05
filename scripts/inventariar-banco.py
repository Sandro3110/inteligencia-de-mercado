#!/usr/bin/env python3
"""
Script para inventariar TODAS as tabelas e campos do banco MySQL
Gera documentação completa para sincronizar schema Drizzle
"""

import os
import json
import pymysql
from urllib.parse import urlparse

# Parse DATABASE_URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL não configurada!")
    exit(1)

# Parse URL (mysql://user:pass@host:port/dbname)
parsed = urlparse(DATABASE_URL)
db_config = {
    'host': parsed.hostname,
    'port': parsed.port or 3306,
    'user': parsed.username,
    'password': parsed.password,
    'database': parsed.path.lstrip('/'),
    'charset': 'utf8mb4'
}

conn = pymysql.connect(**db_config)
cursor = conn.cursor(pymysql.cursors.DictCursor)

print("🔍 INVENTÁRIO COMPLETO DO BANCO DE DADOS\n")
print("=" * 80)

# Listar todas as tabelas
cursor.execute("SHOW TABLES")
tabelas = [list(row.values())[0] for row in cursor.fetchall()]
print(f"\n📊 Total de tabelas: {len(tabelas)}\n")

inventario = {}

for tabela in tabelas:
    print(f"\n{'='*80}")
    print(f"📋 TABELA: {tabela}")
    print(f"{'='*80}")
    
    # Listar colunas
    cursor.execute(f"DESCRIBE `{tabela}`")
    colunas = cursor.fetchall()
    
    # Listar foreign keys
    cursor.execute(f"""
        SELECT 
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = %s
        AND TABLE_NAME = %s
        AND REFERENCED_TABLE_NAME IS NOT NULL
    """, (db_config['database'], tabela))
    
    fks = cursor.fetchall()
    
    # Listar índices
    cursor.execute(f"SHOW INDEX FROM `{tabela}`")
    indices_raw = cursor.fetchall()
    
    # Processar colunas
    colunas_processadas = []
    pks = []
    for col in colunas:
        col_info = {
            'column_name': col['Field'],
            'data_type': col['Type'],
            'is_nullable': col['Null'],
            'column_default': col['Default'],
            'extra': col['Extra']
        }
        colunas_processadas.append(col_info)
        if col['Key'] == 'PRI':
            pks.append(col['Field'])
    
    # Processar índices
    indices_agrupados = {}
    for idx in indices_raw:
        nome = idx['Key_name']
        if nome not in indices_agrupados:
            indices_agrupados[nome] = []
        indices_agrupados[nome].append(idx['Column_name'])
    
    # Armazenar no inventário
    inventario[tabela] = {
        'colunas': colunas_processadas,
        'primary_keys': pks,
        'foreign_keys': [dict(fk) for fk in fks],
        'indices': indices_agrupados
    }
    
    # Imprimir resumo
    print(f"\n📝 Colunas ({len(colunas_processadas)}):")
    for col in colunas_processadas:
        pk_mark = " 🔑 PK" if col['column_name'] in pks else ""
        nullable = col['is_nullable']
        tipo = col['data_type']
        extra = f" {col['extra']}" if col['extra'] else ""
        print(f"  - {col['column_name']}: {tipo} {nullable}{extra}{pk_mark}")
    
    if fks:
        num_fks = len(fks)
        print(f"\n🔗 Foreign Keys ({num_fks}):")
        for fk in fks:
            print(f"  - {fk['COLUMN_NAME']} → {fk['REFERENCED_TABLE_NAME']}.{fk['REFERENCED_COLUMN_NAME']}")
    
    if indices_agrupados:
        # Remover PRIMARY do count
        indices_sem_pk = {k: v for k, v in indices_agrupados.items() if k != 'PRIMARY'}
        if indices_sem_pk:
            num_indices = len(indices_sem_pk)
            print(f"\n📇 Índices ({num_indices}):")
            for nome, colunas_idx in indices_sem_pk.items():
                print(f"  - {nome}: [{', '.join(colunas_idx)}]")

# Salvar inventário em JSON
output_file = '/home/ubuntu/inteligencia-de-mercado/INVENTARIO_BANCO.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(inventario, f, indent=2, ensure_ascii=False)

# Salvar resumo em Markdown
output_md = '/home/ubuntu/inteligencia-de-mercado/INVENTARIO_BANCO.md'
with open(output_md, 'w', encoding='utf-8') as f:
    f.write("# INVENTÁRIO COMPLETO DO BANCO DE DADOS\n\n")
    f.write(f"**Total de tabelas:** {len(inventario)}\n\n")
    f.write("---\n\n")
    
    for tabela, info in inventario.items():
        f.write(f"## {tabela}\n\n")
        f.write(f"**Colunas:** {len(info['colunas'])}\n\n")
        f.write("| Campo | Tipo | Nullable | Extra | PK |\n")
        f.write("|-------|------|----------|-------|----|\n")
        for col in info['colunas']:
            pk = "✓" if col['column_name'] in info['primary_keys'] else ""
            f.write(f"| {col['column_name']} | {col['data_type']} | {col['is_nullable']} | {col['extra'] or '-'} | {pk} |\n")
        
        if info['foreign_keys']:
            f.write(f"\n**Foreign Keys:** {len(info['foreign_keys'])}\n\n")
            for fk in info['foreign_keys']:
                f.write(f"- `{fk['COLUMN_NAME']}` → `{fk['REFERENCED_TABLE_NAME']}.{fk['REFERENCED_COLUMN_NAME']}`\n")
        
        if info['indices']:
            indices_sem_pk = {k: v for k, v in info['indices'].items() if k != 'PRIMARY'}
            if indices_sem_pk:
                f.write(f"\n**Índices:** {len(indices_sem_pk)}\n\n")
                for nome, colunas_idx in indices_sem_pk.items():
                    f.write(f"- `{nome}`: [{', '.join(colunas_idx)}]\n")
        
        f.write("\n---\n\n")

print(f"\n\n{'='*80}")
print(f"✅ Inventário completo salvo em:")
print(f"   - JSON: {output_file}")
print(f"   - Markdown: {output_md}")
print(f"📊 Total de tabelas inventariadas: {len(inventario)}")
print(f"{'='*80}\n")

cursor.close()
conn.close()
