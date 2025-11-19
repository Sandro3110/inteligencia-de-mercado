#!/bin/bash

# Script de monitoramento do enriquecimento de 800 clientes

clear

echo "════════════════════════════════════════════════════════════════════════════════"
echo "                    MONITOR DE ENRIQUECIMENTO - TEMPO REAL"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

while true; do
  # Limpar tela mantendo cabeçalho
  tput cup 4 0
  tput ed
  
  # Data/Hora atual
  echo "🕐 Atualizado em: $(date '+%d/%m/%Y %H:%M:%S')"
  echo ""
  
  # Verificar se processo está rodando
  if pgrep -f "enrich-800-clientes.ts" > /dev/null; then
    echo "✅ Status: PROCESSANDO"
  else
    echo "⚠️  Status: PARADO"
  fi
  echo ""
  
  # Ler progresso do arquivo JSON
  if [ -f /tmp/progresso-enriquecimento.json ]; then
    LOTES_CONCLUIDOS=$(cat /tmp/progresso-enriquecimento.json | grep -o '"concluido": true' | wc -l)
    TOTAL_LOTES=17
    SUCESSOS=$(cat /tmp/progresso-enriquecimento.json | grep -o '"sucessos": [0-9]*' | awk '{sum+=$2} END {print sum}')
    ERROS=$(cat /tmp/progresso-enriquecimento.json | grep -o '"erros": [0-9]*' | awk '{sum+=$2} END {print sum}')
    TOTAL_PROCESSADOS=$((SUCESSOS + ERROS))
    TOTAL_CLIENTES=803
    PERCENTUAL=$((TOTAL_PROCESSADOS * 100 / TOTAL_CLIENTES))
    
    echo "📦 Lotes: $LOTES_CONCLUIDOS/$TOTAL_LOTES concluídos"
    echo "👥 Clientes: $TOTAL_PROCESSADOS/$TOTAL_CLIENTES processados ($PERCENTUAL%)"
    echo "✅ Sucessos: $SUCESSOS"
    echo "❌ Erros: $ERROS"
    
    # Barra de progresso
    echo ""
    echo -n "Progresso: ["
    FILLED=$((PERCENTUAL / 2))
    for i in $(seq 1 50); do
      if [ $i -le $FILLED ]; then
        echo -n "█"
      else
        echo -n "░"
      fi
    done
    echo "] $PERCENTUAL%"
    
    # Tempo estimado
    if [ $TOTAL_PROCESSADOS -gt 0 ]; then
      TEMPO_DECORRIDO=$(( $(date +%s) - $(date -d "$(cat /tmp/progresso-enriquecimento.json | grep -o '"timestamp": "[^"]*"' | head -1 | cut -d'"' -f4)" +%s) ))
      TEMPO_POR_CLIENTE=$((TEMPO_DECORRIDO / TOTAL_PROCESSADOS))
      CLIENTES_RESTANTES=$((TOTAL_CLIENTES - TOTAL_PROCESSADOS))
      TEMPO_RESTANTE=$((CLIENTES_RESTANTES * TEMPO_POR_CLIENTE))
      
      HORAS=$((TEMPO_RESTANTE / 3600))
      MINUTOS=$(((TEMPO_RESTANTE % 3600) / 60))
      
      echo ""
      echo "⏱️  Tempo estimado restante: ${HORAS}h ${MINUTOS}min"
    fi
  else
    echo "⏳ Aguardando início do processamento..."
  fi
  
  echo ""
  echo "────────────────────────────────────────────────────────────────────────────────"
  echo ""
  
  # Últimas 10 linhas do log
  echo "📋 ÚLTIMAS ATIVIDADES:"
  echo ""
  tail -15 /tmp/enrich-800.log | grep -E "Processando:|✅|❌|LOTE|CONCLUÍDO" | tail -10
  
  echo ""
  echo "────────────────────────────────────────────────────────────────────────────────"
  echo "Pressione Ctrl+C para sair"
  
  # Aguardar 5 segundos antes de atualizar
  sleep 5
done
