#!/usr/bin/env python3
"""
Corrige código antigo (client/src/) ANTES de migrar para Next.js
Aplica todas as correções conhecidas preventivamente
"""

import re
import os
from pathlib import Path

# Correções a aplicar
CORRECOES = [
    # 1. Toast sintaxe shadcn → sonner
    {
        "nome": "toast_sintaxe",
        "regex": r"toast\(\{\s*title:\s*(['\"])([^'\"]+)\1\s*,\s*description:\s*(['\"])([^'\"]+)\3\s*\}\)",
        "substituicao": r"toast.success('\2')",
        "descricao": "Toast shadcn → sonner"
    },
    {
        "nome": "toast_sintaxe_simples",
        "regex": r"toast\(\{\s*title:\s*(['\"])([^'\"]+)\1\s*\}\)",
        "substituicao": r"toast.success('\2')",
        "descricao": "Toast shadcn simples → sonner"
    },
    
    # 2. Import useToast → sonner
    {
        "nome": "import_useToast",
        "regex": r"import\s*\{\s*useToast\s*\}\s*from\s*['\"]@/hooks/use-toast['\"];?",
        "substituicao": "import { toast } from 'sonner';",
        "descricao": "Import useToast → sonner"
    },
    {
        "nome": "const_useToast",
        "regex": r"const\s*\{\s*toast\s*\}\s*=\s*useToast\(\);?",
        "substituicao": "",
        "descricao": "Remover const { toast } = useToast()"
    },
    
    # 3. Estrutura paginada
    {
        "nome": "estrutura_paginada",
        "regex": r"(\w+Data)\?\.(projetos|pesquisas|entidades|produtos|mercados)\b",
        "substituicao": r"\1?.data",
        "descricao": "Estrutura paginada .projetos → .data"
    },
    
    # 4. Propriedades de entidade
    {
        "nome": "enriquecido",
        "regex": r"entidade\.enriquecido(?!_)",
        "substituicao": r"entidade.enriquecido_em",
        "descricao": "enriquecido → enriquecido_em"
    },
    {
        "nome": "origem_dados",
        "regex": r"\.origem_dados\b",
        "substituicao": r".origem_data",
        "descricao": "origem_dados → origem_data"
    },
    {
        "nome": "data_enriquecimento",
        "regex": r"\.data_enriquecimento\b",
        "substituicao": r".enriquecido_em",
        "descricao": "data_enriquecimento → enriquecido_em"
    },
    
    # 5. null → undefined
    {
        "nome": "null_para_undefined",
        "regex": r"\|\|\s*null([,\)])",
        "substituicao": r"|| undefined\1",
        "descricao": "|| null → || undefined"
    },
    
    # 6. Routers singulares → plurais
    {
        "nome": "router_entidade",
        "regex": r"trpc\.entidade\.",
        "substituicao": r"trpc.entidades.",
        "descricao": "trpc.entidade → trpc.entidades"
    },
    {
        "nome": "router_projeto",
        "regex": r"trpc\.projeto\.",
        "substituicao": r"trpc.projetos.",
        "descricao": "trpc.projeto → trpc.projetos"
    },
    {
        "nome": "router_pesquisa",
        "regex": r"trpc\.pesquisa\.",
        "substituicao": r"trpc.pesquisas.",
        "descricao": "trpc.pesquisa → trpc.pesquisas"
    },
    {
        "nome": "router_produto",
        "regex": r"trpc\.produto\.",
        "substituicao": r"trpc.produtos.",
        "descricao": "trpc.produto → trpc.produtos"
    },
    {
        "nome": "router_mercado",
        "regex": r"trpc\.mercado\.",
        "substituicao": r"trpc.mercados.",
        "descricao": "trpc.mercado → trpc.mercados"
    },
]

def corrigir_arquivo(filepath):
    """Aplica todas as correções em um arquivo"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            conteudo = f.read()
    except:
        return False, []
    
    conteudo_original = conteudo
    correcoes_aplicadas = []
    
    # Aplicar todas as correções
    for correcao in CORRECOES:
        matches = list(re.finditer(correcao["regex"], conteudo))
        if matches:
            conteudo = re.sub(correcao["regex"], correcao["substituicao"], conteudo)
            correcoes_aplicadas.append({
                "nome": correcao["nome"],
                "descricao": correcao["descricao"],
                "count": len(matches)
            })
    
    # Verificar se houve mudanças
    if conteudo != conteudo_original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(conteudo)
        return True, correcoes_aplicadas
    
    return False, []

def main():
    """Processa todos os arquivos em client/src/"""
    base_dir = Path("client/src")
    
    if not base_dir.exists():
        print(f"❌ Diretório {base_dir} não encontrado")
        return
    
    arquivos_corrigidos = []
    total_correcoes = 0
    
    # Processar todos os .tsx e .ts
    for filepath in base_dir.rglob("*.tsx"):
        modificado, correcoes = corrigir_arquivo(filepath)
        
        if modificado:
            arquivos_corrigidos.append({
                "path": str(filepath),
                "correcoes": correcoes
            })
            total_correcoes += sum(c["count"] for c in correcoes)
            print(f"✅ {filepath}")
            for c in correcoes:
                print(f"   - {c['descricao']} ({c['count']}x)")
    
    print("\n" + "=" * 80)
    print(f"📊 RESUMO")
    print("=" * 80)
    print(f"✅ Arquivos corrigidos: {len(arquivos_corrigidos)}")
    print(f"🔧 Total de correções: {total_correcoes}")
    
    if arquivos_corrigidos:
        print("\n💡 Próximo passo:")
        print("   1. Revisar mudanças: git diff client/src/")
        print("   2. Testar build: cd client && pnpm build")
        print("   3. Commit: git add -A && git commit -m 'fix: Correções preventivas para migração Next.js'")

if __name__ == "__main__":
    main()
