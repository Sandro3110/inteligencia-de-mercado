# 🚀 FASE 5 - ENRIQUECIMENTO: ESPECIFICAÇÃO FINAL

**Data:** 02 de Dezembro de 2025  
**Versão:** 4.0 FINAL - MODELO HÍBRIDO  
**Status:** ✅ APROVADO PARA IMPLEMENTAÇÃO

---

## 📋 ÍNDICE

1. [Decisões Confirmadas](#decisões-confirmadas)
2. [Fluxo Conceitual](#fluxo-conceitual)
3. [Mapeamento de Campos](#mapeamento-de-campos)
4. [Especificação dos Prompts](#especificação-dos-prompts)
5. [Arquitetura Técnica](#arquitetura-técnica)
6. [Custos e Métricas](#custos-e-métricas)
7. [Plano de Implementação](#plano-de-implementação)

---

## 🎯 DECISÕES CONFIRMADAS

### **1. Modelo Híbrido** ⭐

| Prompt | Modelo | Justificativa |
|--------|--------|---------------|
| P1: Cliente | **GPT-4o** | Análise precisa de dados cadastrais |
| P2: Mercado | **GPT-4o** | Análise complexa de mercado |
| P3: Produtos | **GPT-4o** | Identificação técnica de produtos |
| P4: Concorrentes | **GPT-4o-mini** | Listagem de empresas conhecidas |
| P5: Leads | **GPT-4o-mini** | Listagem de empresas conhecidas |
| P6: Validação | **GPT-4o-mini** | Cálculo matemático simples |

### **2. Temperatura**
- ✅ **1.0 em TODOS os prompts** (máxima qualidade e criatividade)

### **3. Concorrência**
- ✅ **5 workers simultâneos** (BullMQ)
- ✅ **1 cliente por job** (granularidade fina)

### **4. Retry**
- ✅ **3 tentativas** com backoff exponencial (1s, 2s, 4s)

### **5. Cache**
- ✅ **Redis 7 dias** para mercados, concorrentes e leads

### **6. Enriquecimento**
- ✅ **Configurável por projeto** (não automático)

---

## 🔄 FLUXO CONCEITUAL

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENTE (importação)                                       │
│  - Nome: "TOTVS S.A."                                       │
│  - Status: "Ativo"                                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  P1: ENRIQUECER CLIENTE (GPT-4o, temp 1.0)                 │
│  - CNPJ, email, telefone, site                              │
│  - Número de funcionários, filiais, lojas                   │
│  Output: 8 campos preenchidos                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  GEOLOCALIZAÇÃO (Fuzzy Match)                               │
│  - Busca cidade/UF em dim_geografia                         │
│  - Levenshtein > 80%                                         │
│  Output: geografiaId                                         │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  P2: MERCADO FORNECEDOR (GPT-4o, temp 1.0)                 │
│  - Onde o cliente VENDE seus produtos                       │
│  - Ex: "Software de Gestão Empresarial (ERP)"               │
│  - Tamanho, crescimento, tendências, players                │
│  Output: 1 mercado criado (7 campos)                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  P3: PRODUTOS (GPT-4o, temp 1.0)                           │
│  - 3 principais produtos que o cliente OFERECE              │
│  - Ex: "TOTVS Protheus", "TOTVS Fluig", "TOTVS Techfin"    │
│  Output: 3 produtos criados (9 campos)                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  P4: CONCORRENTES (GPT-4o-mini, temp 1.0)                  │
│  - 5 players do MERCADO FORNECEDOR                          │
│  - Empresas que COMPETEM com o cliente                      │
│  - Ex: SAP, Sankhya, Senior, Linx, Omie                     │
│  Output: 5 concorrentes criados (65 campos)                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  P5: LEADS (GPT-4o-mini, temp 1.0)                         │
│  - 5 players do MERCADO CONSUMIDOR                          │
│  - Empresas que COMPRAM do cliente                          │
│  - Ex: Ambev, Magazine Luiza, Localiza, MRV, Natura        │
│  Output: 5 leads criados (70 campos)                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  P6: VALIDAÇÃO (GPT-4o-mini, temp 1.0)                     │
│  - Calcular qualidadeScore (0-100)                          │
│  - Classificar: excelente|bom|aceitavel|ruim                │
│  Output: 2 campos (score + classificação)                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  RESULTADO FINAL                                            │
│  - 29 registros criados                                     │
│  - 477 campos preenchidos                                   │
│  - 159 campos via IA                                        │
│  - Custo: $0.006                                            │
│  - Tempo: 25-35s                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 MAPEAMENTO DE CAMPOS

### **Resumo Quantitativo:**

| Tabela | Registros | Campos IA | Campos Sistema | Total |
|--------|-----------|-----------|----------------|-------|
| dim_entidade (cliente) | 1 | 8 | 10 | 18 |
| fato_entidade_contexto (cliente) | 1 | 4 | 11 | 15 |
| dim_mercado | 1 | 7 | 9 | 16 |
| dim_produto | 3 | 9 | 21 | 30 |
| fato_entidade_produto | 3 | 6 | 12 | 18 |
| dim_entidade (concorrentes) | 5 | 40 | 50 | 90 |
| fato_entidade_contexto (concorrentes) | 5 | 15 | 70 | 85 |
| fato_entidade_competidor | 5 | 10 | 20 | 30 |
| dim_entidade (leads) | 5 | 40 | 50 | 90 |
| fato_entidade_contexto (leads) | 5 | 20 | 65 | 85 |
| **TOTAL** | **29** | **159** | **318** | **477** |

### **3 Origens de Dados:**

1. **IMPORTAÇÃO** (3 campos)
   - nome, projetoId, statusQualificacaoId

2. **ENRIQUECIMENTO IA** (159 campos)
   - Preenchidos pelos 6 prompts

3. **REGRAS DE GRAVAÇÃO** (318 campos)
   - IDs, hashes, timestamps, FKs

---

## 🎯 ESPECIFICAÇÃO DOS PROMPTS

### **PROMPT 1: ENRIQUECER CLIENTE**

**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Tokens:** 290 (240 in + 50 out)  
**Custo:** $0.0011

**Campos a Preencher (8):**
1. nomeFantasia
2. cnpj (NULL se não tiver certeza)
3. email
4. telefone
5. site
6. numFiliais
7. numLojas
8. numFuncionarios

**Regra de Honestidade:** NULL > dados inventados

---

### **PROMPT 2: MERCADO FORNECEDOR**

**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Tokens:** 420 (300 in + 120 out)  
**Custo:** $0.0020

**Campos a Preencher (7):**
1. nome (ex: "Software de Gestão Empresarial (ERP)")
2. categoria (Tecnologia, Indústria, Comércio, etc)
3. segmentacao (B2B, B2C, B2B2C)
4. tamanhoMercado (R$ + número de empresas)
5. crescimentoAnual (% ao ano)
6. tendencias (array 3-5 itens)
7. principaisPlayers (array 5-10 empresas)

**Cache:** Redis 7 dias (hash: MD5(nome + categoria))

---

### **PROMPT 3: PRODUTOS**

**Modelo:** GPT-4o  
**Temperatura:** 1.0  
**Tokens:** 440 (260 in + 180 out)  
**Custo:** $0.0025

**Campos a Preencher (9 = 3 produtos x 3 campos):**
1. nome
2. categoria
3. descricao (max 500 chars)

**Quantidade Fixa:** EXATAMENTE 3 produtos

---

### **PROMPT 4: CONCORRENTES**

**Modelo:** GPT-4o-mini ⭐  
**Temperatura:** 1.0  
**Tokens:** 700 (400 in + 300 out)  
**Custo:** $0.00024

**Campos a Preencher (65 = 5 concorrentes x 13 campos):**

**Por Concorrente:**
1. nome
2. nomeFantasia
3. cidade
4. uf
5. cnpj (NULL se não souber)
6. site
7. porte
8. numFuncionarios
9. cnae
10. faturamentoEstimado
11. produtoPrincipal
12. nivelCompeticao (Direto|Indireto|Potencial)
13. diferencial

**Quantidade Fixa:** EXATAMENTE 5 concorrentes

**Regra de Exclusividade:** Cliente NÃO pode ser concorrente

**Cache:** Redis 7 dias (key: `concorrentes:{mercadoId}`)

---

### **PROMPT 5: LEADS**

**Modelo:** GPT-4o-mini ⭐  
**Temperatura:** 1.0  
**Tokens:** 760 (400 in + 360 out)  
**Custo:** $0.00028

**Campos a Preencher (70 = 5 leads x 14 campos):**

**Por Lead:**
1. nome
2. nomeFantasia
3. cidade
4. uf
5. cnpj (NULL se não souber)
6. site
7. porte
8. numFuncionarios
9. setor
10. cnae
11. faturamentoEstimado
12. produtoInteresse
13. motivoFit

**Quantidade Fixa:** EXATAMENTE 5 leads

**Regra de Exclusividade:** 
- Cliente NÃO pode ser lead
- Concorrentes NÃO podem ser leads

**Cache:** Redis 7 dias (key: `leads:{mercadoId}:{setor}`)

---

### **PROMPT 6: VALIDAÇÃO**

**Modelo:** GPT-4o-mini  
**Temperatura:** 1.0  
**Tokens:** 220 (160 in + 60 out)  
**Custo:** $0.00006

**Campos a Preencher (2):**
1. qualidadeScore (0-100)
2. qualidadeClassificacao (excelente|bom|aceitavel|ruim)

**Critérios:**
- Campos obrigatórios: 60 pontos
- Campos opcionais: 40 pontos

---

## 🏗️ ARQUITETURA TÉCNICA

### **Stack:**
- **Backend:** TypeScript + tRPC + Drizzle ORM
- **Banco:** PostgreSQL (Supabase)
- **Jobs:** BullMQ + Redis
- **IA:** OpenAI (GPT-4o + GPT-4o-mini)
- **Geolocalização:** Levenshtein (fuzzy match)

### **Fluxo de Processamento:**

```typescript
// 1. Criar job
const job = await enrichmentQueue.add('enrich-client', {
  clienteId: 123,
  projetoId: 1,
  pesquisaId: 5,
  userId: 'user-123'
});

// 2. Worker processa (5 simultâneos)
async function processEnrichment(job) {
  const { clienteId } = job.data;
  
  // P1: Cliente (GPT-4o)
  const p1 = await callOpenAI('gpt-4o', promptP1, 1.0);
  await gravarCliente(clienteId, p1);
  
  // Geo: Fuzzy Match
  const geo = await fuzzyMatchGeografia(p1.cidade, p1.uf);
  await gravarGeografia(clienteId, geo.id);
  
  // P2: Mercado (GPT-4o)
  const p2 = await callOpenAI('gpt-4o', promptP2, 1.0);
  const mercadoId = await gravarMercado(p2);
  
  // P3: Produtos (GPT-4o)
  const p3 = await callOpenAI('gpt-4o', promptP3, 1.0);
  await gravarProdutos(clienteId, p3.produtos);
  
  // P4: Concorrentes (GPT-4o-mini)
  const p4 = await callOpenAI('gpt-4o-mini', promptP4, 1.0);
  await gravarConcorrentes(clienteId, p4.concorrentes);
  
  // P5: Leads (GPT-4o-mini)
  const p5 = await callOpenAI('gpt-4o-mini', promptP5, 1.0);
  await gravarLeads(clienteId, p5.leads);
  
  // P6: Validação (GPT-4o-mini)
  const p6 = await callOpenAI('gpt-4o-mini', promptP6, 1.0);
  await gravarValidacao(clienteId, p6);
  
  return { success: true, score: p6.qualidadeScore };
}
```

### **Retry Inteligente:**

```typescript
// BullMQ retry config
const queueConfig = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000 // 1s, 2s, 4s
  }
};
```

### **Cache Redis:**

```typescript
// Cache de mercado
const mercadoHash = md5(nome + categoria);
const cached = await redis.get(`mercado:${mercadoHash}`);
if (cached) return JSON.parse(cached);

// Cache de concorrentes
const concKey = `concorrentes:${mercadoId}`;
const cached = await redis.get(concKey);
if (cached) return JSON.parse(cached);

// TTL: 7 dias
await redis.setex(key, 604800, JSON.stringify(data));
```

---

## 💰 CUSTOS E MÉTRICAS

### **Custo por Cliente (Modelo Híbrido):**

| Prompt | Modelo | Tokens | Custo |
|--------|--------|--------|-------|
| P1: Cliente | GPT-4o | 290 | $0.0011 |
| P2: Mercado | GPT-4o | 420 | $0.0020 |
| P3: Produtos | GPT-4o | 440 | $0.0025 |
| P4: Concorrentes | GPT-4o-mini | 700 | $0.00024 |
| P5: Leads | GPT-4o-mini | 760 | $0.00028 |
| P6: Validação | GPT-4o-mini | 220 | $0.00006 |
| **TOTAL** | - | **2.830** | **$0.0059** |

**Custo Arredondado:** **$0.006/cliente**

### **Projeção de Escala:**

| Clientes | Custo Total | Tempo Estimado |
|----------|-------------|----------------|
| 10 | $0.06 | 4-6 min |
| 100 | $0.60 | 40-60 min |
| 1.000 | **$6.00** | 6-9 horas |
| 10.000 | **$60.00** | 2.5-3.5 dias |

### **Economia vs GPT-4o Puro:**

| Cenário | Custo/Cliente | Economia |
|---------|---------------|----------|
| GPT-4o Puro | $0.015 | - |
| **Híbrido** | **$0.006** | **61%** ($0.009) |

### **Tempo de Processamento:**

| Fase | Tempo |
|------|-------|
| P1: Cliente | 2-3s |
| Geo: Fuzzy | 0.1s |
| P2: Mercado | 3-4s |
| P3: Produtos | 3-4s |
| P4: Concorrentes | 5-7s |
| P5: Leads | 5-7s |
| P6: Validação | 1-2s |
| Gravações | 0.5s |
| **TOTAL** | **25-35s** |

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Infraestrutura (2-3 dias)**

**1.1. BullMQ + Redis**
```bash
pnpm add bullmq ioredis
```

**1.2. Criar Queue**
```typescript
// server/queues/enrichment.queue.ts
import { Queue, Worker } from 'bullmq';

export const enrichmentQueue = new Queue('enrichment', {
  connection: { host: 'localhost', port: 6379 }
});

export const enrichmentWorker = new Worker(
  'enrichment',
  processEnrichment,
  { concurrency: 5 }
);
```

**1.3. OpenAI Client**
```typescript
// server/lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

---

### **FASE 2: Prompts (1-2 dias)**

**2.1. Criar Prompt Templates**
```typescript
// server/prompts/p1-cliente.ts
export function criarPromptP1(cliente: Cliente) {
  return `Você é um analista de dados B2B...`;
}
```

**2.2. Função de Chamada**
```typescript
// server/lib/callOpenAI.ts
export async function callOpenAI(
  modelo: 'gpt-4o' | 'gpt-4o-mini',
  prompt: string,
  temperatura: number
) {
  const response = await openai.chat.completions.create({
    model: modelo,
    temperature: temperatura,
    messages: [
      { role: 'system', content: 'Você é um assistente...' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

### **FASE 3: Gravação (2-3 dias)**

**3.1. DAL Extensions**
```typescript
// server/dal/entidade.dal.ts
export async function gravarEnriquecimentoCliente(
  entidadeId: number,
  dados: P1Output
) {
  return await db.update(dimEntidade)
    .set({
      nomeFantasia: dados.nomeFantasia,
      cnpj: dados.cnpj,
      // ... outros campos
      origemTipo: 'enriquecimento_ia',
      origemProcesso: 'enriquecimento_v3',
      origemConfianca: 95
    })
    .where(eq(dimEntidade.id, entidadeId));
}
```

**3.2. Geolocalização Fuzzy**
```typescript
// server/lib/fuzzyGeo.ts
import { levenshtein } from 'fast-levenshtein';

export async function fuzzyMatchGeografia(
  cidade: string,
  uf: string
) {
  const cidades = await db.select()
    .from(dimGeografia)
    .where(eq(dimGeografia.uf, uf));
  
  let melhorMatch = null;
  let melhorScore = 0;
  
  for (const c of cidades) {
    const similarity = 1 - (levenshtein(
      cidade.toLowerCase(),
      c.cidade.toLowerCase()
    ) / Math.max(cidade.length, c.cidade.length));
    
    if (similarity > melhorScore && similarity > 0.8) {
      melhorScore = similarity;
      melhorMatch = c;
    }
  }
  
  return melhorMatch;
}
```

---

### **FASE 4: UI (2-3 dias)**

**4.1. Botão de Enriquecimento**
```tsx
// client/src/pages/Pesquisa.tsx
<Button onClick={handleEnriquecer}>
  Enriquecer Clientes
</Button>
```

**4.2. Progress Real-time**
```tsx
// WebSocket ou polling
const [progresso, setProgresso] = useState(0);

useEffect(() => {
  const interval = setInterval(async () => {
    const status = await trpc.enrichment.getStatus.query({ pesquisaId });
    setProgresso(status.percentual);
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

**4.3. Visualização de Resultados**
```tsx
// Exibir concorrentes, leads, score
<Card>
  <h3>Concorrentes ({concorrentes.length})</h3>
  {concorrentes.map(c => (
    <div key={c.id}>{c.nome} - {c.nivelCompeticao}</div>
  ))}
</Card>
```

---

### **FASE 5: Testes (1-2 dias)**

**5.1. Teste Unitário**
```typescript
// server/tests/enrichment.test.ts
describe('Enriquecimento', () => {
  it('deve enriquecer cliente com sucesso', async () => {
    const result = await processEnrichment({ clienteId: 1 });
    expect(result.success).toBe(true);
    expect(result.score).toBeGreaterThan(80);
  });
});
```

**5.2. Teste de Integração**
```typescript
it('deve criar 29 registros', async () => {
  await processEnrichment({ clienteId: 1 });
  
  const concorrentes = await db.select()
    .from(dimEntidade)
    .where(eq(dimEntidade.tipoEntidade, 'concorrente'));
  
  expect(concorrentes).toHaveLength(5);
});
```

---

### **FASE 6: Deploy (1 dia)**

**6.1. Variáveis de Ambiente**
```env
OPENAI_API_KEY=sk-...
REDIS_URL=redis://localhost:6379
```

**6.2. Redis Cloud**
```bash
# Configurar Redis Cloud (Upstash ou Redis Labs)
```

**6.3. Deploy Vercel**
```bash
vercel --prod
```

---

## 📊 CRONOGRAMA

| Fase | Duração | Entregável |
|------|---------|------------|
| 1. Infraestrutura | 2-3 dias | BullMQ + Redis + OpenAI |
| 2. Prompts | 1-2 dias | 6 prompts funcionais |
| 3. Gravação | 2-3 dias | DAL + Fuzzy Geo |
| 4. UI | 2-3 dias | Interface de enriquecimento |
| 5. Testes | 1-2 dias | Testes unitários + integração |
| 6. Deploy | 1 dia | Produção |
| **TOTAL** | **9-14 dias** | **Sistema completo** |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Infraestrutura**
- [ ] Instalar BullMQ + ioredis
- [ ] Configurar Redis (local ou cloud)
- [ ] Criar enrichmentQueue
- [ ] Criar enrichmentWorker (5 workers)
- [ ] Configurar OpenAI client

### **Prompts**
- [ ] Implementar P1 (Cliente - GPT-4o)
- [ ] Implementar P2 (Mercado - GPT-4o)
- [ ] Implementar P3 (Produtos - GPT-4o)
- [ ] Implementar P4 (Concorrentes - GPT-4o-mini)
- [ ] Implementar P5 (Leads - GPT-4o-mini)
- [ ] Implementar P6 (Validação - GPT-4o-mini)

### **Gravação**
- [ ] DAL: gravarEnriquecimentoCliente
- [ ] DAL: gravarMercado (com cache)
- [ ] DAL: gravarProdutos
- [ ] DAL: gravarConcorrentes (com cache)
- [ ] DAL: gravarLeads (com cache)
- [ ] DAL: gravarValidacao
- [ ] Implementar fuzzyMatchGeografia

### **Cache**
- [ ] Cache de mercado (7 dias)
- [ ] Cache de concorrentes (7 dias)
- [ ] Cache de leads (7 dias)

### **UI**
- [ ] Botão "Enriquecer Clientes"
- [ ] Progress bar real-time
- [ ] Visualização de concorrentes
- [ ] Visualização de leads
- [ ] Visualização de score

### **Testes**
- [ ] Teste unitário: P1-P6
- [ ] Teste integração: fluxo completo
- [ ] Teste cache: hit/miss
- [ ] Teste retry: falhas

### **Deploy**
- [ ] Configurar OPENAI_API_KEY
- [ ] Configurar REDIS_URL
- [ ] Deploy Vercel
- [ ] Testar em produção

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Validar especificação** com o time
2. ⏳ **Iniciar FASE 1** (Infraestrutura)
3. ⏳ **Implementar prompts** (FASE 2)
4. ⏳ **Desenvolver gravação** (FASE 3)
5. ⏳ **Criar UI** (FASE 4)
6. ⏳ **Testar** (FASE 5)
7. ⏳ **Deploy** (FASE 6)

---

**Especificação aprovada e pronta para implementação!** 🚀
