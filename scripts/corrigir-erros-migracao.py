#!/usr/bin/env python3
"""
Script de correção automatizada de erros comuns na migração Next.js
"""

import re
import os
from pathlib import Path

# Padrões de correção
CORRECOES = [
    # 1. Toast sintaxe
    (r"toast\(\{\s*title:\s*['\"]([^'\"]+)['\"]\s*,\s*description:\s*['\"]([^'\"]+)['\"]\s*\}\)", r"toast.success('\1')"),
    (r"toast\(\{\s*title:\s*['\"]([^'\"]+)['\"]\s*\}\)", r"toast.success('\1')"),
    
    # 2. Estrutura paginada
    (r"(\w+Data)\?\.projetos", r"\1?.data"),
    (r"(\w+Data)\?\.pesquisas", r"\1?.data"),
    (r"(\w+Data)\?\.entidades", r"\1?.data"),
    (r"(\w+Data)\?\.produtos", r"\1?.data"),
    (r"(\w+Data)\?\.mercados", r"\1?.data"),
    
    # 3. Propriedades de entidade
    (r"entidade\.enriquecido(?!_)", r"entidade.enriquecido_em"),
    (r"entidade\.origem_dados", r"entidade.origem_data"),
    (r"entidade\.data_enriquecimento", r"entidade.enriquecido_em"),
    
    # 4. null vs undefined
    (r"\|\|\s*null([,\)])", r"|| undefined\1"),
    
    # 5. Imports de toast
    (r"import \{ useToast \} from ['\"]@/hooks/use-toast['\"];?", r"import { toast } from 'sonner';"),
    (r"const \{ toast \} = useToast\(\);?", r""),
    
    # 6. tRPC router names (singular → plural)
    (r"trpc\.entidade\.", r"trpc.entidades."),
    (r"trpc\.projeto\.", r"trpc.projetos."),
    (r"trpc\.pesquisa\.", r"trpc.pesquisas."),
    (r"trpc\.produto\.", r"trpc.produtos."),
    (r"trpc\.mercado\.", r"trpc.mercados."),
]

def corrigir_arquivo(filepath):
    """Aplica todas as correções em um arquivo"""
    with open(filepath, 'r', encoding='utf-8') as f:
        conteudo = f.read()
    
    conteudo_original = conteudo
    
    # Aplicar todas as correções
    for padrao, substituicao in CORRECOES:
        conteudo = re.sub(padrao, substituicao, conteudo)
    
    # Verificar se houve mudanças
    if conteudo != conteudo_original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(conteudo)
        return True
    
    return False

def main():
    """Processa todos os arquivos em app/(dashboard)/"""
    base_dir = Path("app/(dashboard)")
    arquivos_corrigidos = []
    
    if not base_dir.exists():
        print(f"❌ Diretório {base_dir} não encontrado")
        return
    
    # Processar todos os .tsx
    for filepath in base_dir.rglob("*.tsx"):
        if corrigir_arquivo(filepath):
            arquivos_corrigidos.append(str(filepath))
            print(f"✅ Corrigido: {filepath}")
    
    print(f"\n📊 Total de arquivos corrigidos: {len(arquivos_corrigidos)}")
    
    if arquivos_corrigidos:
        print("\n📝 Arquivos modificados:")
        for arquivo in arquivos_corrigidos:
            print(f"  - {arquivo}")

if __name__ == "__main__":
    main()
