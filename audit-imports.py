#!/usr/bin/env python3
"""
Auditoria completa de imports/exports
"""

import os
import re
from pathlib import Path
from collections import defaultdict

# Diretórios para analisar
CLIENT_SRC = Path('client/src')

# Coletar todos os exports
exports = defaultdict(set)

print("🔍 AUDITORIA DE IMPORTS/EXPORTS\n")
print("=" * 80)

# 1. Analisar exports
print("\n1. Coletando exports...\n")

for tsx_file in CLIENT_SRC.rglob('*.tsx'):
    if 'node_modules' in str(tsx_file):
        continue
    
    with open(tsx_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Encontrar exports
    export_patterns = [
        r'export\s+function\s+(\w+)',
        r'export\s+const\s+(\w+)',
        r'export\s+interface\s+(\w+)',
        r'export\s+type\s+(\w+)',
        r'export\s+class\s+(\w+)',
        r'export\s+{\s*([^}]+)\s*}',
    ]
    
    for pattern in export_patterns:
        matches = re.findall(pattern, content)
        for match in matches:
            if ',' in match:
                # Multiple exports
                for name in match.split(','):
                    name = name.strip()
                    if name and not name.startswith('type'):
                        exports[str(tsx_file)].add(name)
            else:
                exports[str(tsx_file)].add(match)

# 2. Analisar imports
print("2. Analisando imports...\n")

problemas = []

for tsx_file in CLIENT_SRC.rglob('*.tsx'):
    if 'node_modules' in str(tsx_file):
        continue
    
    with open(tsx_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for line_num, line in enumerate(lines, 1):
        # Encontrar imports de arquivos locais
        match = re.search(r"import\s+{([^}]+)}\s+from\s+['\"](@/[^'\"]+)['\"]", line)
        if match:
            imported_names = [n.strip() for n in match.group(1).split(',')]
            import_path = match.group(2)
            
            # Converter @/ para caminho real
            real_path = import_path.replace('@/', 'client/src/')
            
            # Tentar encontrar o arquivo
            possible_files = [
                f"{real_path}.tsx",
                f"{real_path}.ts",
                f"{real_path}/index.tsx",
                f"{real_path}/index.ts",
            ]
            
            found_file = None
            for pf in possible_files:
                if Path(pf).exists():
                    found_file = pf
                    break
            
            if not found_file:
                problemas.append({
                    'tipo': 'ARQUIVO_NAO_ENCONTRADO',
                    'arquivo': str(tsx_file),
                    'linha': line_num,
                    'import_path': import_path,
                    'linha_conteudo': line.strip()
                })
                continue
            
            # Verificar se os nomes importados existem nos exports
            exported_names = exports.get(found_file, set())
            
            for imported_name in imported_names:
                imported_name = imported_name.strip()
                if imported_name and imported_name not in exported_names:
                    problemas.append({
                        'tipo': 'EXPORT_NAO_ENCONTRADO',
                        'arquivo': str(tsx_file),
                        'linha': line_num,
                        'nome': imported_name,
                        'arquivo_origem': found_file,
                        'exports_disponiveis': list(exported_names),
                        'linha_conteudo': line.strip()
                    })

# 3. Relatório
print("\n3. RELATÓRIO DE PROBLEMAS\n")
print("=" * 80)

if not problemas:
    print("✅ NENHUM PROBLEMA ENCONTRADO!")
else:
    print(f"🔴 {len(problemas)} PROBLEMAS ENCONTRADOS:\n")
    
    # Agrupar por tipo
    por_tipo = defaultdict(list)
    for p in problemas:
        por_tipo[p['tipo']].append(p)
    
    for tipo, items in por_tipo.items():
        print(f"\n{tipo}: {len(items)} ocorrências")
        print("-" * 80)
        
        for item in items[:10]:  # Mostrar primeiros 10
            print(f"\n  Arquivo: {item['arquivo']}:{item['linha']}")
            print(f"  Linha: {item['linha_conteudo']}")
            
            if tipo == 'EXPORT_NAO_ENCONTRADO':
                print(f"  ❌ Import: {item['nome']}")
                print(f"  📁 De: {item['arquivo_origem']}")
                if item['exports_disponiveis']:
                    print(f"  ✅ Disponíveis: {', '.join(item['exports_disponiveis'][:5])}")
            elif tipo == 'ARQUIVO_NAO_ENCONTRADO':
                print(f"  ❌ Path: {item['import_path']}")
        
        if len(items) > 10:
            print(f"\n  ... e mais {len(items) - 10} problemas")

print("\n" + "=" * 80)
print(f"\nTOTAL: {len(problemas)} problemas encontrados")
