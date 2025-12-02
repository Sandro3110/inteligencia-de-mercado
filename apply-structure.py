#!/usr/bin/env python3
import subprocess
import sys

project_id = "ecnzlynmuerbmqingyfl"

# Lista de comandos SQL para executar sequencialmente
sql_commands = [
    # Extensões
    "CREATE EXTENSION IF NOT EXISTS pg_trgm;",
    
    # dim_entidade (tabela)
    """CREATE TABLE dim_entidade (
  id SERIAL PRIMARY KEY,
  entidade_hash VARCHAR(64) UNIQUE NOT NULL,
  tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')),
  nome VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  site VARCHAR(255),
  num_filiais INTEGER DEFAULT 0,
  num_lojas INTEGER DEFAULT 0,
  num_funcionarios INTEGER,
  origem_tipo VARCHAR(20) NOT NULL CHECK (origem_tipo IN ('importacao', 'ia_prompt', 'api', 'manual')),
  origem_arquivo VARCHAR(255),
  origem_processo VARCHAR(100),
  origem_prompt TEXT,
  origem_confianca INTEGER CHECK (origem_confianca BETWEEN 0 AND 100),
  origem_data TIMESTAMP NOT NULL DEFAULT NOW(),
  origem_usuario_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,
  deleted_at TIMESTAMP,
  deleted_by INTEGER,
  FOREIGN KEY (origem_usuario_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
);""",
]

for i, sql in enumerate(sql_commands, 1):
    print(f"[{i}/{len(sql_commands)}] Executando...")
    # Escapar aspas para JSON
    sql_escaped = sql.replace('"', '\\"').replace('\n', ' ')
    cmd = f'manus-mcp-cli tool call execute_sql --server supabase --input \'{{"project_id": "{project_id}", "query": "{sql_escaped}"}}\''
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ERRO: {result.stderr}")
        sys.exit(1)
    print(f"OK")

print("✅ Estrutura criada com sucesso!")
