import os
import json
import psycopg2

# DATABASE_URL já está no environment
database_url = os.getenv('DATABASE_URL')

print("🔍 Conectando ao banco de dados...\n")

# Conectar ao banco
conn = psycopg2.connect(database_url)
cur = conn.cursor()

# Buscar pesquisa "Base Inicial"
print('🔍 Buscando pesquisa "Base Inicial"...\n')
cur.execute("SELECT id, nome FROM pesquisas WHERE nome = 'Base Inicial' LIMIT 1")
pesquisa = cur.fetchone()

if not pesquisa:
    print('❌ Pesquisa "Base Inicial" não encontrada!')
    exit(1)

pesquisa_id, pesquisa_nome = pesquisa
print(f'✅ Pesquisa encontrada: {pesquisa_nome} (ID: {pesquisa_id})\n')

# Buscar clientes
print('🔍 Buscando clientes...\n')
cur.execute("""
    SELECT id, nome, cnpj, site, cidade, uf, setor, descricao
    FROM clientes
    WHERE pesquisa_id = %s
    LIMIT 10
""", (pesquisa_id,))

clientes = cur.fetchall()
print(f'📊 Total: {len(clientes)} clientes\n')
print('=' * 80)

# Exibir clientes
for i, cliente in enumerate(clientes, 1):
    id, nome, cnpj, site, cidade, uf, setor, descricao = cliente
    print(f'\n{i}. {nome}')
    print(f'   Cidade: {cidade or "N/A"}, UF: {uf or "N/A"}')
    print(f'   Setor: {setor or "N/A"}')

print('\n' + '=' * 80)

# Salvar JSON (primeiros 5)
resultado = {
    'pesquisa': {'id': pesquisa_id, 'nome': pesquisa_nome},
    'totalClientes': len(clientes),
    'clientes': [
        {
            'id': c[0],
            'nome': c[1],
            'cnpj': c[2],
            'site': c[3],
            'cidade': c[4],
            'uf': c[5],
            'setor': c[6],
            'descricao': c[7]
        }
        for c in clientes[:5]
    ]
}

with open('clientes_base_inicial.json', 'w', encoding='utf-8') as f:
    json.dump(resultado, f, indent=2, ensure_ascii=False)

print('\n💾 5 clientes salvos em: clientes_base_inicial.json')

cur.close()
conn.close()
