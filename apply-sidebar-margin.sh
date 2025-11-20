#!/bin/bash

# Script para aplicar useSidebarMargin em todas as páginas
# Lista de páginas que precisam do hook (excluindo as que já têm)

PAGES=(
  "Dashboard.tsx"
  "DashboardPage.tsx"
  "MercadoDetalhes.tsx"
  "AnalyticsPage.tsx"
  "AnalyticsDashboard.tsx"
  "EnrichmentFlow.tsx"
  "EnrichmentProgress.tsx"
  "EnrichmentReview.tsx"
  "EnrichmentSettings.tsx"
  "AlertsPage.tsx"
  "AlertHistoryPage.tsx"
  "ReportsPage.tsx"
  "ROIDashboard.tsx"
  "FunnelView.tsx"
  "SchedulePage.tsx"
  "AtividadePage.tsx"
  "ResultadosEnriquecimento.tsx"
  "AdminLLM.tsx"
  "MonitoringDashboard.tsx"
  "IntelligentAlerts.tsx"
)

BASE_DIR="/home/ubuntu/gestor-pav/client/src/pages"

for page in "${PAGES[@]}"; do
  FILE="$BASE_DIR/$page"
  
  if [ ! -f "$FILE" ]; then
    echo "⚠️  Arquivo não encontrado: $page"
    continue
  fi
  
  # Verificar se já tem o import
  if grep -q "useSidebarMargin" "$FILE"; then
    echo "✓ $page já tem useSidebarMargin"
    continue
  fi
  
  echo "📝 Processando $page..."
  
  # 1. Adicionar import após último import de hooks
  sed -i '/import.*@\/hooks/a import { useSidebarMargin } from "@/hooks/useSidebarMargin";' "$FILE"
  
  # 2. Adicionar hook no início do componente (após primeiro useState ou useQuery)
  sed -i '0,/const.*use[A-Z]/s//const sidebarMargin = useSidebarMargin();\n  &/' "$FILE"
  
  # 3. Substituir ml-60 fixo por variável dinâmica
  sed -i 's/className="\(.*\)ml-60\(.*\)"/className={`\1${sidebarMargin}\2 transition-all duration-300`}/g' "$FILE"
  sed -i "s/className='\(.*\)ml-60\(.*\)'/className={\`\1\${sidebarMargin}\2 transition-all duration-300\`}/g" "$FILE"
  
  echo "✅ $page atualizado"
done

echo ""
echo "🎉 Processo concluído!"
