# 🏗️ FASE 5 - ENRIQUECIMENTO: ARQUITETURA TÉCNICA COMPLETA

**Data:** 01 de Dezembro de 2025  
**Versão:** 3.0 FINAL  
**Autor:** Engenheiro de Dados + Arquiteto da Informação + Especialista em Prompts

---

## 🎯 DECISÕES CONFIRMADAS

1. ✅ **Modelo IA:** Híbrido (GPT-4o para enriquecimento + GPT-4o-mini para validação)
2. ✅ **Concorrência:** 5 jobs simultâneos
3. ✅ **Retry:** 3 tentativas com backoff exponencial
4. ✅ **Cache:** Redis (7 dias)
5. ✅ **Enriquecimento:** Configurável por projeto

---

## 📊 PARTE 1: MAPEAMENTO COMPLETO DE CAMPOS

### **1.1. dim_entidade (17 campos a preencher)**

**Campos já preenchidos na IMPORTAÇÃO (3):**
- ✅ nome
- ✅ tipoEntidade (sempre 'cliente' na importação)
- ✅ entidadeHash (gerado automaticamente)

**Campos a PREENCHER no ENRIQUECIMENTO (14):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | nomeFantasia | varchar(255) | Não | P1 | 0.8 |
| 2 | cnpj | varchar(18) | Não* | P1 | 0.8 |
| 3 | email | varchar(255) | Não | P1 | 0.8 |
| 4 | telefone | varchar(20) | Não | P1 | 0.8 |
| 5 | site | varchar(255) | Não | P1 | 0.8 |
| 6 | numFiliais | integer | Não | P1 | 0.8 |
| 7 | numLojas | integer | Não | P1 | 0.8 |
| 8 | numFuncionarios | integer | Não | P1 | 0.8 |

**Campos de Rastreabilidade (já preenchidos automaticamente):**
- origemTipo = 'enriquecimento_ia'
- origemProcesso = 'enriquecimento_v3'
- origemPrompt = (texto do prompt usado)
- origemConfianca = (score 0-100)
- origemData = NOW()
- origemUsuarioId = user.id

*CNPJ: NULL se não tiver certeza (Regra de Honestidade)

---

### **1.2. fato_entidade_contexto (10 campos a preencher)**

**Campos já preenchidos na IMPORTAÇÃO (4):**
- ✅ entidadeId
- ✅ projetoId
- ✅ pesquisaId
- ✅ statusQualificacaoId (ativo/inativo/prospect)

**Campos a PREENCHER no ENRIQUECIMENTO (10):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | geografiaId | integer (FK) | **SIM** | P1 + Geo | Fuzzy |
| 2 | mercadoId | integer (FK) | **SIM** | P2 | 0.9 |
| 3 | cnae | varchar(10) | Não | P1 | 0.8 |
| 4 | porte | varchar(20) | **SIM** | P1 | 0.8 |
| 5 | faturamentoEstimado | decimal | Não | P1 | 0.8 |
| 6 | numFuncionarios | integer | Não | P1 | 0.8 |
| 7 | qualidadeScore | integer | **SIM** | P6 | 0.3 |
| 8 | qualidadeClassificacao | varchar(10) | **SIM** | P6 | 0.3 |
| 9 | observacoes | text | Não | - | - |

**Nota:** statusQualificacaoId pode ser ATUALIZADO se for 'prospect':
- Prospect → Quente (relevância >= 80%)
- Prospect → Morno (relevância >= 50%)
- Prospect → Frio (relevância >= 20%)
- Prospect → Descartado (relevância < 20%)

---

### **1.3. dim_mercado (7 campos a preencher)**

**Campos a CRIAR/ENRIQUECER (7):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | mercadoHash | varchar(64) | **SIM** | Auto | - |
| 2 | nome | varchar(255) | **SIM** | P2 | 0.9 |
| 3 | categoria | varchar(100) | **SIM** | P2 | 0.9 |
| 4 | segmentacao | varchar(255) | **SIM** | P2 | 0.9 |
| 5 | tamanhoMercadoBr | decimal | **SIM** | P2 | 0.9 |
| 6 | crescimentoAnualPct | decimal | **SIM** | P2 | 0.9 |
| 7 | tendencias | text[] | **SIM** | P2 | 0.9 |
| 8 | principaisPlayers | text[] | **SIM** | P2 | 0.9 |

**Flags de Enriquecimento:**
- enriquecido = true
- enriquecidoEm = NOW()
- enriquecidoPor = 'gpt-4o'

**Cache Redis:** Mercados são reutilizados (hash único)

---

### **1.4. dim_produto (3 produtos x 4 campos = 12 campos)**

**Campos a CRIAR (para cada produto):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | produtoHash | varchar(64) | **SIM** | Auto | - |
| 2 | nome | varchar(255) | **SIM** | P3 | 0.9 |
| 3 | categoria | varchar(100) | **SIM** | P3 | 0.9 |
| 4 | descricao | text | **SIM** | P3 | 0.9 |

**Quantidade Fixa:** EXATAMENTE 3 produtos por cliente

**Flags de Enriquecimento:**
- enriquecido = false (produtos não são enriquecidos individualmente)

---

### **1.5. fato_entidade_produto (3 relações x 3 campos = 9 campos)**

**Campos a CRIAR (para cada relação):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | contextoId | integer (FK) | **SIM** | Auto | - |
| 2 | produtoId | integer (FK) | **SIM** | P3 | 0.9 |
| 3 | tipoRelacao | varchar(50) | Não | P3 | 0.9 |
| 4 | volumeEstimado | varchar(100) | Não | P3 | 0.9 |
| 5 | observacoes | text | Não | - | - |

**Quantidade Fixa:** EXATAMENTE 3 relações

---

### **1.6. dim_entidade (5 concorrentes x 8 campos = 40 campos)**

**Campos a CRIAR (para cada concorrente):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | entidadeHash | varchar(64) | **SIM** | Auto | - |
| 2 | tipoEntidade | varchar(20) | **SIM** | 'concorrente' | - |
| 3 | nome | varchar(255) | **SIM** | P4 | 1.0 |
| 4 | nomeFantasia | varchar(255) | Não | P4 | 1.0 |
| 5 | cnpj | varchar(18) | Não* | P4 | 1.0 |
| 6 | site | varchar(255) | Não | P4 | 1.0 |
| 7 | numFuncionarios | integer | Não | P4 | 1.0 |

**Quantidade Fixa:** EXATAMENTE 5 concorrentes

*CNPJ: NULL se não tiver certeza

---

### **1.7. fato_entidade_contexto (5 concorrentes)**

**Campos a CRIAR (para cada concorrente):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | entidadeId | integer (FK) | **SIM** | P4 | 1.0 |
| 2 | projetoId | integer (FK) | **SIM** | Auto | - |
| 3 | pesquisaId | integer (FK) | **SIM** | Auto | - |
| 4 | geografiaId | integer (FK) | **SIM** | P4 + Geo | Fuzzy |
| 5 | statusQualificacaoId | integer (FK) | **SIM** | 'prospect' | - |
| 6 | porte | varchar(20) | Não | P4 | 1.0 |

---

### **1.8. fato_entidade_competidor (5 relações x 4 campos = 20 campos)**

**Campos a CRIAR (para cada relação):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | contextoId | integer (FK) | **SIM** | Auto | - |
| 2 | competidorEntidadeId | integer (FK) | **SIM** | P4 | 1.0 |
| 3 | nivelCompeticao | varchar(20) | **SIM** | P4 | 1.0 |
| 4 | diferencial | text | Não | P4 | 1.0 |
| 5 | observacoes | text | Não | - | - |

**Quantidade Fixa:** EXATAMENTE 5 relações

---

### **1.9. dim_entidade (5 leads x 8 campos = 40 campos)**

**Campos a CRIAR (para cada lead):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | entidadeHash | varchar(64) | **SIM** | Auto | - |
| 2 | tipoEntidade | varchar(20) | **SIM** | 'lead' | - |
| 3 | nome | varchar(255) | **SIM** | P5 | 1.0 |
| 4 | nomeFantasia | varchar(255) | Não | P5 | 1.0 |
| 5 | cnpj | varchar(18) | Não* | P5 | 1.0 |
| 6 | site | varchar(255) | Não | P5 | 1.0 |
| 7 | numFuncionarios | integer | Não | P5 | 1.0 |

**Quantidade Fixa:** EXATAMENTE 5 leads

*CNPJ: NULL se não tiver certeza

---

### **1.10. fato_entidade_contexto (5 leads)**

**Campos a CRIAR (para cada lead):**

| # | Campo | Tipo | Obrigatório | Prompt | Temperatura |
|---|-------|------|-------------|--------|-------------|
| 1 | entidadeId | integer (FK) | **SIM** | P5 | 1.0 |
| 2 | projetoId | integer (FK) | **SIM** | Auto | - |
| 3 | pesquisaId | integer (FK) | **SIM** | Auto | - |
| 4 | geografiaId | integer (FK) | **SIM** | P5 + Geo | Fuzzy |
| 5 | statusQualificacaoId | integer (FK) | **SIM** | 'prospect' | - |
| 6 | porte | varchar(20) | Não | P5 | 1.0 |

---

## 📊 RESUMO QUANTITATIVO

### **Total de Campos a Preencher POR CLIENTE:**

| Tabela | Qtd Registros | Campos/Registro | Total Campos |
|--------|---------------|-----------------|--------------|
| dim_entidade (cliente) | 1 | 14 | **14** |
| fato_entidade_contexto (cliente) | 1 | 10 | **10** |
| dim_mercado | 1 | 7 | **7** |
| dim_produto | 3 | 4 | **12** |
| fato_entidade_produto | 3 | 3 | **9** |
| dim_entidade (concorrentes) | 5 | 8 | **40** |
| fato_entidade_contexto (concorrentes) | 5 | 6 | **30** |
| fato_entidade_competidor | 5 | 4 | **20** |
| dim_entidade (leads) | 5 | 8 | **40** |
| fato_entidade_contexto (leads) | 5 | 6 | **30** |
| **TOTAL** | **29** | - | **212** |

**Por cliente:** 212 campos preenchidos  
**Para 100 clientes:** 21.200 campos  
**Para 1.000 clientes:** 212.000 campos

---

## 🧩 PARTE 2: ESTRATÉGIA DE BLOCOS E PROMPTS

### **2.1. Estratégia de Blocos**

**Problema:** Processar 1 cliente por vez é lento (8-13h para 100 clientes)

**Solução:** Blocos de N clientes processados em paralelo

**Análise de Custo vs Velocidade:**

| Blocos | Clientes/Bloco | Tokens/Bloco | Custo/Bloco | Velocidade (100 clientes) |
|--------|----------------|--------------|-------------|---------------------------|
| 1 | 1 | ~3.000 | $0.35 | 8-13h (sequencial) |
| 5 | 1 | ~3.000 | $0.35 | 1.6-2.6h (5 workers) |
| 10 | 1 | ~3.000 | $0.35 | 0.8-1.3h (10 workers) |

**Decisão:** 
- ✅ **5 workers simultâneos** (balanceado)
- ✅ **1 cliente por job** (granularidade fina para retry)

**Justificativa:**
- Retry individual (se 1 falha, não perde os outros 4)
- Progress granular (barra de progresso precisa)
- Custo controlado (5 chamadas simultâneas vs 10)

---

### **2.2. Estratégia de Prompts: Único vs Dividido**

**Opção A: Prompt Único (Monolítico)**
```
Entrada: 1 cliente
Saída: Tudo (cliente + mercado + 3 produtos + 5 concorrentes + 5 leads)
Tokens: ~8.000-10.000
Custo: $0.80-$1.00
Risco: Alto (se falha, perde tudo)
```

**Opção B: Prompts Divididos (Modular)** ⭐ **RECOMENDADO**
```
P1: Cliente → 14 campos
P2: Mercado → 7 campos
P3: Produtos → 12 campos (3x)
P4: Concorrentes → 60 campos (5x)
P5: Leads → 60 campos (5x)
P6: Validação → score

Total Tokens: ~9.000-11.000
Custo: $0.90-$1.10
Risco: Baixo (retry individual por fase)
```

**Decisão:** ✅ **Prompts Divididos (6 prompts)**

**Justificativa:**
- Retry granular (se P4 falha, não refaz P1-P3)
- Temperatura otimizada por tipo (0.8 para cliente, 1.0 para concorrentes)
- Validação intermediária (cada fase valida antes de prosseguir)
- Cache de mercado (P2 pode reutilizar mercados existentes)

---

### **2.3. Mapeamento de Prompts**

| Prompt | Objetivo | Modelo | Temp | Tokens (in) | Tokens (out) | Custo |
|--------|----------|--------|------|-------------|--------------|-------|
| **P1** | Enriquecer Cliente | GPT-4o | 0.8 | 800 | 500 | $0.08 |
| **P2** | Identificar Mercado | GPT-4o | 0.9 | 1.000 | 800 | $0.11 |
| **P3** | Produtos (3x) | GPT-4o | 0.9 | 1.200 | 600 | $0.11 |
| **P4** | Concorrentes (5x) | GPT-4o | 1.0 | 2.000 | 1.500 | $0.21 |
| **P5** | Leads (5x) | GPT-4o | 1.0 | 2.000 | 1.500 | $0.21 |
| **P6** | Validação | GPT-4o-mini | 0.3 | 500 | 200 | $0.01 |
| **Geo** | Fuzzy Match | - | - | - | - | $0.00 |
| **TOTAL** | - | - | - | 7.500 | 5.100 | **$0.73** |

**Custo por cliente:** $0.73  
**Custo para 100 clientes:** $73  
**Custo para 1.000 clientes:** $730

---

### **2.4. Temperaturas Otimizadas**

**Temperatura:** Controla criatividade vs precisão

| Temperatura | Uso | Justificativa |
|-------------|-----|---------------|
| **0.3** | Validação (P6) | Máxima precisão, sem criatividade |
| **0.8** | Cliente (P1) | Balanceado (preciso mas flexível) |
| **0.9** | Mercado + Produtos (P2, P3) | Criativo mas controlado |
| **1.0** | Concorrentes + Leads (P4, P5) | Máxima criatividade (diversidade) |

**Por que temperaturas diferentes?**

- **P1 (Cliente):** Dados factuais (CNPJ, email) → baixa criatividade
- **P2 (Mercado):** Análise de mercado → criatividade moderada
- **P3 (Produtos):** Identificação de produtos → criatividade moderada
- **P4 (Concorrentes):** Diversidade de concorrentes → alta criatividade
- **P5 (Leads):** Diversidade de leads → alta criatividade
- **P6 (Validação):** Cálculo de score → zero criatividade

---

## 🔄 PARTE 3: ARQUITETURA DE GRAVAÇÃO CONCOMITANTE

### **3.1. Fluxo de Processamento**

```
┌────────────────────────────────────────────────────────────────┐
│  JOB WORKER (1 de 5 simultâneos)                              │
│                                                                │
│  Cliente: "Empresa X" (ID importação: 123)                    │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  FASE 1: ENRIQUECER CLIENTE (P1, temp 0.8, GPT-4o)           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Input:                                                   │ │
│  │  - nome: "Empresa X"                                      │ │
│  │  - status: "Ativo"                                        │ │
│  │  - cidade: null (a preencher)                             │ │
│  │  - uf: null (a preencher)                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LLM Call (GPT-4o, temp 0.8)                             │ │
│  │  Tokens: 800 in + 500 out = 1.300                        │ │
│  │  Custo: $0.08                                             │ │
│  │  Tempo: ~2-3s                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Output (JSON):                                           │ │
│  │  {                                                         │ │
│  │    "nomeFantasia": "Empresa X Ltda",                      │ │
│  │    "cnpj": "12.345.678/0001-90",                          │ │
│  │    "email": "contato@empresax.com.br",                    │ │
│  │    "telefone": "(11) 98765-4321",                         │ │
│  │    "site": "https://empresax.com.br",                     │ │
│  │    "cidade": "São Paulo",                                 │ │
│  │    "uf": "SP",                                            │ │
│  │    "porte": "Média",                                      │ │
│  │    "setor": "Tecnologia - Software",                      │ │
│  │    "produtoPrincipal": "Sistema de gestão empresarial",   │ │
│  │    "segmentacaoB2bB2c": "B2B",                            │ │
│  │    "numFiliais": 3,                                       │ │
│  │    "numLojas": 0,                                         │ │
│  │    "numFuncionarios": 150                                 │ │
│  │  }                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  VALIDAÇÃO INTERMEDIÁRIA                                  │ │
│  │  - Campos obrigatórios: cidade, uf, porte ✅              │ │
│  │  - CNPJ formato válido ✅                                 │ │
│  │  - Email formato válido ✅                                │ │
│  │  - Telefone formato válido ✅                             │ │
│  │  - Site URL válida ✅                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  GRAVAÇÃO CONCOMITANTE #1                                 │ │
│  │  UPDATE dim_entidade SET                                  │ │
│  │    nomeFantasia = 'Empresa X Ltda',                       │ │
│  │    cnpj = '12.345.678/0001-90',                           │ │
│  │    email = 'contato@empresax.com.br',                     │ │
│  │    ... (14 campos)                                        │ │
│  │  WHERE id = {entidadeId}                                  │ │
│  │                                                            │ │
│  │  ✅ COMMIT (2-3ms)                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  FASE 2: GEOLOCALIZAÇÃO (Fuzzy Match)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Input:                                                   │ │
│  │  - cidade: "São Paulo"                                    │ │
│  │  - uf: "SP"                                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Fuzzy Match (Levenshtein > 80%)                         │ │
│  │  SELECT * FROM dim_geografia                              │ │
│  │  WHERE uf = 'SP'                                          │ │
│  │  ORDER BY similarity(cidade, 'São Paulo') DESC           │ │
│  │  LIMIT 1                                                  │ │
│  │                                                            │ │
│  │  Resultado: ID 3550308 (São Paulo/SP) - 100% match       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  GRAVAÇÃO CONCOMITANTE #2                                 │ │
│  │  UPDATE fato_entidade_contexto SET                        │ │
│  │    geografiaId = 3550308                                  │ │
│  │  WHERE entidadeId = {entidadeId}                          │ │
│  │                                                            │ │
│  │  ✅ COMMIT (2-3ms)                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  FASE 3: IDENTIFICAR MERCADO (P2, temp 0.9, GPT-4o)          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  CACHE CHECK (Redis)                                      │ │
│  │  Key: "mercado:hash:{hash}"                               │ │
│  │  Hash = MD5("Sistema de gestão empresarial|Tecnologia")  │ │
│  │                                                            │ │
│  │  ❌ Cache MISS → Chamar LLM                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LLM Call (GPT-4o, temp 0.9)                             │ │
│  │  Tokens: 1.000 in + 800 out = 1.800                      │ │
│  │  Custo: $0.11                                             │ │
│  │  Tempo: ~3-4s                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Output (JSON):                                           │ │
│  │  {                                                         │ │
│  │    "nome": "Software de Gestão Empresarial (ERP)",        │ │
│  │    "categoria": "Tecnologia",                             │ │
│  │    "segmentacao": "B2B",                                  │ │
│  │    "tamanhoMercado": "R$ 15 bi/ano, 500 mil empresas",   │ │
│  │    "crescimentoAnual": "12% ao ano (2023-2028)",          │ │
│  │    "tendencias": ["Cloud", "IA", "Mobile"],               │ │
│  │    "principaisPlayers": ["TOTVS", "SAP", "Sankhya", ...]  │ │
│  │  }                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  GRAVAÇÃO CONCOMITANTE #3                                 │ │
│  │  INSERT INTO dim_mercado (...) VALUES (...)               │ │
│  │  RETURNING id                                             │ │
│  │                                                            │ │
│  │  mercadoId = 42                                           │ │
│  │  ✅ COMMIT (5-10ms)                                       │ │
│  │                                                            │ │
│  │  CACHE SET (Redis, TTL 7 dias)                            │ │
│  │  Key: "mercado:hash:{hash}" → mercadoId: 42               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  GRAVAÇÃO CONCOMITANTE #4                                 │ │
│  │  UPDATE fato_entidade_contexto SET                        │ │
│  │    mercadoId = 42                                         │ │
│  │  WHERE entidadeId = {entidadeId}                          │ │
│  │                                                            │ │
│  │  ✅ COMMIT (2-3ms)                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  FASE 4: PRODUTOS (P3, temp 0.9, GPT-4o)                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LLM Call (GPT-4o, temp 0.9)                             │ │
│  │  Tokens: 1.200 in + 600 out = 1.800                      │ │
│  │  Custo: $0.11                                             │ │
│  │  Tempo: ~3-4s                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Output (JSON): EXATAMENTE 3 produtos                     │ │
│  │  [                                                         │ │
│  │    {                                                       │ │
│  │      "nome": "ERP Cloud",                                 │ │
│  │      "descricao": "Sistema de gestão na nuvem...",        │ │
│  │      "categoria": "Software"                              │ │
│  │    },                                                      │ │
│  │    { ... produto 2 ... },                                 │ │
│  │    { ... produto 3 ... }                                  │ │
│  │  ]                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LOOP: Para cada produto (3x)                             │ │
│  │                                                            │ │
│  │  1. Gerar hash único                                      │ │
│  │  2. INSERT INTO dim_produto (...) VALUES (...)            │ │
│  │     RETURNING id → produtoId                              │ │
│  │  3. INSERT INTO fato_entidade_produto (...)               │ │
│  │     VALUES (contextoId, produtoId, ...)                   │ │
│  │                                                            │ │
│  │  ✅ COMMIT (15-20ms total para 3 produtos)                │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  FASE 5: CONCORRENTES (P4, temp 1.0, GPT-4o)                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LLM Call (GPT-4o, temp 1.0)                             │ │
│  │  Tokens: 2.000 in + 1.500 out = 3.500                    │ │
│  │  Custo: $0.21                                             │ │
│  │  Tempo: ~5-7s                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Output (JSON): EXATAMENTE 5 concorrentes                 │ │
│  │  [                                                         │ │
│  │    {                                                       │ │
│  │      "nome": "Concorrente A",                             │ │
│  │      "cidade": "Rio de Janeiro",                          │ │
│  │      "uf": "RJ",                                          │ │
│  │      "cnpj": null,                                        │ │
│  │      "site": "https://concorrentea.com.br",               │ │
│  │      "porte": "Grande",                                   │ │
│  │      "produtoPrincipal": "ERP para grandes empresas",     │ │
│  │      "nivelCompeticao": "Direto"                          │ │
│  │    },                                                      │ │
│  │    { ... concorrente 2-5 ... }                            │ │
│  │  ]                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LOOP: Para cada concorrente (5x)                         │ │
│  │                                                            │ │
│  │  1. Gerar hash único                                      │ │
│  │  2. Verificar duplicata (hash)                            │ │
│  │  3. INSERT INTO dim_entidade (tipo='concorrente', ...)    │ │
│  │     RETURNING id → concorrenteId                          │ │
│  │  4. Fuzzy Match Geografia (cidade/uf)                     │ │
│  │  5. INSERT INTO fato_entidade_contexto (...)              │ │
│  │     VALUES (concorrenteId, projeto, pesquisa, geo, ...)   │ │
│  │     RETURNING id → concorrenteContextoId                  │ │
│  │  6. INSERT INTO fato_entidade_competidor (...)            │ │
│  │     VALUES (clienteContextoId, concorrenteId, ...)        │ │
│  │                                                            │ │
│  │  ✅ COMMIT (50-70ms total para 5 concorrentes)            │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  FASE 6: LEADS (P5, temp 1.0, GPT-4o)                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LLM Call (GPT-4o, temp 1.0)                             │ │
│  │  Tokens: 2.000 in + 1.500 out = 3.500                    │ │
│  │  Custo: $0.21                                             │ │
│  │  Tempo: ~5-7s                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Output (JSON): EXATAMENTE 5 leads                        │ │
│  │  [                                                         │ │
│  │    {                                                       │ │
│  │      "nome": "Lead A",                                    │ │
│  │      "cidade": "Belo Horizonte",                          │ │
│  │      "uf": "MG",                                          │ │
│  │      "cnpj": null,                                        │ │
│  │      "site": "https://leada.com.br",                      │ │
│  │      "porte": "Média",                                    │ │
│  │      "produtoInteresse": "ERP Cloud",                     │ │
│  │      "setor": "Indústria"                                 │ │
│  │    },                                                      │ │
│  │    { ... lead 2-5 ... }                                   │ │
│  │  ]                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LOOP: Para cada lead (5x)                                │ │
│  │                                                            │ │
│  │  1. Gerar hash único                                      │ │
│  │  2. Verificar duplicata (hash)                            │ │
│  │  3. INSERT INTO dim_entidade (tipo='lead', ...)           │ │
│  │     RETURNING id → leadId                                 │ │
│  │  4. Fuzzy Match Geografia (cidade/uf)                     │ │
│  │  5. INSERT INTO fato_entidade_contexto (...)              │ │
│  │     VALUES (leadId, projeto, pesquisa, geo, ...)          │ │
│  │                                                            │ │
│  │  ✅ COMMIT (50-70ms total para 5 leads)                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  FASE 7: VALIDAÇÃO FINAL (P6, temp 0.3, GPT-4o-mini)         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  LLM Call (GPT-4o-mini, temp 0.3)                        │ │
│  │  Tokens: 500 in + 200 out = 700                           │ │
│  │  Custo: $0.01                                             │ │
│  │  Tempo: ~1-2s                                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Calcular Score de Qualidade (0-100)                     │ │
│  │                                                            │ │
│  │  Campos Obrigatórios (70%):                               │ │
│  │  - nome ✅, cidade ✅, uf ✅, porte ✅, setor ✅           │ │
│  │  - produtoPrincipal ✅, segmentacaoB2bB2c ✅              │ │
│  │  - mercadoId ✅, geografiaId ✅                            │ │
│  │  Score Obrigatórios: 9/9 = 100% → 70 pontos              │ │
│  │                                                            │ │
│  │  Campos Opcionais (30%):                                  │ │
│  │  - cnpj ✅, email ✅, telefone ✅, site ✅                 │ │
│  │  Score Opcionais: 4/4 = 100% → 30 pontos                 │ │
│  │                                                            │ │
│  │  SCORE TOTAL: 70 + 30 = 100 pontos                        │ │
│  │  CLASSIFICAÇÃO: "excelente"                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  GRAVAÇÃO CONCOMITANTE #5 (FINAL)                         │ │
│  │  UPDATE fato_entidade_contexto SET                        │ │
│  │    qualidadeScore = 100,                                  │ │
│  │    qualidadeClassificacao = 'excelente'                   │ │
│  │  WHERE entidadeId = {entidadeId}                          │ │
│  │                                                            │ │
│  │  ✅ COMMIT (2-3ms)                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  ATUALIZAR ESTATÍSTICAS DA PESQUISA                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  UPDATE dim_pesquisa SET                                  │ │
│  │    entidadesEnriquecidas = entidadesEnriquecidas + 1,     │ │
│  │    qualidadeMedia = AVG(qualidadeScore)                   │ │
│  │  WHERE id = {pesquisaId}                                  │ │
│  │                                                            │ │
│  │  ✅ COMMIT (2-3ms)                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│  JOB CONCLUÍDO ✅                                             │
│                                                                │
│  Tempo Total: ~20-30s                                          │
│  Custo Total: $0.73                                            │
│  Registros Criados: 29                                         │
│  Campos Preenchidos: 212                                       │
│  Score Final: 100/100                                          │
└────────────────────────────────────────────────────────────────┘
```

---

### **3.2. Vantagens da Gravação Concomitante**

**1. Resiliência:**
- Se P4 falha, P1-P3 já estão gravados
- Retry apenas da fase que falhou
- Sem perda de dados

**2. Visibilidade:**
- Usuário vê progresso em tempo real
- Dados parciais já aparecem na UI
- Transparência total

**3. Performance:**
- Gravação incremental (não espera o fim)
- Commits pequenos e rápidos (2-70ms)
- Sem lock de tabela

**4. Auditoria:**
- Cada fase tem timestamp
- Rastreabilidade completa
- Origem de cada campo

---

### **3.3. Transações e Rollback**

**Estratégia:** Commits incrementais (não transação única)

**Por quê?**
- ✅ Evita lock de tabela (100 clientes simultâneos)
- ✅ Permite retry granular
- ✅ Visibilidade em tempo real

**Desvantagem:**
- ⚠️ Se P6 rejeita, dados parciais ficam no banco

**Solução:**
- Marcar contexto como "enriquecimento_falhou"
- Permitir re-enriquecimento manual
- Não deletar dados parciais (podem ser úteis)

---

## 🎯 PARTE 4: PROMPTS TÉCNICOS COMPLETOS

### **PROMPT 1: ENRIQUECER CLIENTE**

**Modelo:** GPT-4o  
**Temperatura:** 0.8  
**Max Tokens:** 1.500

```
Você é um analista de dados B2B especializado em empresas brasileiras.

EMPRESA: {nome}
STATUS: {status}

TAREFA: Enriquecer dados da empresa com informações REAIS e VERIFICÁVEIS do Brasil.

CAMPOS OBRIGATÓRIOS (retorne sempre):
1. cidade: Cidade completa (ex: "São Paulo", "Rio de Janeiro")
2. uf: Estado 2 letras MAIÚSCULAS (ex: "SP", "RJ")
3. porte: Micro | Pequena | Média | Grande
4. setor: Setor específico (ex: "Tecnologia - Software", "Indústria - Alimentos")
5. produtoPrincipal: Principal produto/serviço (max 200 chars)
6. segmentacaoB2bB2c: B2B | B2C | B2B2C

CAMPOS OPCIONAIS (retorne NULL se NÃO TIVER CERTEZA):
7. nomeFantasia: Nome fantasia (se diferente da razão social)
8. cnpj: CNPJ no formato XX.XXX.XXX/XXXX-XX - NULL se não souber COM CERTEZA
9. email: Email corporativo - NULL se não souber
10. telefone: Telefone (XX) XXXXX-XXXX - NULL se não souber
11. site: Site oficial https://... - NULL se não souber
12. numFiliais: Número de filiais (integer) - NULL se não souber
13. numLojas: Número de lojas (integer) - NULL se não souber
14. numFuncionarios: Número aproximado de funcionários - NULL se não souber

REGRAS CRÍTICAS:
- Se NÃO TEM CERTEZA do CNPJ: retorne NULL (NUNCA invente)
- Se NÃO TEM CERTEZA do email/telefone/site: retorne NULL
- Cidade e UF são OBRIGATÓRIOS (use informações públicas ou inferência)
- Seja conservador e preciso
- Dados do BRASIL (não de outros países)

FORMATO DE SAÍDA (JSON válido):
{
  "nomeFantasia": "string ou null",
  "cnpj": "string ou null",
  "email": "string ou null",
  "telefone": "string ou null",
  "site": "string ou null",
  "cidade": "string",
  "uf": "string",
  "porte": "string",
  "setor": "string",
  "produtoPrincipal": "string",
  "segmentacaoB2bB2c": "string",
  "numFiliais": number ou null,
  "numLojas": number ou null,
  "numFuncionarios": number ou null
}
```

---

### **PROMPT 2: IDENTIFICAR MERCADO**

**Modelo:** GPT-4o  
**Temperatura:** 0.9  
**Max Tokens:** 2.000

```
Você é um analista de mercado especializado em inteligência competitiva do Brasil.

EMPRESA: {nome}
PRODUTO PRINCIPAL: {produtoPrincipal}
SETOR: {setor}
SEGMENTAÇÃO: {segmentacaoB2bB2c}

TAREFA: Identificar o MERCADO PRINCIPAL e enriquecê-lo com dados REAIS do Brasil.

CAMPOS OBRIGATÓRIOS:
1. nome: Nome específico do mercado (ex: "Software de Gestão Empresarial (ERP)")
2. categoria: Indústria | Comércio | Serviços | Tecnologia
3. segmentacao: B2B | B2C | B2B2C
4. tamanhoMercado: Tamanho no Brasil em R$ e número de empresas (ex: "R$ 15 bi/ano, 500 mil empresas")
5. crescimentoAnual: Taxa de crescimento (ex: "12% ao ano (2023-2028)")
6. tendencias: Array com 3-5 tendências atuais do mercado brasileiro (max 500 chars total)
7. principaisPlayers: Array com 5-10 empresas brasileiras líderes do mercado

REGRAS CRÍTICAS:
- Seja ESPECÍFICO sobre o mercado brasileiro
- Use dados REAIS e ATUALIZADOS (2024-2025)
- Tendências devem ser CONCRETAS (não genéricas)
- Players devem ser empresas REAIS e BRASILEIRAS
- Tamanho de mercado deve ter FONTE (estimativa fundamentada)

FORMATO DE SAÍDA (JSON válido):
{
  "nome": "string",
  "categoria": "string",
  "segmentacao": "string",
  "tamanhoMercado": "string",
  "crescimentoAnual": "string",
  "tendencias": ["string", "string", "string"],
  "principaisPlayers": ["string", "string", "string", "string", "string"]
}
```

---

### **PROMPT 3: PRODUTOS/SERVIÇOS**

**Modelo:** GPT-4o  
**Temperatura:** 0.9  
**Max Tokens:** 1.500

```
Você é um especialista em análise de produtos e serviços B2B.

EMPRESA: {nome}
PRODUTO PRINCIPAL: {produtoPrincipal}
MERCADO: {mercado.nome}
SITE: {site}

TAREFA: Identificar os 3 PRINCIPAIS produtos/serviços oferecidos pela empresa.

CAMPOS OBRIGATÓRIOS (para cada produto):
1. nome: Nome do produto/serviço (max 255 chars)
2. descricao: Descrição detalhada e técnica (max 500 chars)
3. categoria: Categoria (ex: "Software", "Consultoria", "Hardware")

REGRAS CRÍTICAS:
- EXATAMENTE 3 produtos (não mais, não menos)
- Produtos DIFERENTES entre si (não repetir)
- Descrições ESPECÍFICAS e TÉCNICAS (não genéricas)
- Baseado em informações REAIS da empresa
- Se site disponível, use como referência

FORMATO DE SAÍDA (JSON válido):
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

**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Max Tokens:** 2.500

```
Você é um especialista em inteligência competitiva do Brasil.

CLIENTE (NÃO PODE SER CONCORRENTE): {nome}
MERCADO: {mercado.nome}
PRODUTOS DO CLIENTE: {produtos[0].nome}, {produtos[1].nome}, {produtos[2].nome}
REGIÃO DO CLIENTE: {cidade}, {uf}

TAREFA: Identificar 5 CONCORRENTES REAIS que oferecem produtos similares.

DEFINIÇÃO DE CONCORRENTE:
- Empresa DIFERENTE do cliente: {nome}
- Oferece produtos/serviços SIMILARES
- Atua no MESMO mercado: {mercado.nome}
- Pode ser de qualquer região do Brasil

CAMPOS OBRIGATÓRIOS (para cada concorrente):
1. nome: Razão social ou nome fantasia
2. cidade: Cidade (obrigatório)
3. uf: Estado 2 letras MAIÚSCULAS (obrigatório)
4. produtoPrincipal: Principal produto/serviço similar ao cliente
5. nivelCompeticao: Direto | Indireto | Potencial

CAMPOS OPCIONAIS:
6. nomeFantasia: Nome fantasia (se diferente)
7. cnpj: XX.XXX.XXX/XXXX-XX - NULL se não souber COM CERTEZA
8. site: https://... - NULL se não souber
9. porte: Micro | Pequena | Média | Grande - NULL se não souber
10. diferencial: Diferencial competitivo (max 500 chars) - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 concorrentes
- NÃO inclua o cliente: {nome}
- NÃO invente CNPJs (use NULL se não tiver certeza)
- Empresas REAIS e DIFERENTES
- Diversifique portes e regiões
- Priorize concorrentes DIRETOS

FORMATO DE SAÍDA (JSON válido com 5 concorrentes):
{
  "concorrentes": [
    {
      "nome": "string",
      "nomeFantasia": "string ou null",
      "cidade": "string",
      "uf": "string",
      "cnpj": "string ou null",
      "site": "string ou null",
      "porte": "string ou null",
      "produtoPrincipal": "string",
      "nivelCompeticao": "string",
      "diferencial": "string ou null"
    },
    ... (mais 4 concorrentes)
  ]
}
```

---

### **PROMPT 5: LEADS**

**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Max Tokens:** 2.500

```
Você é um especialista em prospecção B2B do Brasil.

CLIENTE (FORNECEDOR): {nome}
PRODUTOS OFERECIDOS: {produtos[0].nome}, {produtos[1].nome}, {produtos[2].nome}
MERCADO: {mercado.nome}
REGIÃO: {cidade}, {uf}

CONCORRENTES (NÃO PODEM SER LEADS):
- {concorrentes[0].nome}
- {concorrentes[1].nome}
- {concorrentes[2].nome}
- {concorrentes[3].nome}
- {concorrentes[4].nome}

TAREFA: Identificar 5 LEADS REAIS (empresas que COMPRAM os produtos do cliente).

DEFINIÇÃO DE LEAD:
- Empresa que COMPRA/CONSOME os produtos do cliente
- NÃO é o próprio cliente: {nome}
- NÃO é concorrente (listados acima)
- Pode ser de qualquer região do Brasil
- Tem fit com os produtos oferecidos

CAMPOS OBRIGATÓRIOS (para cada lead):
1. nome: Razão social ou nome fantasia
2. cidade: Cidade (obrigatório)
3. uf: Estado 2 letras MAIÚSCULAS (obrigatório)
4. produtoInteresse: Qual produto do cliente compraria
5. setor: Setor de atuação do lead

CAMPOS OPCIONAIS:
6. nomeFantasia: Nome fantasia (se diferente)
7. cnpj: XX.XXX.XXX/XXXX-XX - NULL se não souber COM CERTEZA
8. site: https://... - NULL se não souber
9. porte: Micro | Pequena | Média | Grande - NULL se não souber
10. motivoFit: Por que é um bom lead (max 300 chars) - NULL se não souber

REGRAS CRÍTICAS:
- EXATAMENTE 5 leads
- NÃO inclua cliente: {nome}
- NÃO inclua concorrentes
- NÃO invente CNPJs (use NULL)
- Empresas REAIS que usariam os produtos
- Diversifique setores e portes

FORMATO DE SAÍDA (JSON válido com 5 leads):
{
  "leads": [
    {
      "nome": "string",
      "nomeFantasia": "string ou null",
      "cidade": "string",
      "uf": "string",
      "cnpj": "string ou null",
      "site": "string ou null",
      "porte": "string ou null",
      "produtoInteresse": "string",
      "setor": "string",
      "motivoFit": "string ou null"
    },
    ... (mais 4 leads)
  ]
}
```

---

### **PROMPT 6: VALIDAÇÃO**

**Modelo:** GPT-4o-mini  
**Temperatura:** 0.3  
**Max Tokens:** 500

```
Você é um validador de qualidade de dados.

DADOS ENRIQUECIDOS:
{JSON completo do cliente enriquecido}

TAREFA: Calcular score de qualidade (0-100) baseado em completude.

CAMPOS OBRIGATÓRIOS (70% do score):
- nome, cidade, uf, porte, setor, produtoPrincipal, segmentacaoB2bB2c
- mercadoId, geografiaId

CAMPOS OPCIONAIS (30% do score):
- cnpj, email, telefone, site

CÁLCULO:
scoreObrigatorios = (preenchidos / 9) * 70
scoreOpcionais = (preenchidos / 4) * 30
scoreTotal = scoreObrigatorios + scoreOpcionais

CLASSIFICAÇÃO:
- 90-100: "excelente"
- 80-89: "bom"
- 70-79: "aceitavel"
- 0-69: "ruim"

FORMATO DE SAÍDA (JSON):
{
  "qualidadeScore": number (0-100),
  "qualidadeClassificacao": "string",
  "camposObrigatoriosPreenchidos": number,
  "camposOpcionaisPreenchidos": number
}
```

---

## ⏱️ PARTE 5: MÉTRICAS E ESTIMATIVAS

### **5.1. Tempo de Processamento**

| Fase | Tempo | Acumulado |
|------|-------|-----------|
| P1: Cliente | 2-3s | 2-3s |
| Geo: Fuzzy Match | 0.1s | 2-3s |
| P2: Mercado | 3-4s | 5-7s |
| P3: Produtos | 3-4s | 8-11s |
| P4: Concorrentes | 5-7s | 13-18s |
| P5: Leads | 5-7s | 18-25s |
| P6: Validação | 1-2s | 19-27s |
| Gravações | 0.2s | 19-27s |
| **TOTAL** | **19-27s** | - |

**Para 100 clientes (5 workers):**
- Sequencial: 1.900-2.700s = 32-45min
- Com overhead: **40-60min**

**Para 1.000 clientes (5 workers):**
- Sequencial: 19.000-27.000s = 5.3-7.5h
- Com overhead: **6-9h**

---

### **5.2. Custo de Processamento**

| Fase | Modelo | Tokens | Custo/Cliente |
|------|--------|--------|---------------|
| P1 | GPT-4o | 1.300 | $0.08 |
| P2 | GPT-4o | 1.800 | $0.11 |
| P3 | GPT-4o | 1.800 | $0.11 |
| P4 | GPT-4o | 3.500 | $0.21 |
| P5 | GPT-4o | 3.500 | $0.21 |
| P6 | GPT-4o-mini | 700 | $0.01 |
| **TOTAL** | - | **12.600** | **$0.73** |

**Para 100 clientes:** $73  
**Para 1.000 clientes:** $730  
**Para 10.000 clientes:** $7.300

---

### **5.3. Economia com Cache**

**Mercados repetidos:** ~30-50% (estimativa)

**Exemplo:**
- 100 clientes → ~40 mercados únicos
- Sem cache: 100 chamadas P2 = $11
- Com cache: 40 chamadas P2 = $4.40
- **Economia: $6.60 (60%)**

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Validar conceituação técnica
2. ⏳ Criar especificação de implementação
3. ⏳ Implementar infraestrutura (BullMQ + Redis)
4. ⏳ Implementar workers e prompts
5. ⏳ Implementar UI e monitoramento
6. ⏳ Testes com dados reais
7. ⏳ Deploy e validação

---

**Aguardo sua validação!** 🚀
