#!/bin/bash

# Script para testar componente específico
# Uso: ./scripts/test-component.sh <component-path>

set -e

COMPONENT_PATH=$1

if [ -z "$COMPONENT_PATH" ]; then
  echo "❌ Erro: Especifique o caminho do componente"
  echo "Uso: ./scripts/test-component.sh <component-path>"
  exit 1
fi

echo "🧪 Testando componente: $COMPONENT_PATH"
echo ""

# 1. TypeScript check
echo "1️⃣ TypeScript check..."
npx tsc --noEmit || { echo "❌ TypeScript falhou"; exit 1; }
echo "✅ TypeScript OK"
echo ""

# 2. ESLint
echo "2️⃣ ESLint..."
npx eslint "$COMPONENT_PATH" || { echo "❌ ESLint falhou"; exit 1; }
echo "✅ ESLint OK"
echo ""

# 3. Prettier
echo "3️⃣ Prettier..."
npx prettier --check "$COMPONENT_PATH" || { echo "❌ Prettier falhou"; exit 1; }
echo "✅ Prettier OK"
echo ""

# 4. Testes unitários
echo "4️⃣ Testes unitários..."
npm test -- "$COMPONENT_PATH" || { echo "❌ Testes falharam"; exit 1; }
echo "✅ Testes OK"
echo ""

# 5. Build
echo "5️⃣ Build..."
npm run build || { echo "❌ Build falhou"; exit 1; }
echo "✅ Build OK"
echo ""

echo "🎉 Todos os testes passaram!"
echo ""
echo "Componente pronto para deploy!"
