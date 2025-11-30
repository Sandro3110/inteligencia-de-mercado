# 🎨 Análise Crítica: Hierarquias de Drill-Down

**Equipe:** Arquitetura de Informação + Frontend + Engenharia de Dados  
**Data:** 30/11/2025  
**Objetivo:** Validar utilidade real das hierarquias propostas

---

## 🤔 Pergunta Central

**"Essas hierarquias realmente ajudam o usuário a tomar decisões de negócio?"**

---

## 📊 Análise Crítica dos 3 Módulos

### ✅ 1. Geoposição (Região → Estado → Cidade)

**Pergunta de negócio:** "Onde estão meus clientes/leads/concorrentes?"

**Utilidade:** ⭐⭐⭐⭐⭐ (5/5)

**Por quê funciona:**

- ✅ Hierarquia **natural e universal** (todo mundo entende)
- ✅ Responde perguntas óbvias: "Onde expandir?", "Onde está a concorrência?"
- ✅ Navegação **intuitiva** (do macro para o micro)
- ✅ Ação clara: "Vou focar em São Paulo porque tem 80 leads"

**Veredito:** ✅ **MANTER** (já implementado e funciona bem)

---

### ⚠️ 2. Setores/Segmentos (Setor → Subsetor → Segmento)

**Pergunta de negócio:** "Quais setores têm mais clientes/leads?"

**Utilidade:** ⭐⭐⭐ (3/5)

**Problemas identificados:**

❌ **Hierarquia artificial:**

- "Setor → Subsetor → Segmento" não é natural
- Usuário não pensa assim: "Vou expandir Setor → depois Subsetor → depois Segmento"
- Confuso: qual a diferença entre Subsetor e Segmento?

❌ **Dados inconsistentes:**

- Clientes não têm `subsetor`
- Valores de `setor` podem estar bagunçados
- Precisa criar tabela de mapeamento (overhead)

❌ **Pergunta errada:**

- Usuário não quer "navegar hierarquia de setores"
- Usuário quer: **"Quais setores têm mais oportunidades?"**

**Proposta alternativa:** 🔄 **REFORMULAR**

---

### ⚠️ 3. Produtos/Mercados (Produto → Mercado → Região → Estado → Cidade)

**Pergunta de negócio:** "Onde cada produto está presente?"

**Utilidade:** ⭐⭐ (2/5)

**Problemas identificados:**

❌ **Hierarquia complexa demais:**

- 5 níveis de drill-down é **cognitivamente pesado**
- Usuário vai se perder: "Onde eu estou? Produto? Mercado? Região?"
- Navegação confusa: "Clico no produto, depois mercado, depois região..."

❌ **Mistura conceitos:**

- Produto → Mercado (relação de negócio)
- Mercado → Região (relação geográfica)
- Não é uma hierarquia natural, são **2 hierarquias diferentes**

❌ **Pergunta errada:**

- Usuário não quer "navegar 5 níveis"
- Usuário quer: **"Qual produto vende mais em cada região?"**

**Proposta alternativa:** 🔄 **REFORMULAR COMPLETAMENTE**

---

## 💡 Proposta: Hierarquias Orientadas a Decisão

### Princípios de Design:

1. **Pergunta de negócio primeiro** → depois a hierarquia
2. **Máximo 3 níveis** (limite cognitivo)
3. **Hierarquias naturais** (que o usuário já conhece)
4. **Ação clara** ao final da navegação

---

## 🎯 Módulo 2 REFORMULADO: Análise de Setores

### ❌ Hierarquia antiga (confusa):

```
Setor → Subsetor → Segmento → Empresas
```

### ✅ Hierarquia nova (orientada a decisão):

**Opção A: Visão de Oportunidades por Setor**

```
Setor
  ├─ Clientes (quantos tenho)
  ├─ Leads (quantos posso conquistar)
  ├─ Concorrentes (quantos competem)
  └─ Ação: "Expandir neste setor" ou "Evitar (muita concorrência)"
```

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  📊 Análise de Setores                                  │
├─────────────────────────────────────────────────────────┤
│  Setor          Clientes  Leads  Concorrentes  Score   │
├─────────────────────────────────────────────────────────┤
│  Tecnologia        245    1.240      890       ⭐⭐⭐⭐   │
│  Saúde             180      680      420       ⭐⭐⭐⭐⭐ │
│  Educação          120      890      250       ⭐⭐⭐⭐⭐ │
│  Varejo             95      450      780       ⭐⭐⭐     │
└─────────────────────────────────────────────────────────┘

[Clique em um setor para ver distribuição geográfica]
```

**Quando clica em "Tecnologia":**

- Abre modal com **Geoposição filtrada por setor**
- Reutiliza módulo de Geoposição (Região → Estado → Cidade)
- Mostra: "Tecnologia está concentrada em SP (120 clientes)"

**Benefícios:**

- ✅ **1 nível** ao invés de 3
- ✅ **Reutiliza** módulo de Geoposição
- ✅ **Ação clara:** "Focar em Saúde (alto score)"
- ✅ **Sem hierarquia artificial**

---

**Opção B: Matriz Setor × Região**

```
┌─────────────────────────────────────────────────────────┐
│  📊 Matriz: Setores × Regiões                           │
├─────────────────────────────────────────────────────────┤
│  Setor       Sul  Sudeste  Centro  Nordeste  Norte     │
├─────────────────────────────────────────────────────────┤
│  Tecnologia   45    120      35       30       15      │
│  Saúde        30     95      25       20       10      │
│  Educação     25     60      15       15        5      │
└─────────────────────────────────────────────────────────┘

[Heatmap: verde = muitos clientes, vermelho = poucos]
[Clique em célula para ver cidades]
```

**Benefícios:**

- ✅ **Visão 2D** (setor × região) em 1 tela
- ✅ **Identifica gaps** rapidamente (células vermelhas)
- ✅ **Ação clara:** "Expandir Tecnologia no Nordeste (gap)"

---

## 🎯 Módulo 3 REFORMULADO: Produtos & Mercados

### ❌ Hierarquia antiga (complexa):

```
Produto → Mercado → Região → Estado → Cidade → Empresas
```

### ✅ Proposta nova: Separar em 2 Visões

**Visão 1: Ranking de Produtos**

```
┌─────────────────────────────────────────────────────────┐
│  🏆 Top Produtos                                        │
├─────────────────────────────────────────────────────────┤
│  Produto          Clientes  Receita  Crescimento       │
├─────────────────────────────────────────────────────────┤
│  ERP Cloud           245    R$ 2.4M    +45% ↗          │
│  CRM Mobile          180    R$ 1.8M    +32% ↗          │
│  Sistema Logística   120    R$ 1.2M    +15% ↗          │
└─────────────────────────────────────────────────────────┘

[Clique em produto para ver onde está presente]
```

**Quando clica em "ERP Cloud":**

- Abre modal com **Geoposição filtrada por produto**
- Reutiliza módulo de Geoposição
- Mostra: "ERP Cloud está em 15 estados, concentrado em SP"

**Visão 2: Matriz Produto × Mercado**

```
┌─────────────────────────────────────────────────────────┐
│  📊 Matriz: Produtos × Mercados                         │
├─────────────────────────────────────────────────────────┤
│  Produto       Indústria  Varejo  Saúde  Educação      │
├─────────────────────────────────────────────────────────┤
│  ERP Cloud        120       45      30       50        │
│  CRM Mobile        80       60      20       20        │
│  Logística         40       95      10       15        │
└─────────────────────────────────────────────────────────┘

[Heatmap: identifica produto-mercado fit]
```

**Benefícios:**

- ✅ **2 visões simples** ao invés de 1 complexa
- ✅ **Reutiliza** módulo de Geoposição
- ✅ **Ação clara:** "ERP Cloud tem fit com Indústria"
- ✅ **Sem 5 níveis de navegação**

---

## 📊 Comparação: Antes × Depois

| Aspecto          | Antes                                                   | Depois                                     |
| ---------------- | ------------------------------------------------------- | ------------------------------------------ |
| **Módulo 2**     | Setor → Subsetor → Segmento (3 níveis)                  | Tabela de Setores + Geoposição (1 nível)   |
| **Módulo 3**     | Produto → Mercado → Região → Estado → Cidade (5 níveis) | Ranking + Matriz + Geoposição (1-2 níveis) |
| **Complexidade** | Alta                                                    | Baixa                                      |
| **Tempo dev**    | 29 horas                                                | 8 horas                                    |
| **Reutilização** | 40-60%                                                  | 90%                                        |
| **Utilidade**    | ⭐⭐⭐                                                  | ⭐⭐⭐⭐⭐                                 |

---

## 🎯 Proposta Final: 3 Módulos Simples

### 1️⃣ Geoposição (JÁ IMPLEMENTADO)

**Hierarquia:** Região → Estado → Cidade  
**Pergunta:** "Onde estão?"  
**Status:** ✅ Manter

### 2️⃣ Análise de Setores (SIMPLIFICADO)

**Hierarquia:** Tabela flat + Geoposição  
**Pergunta:** "Quais setores têm mais oportunidades?"  
**Componentes:**

- Tabela de setores com score
- Clique → abre Geoposição filtrada
- Opcional: Matriz Setor × Região

**Tempo dev:** ~4 horas

### 3️⃣ Análise de Produtos (SIMPLIFICADO)

**Hierarquia:** Ranking + Matriz + Geoposição  
**Pergunta:** "Quais produtos vendem mais e onde?"  
**Componentes:**

- Ranking de produtos
- Matriz Produto × Mercado
- Clique → abre Geoposição filtrada

**Tempo dev:** ~4 horas

---

## 🏗️ Arquitetura Simplificada

### Backend (Reutilização Máxima)

**Módulo 2: Análise de Setores**

```typescript
// Apenas 1 query simples
sectorAnalysisRouter = router({
  getSectorSummary: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      // Query simples: GROUP BY setor
      // Retorna: setor, count_clientes, count_leads, count_concorrentes
      // Calcula score: (leads / concorrentes) * peso
    }),
});
```

**Módulo 3: Análise de Produtos**

```typescript
// 2 queries simples
productAnalysisRouter = router({
  getProductRanking: publicProcedure.query(async ({ input }) => {
    // Query: GROUP BY produto
    // ORDER BY count_clientes DESC
  }),

  getProductMarketMatrix: publicProcedure.query(async ({ input }) => {
    // Query: GROUP BY produto, mercado
    // Retorna matriz 2D
  }),
});
```

**Reutilização:**

- ✅ Ao clicar em setor/produto → chama `mapHierarchical.getHierarchicalData` com filtro
- ✅ Usa mesma stored procedure de Geoposição
- ✅ Usa mesmos componentes de UI

### Frontend (Componentes Simples)

**Módulo 2:**

```tsx
<SectorAnalysisPage>
  <SectorTable
    data={sectors}
    onSectorClick={(setor) => {
      // Abre modal com GeoTable filtrada
      <GeoTable filters={{ setor }} />;
    }}
  />
</SectorAnalysisPage>
```

**Módulo 3:**

```tsx
<ProductAnalysisPage>
  <Tabs>
    <Tab label="Ranking">
      <ProductRanking
        onProductClick={(produto) => {
          <GeoTable filters={{ produto }} />;
        }}
      />
    </Tab>
    <Tab label="Matriz">
      <ProductMarketMatrix />
    </Tab>
  </Tabs>
</ProductAnalysisPage>
```

---

## 📈 Ganhos da Simplificação

| Métrica                      | Antes     | Depois        | Ganho |
| ---------------------------- | --------- | ------------- | ----- |
| **Níveis hierárquicos**      | 3 + 5 = 8 | 1 + 1 = 2     | -75%  |
| **Tempo de desenvolvimento** | 29h       | 8h            | -72%  |
| **Queries complexas**        | 5         | 2             | -60%  |
| **Stored procedures**        | 5         | 0 (reutiliza) | -100% |
| **Componentes novos**        | 12        | 4             | -67%  |
| **Reutilização de código**   | 50%       | 90%           | +80%  |
| **Utilidade para usuário**   | ⭐⭐⭐    | ⭐⭐⭐⭐⭐    | +67%  |

---

## 🎯 Recomendação Final

### ✅ Implementar:

**1. Análise de Setores (4 horas)**

- Tabela simples com score
- Clique → Geoposição filtrada
- Opcional: Matriz Setor × Região (heatmap)

**2. Análise de Produtos (4 horas)**

- Ranking de produtos
- Matriz Produto × Mercado
- Clique → Geoposição filtrada

### ❌ NÃO implementar:

- ❌ Hierarquia Setor → Subsetor → Segmento
- ❌ Hierarquia Produto → Mercado → Região → Estado → Cidade
- ❌ Stored procedures complexas (reutilizar as de Geoposição)

---

## 💬 Perguntas para Validação

**Para o usuário:**

1. "Você quer navegar 5 níveis de hierarquia ou ver um ranking simples?"
2. "Prefere uma tabela com score ou uma árvore de drill-down?"
3. "O que é mais útil: matriz 2D ou navegação hierárquica?"

**Hipótese:**

- 90% dos usuários preferem **visualizações simples** (tabelas, rankings, matrizes)
- 10% dos usuários querem **drill-down profundo** (já têm Geoposição)

---

**Conclusão:** Menos é mais. Simplicidade > Complexidade.

**Próximo passo:** Validar com usuário antes de implementar.
