#!/bin/bash

# Script para rollback em caso de erro
# Uso: ./scripts/rollback.sh [--to-version=v1.4.0]

set -e

VERSION=$1

echo "🔄 Iniciando ROLLBACK..."
echo ""

if [ -z "$VERSION" ]; then
  echo "❌ Erro: Especifique a versão"
  echo "Uso: ./scripts/rollback.sh --to-version=v1.4.0"
  echo ""
  echo "Versões disponíveis:"
  git tag -l | tail -5
  exit 1
fi

# Extrair versão do argumento
VERSION=${VERSION#--to-version=}

echo "📍 Revertendo para versão: $VERSION"
echo ""

# 1. Verificar se tag existe
if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "❌ Erro: Tag $VERSION não existe"
  echo ""
  echo "Tags disponíveis:"
  git tag -l | tail -10
  exit 1
fi

# 2. Confirmar
read -p "⚠️  Tem certeza que deseja reverter para $VERSION? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Rollback cancelado"
  exit 0
fi

# 3. Criar backup da versão atual
CURRENT_SHA=$(git rev-parse HEAD)
echo "💾 Criando backup da versão atual..."
git tag -f "backup-before-rollback-$(date +%Y%m%d-%H%M%S)" "$CURRENT_SHA"
echo "✅ Backup criado"
echo ""

# 4. Reverter código
echo "🔄 Revertendo código..."
git checkout "$VERSION" || { echo "❌ Erro ao reverter código"; exit 1; }
echo "✅ Código revertido"
echo ""

# 5. Reinstalar dependências
echo "📦 Reinstalando dependências..."
npm install || { echo "❌ Erro ao instalar dependências"; exit 1; }
echo "✅ Dependências OK"
echo ""

# 6. Build
echo "🏗️  Build..."
npm run build || { echo "❌ Build falhou"; exit 1; }
echo "✅ Build OK"
echo ""

# 7. Deploy
echo "🚀 Fazendo deploy da versão revertida..."
npx vercel --prod --yes || { echo "❌ Deploy falhou"; exit 1; }
echo ""

echo "✅ ROLLBACK CONCLUÍDO!"
echo ""
echo "📍 Versão atual: $VERSION"
echo "💾 Backup da versão anterior: backup-before-rollback-*"
echo ""
echo "🌐 Produção: https://www.intelmarket.app"
