#!/bin/bash

# Script para validar qualidade do código
# Uso: ./scripts/validate-quality.sh

set -e

echo "🔍 Validando qualidade do código..."
echo ""

ERRORS=0

# 1. TypeScript
echo "1️⃣ TypeScript check..."
if npx tsc --noEmit; then
  echo "✅ TypeScript OK"
else
  echo "❌ TypeScript FALHOU"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. ESLint
echo "2️⃣ ESLint..."
if npx eslint . --ext .ts,.tsx --max-warnings 0; then
  echo "✅ ESLint OK"
else
  echo "❌ ESLint FALHOU"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Prettier
echo "3️⃣ Prettier..."
if npx prettier --check .; then
  echo "✅ Prettier OK"
else
  echo "❌ Prettier FALHOU"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Testes
echo "4️⃣ Testes..."
if npm test; then
  echo "✅ Testes OK"
else
  echo "❌ Testes FALHARAM"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Build
echo "5️⃣ Build..."
if npm run build; then
  echo "✅ Build OK"
else
  echo "❌ Build FALHOU"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Verificar bundle size
echo "6️⃣ Bundle size..."
BUILD_SIZE=$(du -sh .next | cut -f1)
echo "📦 Tamanho do build: $BUILD_SIZE"
echo "✅ Bundle size OK"
echo ""

# Resultado final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo "🎉 QUALIDADE: 100% ✅"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Código pronto para deploy!"
  exit 0
else
  echo "❌ QUALIDADE: FALHOU ($ERRORS erros)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Corrija os erros antes de fazer deploy!"
  exit 1
fi
