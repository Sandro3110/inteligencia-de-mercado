#!/bin/bash

# Script para deploy em staging
# Uso: ./scripts/deploy-staging.sh

set -e

echo "🚀 Iniciando deploy para STAGING..."
echo ""

# 1. Verificar branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branch atual: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "staging" ] && [ "$CURRENT_BRANCH" != "main" ]; then
  echo "⚠️  Aviso: Você não está em staging ou main"
  read -p "Continuar mesmo assim? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 2. Verificar se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
  echo "❌ Erro: Há mudanças não commitadas"
  echo "Faça commit antes de fazer deploy"
  exit 1
fi

# 3. Rodar testes
echo ""
echo "🧪 Rodando testes..."
npm test || { echo "❌ Testes falharam"; exit 1; }
echo "✅ Testes OK"

# 4. Build local
echo ""
echo "🏗️  Build local..."
npm run build || { echo "❌ Build falhou"; exit 1; }
echo "✅ Build OK"

# 5. Deploy no Vercel (staging)
echo ""
echo "📦 Fazendo deploy no Vercel (staging)..."
echo ""

# Usar Vercel CLI via npx
npx vercel --yes --env=staging || { echo "❌ Deploy falhou"; exit 1; }

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Staging URL: https://staging-inteligencia-de-mercado.vercel.app"
echo ""
echo "👤 Aguardando validação do usuário..."
