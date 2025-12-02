# 📋 MEU ENTENDIMENTO DO PROCESSO DE IMPORTAÇÃO E ENRIQUECIMENTO

**Data:** 01/12/2025  
**Baseado em:** Análise do código existente

---

## 🔍 O QUE EU ENTENDO ATUALMENTE

### **1. FLUXO GERAL (Como Funciona Hoje)**

```
Usuário → Upload CSV → Criar Projeto/Pesquisa → Importar Clientes → Enriquecer → Visualizar
```

---

## 📥 IMPORTAÇÃO (createWithCSV)

### **Entrada:**

- **Arquivo:** CSV com clientes
- **Campos esperados** (flexíveis):
  - `nome` ou `razao_social` (obrigatório)
  - `cnpj` (opcional)
  - `cidade` (opcional)
  - `uf` ou `estado` (opcional)
  - `setor` ou `segmento` (opcional)
  - `telefone` ou `phone` (opcional)
  - `email` (opcional)
  - `produto` ou `produto_principal` (opcional)

### **Processo:**

1. ✅ Criar registro em `pesquisas` (tabela antiga)
2. ✅ Parsear CSV (primeira linha = headers)
3. ✅ Mapear colunas (flexível: aceita variações de nomes)
4. ✅ Inserir registros em `clientes` (tabela antiga)
5. ✅ Atualizar `totalClientes` na pesquisa
6. ✅ Status inicial: `'importado'`
7. ✅ `validationStatus`: `'pending'`

### **Problemas Identificados:**

- ❌ Usa tabelas antigas (`clientes`, não `fato_entidades`)
- ❌ Não valida se cidade existe em `dim_geografia`
- ❌ Não cria `mercado_id` obrigatório
- ❌ Não gera `entidade_hash` para deduplicação
- ❌ Não calcula `qualidade_score` inicial
- ❌ Campo `setor` vai para `clientes.setor` (que não deveria existir)

---

## 🔄 ENRIQUECIMENTO (Sistema V2 - 13 Etapas)

### **Gatilho:**

- Usuário clica "Enriquecer" na UI
- Chama `enrichment.start({ pesquisaId })`
- Cria `enrichmentJob` com status `'running'`
- Dispara API route `/api/enrichment/process` em background

### **Processo (13 Etapas por Cliente):**

#### **ETAPA 1: Enriquecer Cliente** (`prompt1_enriquecerCliente`)

- **Input:** nome, cnpj, produtoPrincipal, siteOficial, cidade, uf
- **Output:** dados enriquecidos do cliente
- **LLM:** OpenAI (GPT-4)

#### **ETAPA 2: Geocodificar**

- **Input:** cidade, uf
- **Output:** latitude, longitude
- **API:** Google Geocoding (via proxy)

#### **ETAPA 3: Gravar Cliente Enriquecido**

- Atualizar registro em `clientes` (tabela antiga)
- Calcular `qualidadeScore` e `qualidadeClassificacao`

#### **ETAPA 4: Identificar Mercado** (`prompt2_identificarMercado`)

- **Input:** dados do cliente
- **Output:** nome do mercado, categoria

#### **ETAPA 5: Buscar/Criar Mercado**

- Buscar em `mercados_unicos` (tabela antiga)
- Se não existir, criar novo

#### **ETAPA 6: Enriquecer Mercado** (`prompt3_enriquecerMercado`)

- **Input:** nome do mercado
- **Output:** segmentação, tamanho, tendências

#### **ETAPA 7: Vincular Cliente ↔ Mercado**

- Inserir em `clientes_mercados` (tabela antiga N:N)

#### **ETAPA 8: Identificar Produtos** (`prompt2b_identificarProdutos`)

- **Input:** dados do cliente
- **Output:** lista de produtos

#### **ETAPA 9: Gravar Produtos**

- Inserir em `produtos` (tabela antiga)
- Calcular qualidade do produto

#### **ETAPA 10: Identificar Concorrentes** (`prompt4_identificarConcorrentes`)

- **Input:** mercado, cidade, uf
- **Output:** lista de concorrentes (5 por mercado)

#### **ETAPA 11: Gravar Concorrentes**

- Inserir em `concorrentes` (tabela antiga)
- Calcular qualidade do concorrente

#### **ETAPA 12: Identificar Leads** (`prompt5_identificarLeads`)

- **Input:** mercado, cidade, uf
- **Output:** lista de leads (10 por mercado)

#### **ETAPA 13: Gravar Leads**

- Inserir em `leads` (tabela antiga)
- Calcular qualidade do lead

---

## 🎯 CARACTERÍSTICAS DO SISTEMA ATUAL

### **✅ Pontos Fortes:**

1. **Modular:** Prompts separados por função
2. **Assíncrono:** Processamento em background
3. **Pausável:** Pode pausar/retomar enriquecimento
4. **Qualidade:** Calcula score de qualidade
5. **Geocodificação:** Adiciona coordenadas
6. **Completo:** Enriquece cliente + mercado + produtos + concorrentes + leads

### **❌ Problemas Críticos:**

#### 1. **Usa Tabelas Antigas**

- `clientes`, `leads`, `concorrentes` (separadas)
- Deveria usar `fato_entidades` (unificada)

#### 2. **Sem Deduplicação**

- Não gera `entidade_hash`
- Pode inserir duplicatas

#### 3. **Sem Validação de Geografia**

- Não verifica se cidade existe em `dim_geografia`
- Pode inserir cidades inválidas

#### 4. **Relacionamentos Inconsistentes**

- `clientes_mercados` (N:N antiga)
- Deveria usar `mercado_id` direto em `fato_entidades`

#### 5. **Sem Cache de Mercados/Produtos**

- Re-enriquece mercado/produto toda vez
- Deveria buscar por `mercado_hash`/`produto_hash` primeiro

#### 6. **Processamento Sequencial**

- Enriquece 1 cliente por vez (lento)
- Poderia fazer batch de 5-10

#### 7. **Sem Camadas de Enriquecimento**

- Faz tudo de uma vez (13 etapas)
- Deveria ter camadas: básico → mercado → produtos → concorrentes

#### 8. **Custo Alto**

- Chama LLM 6 vezes por cliente
- Poderia otimizar com cache

---

## 📊 VOLUME E PERFORMANCE

### **Estimativas Atuais:**

- **1 cliente:** ~30-60s (13 etapas)
- **100 clientes:** ~50-100min (sequencial)
- **Custo por cliente:** ~R$ 0,15-0,20 (6 chamadas LLM)

### **Gargalos:**

1. Processamento sequencial (1 por vez)
2. Muitas chamadas LLM por cliente
3. Sem cache de mercados/produtos
4. Geocodificação lenta

---

## 🤔 MINHAS DÚVIDAS PARA DISCUTIR

### **1. IMPORTAÇÃO:**

- [ ] Quais campos são **obrigatórios** no CSV?
- [ ] Como lidar com cidades que não existem em `dim_geografia`?
- [ ] Como detectar duplicatas? (CNPJ? nome+cidade?)
- [ ] Aceitar importação sem CNPJ?
- [ ] Validar formato de CNPJ/email/telefone?

### **2. ENRIQUECIMENTO:**

- [ ] Todas as 13 etapas são necessárias?
- [ ] Podemos fazer em camadas (básico → avançado)?
- [ ] Quanto tempo é aceitável por cliente?
- [ ] Qual o orçamento de custo por cliente?
- [ ] Priorizar velocidade ou qualidade?

### **3. MERCADOS:**

- [ ] Como normalizar nomes de mercados?
- [ ] Criar mercado automaticamente ou pedir aprovação?
- [ ] Re-enriquecer mercados periodicamente?

### **4. PRODUTOS:**

- [ ] Quantos produtos por cliente (máximo)?
- [ ] Como lidar com produtos genéricos ("diversos")?
- [ ] Criar produto automaticamente ou pedir aprovação?

### **5. CONCORRENTES/LEADS:**

- [ ] Realmente precisamos gerar concorrentes/leads automaticamente?
- [ ] Ou isso deveria ser opcional/sob demanda?
- [ ] Quantos por mercado?

### **6. QUALIDADE:**

- [ ] Qual o score mínimo aceitável?
- [ ] O que fazer com registros de baixa qualidade?
- [ ] Re-enriquecer automaticamente?

### **7. PERFORMANCE:**

- [ ] Processar em batch (5-10 por vez)?
- [ ] Usar LLM mais barato para tarefas simples?
- [ ] Implementar cache agressivo?

---

## 🎯 MINHA PROPOSTA INICIAL (Para Discussão)

### **FASE 1: Importação Simples**

1. Upload CSV
2. Validar campos obrigatórios (nome, cidade, uf)
3. Normalizar cidade (buscar em `dim_geografia`)
4. Gerar `entidade_hash` (deduplicação)
5. Inserir em `fato_entidades` (tipo='cliente', status='prospect')
6. **NÃO enriquecer** ainda

### **FASE 2: Enriquecimento em Camadas**

#### **Camada 1: Básico** (obrigatório, síncrono, 5-10s)

- Validar/corrigir cidade
- Geocodificar
- Calcular qualidade inicial (40-60%)

#### **Camada 2: Mercado** (importante, assíncrono, 5-10min)

- Identificar mercado (LLM)
- Buscar/criar em `dim_mercados` (cache por hash)
- Vincular `mercado_id`
- Atualizar qualidade (60-70%)

#### **Camada 3: Produtos** (importante, assíncrono, 10-20min)

- Identificar produtos (LLM)
- Buscar/criar em `dim_produtos` (cache por hash)
- Vincular via `entidade_produtos` (N:N)
- Atualizar qualidade (70-80%)

#### **Camada 4: Concorrentes** (opcional, assíncrono, 30-60min)

- Identificar concorrentes (LLM)
- Criar em `fato_entidades` (tipo='concorrente')
- Vincular via `entidade_competidores` (N:N)
- Atualizar qualidade (80-90%)

#### **Camada 5: Leads** (opcional, sob demanda)

- Identificar leads (LLM)
- Criar em `fato_entidades` (tipo='lead')
- Atualizar qualidade (90-100%)

### **Benefícios:**

- ✅ Usuário vê dados básicos rapidamente (Camada 1)
- ✅ Enriquecimento progressivo em background
- ✅ Pode parar em qualquer camada
- ✅ Cache reduz custo
- ✅ Batch processing acelera

---

## ❓ PERGUNTAS PARA VOCÊ

1. **Você concorda com essa divisão em camadas?**
2. **Quais campos do CSV são realmente obrigatórios?**
3. **Quanto tempo/custo é aceitável por cliente?**
4. **Concorrentes/Leads devem ser automáticos ou opcionais?**
5. **Como você quer lidar com duplicatas?**
6. **Qual a prioridade: velocidade ou qualidade?**

---

**Agora me diga:** O que eu entendi certo? O que está errado? O que falta?
