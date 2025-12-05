#!/usr/bin/env python3
"""
Analisa código antigo (client/src/) e identifica padrões problemáticos
ANTES de migrar para Next.js
"""

import re
import os
from pathlib import Path
from collections import defaultdict

# Padrões problemáticos a detectar
PADROES_PROBLEMATICOS = {
    "toast_shadcn": {
        "regex": r"toast\(\{\s*title:",
        "descricao": "Toast com sintaxe shadcn/ui (deve usar sonner)",
        "correcao": "Usar toast.success('mensagem') do sonner"
    },
    "useToast_import": {
        "regex": r"import.*useToast.*from.*use-toast",
        "descricao": "Import de useToast (deve usar sonner)",
        "correcao": "import { toast } from 'sonner';"
    },
    "estrutura_paginada_errada": {
        "regex": r"(\w+Data)\?\.(projetos|pesquisas|entidades|produtos|mercados)\b",
        "descricao": "Acesso incorreto a dados paginados (.projetos em vez de .data)",
        "correcao": "Usar .data para acessar array de resultados"
    },
    "propriedade_enriquecido": {
        "regex": r"entidade\.enriquecido(?!_)",
        "descricao": "Propriedade 'enriquecido' (deve ser 'enriquecido_em')",
        "correcao": "Usar entidade.enriquecido_em"
    },
    "propriedade_origem_dados": {
        "regex": r"\.origem_dados\b",
        "descricao": "Propriedade 'origem_dados' (deve ser 'origem_data')",
        "correcao": "Usar .origem_data"
    },
    "null_sem_undefined": {
        "regex": r"\|\|\s*null[,\)]",
        "descricao": "Uso de || null (deve ser || undefined para Zod)",
        "correcao": "Usar || undefined"
    },
    "router_singular": {
        "regex": r"trpc\.(entidade|projeto|pesquisa|produto|mercado)\.",
        "descricao": "Router singular (deve ser plural)",
        "correcao": "Usar trpc.entidades., trpc.projetos., etc"
    },
    "interface_local_entidade": {
        "regex": r"interface\s+Entidade\s*\{",
        "descricao": "Interface Entidade local (deve usar canônica)",
        "correcao": "import { Entidade } from '@shared/types/entidade';"
    },
    "optional_com_null": {
        "regex": r"(\w+)\?:\s*string\s*\|\s*null",
        "descricao": "Propriedade opcional com | null (?: adiciona | undefined)",
        "correcao": "Remover ? e usar apenas: string | null"
    },
    "comparacao_sem_null_check": {
        "regex": r"(entidade|item|data)\.(\w+)\s*(>=|<=|>|<)\s*\d+",
        "descricao": "Comparação numérica sem null check",
        "correcao": "Adicionar verificação: value != null ? value >= X : ..."
    },
}

def analisar_arquivo(filepath):
    """Analisa um arquivo e retorna problemas encontrados"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            conteudo = f.read()
    except:
        return []
    
    problemas = []
    
    for nome_padrao, config in PADROES_PROBLEMATICOS.items():
        matches = list(re.finditer(config["regex"], conteudo))
        if matches:
            for match in matches:
                # Encontrar número da linha
                linha = conteudo[:match.start()].count('\n') + 1
                problemas.append({
                    "tipo": nome_padrao,
                    "descricao": config["descricao"],
                    "correcao": config["correcao"],
                    "linha": linha,
                    "trecho": match.group(0)[:50]
                })
    
    return problemas

def main():
    """Analisa todos os arquivos em client/src/"""
    base_dir = Path("client/src")
    
    if not base_dir.exists():
        print(f"❌ Diretório {base_dir} não encontrado")
        return
    
    todos_problemas = defaultdict(list)
    total_arquivos = 0
    arquivos_com_problemas = 0
    
    # Processar todos os .tsx e .ts
    for filepath in base_dir.rglob("*.tsx"):
        total_arquivos += 1
        problemas = analisar_arquivo(filepath)
        
        if problemas:
            arquivos_com_problemas += 1
            todos_problemas[str(filepath)] = problemas
    
    # Gerar relatório
    print("=" * 80)
    print("📊 RELATÓRIO DE ANÁLISE PREVENTIVA")
    print("=" * 80)
    print(f"\n📁 Total de arquivos analisados: {total_arquivos}")
    print(f"⚠️  Arquivos com problemas: {arquivos_com_problemas}")
    print(f"🔧 Total de problemas encontrados: {sum(len(p) for p in todos_problemas.values())}")
    
    if todos_problemas:
        print("\n" + "=" * 80)
        print("🔍 DETALHAMENTO POR ARQUIVO")
        print("=" * 80)
        
        for arquivo, problemas in sorted(todos_problemas.items()):
            print(f"\n📄 {arquivo}")
            print(f"   {len(problemas)} problema(s) encontrado(s)")
            
            # Agrupar por tipo
            por_tipo = defaultdict(list)
            for p in problemas:
                por_tipo[p["tipo"]].append(p)
            
            for tipo, ocorrencias in por_tipo.items():
                print(f"\n   ⚠️  {ocorrencias[0]['descricao']}")
                print(f"      💡 {ocorrencias[0]['correcao']}")
                print(f"      📍 Linhas: {', '.join(str(o['linha']) for o in ocorrencias)}")
    
    # Salvar relatório
    with open("RELATORIO_ANALISE_PREVENTIVA.md", "w") as f:
        f.write("# Relatório de Análise Preventiva\n\n")
        f.write(f"**Total de arquivos:** {total_arquivos}\n")
        f.write(f"**Arquivos com problemas:** {arquivos_com_problemas}\n")
        f.write(f"**Total de problemas:** {sum(len(p) for p in todos_problemas.values())}\n\n")
        
        for arquivo, problemas in sorted(todos_problemas.items()):
            f.write(f"\n## {arquivo}\n\n")
            for p in problemas:
                f.write(f"- **Linha {p['linha']}**: {p['descricao']}\n")
                f.write(f"  - Correção: {p['correcao']}\n")
    
    print(f"\n\n✅ Relatório salvo em: RELATORIO_ANALISE_PREVENTIVA.md")

if __name__ == "__main__":
    main()
