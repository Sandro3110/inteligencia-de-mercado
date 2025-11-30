#!/usr/bin/env python3
"""
Análise de Qualidade da Base de Dados
"""

import os
import json
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Carregar variáveis de ambiente
load_dotenv()

# Conectar ao banco
DATABASE_URL = os.getenv('DATABASE_URL')
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor(cursor_factory=RealDictCursor)

print("=" * 80)
print("ANÁLISE DE QUALIDADE DA BASE DE DADOS - PESQUISA ID: 1")
print("=" * 80)
print()

# ==========================================
# 1. ANÁLISE DE DOCUMENTOS (CNPJ/CPF)
# ==========================================
print("📋 1. ANÁLISE DE DOCUMENTOS (CNPJ/CPF)")
print("-" * 80)

# Clientes
cur.execute("""
SELECT 
  'CLIENTES' as tabela,
  COUNT(*) as total,
  COUNT(cnpj) as com_cnpj,
  COUNT(*) - COUNT(cnpj) as sem_cnpj,
  ROUND(COUNT(cnpj)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as percentual_preenchido
FROM clientes
WHERE "pesquisaId" = 1;
""")
clientes_cnpj = cur.fetchone()
print(f"CLIENTES:")
print(f"  Total: {clientes_cnpj['total']}")
print(f"  Com CNPJ: {clientes_cnpj['com_cnpj']} ({clientes_cnpj['percentual_preenchido']}%)")
print(f"  Sem CNPJ: {clientes_cnpj['sem_cnpj']}")
print()

# Leads
cur.execute("""
SELECT 
  'LEADS' as tabela,
  COUNT(*) as total,
  COUNT(cnpj) as com_cnpj,
  COUNT(*) - COUNT(cnpj) as sem_cnpj,
  ROUND(COUNT(cnpj)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as percentual_preenchido
FROM leads
WHERE "pesquisaId" = 1;
""")
leads_cnpj = cur.fetchone()
print(f"LEADS:")
print(f"  Total: {leads_cnpj['total']}")
print(f"  Com CNPJ: {leads_cnpj['com_cnpj']} ({leads_cnpj['percentual_preenchido']}%)")
print(f"  Sem CNPJ: {leads_cnpj['sem_cnpj']}")
print()

# Concorrentes
cur.execute("""
SELECT 
  'CONCORRENTES' as tabela,
  COUNT(*) as total,
  COUNT(cnpj) as com_cnpj,
  COUNT(*) - COUNT(cnpj) as sem_cnpj,
  ROUND(COUNT(cnpj)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as percentual_preenchido
FROM concorrentes
WHERE "pesquisaId" = 1;
""")
concorrentes_cnpj = cur.fetchone()
print(f"CONCORRENTES:")
print(f"  Total: {concorrentes_cnpj['total']}")
print(f"  Com CNPJ: {concorrentes_cnpj['com_cnpj']} ({concorrentes_cnpj['percentual_preenchido']}%)")
print(f"  Sem CNPJ: {concorrentes_cnpj['sem_cnpj']}")
print()

# ==========================================
# 2. ANÁLISE DE ENRIQUECIMENTO
# ==========================================
print("📊 2. ANÁLISE DE ENRIQUECIMENTO")
print("-" * 80)

# Clientes
cur.execute("""
SELECT 
  COUNT(*) as total,
  ROUND(AVG("qualidadeScore"), 2) as score_medio,
  COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
  COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
  COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim,
  COUNT(cidade) as com_cidade,
  COUNT(uf) as com_uf,
  COUNT(telefone) as com_telefone,
  COUNT(email) as com_email,
  ROUND(COUNT(cidade)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as perc_cidade
FROM clientes
WHERE "pesquisaId" = 1;
""")
clientes_enriq = cur.fetchone()
print(f"CLIENTES:")
print(f"  Score Médio: {clientes_enriq['score_medio']}")
print(f"  Excelente (≥8): {clientes_enriq['excelente']}")
print(f"  Bom (5-7): {clientes_enriq['bom']}")
print(f"  Ruim (<5): {clientes_enriq['ruim']}")
print(f"  Com Cidade: {clientes_enriq['com_cidade']} ({clientes_enriq['perc_cidade']}%)")
print()

# Leads
cur.execute("""
SELECT 
  COUNT(*) as total,
  ROUND(AVG("qualidadeScore"), 2) as score_medio,
  COUNT(CASE WHEN "qualidadeScore" >= 8 THEN 1 END) as excelente,
  COUNT(CASE WHEN "qualidadeScore" >= 5 AND "qualidadeScore" < 8 THEN 1 END) as bom,
  COUNT(CASE WHEN "qualidadeScore" < 5 THEN 1 END) as ruim,
  COUNT(cidade) as com_cidade,
  ROUND(COUNT(cidade)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as perc_cidade
FROM leads
WHERE "pesquisaId" = 1;
""")
leads_enriq = cur.fetchone()
print(f"LEADS:")
print(f"  Score Médio: {leads_enriq['score_medio']}")
print(f"  Excelente (≥8): {leads_enriq['excelente']}")
print(f"  Bom (5-7): {leads_enriq['bom']}")
print(f"  Ruim (<5): {leads_enriq['ruim']}")
print(f"  Com Cidade: {leads_enriq['com_cidade']} ({leads_enriq['perc_cidade']}%)")
print()

# ==========================================
# 3. ANÁLISE DE MERCADOS
# ==========================================
print("🗺️  3. ANÁLISE DE MERCADOS")
print("-" * 80)

try:
    cur.execute("""
    SELECT 
      COUNT(*) as total_mercados,
      COUNT("tamanhoMercado") as com_tamanho,
      COUNT(tendencias) as com_tendencias,
      COUNT("crescimentoAnual") as com_crescimento,
      COUNT("principaisPlayers") as com_players,
      ROUND(AVG("quantidadeClientes"), 0) as clientes_medio,
      ROUND(COUNT("tamanhoMercado")::numeric / NULLIF(COUNT(*), 0) * 100, 2) as perc_tamanho,
      ROUND(COUNT(tendencias)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as perc_tendencias
    FROM mercados_unicos
    WHERE "pesquisaId" = 1;
    """)
    mercados = cur.fetchone()
    print(f"MERCADOS:")
    print(f"  Total: {mercados['total_mercados']}")
    print(f"  Com Tamanho: {mercados['com_tamanho']} ({mercados['perc_tamanho']}%)")
    print(f"  Com Tendências: {mercados['com_tendencias']} ({mercados['perc_tendencias']}%)")
    print(f"  Com Crescimento: {mercados['com_crescimento']}")
    print(f"  Com Players: {mercados['com_players']}")
    print(f"  Clientes Médio: {mercados['clientes_medio']}")
except Exception as e:
    print(f"  ⚠️ Erro ao analisar mercados: {e}")
    mercados = {'total_mercados': 0, 'com_tamanho': 0, 'perc_tamanho': 0}
    conn.rollback()  # Rollback da transação após erro
print()

# ==========================================
# 4. ANÁLISE GEOGRÁFICA
# ==========================================
print("📍 4. ANÁLISE GEOGRÁFICA")
print("-" * 80)

cur.execute("""
SELECT 
  SUM(total) as total_entidades,
  SUM(com_coordenadas) as total_geocodificado,
  ROUND(SUM(com_coordenadas)::numeric / NULLIF(SUM(total), 0) * 100, 2) as perc_geocodificado
FROM (
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas
  FROM clientes WHERE "pesquisaId" = 1
  UNION ALL
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas
  FROM leads WHERE "pesquisaId" = 1
  UNION ALL
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as com_coordenadas
  FROM concorrentes WHERE "pesquisaId" = 1
) sub;
""")
geo = cur.fetchone()
print(f"GEOLOCALIZAÇÃO:")
print(f"  Total de Entidades: {geo['total_entidades']}")
print(f"  Geocodificadas: {geo['total_geocodificado']} ({geo['perc_geocodificado']}%)")
print(f"  Sem Coordenadas: {geo['total_entidades'] - geo['total_geocodificado']}")
print()

# ==========================================
# 5. RESUMO GERAL
# ==========================================
print("=" * 80)
print("📈 RESUMO GERAL DE QUALIDADE")
print("=" * 80)

total_entidades = clientes_cnpj['total'] + leads_cnpj['total'] + concorrentes_cnpj['total']
total_com_cnpj = clientes_cnpj['com_cnpj'] + leads_cnpj['com_cnpj'] + concorrentes_cnpj['com_cnpj']
perc_cnpj = round(total_com_cnpj / total_entidades * 100, 2) if total_entidades > 0 else 0

# Calcular score médio geral (ignorar None)
scores = []
if clientes_enriq['score_medio'] is not None:
    scores.append(clientes_enriq['score_medio'])
if leads_enriq['score_medio'] is not None:
    scores.append(leads_enriq['score_medio'])
score_medio_geral = round(sum(scores) / len(scores), 2) if scores else 0

print(f"Total de Entidades: {total_entidades}")
print(f"  - Clientes: {clientes_cnpj['total']}")
print(f"  - Leads: {leads_cnpj['total']}")
print(f"  - Concorrentes: {concorrentes_cnpj['total']}")
print()
print(f"Qualidade de Documentos (CNPJ): {perc_cnpj}%")
print(f"Score Médio de Enriquecimento: {score_medio_geral}/10")
print(f"Mercados Identificados: {mercados['total_mercados']}")
print(f"Taxa de Geocodificação: {geo['perc_geocodificado']}%")
print()

# Fechar conexão
cur.close()
conn.close()

print("=" * 80)
print("✅ Análise concluída!")
print("=" * 80)
