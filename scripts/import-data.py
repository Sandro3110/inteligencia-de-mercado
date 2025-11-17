#!/usr/bin/env python3
"""
Script para importar dados dos arquivos JSON para o banco local
"""

import json
import mysql.connector
import os
import re

def connect_db():
    """Conecta ao banco local"""
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise Exception("DATABASE_URL não configurada")
    
    # Parse DATABASE_URL
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

def import_data():
    print("🚀 Iniciando importação de dados...\n")
    
    conn = connect_db()
    cursor = conn.cursor()
    
    # 1. Mercados
    print("📦 Importando mercados_unicos...")
    with open("scripts/data_mercados_unicos.json", "r", encoding='utf-8') as f:
        mercados = json.load(f)
    
    for m in mercados:
        cursor.execute("""
            INSERT INTO mercados_unicos 
            (id, mercadoHash, nome, segmentacao, categoria, tamanhoMercado, 
             crescimentoAnual, tendencias, principaisPlayers, quantidadeClientes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE nome=VALUES(nome)
        """, (
            m['id'], m.get('mercado_hash'), m['nome'], m.get('segmentacao'), 
            m.get('categoria'), m.get('tamanho_mercado'), m.get('crescimento_anual'),
            m.get('tendencias'), m.get('principais_players'), m.get('quantidade_clientes', 0)
        ))
    conn.commit()
    print(f"   ✅ {len(mercados)} mercados importados")
    
    # 2. Clientes
    print("\n📦 Importando clientes...")
    with open("scripts/data_clientes.json", "r", encoding='utf-8') as f:
        clientes = json.load(f)
    
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
    print(f"   ✅ {len(clientes)} clientes importados")
    
    # 3. Clientes_Mercados
    print("\n📦 Importando clientes_mercados...")
    with open("scripts/data_clientes_mercados.json", "r", encoding='utf-8') as f:
        cm = json.load(f)
    
    for rel in cm:
        cursor.execute("""
            INSERT INTO clientes_mercados (id, clienteId, mercadoId)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE clienteId=VALUES(clienteId)
        """, (rel['id'], rel['cliente_id'], rel['mercado_id']))
    conn.commit()
    print(f"   ✅ {len(cm)} associações importadas")
    
    # 4. Concorrentes
    print("\n📦 Importando concorrentes...")
    with open("scripts/data_concorrentes.json", "r", encoding='utf-8') as f:
        concorrentes = json.load(f)
    
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
    print(f"   ✅ {len(concorrentes)} concorrentes importados")
    
    # 5. Leads
    print("\n📦 Importando leads...")
    with open("scripts/data_leads.json", "r", encoding='utf-8') as f:
        leads = json.load(f)
    
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
    print(f"   ✅ {len(leads)} leads importados")
    
    cursor.close()
    conn.close()
    
    print("\n🎉 Importação concluída com sucesso!")
    print(f"\n📊 Resumo:")
    print(f"   - Mercados: {len(mercados)}")
    print(f"   - Clientes: {len(clientes)}")
    print(f"   - Associações: {len(cm)}")
    print(f"   - Concorrentes: {len(concorrentes)}")
    print(f"   - Leads: {len(leads)}")
    print(f"   - Total: {len(mercados) + len(clientes) + len(cm) + len(concorrentes) + len(leads)} registros\n")

if __name__ == "__main__":
    import_data()

