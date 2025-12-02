# 🧠 FASE 5 - ENRIQUECIMENTO: CONCEITUAÇÃO COMPLETA

**Data:** 01 de Dezembro de 2025  
**Versão:** 3.0 (Consolidação Passado + Presente)  
**Status:** 📋 CONCEITUAL - Aguardando Validação

---

## 🎯 VISÃO GERAL

A FASE 5 representa o **coração inteligente** do sistema - onde dados mínimos (nome + status) se transformam em inteligência de mercado acionável através de IA.

### **Transformação:**

```
ENTRADA (FASE 4 - Importação):
- Nome: "Empresa X"
- Status: "Ativo"
- Score: 20-40 (BAIXO)

↓ ENRIQUECIMENTO (FASE 5) ↓

SAÍDA:
- Todos os 27 campos preenchidos
- 1 Mercado identificado e enriquecido
- 3 Produtos/Serviços mapeados
- 5 Concorrentes identificados
- 5 Leads qualificados
- Score: 70-95 (ALTO)
```

---

## 📚 APRENDIZADOS DO PASSADO (V2)

### ✅ O QUE FUNCIONOU MUITO BEM

**1. Arquitetura Modular (8 Fases)**
- Prompts separados por tipo de entidade
- Temperatura ajustada por fase (0.8 → 1.0)
- Validação intermediária
- Score de qualidade: 66% → 96% (+44pp)

**2. Regra de Honestidade**
- "Se não tem certeza do CNPJ: retorne NULL"
- Eliminou 94,5% de CNPJs inventados
- Confiabilidade > Completude

**3. Quantificação Fixa**
- 1 Mercado + 3 Produtos + 5 Concorrentes + 5 Leads
- Eliminou variabilidade (1-10 → fixo 5)
- Análises comparativas consistentes

**4. Enriquecimento de Mercado**
- 0% → 100% de completude
- Tendências, crescimento, players
- Inteligência competitiva real

**5. Localização Obrigatória**
- 11,52% → 100% com cidade/UF
- Geocodificação automática
- Análises territoriais viáveis

---

## ⚠️ GAPS IDENTIFICADOS NO V2

### **GAP #1: Processamento Sequencial Lento**
- 1 cliente por vez = 5-8min por cliente
- 100 clientes = 8-13 horas
- **Solução V3:** Jobs em background + processamento paralelo

### **GAP #2: Sem Retry Inteligente**
- Falha = perda total
- Sem recuperação automática
- **Solução V3:** Retry com backoff exponencial + fallback

### **GAP #3: Sem Monitoramento em Tempo Real**
- Usuário não sabe o progresso
- Sem visibilidade de erros
- **Solução V3:** WebSocket + progress bar + logs

### **GAP #4: Custo Não Otimizado**
- Sempre GPT-4 (caro)
- Sem cache de mercados
- **Solução V3:** GPT-4o-mini para validações + cache Redis

### **GAP #5: Sem Enriquecimento Incremental**
- Tudo ou nada
- Não permite atualização parcial
- **Solução V3:** Enriquecimento por campo/grupo

---

## 🏗️ ARQUITETURA V3 (NOVA)

### **Fluxo Completo:**

```
┌─────────────────────────────────────────────────────────────┐
│  ENTRADA: Entidades Importadas (FASE 4)                    │
│  - 1-250k entidades com nome + status                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SELEÇÃO: Usuário escolhe o que enriquecer                 │
│  - Todas (em lote)                                          │
│  - Por filtro (status, projeto, pesquisa)                  │
│  - Individual (1 entidade)                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  CRIAÇÃO DE JOBS (BullMQ + Redis)                          │
│  - 1 job por entidade                                       │
│  - Prioridade: Ativo > Prospect > Inativo                  │
│  - Concorrência: 5 jobs simultâneos                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PROCESSAMENTO PARALELO (Worker Pool)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 1: Enriquecer Cliente (GPT-4o, temp 0.8)      │  │
│  │  - CNPJ, email, telefone, site, porte, setor        │  │
│  │  - Validação: campos obrigatórios                    │  │
│  │  - Retry: 3x com backoff                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 2: Identificar Mercado (GPT-4o, temp 0.9)     │  │
│  │  - Nome, categoria, tamanho, crescimento            │  │
│  │  - Tendências, players                               │  │
│  │  - Cache: reutilizar mercados existentes            │  │
│  │  - Validação: 7 campos obrigatórios                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 3: Produtos (GPT-4o, temp 0.9)                │  │
│  │  - Exatamente 3 produtos                             │  │
│  │  - Nome, descrição, categoria                        │  │
│  │  - Validação: quantidade fixa                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 4: Concorrentes (GPT-4o, temp 1.0)            │  │
│  │  - Exatamente 5 concorrentes                         │  │
│  │  - Validação: ≠ Cliente, ≠ Leads                     │  │
│  │  - Deduplicação: hash único                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 5: Leads (GPT-4o, temp 1.0)                   │  │
│  │  - Exatamente 5 leads                                │  │
│  │  - Validação: ≠ Cliente, ≠ Concorrentes              │  │
│  │  - Deduplicação: hash único                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 6: Validação (GPT-4o-mini, temp 0.3)          │  │
│  │  - Calcular score (0-100)                            │  │
│  │  - Rejeitar se < 70%                                 │  │
│  │  - Retry se falhou                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 7: Geocodificação (Fuzzy Match)               │  │
│  │  - JOIN com dim_geografia                            │  │
│  │  - Similaridade > 80%                                │  │
│  │  - Latitude/Longitude                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  FASE 8: Gravação (Transacional)                    │  │
│  │  - Atualizar dim_entidade                            │  │
│  │  - Criar fato_entidade_contexto                      │  │
│  │  - Criar fato_entidade_produto (3x)                  │  │
│  │  - Criar fato_entidade_competidor (5x)               │  │
│  │  - Criar leads (5x)                                  │  │
│  │  - Atualizar score de qualidade                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  MONITORAMENTO (WebSocket + UI)                            │
│  - Progress bar em tempo real                              │
│  - Estatísticas (sucesso/erro/em progresso)                │
│  - Logs detalhados                                          │
│  - Estimativa de tempo restante                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  RESULTADO FINAL                                            │
│  - Entidades enriquecidas (score 70-95)                    │
│  - Relatório de qualidade                                  │
│  - Erros e avisos                                           │
│  - Custo total (tokens + $)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 PROMPTS V3 (REFINADOS)

### **PROMPT 1: ENRIQUECER CLIENTE**

**Temperatura:** 0.8  
**Modelo:** GPT-4o  
**Max Tokens:** 1000

```
Você é um analista de mercado B2B especializado em empresas brasileiras.

EMPRESA: {nome}
STATUS ATUAL: {status}
CIDADE/UF (se disponível): {cidade}, {uf}

TAREFA: Enriquecer dados da empresa com informações REAIS e VERIFICÁVEIS.

CAMPOS OBRIGATÓRIOS:
1. cnpj: CNPJ no formato XX.XXX.XXX/XXXX-XX - NULL se não souber COM CERTEZA
2. email: Email corporativo - NULL se não souber
3. telefone: Telefone (XX) XXXXX-XXXX - NULL se não souber
4. site: Site oficial https://... - NULL se não souber
5. cidade: Cidade completa (obrigatório)
6. uf: Estado 2 letras maiúsculas (obrigatório)
7. porte: Micro | Pequena | Média | Grande
8. setor: Setor específico (ex: "Tecnologia - Software")
9. produtoPrincipal: Principal produto/serviço (max 200 chars)
10. segmentacaoB2bB2c: B2B | B2C | B2B2C

REGRAS CRÍTICAS:
- Se NÃO TEM CERTEZA do CNPJ: retorne NULL
- NUNCA invente emails, telefones ou sites
- Cidade e UF são OBRIGATÓRIOS
- Seja conservador e preciso

Retorne APENAS JSON válido:
{
  "cnpj": "string ou null",
  "email": "string ou null",
  "telefone": "string ou null",
  "site": "string ou null",
  "cidade": "string",
  "uf": "string",
  "porte": "string",
  "setor": "string",
  "produtoPrincipal": "string",
  "segmentacaoB2bB2c": "string"
}
```

---

### **PROMPT 2: IDENTIFICAR MERCADO**

**Temperatura:** 0.9  
**Modelo:** GPT-4o  
**Max Tokens:** 1500

```
Você é um analista de mercado especializado em inteligência competitiva do Brasil.

EMPRESA: {nome}
PRODUTO PRINCIPAL: {produtoPrincipal}
SETOR: {setor}
CIDADE/UF: {cidade}, {uf}

TAREFA: Identificar o MERCADO PRINCIPAL e enriquecê-lo com dados REAIS do Brasil.

CAMPOS OBRIGATÓRIOS:
1. nome: Nome específico do mercado (ex: "Software de Gestão Empresarial")
2. categoria: Indústria | Comércio | Serviços | Tecnologia
3. segmentacao: B2B | B2C | B2B2C
4. tamanhoMercado: Tamanho no Brasil (ex: "R$ 15 bi/ano, 500 mil empresas")
5. crescimentoAnual: Taxa (ex: "12% ao ano (2023-2028)")
6. tendencias: 3-5 tendências atuais (max 500 chars)
7. principaisPlayers: 5-10 empresas brasileiras (separadas por vírgula)

REGRAS CRÍTICAS:
- Seja ESPECÍFICO sobre o mercado brasileiro
- Use dados REAIS e ATUALIZADOS (2024-2025)
- Tendências devem ser CONCRETAS
- Players devem ser empresas REAIS

Retorne APENAS JSON válido:
{
  "nome": "string",
  "categoria": "string",
  "segmentacao": "string",
  "tamanhoMercado": "string",
  "crescimentoAnual": "string",
  "tendencias": "string",
  "principaisPlayers": "string"
}
```

---

### **PROMPT 3: PRODUTOS/SERVIÇOS**

**Temperatura:** 0.9  
**Modelo:** GPT-4o  
**Max Tokens:** 1200

```
Você é um especialista em análise de produtos B2B.

EMPRESA: {nome}
PRODUTO PRINCIPAL: {produtoPrincipal}
MERCADO: {mercado.nome}
SITE: {site}

TAREFA: Identificar os 3 PRINCIPAIS produtos/serviços.

CAMPOS OBRIGATÓRIOS (para cada produto):
1. nome: Nome do produto/serviço (max 255 chars)
2. descricao: Descrição detalhada (max 500 chars)
3. categoria: Categoria (ex: "Software", "Consultoria")

REGRAS CRÍTICAS:
- EXATAMENTE 3 produtos (não mais, não menos)
- Produtos DIFERENTES entre si
- Descrições ESPECÍFICAS e TÉCNICAS

Retorne APENAS JSON válido:
{
  "produtos": [
    {
      "nome": "string",
      "descricao": "string",
      "categoria": "string"
    },
    {
      "nome": "string",
      "descricao": "string",
      "categoria": "string"
    },
    {
      "nome": "string",
      "descricao": "string",
      "categoria": "string"
    }
  ]
}
```

---

### **PROMPT 4: CONCORRENTES**

**Temperatura:** 1.0  
**Modelo:** GPT-4o  
**Max Tokens:** 2000

```
Você é um especialista em inteligência competitiva do Brasil.

CLIENTE (NÃO PODE SER CONCORRENTE): {nome}
MERCADO: {mercado.nome}
PRODUTOS DO CLIENTE: {produtos[0].nome}, {produtos[1].nome}, {produtos[2].nome}
REGIÃO: {cidade}, {uf}

TAREFA: Identificar 5 CONCORRENTES REAIS que oferecem produtos similares.

DEFINIÇÃO DE CONCORRENTE:
- Empresa DIFERENTE do cliente
- Oferece produtos/serviços SIMILARES
- Atua no MESMO mercado
- Pode ser de qualquer região do Brasil

CAMPOS OBRIGATÓRIOS (para cada):
1. nome: Razão social ou nome fantasia
2. cidade: Cidade (obrigatório)
3. uf: Estado 2 letras (obrigatório)
4. produtoPrincipal: Principal produto/serviço

CAMPOS OPCIONAIS:
5. cnpj: XX.XXX.XXX/XXXX-XX - NULL se não souber
6. site: https://... - NULL se não souber
7. porte: Micro | Pequena | Média | Grande - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 concorrentes
- NÃO inclua o cliente: {nome}
- NÃO invente CNPJs (use NULL)
- Empresas REAIS e DIFERENTES

Retorne APENAS JSON válido com 5 concorrentes.
```

---

### **PROMPT 5: LEADS**

**Temperatura:** 1.0  
**Modelo:** GPT-4o  
**Max Tokens:** 2000

```
Você é um especialista em prospecção B2B do Brasil.

CLIENTE (FORNECEDOR): {nome}
PRODUTOS OFERECIDOS: {produtos[0].nome}, {produtos[1].nome}, {produtos[2].nome}
MERCADO: {mercado.nome}
REGIÃO: {cidade}, {uf}

CONCORRENTES (NÃO PODEM SER LEADS): {concorrentes[0].nome}, {concorrentes[1].nome}, ...

TAREFA: Identificar 5 LEADS REAIS (empresas que COMPRAM os produtos do cliente).

DEFINIÇÃO DE LEAD:
- Empresa que COMPRA/CONSOME os produtos do cliente
- NÃO é o próprio cliente
- NÃO é concorrente
- Pode ser de qualquer região do Brasil

CAMPOS OBRIGATÓRIOS (para cada):
1. nome: Razão social ou nome fantasia
2. cidade: Cidade (obrigatório)
3. uf: Estado 2 letras (obrigatório)
4. produtoInteresse: Qual produto compraria
5. setor: Setor de atuação

CAMPOS OPCIONAIS:
6. cnpj: XX.XXX.XXX/XXXX-XX - NULL se não souber
7. site: https://... - NULL se não souber
8. porte: Micro | Pequena | Média | Grande - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 leads
- NÃO inclua cliente: {nome}
- NÃO inclua concorrentes
- NÃO invente CNPJs (use NULL)
- Empresas REAIS que usariam os produtos

Retorne APENAS JSON válido com 5 leads DIFERENTES.
```

---

## ✅ SISTEMA DE VALIDAÇÃO V3

### **Score de Qualidade (0-100)**

```typescript
interface ScoreCalculation {
  camposObrigatorios: {
    preenchidos: number;
    total: number;
    peso: 70; // 70% do score
  };
  camposOpcionais: {
    preenchidos: number;
    total: number;
    peso: 30; // 30% do score
  };
  scoreTotal: number; // 0-100
  status: 'excelente' | 'bom' | 'aceitavel' | 'ruim';
}

function calcularScore(entidade: any): ScoreCalculation {
  const obrigatorios = ['nome', 'cidade', 'uf', 'porte', 'setor', 'produtoPrincipal', 'segmentacaoB2bB2c'];
  const opcionais = ['cnpj', 'email', 'telefone', 'site'];
  
  const preenchidosObrig = obrigatorios.filter(campo => entidade[campo] && entidade[campo] !== null).length;
  const preenchidosOpc = opcionais.filter(campo => entidade[campo] && entidade[campo] !== null).length;
  
  const scoreObrig = (preenchidosObrig / obrigatorios.length) * 70;
  const scoreOpc = (preenchidosOpc / opcionais.length) * 30;
  
  const scoreTotal = Math.round(scoreObrig + scoreOpc);
  
  let status: 'excelente' | 'bom' | 'aceitavel' | 'ruim';
  if (scoreTotal >= 90) status = 'excelente';
  else if (scoreTotal >= 80) status = 'bom';
  else if (scoreTotal >= 70) status = 'aceitavel';
  else status = 'ruim';
  
  return {
    camposObrigatorios: {
      preenchidos: preenchidosObrig,
      total: obrigatorios.length,
      peso: 70
    },
    camposOpcionais: {
      preenchidos: preenchidosOpc,
      total: opcionais.length,
      peso: 30
    },
    scoreTotal,
    status
  };
}
```

### **Critérios de Aceitação**

- ✅ **Score >= 90:** Excelente (aceitar)
- ✅ **Score 80-89:** Bom (aceitar)
- ⚠️ **Score 70-79:** Aceitável (aceitar com aviso)
- ❌ **Score < 70:** Ruim (rejeitar e retry)

---

## 🔧 TECNOLOGIAS V3

### **Backend**
- **BullMQ:** Fila de jobs (Redis)
- **Redis:** Cache de mercados + sessões
- **OpenAI API:** GPT-4o + GPT-4o-mini
- **Drizzle ORM:** Queries type-safe
- **Zod:** Validação de schemas

### **Frontend**
- **React Query:** Cache + sincronização
- **WebSocket:** Progress em tempo real
- **Recharts:** Gráficos de qualidade
- **Tailwind:** UI responsiva

---

## 📊 MÉTRICAS ESPERADAS V3

| Métrica | V2 (Atual) | V3 (Esperado) | Melhoria |
|---------|------------|---------------|----------|
| **Score Médio** | 66% | 85% | +29% |
| **Tempo (100 clientes)** | 8-13h | 1-2h | -85% |
| **CNPJs Inventados** | 94,5% | 0% | -100% |
| **Mercados Enriquecidos** | 0% | 100% | +100% |
| **Localização Completa** | 11,52% | 100% | +769% |
| **Custo por Cliente** | $0.50 | $0.35 | -30% |
| **Taxa de Sucesso** | 85% | 95% | +12% |

---

## ⏱️ CRONOGRAMA ESTIMADO

**Semana 1-2:** Infraestrutura (8-12h)
- BullMQ + Redis
- Workers
- WebSocket

**Semana 3-4:** Prompts e Validação (8-12h)
- 5 prompts refinados
- Sistema de validação
- Retry logic

**Semana 5-6:** UI e Monitoramento (8-12h)
- Página de enriquecimento
- Progress real-time
- Relatórios

**Semana 7-8:** Testes e Ajustes (6-8h)
- Testes unitários
- Testes de integração
- Otimizações

**TOTAL:** 30-44h (~1-2 meses)

---

## ❓ DECISÕES NECESSÁRIAS

### **1. Modelo de IA**
- A) GPT-4o (mais caro, melhor qualidade) ⭐ **RECOMENDO**
- B) GPT-4o-mini (mais barato, qualidade ok)
- C) Híbrido (GPT-4o para cliente/mercado, mini para validação) ⭐⭐ **MELHOR**

### **2. Concorrência de Jobs**
- A) 5 simultâneos (balanceado) ⭐ **RECOMENDO**
- B) 10 simultâneos (mais rápido, mais caro)
- C) 3 simultâneos (mais lento, mais barato)

### **3. Retry Strategy**
- A) 3 tentativas com backoff exponencial ⭐ **RECOMENDO**
- B) 5 tentativas
- C) Sem retry (falha = pula)

### **4. Cache de Mercados**
- A) Redis (rápido, expira em 7 dias) ⭐ **RECOMENDO**
- B) Banco (permanente, mais lento)
- C) Sem cache (sempre novo)

### **5. Enriquecimento Opcional**
- A) Sempre perguntar ao usuário ⭐ **RECOMENDO**
- B) Sempre enriquecer automaticamente
- C) Configurável por projeto

---

## 🎯 PRÓXIMOS PASSOS

1. **Validar conceituação** com você
2. **Decidir** as 5 questões acima
3. **Criar especificação técnica** detalhada
4. **Implementar** FASE 5
5. **Testar** com dados reais
6. **Deploy** e monitorar

---

**Aguardo sua validação e decisões!** 🚀
