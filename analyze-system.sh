#!/bin/bash

echo "=== ANÁLISE COMPLETA DO GESTOR PAV ==="
echo ""
echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "## 1. PÁGINAS DO PROJETO"
echo "Total de páginas:"
find client/src/pages -name "*.tsx" | wc -l
echo ""
echo "Lista de páginas:"
find client/src/pages -name "*.tsx" -exec basename {} \; | sort
echo ""

echo "## 2. ROTAS CONFIGURADAS"
echo "Rotas no App.tsx:"
grep -E 'path=|component=' client/src/App.tsx | grep -v '//' | wc -l
echo ""

echo "## 3. ITENS DO MENU"
echo "Seções do menu no AppSidebar:"
grep -E 'title:.*icon:' client/src/components/AppSidebar.tsx | wc -l
echo ""

echo "## 4. COMPONENTES"
echo "Total de componentes:"
find client/src/components -name "*.tsx" | wc -l
echo ""

echo "## 5. HOOKS CUSTOMIZADOS"
echo "Total de hooks:"
find client/src/hooks -name "*.ts*" | wc -l
echo ""

echo "## 6. ROUTERS TRPC"
echo "Routers no backend:"
grep -E '^\s+[a-zA-Z]+: router\(' server/routers.ts | wc -l
echo ""

echo "## 7. TABELAS DO BANCO"
echo "Schemas definidos:"
grep -E 'export const [a-zA-Z]+ = mysqlTable' drizzle/schema.ts | wc -l
echo ""

echo "## 8. TESTES"
echo "Arquivos de teste:"
find server/__tests__ -name "*.test.ts" | wc -l
echo ""

echo "=== FIM DA ANÁLISE ==="
