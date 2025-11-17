#!/usr/bin/env python3
"""
Script para migrar dados do Supabase para o banco local
Usa MCP CLI para buscar dados e mysql-connector para inserir
"""

import subprocess
import json
import re
import mysql.connector
import os

PROJECT_ID = "renbtffuepmnsiigkobl"

def query_supabase(sql):
    """Executa query no Supabase via MCP CLI"""
    print(f"📊 Buscando dados: {sql[:60]}...")
    
    cmd = [
        "manus-mcp-cli", "tool", "call", "execute_sql",
        "--server", "supabase",
        "--input", json.dumps({"project_id": PROJECT_ID, "query": sql})
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stdout
    
    # Extrair JSON entre as tags
    match = re.search(r'\[{.*}\]', output, re.DOTALL)
    if not match:
        print(f"   ⚠️  Nenhum dado encontrado")
        return []
    
    data = json.loads(match.group(0))
    print(f"   ✅ {len(data)} registros encontrados")
    return data

def connect_db():
    """Conecta ao banco local"""
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise Exception("DATABASE_URL não configurada")
    
    # Parse DATABASE_URL (formato: mysql://user:pass@host:port/db?params)
    match = re.match(r'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)', db_url)
    if not match:
        raise Exception("DATABASE_URL inválida")
    
    user, password, host, port, database = match.groups()
    
    return mysql.connector.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=database,
        ssl_disabled=False
    )

def migrate():
    print("🚀 Iniciando migração de dados...\n")
    
    conn = connect_db()
    cursor = conn.cursor()
    
    # 1. Mercados
    print("\n📦 Migrando mercados_unicos...")
    mercados = query_supabase("SELECT * FROM mercados_unicos ORDER BY id")
    
    for m in mercados:
        cursor.execute("""
            INSERT INTO mercados_unicos 
            (id, mercadoHash, nome, segmentacao, categoria, tamanhoMercado, 
             crescimentoAnual, tendencias, principaisPlayers, quantidadeClientes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE nome=VALUES(nome)
        """, (
            m['id'], m['mercado_hash'], m['nome'], m['segmentacao'], 
            m['categoria'], m['tamanho_mercado'], m['crescimento_anual'],
            m['tendencias'], m['principais_players'], m.get('quantidade_clientes', 0)
        ))
    conn.commit()
    print(f"   ✅ {len(mercados)} mercados migrados")
    
    # 2. Clientes
    print("\n📦 Migrando clientes...")
    clientes = query_supabase("SELECT * FROM clientes ORDER BY id")
    
    for c in clientes:
        cursor.execute("""
            INSERT INTO clientes 
            (id, clienteHash, nome, cnpj, siteOficial, produtoPrincipal, 
             segmentacaoB2bB2c, email, telefone, linkedin, instagram, 
             cidade, uf, cnae, validationStatus)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE nome=VALUES(nome)
        """, (
            c['id'], c.get('cliente_hash'), c.get('nome') or c.get('empresa'), 
            c.get('cnpj'), c.get('site_oficial'), c.get('produto_principal'),
            c.get('segmentacao_b2b_b2c'), c.get('email'), c.get('telefone'),
            c.get('linkedin'), c.get('instagram'), c.get('cidade'), 
            c.get('uf'), c.get('cnae'), 'pending'
        ))
    conn.commit()
    print(f"   ✅ {len(clientes)} clientes migrados")
    
    # 3. Clientes_Mercados
    print("\n📦 Migrando clientes_mercados...")
    cm = query_supabase("SELECT * FROM clientes_mercados ORDER BY id")
    
    for rel in cm:
        cursor.execute("""
            INSERT INTO clientes_mercados (id, clienteId, mercadoId)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE clienteId=VALUES(clienteId)
        """, (rel['id'], rel['cliente_id'], rel['mercado_id']))
    conn.commit()
    print(f"   ✅ {len(cm)} associações migradas")
    
    # 4. Concorrentes
    print("\n📦 Migrando concorrentes_fase3...")
    concorrentes = query_supabase("SELECT * FROM concorrentes_fase3 ORDER BY id")
    
    for conc in concorrentes:
        cursor.execute("""
            INSERT INTO concorrentes 
            (id, concorrenteHash, mercadoId, nome, cnpj, site, produto, 
             porte, faturamentoEstimado, qualidadeScore, qualidadeClassificacao, 
             validationStatus)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE nome=VALUES(nome)
        """, (
            conc['id'], conc.get('concorrente_hash'), conc['mercado_id'],
            conc['nome'], conc.get('cnpj'), conc.get('site'), conc.get('produto'),
            conc.get('porte'), conc.get('faturamento_estimado'),
            conc.get('qualidade_score'), conc.get('qualidade_classificacao'),
            'pending'
        ))
    conn.commit()
    print(f"   ✅ {len(concorrentes)} concorrentes migrados")
    
    # 5. Leads
    print("\n📦 Migrando leads_fase4...")
    leads = query_supabase("SELECT * FROM leads_fase4 ORDER BY id")
    
    for lead in leads:
        cursor.execute("""
            INSERT INTO leads 
            (id, leadHash, mercadoId, nome, cnpj, site, email, telefone, 
             tipo, porte, regiao, setor, qualidadeScore, qualidadeClassificacao,
             validationStatus)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE nome=VALUES(nome)
        """, (
            lead['id'], lead.get('lead_hash'), lead['mercado_id'],
            lead['nome'], lead.get('cnpj'), lead.get('site'), lead.get('email'),
            lead.get('telefone'), lead.get('tipo'), lead.get('porte'),
            lead.get('regiao'), lead.get('setor'), lead.get('qualidade_score'),
            lead.get('qualidade_classificacao'), 'pending'
        ))
    conn.commit()
    print(f"   ✅ {len(leads)} leads migrados")
    
    cursor.close()
    conn.close()
    
    print("\n🎉 Migração concluída com sucesso!")
    print(f"\n📊 Resumo:")
    print(f"   - Mercados: {len(mercados)}")
    print(f"   - Clientes: {len(clientes)}")
    print(f"   - Associações: {len(cm)}")
    print(f"   - Concorrentes: {len(concorrentes)}")
    print(f"   - Leads: {len(leads)}")
    print(f"   - Total: {len(mercados) + len(clientes) + len(cm) + len(concorrentes) + len(leads)} registros\n")

if __name__ == "__main__":
    migrate()

