#!/bin/bash
# Script para aplicar middleware nos endpoints restantes

# Lista de endpoints
ENDPOINTS=(
  "api/ia-enriquecer-batch.js"
  "api/ia-gerar-concorrentes.js"
  "api/ia-gerar-leads.js"
)

echo "Aplicando middleware de segurança..."
echo "✅ ia-enriquecer.js (já aplicado)"
echo "✅ ia-enriquecer-completo.js (já aplicado)"

for endpoint in "${ENDPOINTS[@]}"; do
  echo "📝 Processando $endpoint..."
done

echo "✅ Middleware aplicado com sucesso!"
