#!/bin/bash
# Script de teste dos endpoints de IA no Vercel

BASE_URL="https://inteligencia-de-mercado.vercel.app"
USER_ID="4e08ddd3-173f-49d1-ac39-43feae5b95c6"

echo "╔════════════════════════════════════════╗"
echo "║   TESTE DAS APIs DE IA - VERCEL       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 1. Testar Estatísticas
echo -e "${CYAN}📈 TESTANDO ENDPOINT DE ESTATÍSTICAS...${NC}"
echo ""
STATS=$(curl -s "${BASE_URL}/api/ia-stats")
if echo "$STATS" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Endpoint /api/ia-stats funcionando${NC}"
  echo "$STATS" | jq '.data.config'
else
  echo -e "${RED}❌ Erro no endpoint de estatísticas${NC}"
  echo "$STATS"
fi
echo ""

# 2. Testar Enriquecimento
echo -e "${CYAN}🔍 TESTANDO ENDPOINT DE ENRIQUECIMENTO...${NC}"
echo ""
ENRICH_PAYLOAD=$(cat <<EOF
{
  "userId": "${USER_ID}",
  "entidadeId": 999,
  "nome": "Nubank",
  "cnpj": "18.236.120/0001-58"
}
EOF
)

echo -e "${YELLOW}Payload:${NC}"
echo "$ENRICH_PAYLOAD" | jq '.'
echo ""

ENRICH_RESULT=$(curl -s -X POST "${BASE_URL}/api/ia-enriquecer" \
  -H "Content-Type: application/json" \
  -d "$ENRICH_PAYLOAD")

if echo "$ENRICH_RESULT" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Endpoint /api/ia-enriquecer funcionando${NC}"
  echo ""
  echo -e "${CYAN}Dados retornados:${NC}"
  echo "$ENRICH_RESULT" | jq '{
    descricao: .data.descricao[:100],
    setor: .data.setor,
    porte: .data.porte,
    score: .data.score,
    produtos: (.data.produtos | length),
    usage: .usage
  }'
else
  echo -e "${RED}❌ Erro no endpoint de enriquecimento${NC}"
  echo "$ENRICH_RESULT" | jq '.'
fi
echo ""

# 3. Testar Análise de Mercado
echo -e "${CYAN}📊 TESTANDO ENDPOINT DE ANÁLISE DE MERCADO...${NC}"
echo ""
ANALISE_PAYLOAD=$(cat <<EOF
{
  "userId": "${USER_ID}",
  "projetoId": 999,
  "entidades": [
    {"nome": "Nubank", "setor": "Fintech"},
    {"nome": "Inter", "setor": "Fintech"},
    {"nome": "PicPay", "setor": "Fintech"}
  ]
}
EOF
)

echo -e "${YELLOW}Payload:${NC}"
echo "$ANALISE_PAYLOAD" | jq '.'
echo ""

ANALISE_RESULT=$(curl -s -X POST "${BASE_URL}/api/ia-analisar-mercado" \
  -H "Content-Type: application/json" \
  -d "$ANALISE_PAYLOAD")

if echo "$ANALISE_RESULT" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Endpoint /api/ia-analisar-mercado funcionando${NC}"
  echo ""
  echo -e "${CYAN}Dados retornados:${NC}"
  echo "$ANALISE_RESULT" | jq '{
    resumo: .data.resumo[:100],
    oportunidades: (.data.oportunidades | length),
    riscos: (.data.riscos | length),
    tendencias: (.data.tendencias | length),
    usage: .usage
  }'
else
  echo -e "${RED}❌ Erro no endpoint de análise${NC}"
  echo "$ANALISE_RESULT" | jq '.'
fi
echo ""

# 4. Testar Sugestões
echo -e "${CYAN}💡 TESTANDO ENDPOINT DE SUGESTÕES...${NC}"
echo ""
SUGESTOES_PAYLOAD=$(cat <<EOF
{
  "userId": "${USER_ID}",
  "entidadeId": 999,
  "entidade": {
    "nome": "Empresa Alpha",
    "tipo": "lead",
    "setor": "Tecnologia",
    "porte": "Médio",
    "score": 7
  }
}
EOF
)

echo -e "${YELLOW}Payload:${NC}"
echo "$SUGESTOES_PAYLOAD" | jq '.'
echo ""

SUGESTOES_RESULT=$(curl -s -X POST "${BASE_URL}/api/ia-sugestoes" \
  -H "Content-Type: application/json" \
  -d "$SUGESTOES_PAYLOAD")

if echo "$SUGESTOES_RESULT" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Endpoint /api/ia-sugestoes funcionando${NC}"
  echo ""
  echo -e "${CYAN}Dados retornados:${NC}"
  echo "$SUGESTOES_RESULT" | jq '{
    sugestoes: (.data.sugestoes | length),
    primeiras_3: (.data.sugestoes[:3] | map({acao, prioridade, prazo})),
    usage: .usage
  }'
else
  echo -e "${RED}❌ Erro no endpoint de sugestões${NC}"
  echo "$SUGESTOES_RESULT" | jq '.'
fi
echo ""

# 5. Verificar estatísticas após testes
echo -e "${CYAN}📊 VERIFICANDO ESTATÍSTICAS APÓS TESTES...${NC}"
echo ""
sleep 2
STATS_FINAL=$(curl -s "${BASE_URL}/api/ia-stats")
echo "$STATS_FINAL" | jq '{
  totalChamadas: .data.resumoMensal.totalChamadas,
  totalTokens: .data.resumoMensal.totalTokens,
  custoTotal: .data.resumoMensal.custoTotal,
  percentualUsado: .data.resumoMensal.percentualUsado,
  atividadesRecentes: (.data.atividadesRecentes | length)
}'
echo ""

echo "╔════════════════════════════════════════╗"
echo "║         TESTES CONCLUÍDOS             ║"
echo "╚════════════════════════════════════════╝"
