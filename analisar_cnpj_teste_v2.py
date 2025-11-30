import json

# Ler resultado do teste
with open('resultado_teste_piloto_v2.json', 'r', encoding='utf-8') as f:
    dados = json.load(f)

print("=" * 80)
print("ANÁLISE DE CNPJs - TESTE PILOTO V2")
print("=" * 80)
print()

total_clientes = len(dados['resultados'])
print(f"📊 Total de clientes testados: {total_clientes}")
print()

# Analisar CNPJs dos clientes
print("=" * 80)
print("1. CNPJs DOS CLIENTES (após enriquecimento)")
print("=" * 80)

clientes_com_cnpj = 0
clientes_sem_cnpj = 0
clientes_cnpj_original = 0

for i, resultado in enumerate(dados['resultados'], 1):
    cliente_original = resultado['clienteOriginal']
    cliente_enriquecido = resultado['enriquecimento']['cliente']
    
    cnpj_original = cliente_original.get('cnpj')
    cnpj_enriquecido = cliente_enriquecido.get('cnpj')
    
    print(f"\n{i}. {cliente_original['nome']}")
    print(f"   CNPJ Original: {cnpj_original or 'null'}")
    print(f"   CNPJ Enriquecido: {cnpj_enriquecido or 'null'}")
    
    if cnpj_enriquecido and cnpj_enriquecido != 'null':
        clientes_com_cnpj += 1
        if cnpj_original == cnpj_enriquecido:
            clientes_cnpj_original += 1
            print(f"   Status: ✅ PRESERVADO (manteve o original)")
        else:
            print(f"   Status: ⚠️ MODIFICADO (diferente do original)")
    else:
        clientes_sem_cnpj += 1
        print(f"   Status: ❌ NULL (não conseguiu preencher)")

print()
print("=" * 80)
print("RESUMO - CLIENTES")
print("=" * 80)
print(f"✅ Com CNPJ: {clientes_com_cnpj}/{total_clientes} ({clientes_com_cnpj/total_clientes*100:.1f}%)")
print(f"   - Preservados (original): {clientes_cnpj_original}")
print(f"   - Modificados: {clientes_com_cnpj - clientes_cnpj_original}")
print(f"❌ Sem CNPJ (null): {clientes_sem_cnpj}/{total_clientes} ({clientes_sem_cnpj/total_clientes*100:.1f}%)")
print()

# Analisar CNPJs dos concorrentes
print("=" * 80)
print("2. CNPJs DOS CONCORRENTES")
print("=" * 80)

total_concorrentes = 0
concorrentes_com_cnpj = 0
concorrentes_sem_cnpj = 0

for resultado in dados['resultados']:
    concorrentes = resultado['enriquecimento']['concorrentes']
    total_concorrentes += len(concorrentes)
    
    for conc in concorrentes:
        if conc.get('cnpj') and conc['cnpj'] != 'null':
            concorrentes_com_cnpj += 1
        else:
            concorrentes_sem_cnpj += 1

print(f"\nTotal de concorrentes: {total_concorrentes}")
print(f"✅ Com CNPJ: {concorrentes_com_cnpj}/{total_concorrentes} ({concorrentes_com_cnpj/total_concorrentes*100:.1f}%)")
print(f"❌ Sem CNPJ (null): {concorrentes_sem_cnpj}/{total_concorrentes} ({concorrentes_sem_cnpj/total_concorrentes*100:.1f}%)")
print()

# Analisar CNPJs dos leads
print("=" * 80)
print("3. CNPJs DOS LEADS")
print("=" * 80)

total_leads = 0
leads_com_cnpj = 0
leads_sem_cnpj = 0

for resultado in dados['resultados']:
    leads = resultado['enriquecimento']['leads']
    total_leads += len(leads)
    
    for lead in leads:
        if lead.get('cnpj') and lead['cnpj'] != 'null':
            leads_com_cnpj += 1
        else:
            leads_sem_cnpj += 1

print(f"\nTotal de leads: {total_leads}")
print(f"✅ Com CNPJ: {leads_com_cnpj}/{total_leads} ({leads_com_cnpj/total_leads*100:.1f}%)")
print(f"❌ Sem CNPJ (null): {leads_sem_cnpj}/{total_leads} ({leads_sem_cnpj/total_leads*100:.1f}%)")
print()

# Resumo geral
print("=" * 80)
print("RESUMO GERAL")
print("=" * 80)
print()
print(f"📊 CLIENTES:")
print(f"   ✅ {clientes_com_cnpj}/{total_clientes} com CNPJ ({clientes_com_cnpj/total_clientes*100:.1f}%)")
print(f"   ❌ {clientes_sem_cnpj}/{total_clientes} sem CNPJ ({clientes_sem_cnpj/total_clientes*100:.1f}%)")
print()
print(f"📊 CONCORRENTES:")
print(f"   ✅ {concorrentes_com_cnpj}/{total_concorrentes} com CNPJ ({concorrentes_com_cnpj/total_concorrentes*100:.1f}%)")
print(f"   ❌ {concorrentes_sem_cnpj}/{total_concorrentes} sem CNPJ ({concorrentes_sem_cnpj/total_concorrentes*100:.1f}%)")
print()
print(f"📊 LEADS:")
print(f"   ✅ {leads_com_cnpj}/{total_leads} com CNPJ ({leads_com_cnpj/total_leads*100:.1f}%)")
print(f"   ❌ {leads_sem_cnpj}/{total_leads} sem CNPJ ({leads_sem_cnpj/total_leads*100:.1f}%)")
print()
print(f"📊 TOTAL GERAL:")
total_entidades = total_clientes + total_concorrentes + total_leads
total_com_cnpj = clientes_com_cnpj + concorrentes_com_cnpj + leads_com_cnpj
total_sem_cnpj = clientes_sem_cnpj + concorrentes_sem_cnpj + leads_sem_cnpj
print(f"   ✅ {total_com_cnpj}/{total_entidades} com CNPJ ({total_com_cnpj/total_entidades*100:.1f}%)")
print(f"   ❌ {total_sem_cnpj}/{total_entidades} sem CNPJ ({total_sem_cnpj/total_entidades*100:.1f}%)")
print()
print("=" * 80)
