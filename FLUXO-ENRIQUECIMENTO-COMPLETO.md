# 📋 MAPEAMENTO COMPLETO DO FLUXO DE ENRIQUECIMENTO

**Gestor PAV - Sistema de Enriquecimento de Dados de Mercado**

Data: 21/11/2025  
Versão: 1.0

---

## 🎯 VISÃO GERAL

O sistema de enriquecimento é responsável por:

1. **Receber** dados básicos de clientes (nome, CNPJ)
2. **Enriquecer** com dados externos (APIs, LLM)
3. **Identificar** mercados, produtos, concorrentes e leads
4. **Armazenar** no banco de dados
5. **Apresentar** em múltiplos dashboards

---

## 📁 ARQUITETURA DE ARQUIVOS

### 1. BACKEND - Núcleo do Enriquecimento

#### 1.1 Arquivos Principais de Processamento

| Arquivo                                       | Responsabilidade                                              | Status   |
| --------------------------------------------- | ------------------------------------------------------------- | -------- |
| `server/enrichmentOptimized.ts`               | ⭐ **PRINCIPAL** - Enriquecimento otimizado com 1 chamada LLM | ✅ Ativo |
| `server/enrichmentFlow.ts`                    | Fluxo completo de enriquecimento (wizard → banco)             | ✅ Ativo |
| `server/enrichmentBatchProcessor.ts`          | Processamento em lote com controle de pausa/retomada          | ✅ Ativo |
| `server/enrichmentBatchProcessorOptimized.ts` | Versão otimizada do batch processor                           | ✅ Ativo |
| `server/enrichmentJobManager.ts`              | Gerenciamento de jobs de enriquecimento                       | ✅ Ativo |
| `server/enrichmentBatch.ts`                   | Funções auxiliares de batch                                   | ✅ Ativo |

#### 1.2 Arquivos de Controle e Monitoramento

| Arquivo                           | Responsabilidade                     | Status   |
| --------------------------------- | ------------------------------------ | -------- |
| `server/enrichmentControl.ts`     | Controle de pausa/retomada global    | ✅ Ativo |
| `server/enrichmentMonitor.ts`     | Monitoramento de progresso e alertas | ✅ Ativo |
| `server/_core/enrichmentCache.ts` | Cache de dados enriquecidos (CNPJ)   | ✅ Ativo |

#### 1.3 Arquivos de Integração com APIs

| Arquivo                                  | Responsabilidade                         | Status    |
| ---------------------------------------- | ---------------------------------------- | --------- |
| `server/integrations/openaiOptimized.ts` | Integração OpenAI com schema estruturado | ✅ Ativo  |
| `server/geminiEnrichment.ts`             | Integração Gemini (alternativa)          | ⚠️ Legado |
| `server/geminiEnrichmentFull.ts`         | Integração Gemini completa               | ⚠️ Legado |

#### 1.4 Arquivos de Banco de Dados

| Arquivo             | Função                         | Tabelas Relacionadas                                                                                    |
| ------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `server/db.ts`      | Funções CRUD de enriquecimento | `enrichment_runs`, `enrichment_configs`, `enrichment_jobs`, `scheduled_enrichments`, `enrichment_cache` |
| `drizzle/schema.ts` | Schema das tabelas             | Todas as tabelas de enriquecimento                                                                      |

#### 1.5 Routers tRPC

| Router                | Endpoints                                                             | Arquivo                          |
| --------------------- | --------------------------------------------------------------------- | -------------------------------- |
| `enrichment`          | `progress`, `history`, `pause`, `resume`, `status`                    | `server/routers.ts` (linha 1383) |
| `enrichmentOptimized` | `enrichOne`, `enrichMultiple`, `enrichBatch`, `createJob`, `startJob` | `server/routers.ts` (linha 1966) |
| `enrichmentConfig`    | `get`, `save`, `testKeys`                                             | `server/routers.ts` (linha 2199) |

---

### 2. FRONTEND - Interface de Usuário

#### 2.1 Páginas Principais

| Página                    | Rota                    | Responsabilidade                   |
| ------------------------- | ----------------------- | ---------------------------------- |
| `ResearchWizard.tsx`      | `/wizard`               | Criação de nova pesquisa (4 steps) |
| `EnrichmentProgress.tsx`  | `/enrichment-progress`  | Monitoramento em tempo real        |
| `EnrichmentConfig.tsx`    | `/enrichment-config`    | Configuração de APIs               |
| `EnrichmentScheduler.tsx` | `/enrichment-scheduler` | Agendamento de enriquecimentos     |

#### 2.2 Dashboards de Visualização

| Dashboard                      | Rota                  | Dados Exibidos                             |
| ------------------------------ | --------------------- | ------------------------------------------ |
| `Home.tsx`                     | `/`                   | Visão geral de todos os projetos           |
| `CascadeView.tsx`              | `/cascade`            | Mercados → Clientes → Concorrentes → Leads |
| `MercadoDetalhes.tsx`          | `/mercado/:id`        | Detalhes de um mercado específico          |
| `ClienteDetalhes.tsx`          | `/cliente/:id`        | Detalhes de um cliente específico          |
| `ConcorrenteDetalhes.tsx`      | `/concorrente/:id`    | Detalhes de um concorrente                 |
| `LeadDetalhes.tsx`             | `/lead/:id`           | Detalhes de um lead                        |
| `TendenciasDashboard.tsx`      | `/tendencias`         | Análise de tendências de qualidade         |
| `ProjectActivityDashboard.tsx` | `/projetos/atividade` | Atividade de projetos                      |

#### 2.3 Componentes de UI

| Componente                   | Função                                     |
| ---------------------------- | ------------------------------------------ |
| `EnrichmentProgressCard.tsx` | Card de progresso individual               |
| `EnrichmentStatusBadge.tsx`  | Badge de status (running/paused/completed) |
| `QuickPesquisaSelector.tsx`  | Seletor rápido de pesquisa                 |
| `PesquisaSelector.tsx`       | Seletor completo de pesquisa               |
| `ProjectSelector.tsx`        | Seletor de projeto                         |

---

## 🔄 FLUXO COMPLETO DE ENRIQUECIMENTO

### FASE 1: ENTRADA DE DADOS (Frontend)

```
┌─────────────────────────────────────────────────────────────┐
│ ResearchWizard.tsx (/wizard)                                │
├─────────────────────────────────────────────────────────────┤
│ Step 1: Seleção de Projeto                                  │
│   - Listar projetos disponíveis                             │
│   - Permitir criar novo projeto inline                      │
│   - Validar projeto não hibernado                           │
│                                                              │
│ Step 2: Configuração de Parâmetros                          │
│   - Nome da pesquisa                                        │
│   - Descrição                                               │
│   - Configurações de enriquecimento                         │
│                                                              │
│ Step 3: Escolha de Método                                   │
│   - Upload de arquivo (CSV/Excel)                           │
│   - Entrada manual                                          │
│   - Importação de pesquisa anterior                         │
│                                                              │
│ Step 4: Inserção de Dados                                   │
│   - Colar lista de clientes (nome, CNPJ)                    │
│   - Validar formato                                         │
│   - Preview dos dados                                       │
│                                                              │
│ ✅ Botão "Iniciar Enriquecimento"                           │
└─────────────────────────────────────────────────────────────┘
         │
         │ trpc.enrichment.execute.mutate()
         ▼
```

### FASE 2: PROCESSAMENTO BACKEND

```
┌─────────────────────────────────────────────────────────────┐
│ server/routers.ts → enrichment.execute                      │
└─────────────────────────────────────────────────────────────┘
         │
         │ executeEnrichmentFlow(input, onProgress)
         ▼
┌─────────────────────────────────────────────────────────────┐
│ server/enrichmentFlow.ts                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Validar input                                            │
│ 2. Criar projeto (se novo)                                  │
│ 3. Criar pesquisa no banco                                  │
│ 4. Criar enrichment_run (tracking)                          │
│ 5. Iniciar monitoramento de progresso                       │
│ 6. Processar clientes em lote                               │
└─────────────────────────────────────────────────────────────┘
         │
         │ Para cada cliente
         ▼
┌─────────────────────────────────────────────────────────────┐
│ server/enrichmentOptimized.ts                               │
│ enrichClienteOptimized(clienteId, projectId)                │
├─────────────────────────────────────────────────────────────┤
│ 1. Buscar dados básicos do cliente                          │
│ 2. Verificar cache (enrichment_cache)                       │
│ 3. Chamar generateAllDataOptimized() [1 CHAMADA LLM]        │
│ 4. Processar resposta estruturada                           │
│ 5. Atualizar cliente no banco                               │
│ 6. Criar/associar mercados                                  │
│ 7. Criar produtos                                           │
│ 8. Criar concorrentes                                       │
│ 9. Criar leads                                              │
│ 10. Salvar no cache                                         │
│ 11. Retornar resultado                                      │
└─────────────────────────────────────────────────────────────┘
         │
         │ generateAllDataOptimized()
         ▼
┌─────────────────────────────────────────────────────────────┐
│ server/integrations/openaiOptimized.ts                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Montar prompt estruturado                                │
│ 2. Definir JSON Schema (response_format)                    │
│ 3. Chamar OpenAI API (gpt-4o)                               │
│ 4. Parsear resposta JSON                                    │
│ 5. Retornar dados estruturados:                             │
│    - clienteEnriquecido (site, email, telefone, etc)        │
│    - mercados[] (nome, descrição, tamanho)                  │
│    - produtos[] (nome, categoria, preço)                    │
│    - concorrentes[] (nome, site, porte)                     │
│    - leads[] (nome, site, tipo)                             │
└─────────────────────────────────────────────────────────────┘
```

### FASE 3: ARMAZENAMENTO NO BANCO

```
┌─────────────────────────────────────────────────────────────┐
│ server/db.ts - Funções de Persistência                      │
├─────────────────────────────────────────────────────────────┤
│ 1. upsertCliente() → tabela `clientes`                      │
│ 2. upsertMercado() → tabela `mercados`                      │
│ 3. associateClienteToMercado() → tabela `mercado_clientes`  │
│ 4. createProduto() → tabela `produtos`                      │
│ 5. createConcorrente() → tabela `concorrentes`              │
│ 6. createLead() → tabela `leads`                            │
│ 7. updateEnrichmentRun() → tabela `enrichment_runs`         │
│ 8. setCachedEnrichment() → tabela `enrichment_cache`        │
│ 9. trackClienteChanges() → tabela `cliente_history`         │
└─────────────────────────────────────────────────────────────┘
```

### FASE 4: MONITORAMENTO EM TEMPO REAL

```
┌─────────────────────────────────────────────────────────────┐
│ server/enrichmentMonitor.ts                                 │
├─────────────────────────────────────────────────────────────┤
│ 1. startProgressMonitoring(projectId, pesquisaId)           │
│ 2. Polling a cada 5 segundos                                │
│ 3. Calcular progresso:                                      │
│    - totalClientes                                          │
│    - clientesEnriquecidos                                   │
│    - percentualConcluido                                    │
│    - tempoDecorrido                                         │
│    - tempoEstimado                                          │
│ 4. Verificar alertas (checkAlerts)                          │
│ 5. Enviar notificações via WebSocket                        │
└─────────────────────────────────────────────────────────────┘
         │
         │ WebSocket broadcast
         ▼
┌─────────────────────────────────────────────────────────────┐
│ server/websocket.ts                                         │
├─────────────────────────────────────────────────────────────┤
│ - sendEnrichmentProgress(userId, data)                      │
│ - sendEnrichmentComplete(userId, data)                      │
│ - broadcast(notification)                                   │
└─────────────────────────────────────────────────────────────┘
```

### FASE 5: VISUALIZAÇÃO NO FRONTEND

```
┌─────────────────────────────────────────────────────────────┐
│ EnrichmentProgress.tsx (/enrichment-progress)               │
├─────────────────────────────────────────────────────────────┤
│ 1. useQuery com refetchInterval: 5000 (polling)             │
│ 2. Exibir barra de progresso                                │
│ 3. Exibir estatísticas em tempo real                        │
│ 4. Botões de controle (Pausar/Retomar/Cancelar)             │
│ 5. Logs de atividade                                        │
│ 6. Redirecionamento automático ao concluir                  │
└─────────────────────────────────────────────────────────────┘
         │
         │ Ao concluir, redireciona para:
         ▼
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARDS DE VISUALIZAÇÃO                                  │
├─────────────────────────────────────────────────────────────┤
│ 1. Home.tsx (/)                                             │
│    - Cards de projetos                                      │
│    - Estatísticas gerais                                    │
│    - Últimas pesquisas                                      │
│                                                              │
│ 2. CascadeView.tsx (/cascade)                               │
│    - Accordion de mercados                                  │
│    - Tabs: Clientes | Concorrentes | Leads                  │
│    - Busca e filtros                                        │
│    - Ações em lote                                          │
│                                                              │
│ 3. MercadoDetalhes.tsx (/mercado/:id)                       │
│    - Informações do mercado                                 │
│    - Lista de clientes                                      │
│    - Lista de concorrentes                                  │
│    - Lista de leads                                         │
│    - Gráficos de análise                                    │
│                                                              │
│ 4. ClienteDetalhes.tsx (/cliente/:id)                       │
│    - Dados enriquecidos do cliente                          │
│    - Mercados associados                                    │
│    - Produtos                                               │
│    - Histórico de mudanças                                  │
│    - Mapa de localização (se geocoded)                      │
│                                                              │
│ 5. TendenciasDashboard.tsx (/tendencias)                    │
│    - Gráficos de evolução de qualidade                      │
│    - Alertas de queda de qualidade                          │
│    - Comparação entre mercados                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabelas Principais de Enriquecimento

```sql
-- Tracking de execuções
enrichment_runs (
  id, projectId, status, totalClientes,
  clientesEnriquecidos, startedAt, completedAt,
  durationSeconds, errorMessage
)

-- Configurações de APIs por projeto
enrichment_configs (
  id, projectId, openaiApiKey, receitawsApiKey,
  serpApiKey, useGemini, createdAt, updatedAt
)

-- Jobs de enriquecimento
enrichment_jobs (
  id, projectId, status, totalClientes,
  processedClientes, createdAt, startedAt,
  completedAt, errorMessage
)

-- Agendamentos
scheduled_enrichments (
  id, projectId, scheduledAt, status,
  clientes, createdAt
)

-- Cache de dados enriquecidos
enrichment_cache (
  id, cnpj, data, createdAt, expiresAt
)
```

### Tabelas de Dados Enriquecidos

```sql
-- Clientes enriquecidos
clientes (
  id, nome, cnpj, siteOficial, produtoPrincipal,
  cidade, uf, regiao, porte, email, telefone,
  linkedin, instagram, latitude, longitude,
  geocodedAt, qualidadeScore, status, tags,
  observacoes, pesquisaId, createdAt, updatedAt
)

-- Mercados identificados
mercados (
  id, nome, descricao, tamanhoEstimado,
  tendencia, nivelConcorrencia, barreirasEntrada,
  oportunidades, projectId, createdAt
)

-- Produtos
produtos (
  id, nome, categoria, descricao, precoEstimado,
  unidade, aplicacoes, clienteId, mercadoId,
  pesquisaId, createdAt
)

-- Concorrentes
concorrentes (
  id, nome, cnpj, site, produto, porte,
  faturamentoEstimado, diferenciais, pontosFracos,
  mercadoId, pesquisaId, qualidadeScore,
  createdAt
)

-- Leads
leads (
  id, nome, cnpj, site, tipo, porte, setor,
  localizacao, potencial, mercadoId, pesquisaId,
  qualidadeScore, createdAt
)
```

---

## 🔌 INTEGRAÇÕES EXTERNAS

### 1. OpenAI API (Principal)

**Arquivo**: `server/integrations/openaiOptimized.ts`

**Função**: `generateAllDataOptimized(cliente)`

**Modelo**: `gpt-4o`

**Entrada**:

```json
{
  "nome": "Empresa XYZ",
  "cnpj": "12345678000190",
  "site": "https://exemplo.com"
}
```

**Saída** (JSON Schema estruturado):

```json
{
  "clienteEnriquecido": {
    "siteOficial": "https://...",
    "produtoPrincipal": "...",
    "cidade": "...",
    "uf": "...",
    "regiao": "...",
    "porte": "...",
    "email": "...",
    "telefone": "...",
    "linkedin": "...",
    "instagram": "...",
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "mercados": [{ "nome": "...", "descricao": "...", "tamanhoEstimado": "..." }],
  "produtos": [{ "nome": "...", "categoria": "...", "precoEstimado": "..." }],
  "concorrentes": [{ "nome": "...", "site": "...", "porte": "..." }],
  "leads": [{ "nome": "...", "site": "...", "tipo": "..." }]
}
```

### 2. ReceitaWS API (Opcional)

**Uso**: Buscar dados de CNPJ (razão social, endereço, atividade)

**Status**: Implementado mas não obrigatório

### 3. SerpAPI (Opcional)

**Uso**: Buscar concorrentes e leads via Google Search

**Status**: Implementado mas não obrigatório

---

## 🎛️ CONTROLES DE ENRIQUECIMENTO

### Controle de Pausa/Retomada

**Arquivo**: `server/enrichmentControl.ts`

**Funções**:

- `pauseEnrichment(projectId, runId)` - Pausa processamento
- `resumeEnrichment(projectId, runId)` - Retoma processamento
- `getEnrichmentState()` - Estado atual (isPaused)
- `resetEnrichmentState()` - Reseta estado

**Estado Global** (em memória):

```typescript
{
  isPaused: boolean,
  pausedAt: Date | null
}
```

### Batch Processor

**Arquivo**: `server/enrichmentBatchProcessor.ts`

**Funções**:

- `startBatchEnrichment(options)` - Inicia processamento em lote
- `pauseBatchEnrichment()` - Pausa batch
- `resumeBatchEnrichment(options)` - Retoma batch
- `cancelBatchEnrichment()` - Cancela batch
- `getBatchStatus()` - Status atual do batch

**Job State**:

```typescript
{
  pesquisaId: number,
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled',
  totalClientes: number,
  processedClientes: number,
  successCount: number,
  errorCount: number,
  currentBatch: number,
  totalBatches: number,
  startedAt: Date | null,
  pausedAt: Date | null
}
```

---

## 📊 QUERIES tRPC DISPONÍVEIS

### Router: `enrichment`

| Endpoint   | Tipo     | Parâmetros             | Retorno                |
| ---------- | -------- | ---------------------- | ---------------------- |
| `progress` | query    | `{ projectId }`        | Progresso atual        |
| `history`  | query    | `{ projectId, limit }` | Histórico de runs      |
| `pause`    | mutation | `{ projectId, runId }` | `{ success, message }` |
| `resume`   | mutation | `{ projectId, runId }` | `{ success, message }` |
| `status`   | query    | `{ projectId }`        | Status detalhado       |
| `execute`  | mutation | `{ clientes[], ... }`  | Inicia enriquecimento  |

### Router: `enrichmentOptimized`

| Endpoint         | Tipo     | Parâmetros                    | Retorno                     |
| ---------------- | -------- | ----------------------------- | --------------------------- |
| `enrichOne`      | mutation | `{ clienteId, projectId }`    | Resultado do enriquecimento |
| `enrichMultiple` | mutation | `{ clienteIds[], projectId }` | Array de resultados         |
| `enrichBatch`    | mutation | `{ projectId, batchSize }`    | Estatísticas do batch       |
| `createJob`      | mutation | `{ projectId, batchSize }`    | `{ jobId }`                 |
| `startJob`       | mutation | `{ jobId }`                   | `{ success }`               |
| `pauseJob`       | mutation | `{ jobId }`                   | `{ success }`               |
| `cancelJob`      | mutation | `{ jobId }`                   | `{ success }`               |
| `getJobProgress` | query    | `{ jobId }`                   | Progresso do job            |
| `listJobs`       | query    | `{ projectId }`               | Lista de jobs               |

### Router: `enrichmentConfig`

| Endpoint   | Tipo     | Parâmetros                         | Retorno              |
| ---------- | -------- | ---------------------------------- | -------------------- |
| `get`      | query    | `{ projectId }`                    | Configuração atual   |
| `save`     | mutation | `{ projectId, openaiApiKey, ... }` | Configuração salva   |
| `testKeys` | mutation | `{ openaiApiKey, ... }`            | Validação das chaves |

---

## 🧪 TESTES EXISTENTES

### Testes Unitários

| Arquivo                                      | Cobertura               |
| -------------------------------------------- | ----------------------- |
| `server/__tests__/enrichmentConfig.test.ts`  | Configuração de APIs    |
| `server/__tests__/enrichmentFlow.test.ts`    | Fluxo de enriquecimento |
| `server/__tests__/geolocalizacao-ia.test.ts` | Geolocalização por IA   |
| `server/__tests__/fase65.test.ts`            | Página de progresso     |
| `server/__tests__/fase82-api-alerts.test.ts` | Sistema de alertas      |

### Testes E2E

| Arquivo                                | Cobertura                      |
| -------------------------------------- | ------------------------------ |
| `e2e/enrichment-flow.spec.ts`          | Fluxo básico de enriquecimento |
| `e2e/complete-enrichment-flow.spec.ts` | Fluxo completo end-to-end      |

---

## 🚨 PONTOS DE ATENÇÃO

### 1. Cache de Enriquecimento

- **Localização**: `enrichment_cache` table
- **Chave**: CNPJ (14 dígitos)
- **Expiração**: 30 dias (configurável)
- **Problema potencial**: Cache pode retornar dados desatualizados

### 2. Estado em Memória

- **Arquivos**: `enrichmentControl.ts`, `enrichmentBatchProcessor.ts`
- **Problema**: Estado perdido ao reiniciar servidor
- **Solução**: Verificar `enrichment_runs` no banco ao iniciar

### 3. Processamento Assíncrono

- **Problema**: Frontend pode não receber atualizações em tempo real
- **Solução**: Polling a cada 5 segundos + WebSocket

### 4. Tratamento de Erros

- **Problema**: Erros em um cliente podem travar todo o batch
- **Solução**: Try-catch individual + retry logic

### 5. Rate Limiting de APIs

- **OpenAI**: 10,000 requests/min (tier 2)
- **ReceitaWS**: 3 requests/min (free tier)
- **SerpAPI**: 100 searches/month (free tier)

---

## 📈 MÉTRICAS DE PERFORMANCE

### Tempo Médio de Enriquecimento

| Operação             | Tempo Esperado    |
| -------------------- | ----------------- |
| 1 cliente (completo) | 8-12 segundos     |
| 10 clientes (batch)  | 80-120 segundos   |
| 50 clientes (batch)  | 400-600 segundos  |
| 100 clientes (batch) | 800-1200 segundos |

### Custos Estimados (OpenAI)

| Volume        | Custo Aproximado |
| ------------- | ---------------- |
| 1 cliente     | $0.05 - $0.10    |
| 10 clientes   | $0.50 - $1.00    |
| 100 clientes  | $5.00 - $10.00   |
| 1000 clientes | $50.00 - $100.00 |

---

## 🔍 PRÓXIMOS PASSOS

1. ✅ Criar roteiro de testes completo
2. ✅ Identificar pontos de falha
3. ⏳ Executar testes end-to-end
4. ⏳ Corrigir bugs encontrados
5. ⏳ Otimizar performance
6. ⏳ Melhorar tratamento de erros
7. ⏳ Adicionar mais testes automatizados

---

**Documento criado em**: 21/11/2025  
**Última atualização**: 21/11/2025  
**Versão**: 1.0
