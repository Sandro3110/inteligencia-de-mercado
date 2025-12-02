# 🤖 FASE 4: PROMPTS ATUALIZADOS COM NOVAS MÉTRICAS

**Data:** 02 de Dezembro de 2025  
**Modelo:** Híbrido (GPT-4o + GPT-4o-mini)  
**Temperatura:** 1.0 (qualidade máxima)

---

## 📋 VISÃO GERAL

**6 Prompts Especializados:**
1. **P1: Cliente** (GPT-4o) - Enriquece dados do cliente + **métricas financeiras**
2. **P2: Mercado** (GPT-4o) - Identifica mercado + **hierarquias**
3. **P3: Produtos** (GPT-4o) - Identifica 3 produtos + **métricas de produto**
4. **P4: Concorrentes** (GPT-4o-mini) - Identifica 5 concorrentes + **métricas de concorrência**
5. **P5: Leads** (GPT-4o-mini) - Identifica 5 leads + **métricas financeiras**
6. **P6: Validação** (GPT-4o-mini) - Valida dados + **calcula scores**

---

## 🎯 P1: ENRIQUECIMENTO DO CLIENTE

### **Modelo:** GPT-4o
### **Temperatura:** 1.0
### **Tokens Estimados:** 290 (240 in + 50 out)

### **Prompt:**

```
Você é um especialista em inteligência de mercado brasileiro.

CLIENTE: {nome_cliente}

TAREFA: Enriquecer dados cadastrais e calcular métricas de negócio.

RETORNE UM JSON com esta estrutura EXATA:

{
  "nomeFantasia": "string ou null",
  "cnpj": "string (00.000.000/0000-00) ou null",
  "email": "string ou null",
  "telefone": "string ou null",
  "site": "string (URL completa) ou null",
  "numFiliais": number ou null,
  "numLojas": number ou null,
  "numFuncionarios": number ou null,
  "faturamentoAnual": number (em R$) ou null,
  "porte": "micro" | "pequena" | "media" | "grande" ou null,
  "cnae": "string (código CNAE principal) ou null",
  
  // NOVAS MÉTRICAS FINANCEIRAS
  "receitaPotencialAnual": number (em R$, estimativa conservadora),
  "ticketMedioEstimado": number (em R$, valor médio por transação),
  "ltvEstimado": number (em R$, lifetime value estimado),
  "cacEstimado": number (em R$, custo de aquisição estimado),
  
  // SCORES
  "scoreFit": number (0-100, fit produto-mercado),
  "probabilidadeConversao": number (0-100, % de chance de conversão),
  "scorePriorizacao": number (0-100, prioridade comercial),
  
  // CICLO DE VENDA
  "cicloVendaEstimadoDias": number (dias típicos do ciclo),
  
  // SEGMENTAÇÃO
  "segmentoAbc": "A" | "B" | "C" (baseado em potencial),
  "ehClienteIdeal": boolean (se é ICP - Ideal Customer Profile),
  
  // OBSERVAÇÕES
  "justificativaScore": "string (explique o score_fit)",
  "recomendacoes": "string (recomendações comerciais)"
}

REGRAS:
1. Use NULL se não souber (NUNCA invente dados)
2. Seja CONSERVADOR nas estimativas financeiras
3. scoreFit considera: porte, setor, maturidade, fit tecnológico
4. probabilidadeConversao considera: maturidade digital, budget, timing
5. scorePriorizacao = (scoreFit * 0.4) + (probabilidadeConversao * 0.3) + (receitaPotencial * 0.3)
6. Segmento A: >R$50M faturamento, B: R$10-50M, C: <R$10M
7. Cliente ideal: score_fit >80, probabilidade >60, segmento A ou B
8. Justificativa deve ser objetiva e baseada em fatos
9. Recomendações devem ser acionáveis

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.
```

### **Campos Preenchidos:** 23
### **Custo:** ~$0.0011

---

## 🌍 P2: IDENTIFICAÇÃO DO MERCADO

### **Modelo:** GPT-4o
### **Temperatura:** 1.0
### **Tokens Estimados:** 420 (300 in + 120 out)

### **Prompt:**

```
Você é um especialista em classificação de mercados brasileiros.

CLIENTE: {nome_cliente}
PRODUTOS: {lista_produtos}

TAREFA: Identificar o mercado de atuação COM HIERARQUIA COMPLETA.

RETORNE UM JSON com esta estrutura EXATA:

{
  "mercado": {
    "nome": "string (nome específico do mercado)",
    "categoria": "string (categoria ampla)",
    "segmentacao": "string (segmento específico)",
    "tamanhoMercadoBr": number (em R$, tamanho total do mercado no Brasil),
    "crescimentoAnualPct": number (% de crescimento anual),
    "tendencias": ["string", "string", "string"] (3-5 tendências),
    "principaisPlayers": ["string", "string", "string"] (3-5 players principais),
    
    // NOVA HIERARQUIA
    "setor": "string (Tecnologia | Indústria | Comércio | Serviços | Agronegócio | Saúde | Educação | Financeiro | Construção | Energia)",
    "subsetor": "string (subsetor dentro do setor, ex: Software, Hardware, Consultoria)",
    "nicho": "string (nicho específico, ex: ERP, CRM, BI)"
  }
}

EXEMPLOS DE HIERARQUIA:

1. TOTVS:
   - Setor: Tecnologia
   - Subsetor: Software
   - Nicho: Gestão Empresarial (ERP)

2. Ambev:
   - Setor: Indústria
   - Subsetor: Bebidas
   - Nicho: Cervejaria

3. Magazine Luiza:
   - Setor: Comércio
   - Subsetor: Varejo
   - Nicho: E-commerce

REGRAS:
1. Hierarquia deve ser: Setor → Subsetor → Nicho → Mercado
2. Setor deve ser um dos 10 listados
3. Subsetor deve ser específico mas não muito granular
4. Nicho deve ser o mais específico possível
5. Mercado.nome deve refletir o nicho + categoria
6. Use NULL se não souber
7. Seja preciso na hierarquia

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.
```

### **Campos Preenchidos:** 11 (7 existentes + 3 hierarquia + 1 validação)
### **Custo:** ~$0.0020

---

## 📦 P3: IDENTIFICAÇÃO DOS PRODUTOS

### **Modelo:** GPT-4o
### **Temperatura:** 1.0
### **Tokens Estimados:** 440 (260 in + 180 out)

### **Prompt:**

```
Você é um especialista em produtos e serviços brasileiros.

CLIENTE: {nome_cliente}
MERCADO: {nome_mercado}

TAREFA: Identificar os 3 PRINCIPAIS produtos/serviços COM MÉTRICAS.

RETORNE UM JSON com esta estrutura EXATA:

{
  "produtos": [
    {
      "nome": "string (nome do produto/serviço)",
      "categoria": "string (categoria do produto)",
      "descricao": "string (descrição detalhada)",
      "precoMedio": number (em R$) ou null,
      "unidade": "string (licença, projeto, hora, etc)",
      "ncm": "string (código NCM se aplicável) ou null",
      
      // NOVAS MÉTRICAS DE PRODUTO
      "volumeVendasEstimado": number (em R$/ano, volume de vendas estimado),
      "margemEstimada": number (% de margem de lucro, 0-100),
      "penetracaoMercado": number (% de penetração no mercado, 0-100),
      "ehProdutoPrincipal": boolean (se é o produto principal/carro-chefe),
      
      // RELAÇÃO COM CLIENTE
      "tipoRelacao": "fabricante" | "distribuidor" | "revendedor" | "integrador",
      "volumeEstimado": "string (alto | médio | baixo)"
    }
  ]
}

REGRAS:
1. EXATAMENTE 3 produtos (os mais importantes)
2. Primeiro produto DEVE ter ehProdutoPrincipal = true
3. volumeVendasEstimado = precoMedio * volume estimado de vendas/ano
4. margemEstimada: Software (60-80%), Serviços (30-50%), Produtos (20-40%)
5. penetracaoMercado: market share estimado do cliente neste produto
6. Use NULL se não souber valores financeiros
7. Seja CONSERVADOR nas estimativas
8. Priorize produtos de maior receita

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.
```

### **Campos Preenchidos:** 13 por produto × 3 = 39 campos
### **Custo:** ~$0.0025

---

## 🏆 P4: IDENTIFICAÇÃO DOS CONCORRENTES

### **Modelo:** GPT-4o-mini
### **Temperatura:** 1.0
### **Tokens Estimados:** 700 (400 in + 300 out)

### **Prompt:**

```
Você é um especialista em análise competitiva do mercado brasileiro.

CLIENTE: {nome_cliente}
MERCADO: {nome_mercado}
PRODUTOS: {lista_produtos}

TAREFA: Identificar os 5 PRINCIPAIS CONCORRENTES DIRETOS COM MÉTRICAS.

IMPORTANTE: NÃO INCLUA O PRÓPRIO CLIENTE NA LISTA!

RETORNE UM JSON com esta estrutura EXATA:

{
  "concorrentes": [
    {
      "nome": "string (razão social)",
      "nomeFantasia": "string ou null",
      "cnpj": "string ou null",
      "site": "string ou null",
      "porte": "micro" | "pequena" | "media" | "grande" ou null,
      "numFuncionarios": number ou null,
      
      // MÉTRICAS DE CONCORRÊNCIA
      "nivelCompeticao": "direta" | "indireta" | "substituto",
      "shareOfVoice": number (% de presença no mercado, 0-100),
      "vantagemCompetitivaScore": number (nossa vantagem vs este concorrente, -100 a 100),
      "ameacaNivel": "baixa" | "media" | "alta" | "critica",
      
      // ANÁLISE
      "diferencial": "string (principal diferencial do concorrente)",
      "observacoes": "string (pontos fortes e fracos)"
    }
  ]
}

REGRAS:
1. EXATAMENTE 5 concorrentes (os mais relevantes)
2. NUNCA inclua o cliente {nome_cliente} na lista
3. Ordene por relevância (mais importante primeiro)
4. nivelCompeticao: direta (mesmo produto), indireta (produto similar), substituto (solução alternativa)
5. shareOfVoice: presença de mercado estimada (soma dos 5 não precisa ser 100%)
6. vantagemCompetitivaScore: positivo se temos vantagem, negativo se concorrente tem vantagem
7. ameacaNivel: baseado em porte, crescimento, inovação
8. Use NULL se não souber
9. Seja objetivo e factual

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.
```

### **Campos Preenchidos:** 12 por concorrente × 5 = 60 campos
### **Custo:** ~$0.00024

---

## 🎯 P5: IDENTIFICAÇÃO DOS LEADS

### **Modelo:** GPT-4o-mini
### **Temperatura:** 1.0
### **Tokens Estimados:** 760 (400 in + 360 out)

### **Prompt:**

```
Você é um especialista em prospecção B2B do mercado brasileiro.

CLIENTE: {nome_cliente}
MERCADO CONSUMIDOR: {mercado_consumidor}
PRODUTOS: {lista_produtos}
CONCORRENTES: {lista_concorrentes}

TAREFA: Identificar 5 LEADS QUALIFICADOS (potenciais compradores) COM MÉTRICAS.

IMPORTANTE: 
- NÃO INCLUA O CLIENTE {nome_cliente}
- NÃO INCLUA OS CONCORRENTES: {lista_concorrentes}

RETORNE UM JSON com esta estrutura EXATA:

{
  "leads": [
    {
      "nome": "string (razão social)",
      "nomeFantasia": "string ou null",
      "cnpj": "string ou null",
      "email": "string ou null",
      "telefone": "string ou null",
      "site": "string ou null",
      "cidade": "string",
      "uf": "string (sigla)",
      "porte": "micro" | "pequena" | "media" | "grande" ou null,
      "numFuncionarios": number ou null,
      "faturamentoAnual": number (em R$) ou null,
      
      // NOVAS MÉTRICAS FINANCEIRAS
      "receitaPotencialAnual": number (em R$, quanto pode gastar com nossos produtos),
      "ticketMedioEstimado": number (em R$, valor médio por compra),
      "ltvEstimado": number (em R$, lifetime value estimado),
      
      // SCORES
      "scoreFit": number (0-100, fit com nosso produto),
      "probabilidadeConversao": number (0-100, % de chance de fechar),
      "scorePriorizacao": number (0-100, prioridade de abordagem),
      
      // CICLO
      "cicloVendaEstimadoDias": number (dias para fechar),
      
      // SEGMENTAÇÃO
      "segmentoAbc": "A" | "B" | "C",
      "ehClienteIdeal": boolean,
      
      // ANÁLISE
      "justificativaScore": "string (por que é um bom lead)",
      "recomendacoes": "string (como abordar)"
    }
  ]
}

REGRAS:
1. EXATAMENTE 5 leads (os mais qualificados)
2. NUNCA inclua o cliente ou concorrentes
3. Leads devem ser COMPRADORES dos produtos do cliente
4. Ordene por scorePriorizacao (maior primeiro)
5. receitaPotencialAnual: quanto o lead pode gastar/ano com nossos produtos
6. ticketMedio: valor médio por transação/projeto
7. ltvEstimado: valor total ao longo do relacionamento (3-5 anos)
8. scoreFit: adequação do lead ao nosso produto (porte, setor, maturidade)
9. probabilidadeConversao: chance real de fechar (budget, timing, necessidade)
10. scorePriorizacao = (scoreFit * 0.4) + (probabilidadeConversao * 0.3) + (receitaPotencial * 0.3)
11. Segmento A: >R$50M potencial, B: R$10-50M, C: <R$10M
12. Cliente ideal: score_fit >80, probabilidade >60, segmento A ou B
13. Seja CONSERVADOR nas estimativas
14. Justificativa e recomendações devem ser acionáveis

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.
```

### **Campos Preenchidos:** 23 por lead × 5 = 115 campos
### **Custo:** ~$0.00028

---

## ✅ P6: VALIDAÇÃO E CÁLCULO FINAL

### **Modelo:** GPT-4o-mini
### **Temperatura:** 1.0
### **Tokens Estimados:** 220 (160 in + 60 out)

### **Prompt:**

```
Você é um auditor de qualidade de dados.

DADOS ENRIQUECIDOS:
- Cliente: {dados_cliente}
- Mercado: {dados_mercado}
- Produtos: {dados_produtos}
- Concorrentes: {dados_concorrentes}
- Leads: {dados_leads}

TAREFA: Validar consistência e calcular score de qualidade.

RETORNE UM JSON com esta estrutura EXATA:

{
  "validacao": {
    "qualidadeScore": number (0-100, score geral de qualidade),
    "qualidadeClassificacao": "excelente" | "bom" | "aceitavel" | "ruim",
    "inconsistencias": ["string"] ou [],
    "camposFaltantes": ["string"] ou [],
    "recomendacoesValidacao": "string (sugestões de melhoria)"
  }
}

CÁLCULO DO SCORE:
- Cliente completo (CNPJ, porte, faturamento, métricas): +40 pontos
- Mercado completo (hierarquia, tamanho, tendências): +20 pontos
- Produtos completos (3 produtos com métricas): +15 pontos
- Concorrentes completos (5 concorrentes com métricas): +15 pontos
- Leads completos (5 leads com métricas e scores): +10 pontos

CLASSIFICAÇÃO:
- 90-100: excelente
- 70-89: bom
- 50-69: aceitavel
- 0-49: ruim

INCONSISTÊNCIAS A VERIFICAR:
1. Cliente na lista de concorrentes ou leads
2. Concorrente na lista de leads
3. Scores fora do range (0-100)
4. Segmento ABC inválido
5. Hierarquia de mercado incompleta
6. Métricas financeiras negativas

RETORNE APENAS O JSON, SEM TEXTO ADICIONAL.
```

### **Campos Preenchidos:** 5
### **Custo:** ~$0.00006

---

## 📊 RESUMO DE CUSTOS

| Prompt | Modelo | Tokens | Custo | Campos |
|--------|--------|--------|-------|--------|
| P1: Cliente | GPT-4o | 290 | $0.0011 | 23 |
| P2: Mercado | GPT-4o | 420 | $0.0020 | 11 |
| P3: Produtos | GPT-4o | 440 | $0.0025 | 39 |
| P4: Concorrentes | GPT-4o-mini | 700 | $0.00024 | 60 |
| P5: Leads | GPT-4o-mini | 760 | $0.00028 | 115 |
| P6: Validação | GPT-4o-mini | 220 | $0.00006 | 5 |
| **TOTAL** | **Híbrido** | **2.830** | **$0.0059** | **253** |

**Custo por Cliente:** $0.006 (arredondado)  
**Custo para 1.000 Clientes:** $6  
**Custo para 10.000 Clientes:** $60

---

## 🎯 CAMPOS TOTAIS PREENCHIDOS

**Por Cliente:**
- **Cliente:** 23 campos (P1)
- **Mercado:** 11 campos (P2)
- **Produtos:** 39 campos (P3, 13×3)
- **Concorrentes:** 60 campos (P4, 12×5)
- **Leads:** 115 campos (P5, 23×5)
- **Validação:** 5 campos (P6)

**TOTAL:** 253 campos preenchidos pela IA  
**TOTAL GERAL:** 477 campos (253 IA + 224 sistema)

---

## ✅ PRÓXIMOS PASSOS

1. Implementar funções de cálculo de métricas
2. Criar funções de gravação com novos campos
3. Atualizar worker de enriquecimento
4. Testar com dados reais

**Status:** ✅ ESPECIFICAÇÃO COMPLETA  
**Próximo:** Implementação das funções
