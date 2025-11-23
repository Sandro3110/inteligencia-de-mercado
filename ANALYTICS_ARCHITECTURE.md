# 📊 Arquitetura de Analytics Robusta - Gestor PAV

## 🎯 Visão Geral

Proposta de modelo de analytics moderno e dinâmico baseado em princípios de **Data Engineering** para explorar dados de pesquisa de mercado com profundidade, flexibilidade e performance.

---

## 📐 Arquitetura Proposta

### **Camada 1: Data Warehouse (Agregações Materializadas)**

Criar tabelas de agregação pré-calculadas para performance:

```
analytics_mercados_agg (agregação diária/mensal)
├── projectId, pesquisaId, mercadoId
├── periodo (date), granularidade (day/week/month)
├── total_clientes, total_concorrentes, total_leads
├── leads_por_stage (JSON: {novo: X, em_contato: Y, ...})
├── conversao_rate, ticket_medio
├── qualidade_media_clientes, qualidade_media_leads
├── distribuicao_uf (JSON: {SP: X, RJ: Y, ...})
├── distribuicao_porte (JSON: {MEI: X, Pequeno: Y, ...})
└── updated_at

analytics_cohort (análise de coorte)
├── projectId, pesquisaId
├── cohort_mes (mês de criação)
├── periodo_offset (0, 1, 2, ... meses desde criação)
├── total_leads_criados
├── leads_convertidos_acumulado
├── taxa_retencao
└── valor_gerado_acumulado

analytics_rfm (Recency, Frequency, Monetary)
├── projectId, leadId
├── recency_score (1-5: última interação)
├── frequency_score (1-5: frequência de contatos)
├── monetary_score (1-5: valor potencial)
├── rfm_segment (Champions, Loyal, At Risk, Lost)
└── updated_at

analytics_funnel_snapshot (snapshot diário do funil)
├── projectId, pesquisaId
├── snapshot_date
├── stage, total_leads, conversao_rate
├── tempo_medio_stage (dias)
├── taxa_avanco_proximo_stage
└── taxa_perda
```

---

## 🔧 Componentes do Sistema

### **1. Motor de Agregação (Background Job)**

```typescript
// server/analytics/aggregationEngine.ts
- Roda diariamente (cron: 0 2 * * *)
- Calcula métricas agregadas incrementalmente
- Atualiza tabelas de analytics_*
- Mantém histórico para análise temporal
```

### **2. Query Builder Dinâmico**

```typescript
// server/analytics/queryBuilder.ts
interface AnalyticsQuery {
  metrics: string[]; // ['total_leads', 'conversao_rate', ...]
  dimensions: string[]; // ['mercado', 'uf', 'porte', ...]
  filters: Filter[]; // [{field: 'uf', op: 'in', value: ['SP','RJ']}]
  timeRange: TimeRange; // {from: '2024-01', to: '2024-12'}
  granularity: "day" | "week" | "month" | "quarter";
  groupBy: string[]; // ['mercado', 'mes']
  orderBy: { field: string; dir: "asc" | "desc" }[];
}

// Exemplo de uso:
const query = buildAnalyticsQuery({
  metrics: ["total_leads", "conversao_rate"],
  dimensions: ["mercado", "uf"],
  filters: [{ field: "porte", op: "in", value: ["Médio", "Grande"] }],
  timeRange: { from: "2024-01", to: "2024-12" },
  granularity: "month",
  groupBy: ["mercado", "mes"],
});
```

### **3. Drill-Down Hierárquico**

```
Hierarquia de Drill-Down:
PROJECT → PESQUISA → MERCADO → CLIENTE/CONCORRENTE → LEAD → CONVERSÃO

Cada nível permite:
- Filtrar dados do nível inferior
- Agregar métricas do nível superior
- Navegar para cima/baixo na hierarquia
```

---

## 📈 Dashboards Propostos

### **Dashboard 1: Executive Overview (Visão Executiva)**

**KPIs Principais:**

- Total de Mercados Mapeados
- Total de Leads Gerados
- Taxa de Conversão Global
- Ticket Médio de Conversões
- ROI Estimado

**Gráficos:**

1. **Funil de Conversão Interativo** (com drill-down por mercado)
2. **Evolução Temporal** (leads, conversões, receita)
3. **Heatmap Geográfico** (concentração de leads por UF)
4. **Top 10 Mercados** (por volume, conversão, receita)

---

### **Dashboard 2: Market Intelligence (Inteligência de Mercado)**

**Análises:**

1. **Matriz BCG** (Crescimento vs Participação de Mercado)
   - Eixo X: Taxa de crescimento do mercado
   - Eixo Y: Participação (nº clientes / total mercado)
   - Tamanho bolha: Valor potencial

2. **Análise de Concentração**
   - Índice Herfindahl-Hirschman (HHI)
   - Curva de Lorenz (distribuição de clientes)
   - Top 3/5/10 players por mercado

3. **Análise de Gaps**
   - Mercados com baixa cobertura
   - Regiões sub-exploradas
   - Segmentos com alta demanda / baixa oferta

4. **Tendências e Sazonalidade**
   - Decomposição temporal (trend, seasonal, residual)
   - Previsão de crescimento (próximos 3-6 meses)

---

### **Dashboard 3: Sales Performance (Performance de Vendas)**

**Métricas:**

1. **Análise de Cohort**
   - Taxa de retenção por coorte mensal
   - Tempo médio até primeira conversão
   - LTV (Lifetime Value) por coorte

2. **Análise RFM**
   - Segmentação de leads (Champions, Loyal, At Risk, Lost)
   - Ações recomendadas por segmento
   - Valor potencial por segmento

3. **Análise de Funil**
   - Taxa de conversão por stage
   - Tempo médio em cada stage
   - Gargalos identificados
   - Leads em risco de churn

4. **Performance por Dimensão**
   - Conversão por UF, Porte, Segmentação
   - Ticket médio por dimensão
   - Velocidade de fechamento

---

### **Dashboard 4: Data Quality & Operations (Qualidade de Dados)**

**Monitoramento:**

1. **Score de Qualidade**
   - Distribuição de scores (clientes, concorrentes, leads)
   - Evolução temporal da qualidade
   - Campos com maior incompletude

2. **Enriquecimento**
   - Taxa de sucesso de enriquecimento
   - Tempo médio de enriquecimento
   - Custos por registro enriquecido

3. **Validação**
   - Taxa de validação (pending → rich/discarded)
   - Tempo médio de validação
   - Validadores mais ativos

---

## 🛠️ Funcionalidades Avançadas

### **1. Filtros Dinâmicos Globais**

Interface de filtros que se aplica a todos os gráficos:

```typescript
interface GlobalFilters {
  projectIds: number[];
  pesquisaIds: number[];
  mercadoIds: number[];
  timeRange: { from: Date; to: Date };
  dimensions: {
    uf: string[];
    porte: string[];
    segmentacao: string[];
    qualidadeMin: number;
  };
}
```

### **2. Comparação Lado a Lado**

Comparar 2-4 entidades simultaneamente:

- Projetos vs Projetos
- Pesquisas vs Pesquisas
- Mercados vs Mercados
- Períodos vs Períodos (YoY, MoM)

### **3. Alertas Inteligentes**

Alertas baseados em ML/regras:

- Mercado com crescimento acelerado (>50% MoM)
- Lead com alta probabilidade de conversão
- Queda abrupta em conversões (>20% WoW)
- Oportunidade de cross-sell identificada

### **4. Exportação Avançada**

- **Excel/CSV**: Dados brutos + agregados
- **PDF**: Relatórios formatados com gráficos
- **PNG/SVG**: Gráficos individuais
- **API**: Endpoint para integração externa

### **5. Análises Preditivas (ML)**

```python
# Modelos propostos:
1. Previsão de Conversão (Lead Scoring)
   - Features: qualidadeScore, porte, uf, mercado, tempo_no_funil
   - Target: conversao (0/1)
   - Modelo: XGBoost / Random Forest

2. Previsão de Churn
   - Features: recency, frequency, stage, tempo_sem_atividade
   - Target: churn_30d (0/1)
   - Modelo: Logistic Regression

3. Previsão de Ticket Médio
   - Features: porte, mercado, uf, numero_estabelecimentos
   - Target: valor_conversao
   - Modelo: Linear Regression / Gradient Boosting

4. Clusterização de Mercados
   - Features: tamanho, crescimento, concentracao, ticket_medio
   - Algoritmo: K-Means / DBSCAN
   - Output: 4-6 clusters (ex: Emergente, Maduro, Saturado, Nicho)
```

---

## 🎨 UI/UX Proposta

### **Componentes Reutilizáveis**

```typescript
<AnalyticsCard
  title="Taxa de Conversão"
  value="23.4%"
  change="+2.1%"
  trend="up"
  sparkline={[...]}
  onClick={() => drillDown('conversao')}
/>

<DynamicChart
  type="line|bar|pie|scatter|heatmap"
  data={chartData}
  config={{
    xAxis: 'mes',
    yAxis: 'total_leads',
    groupBy: 'mercado',
    filters: globalFilters
  }}
  onDrillDown={(point) => handleDrillDown(point)}
  exportable={true}
/>

<FilterPanel
  filters={globalFilters}
  onChange={setGlobalFilters}
  savedFilters={userSavedFilters}
  onSave={saveFilter}
/>

<ComparisonView
  entities={[
    {type: 'project', id: 1},
    {type: 'project', id: 2}
  ]}
  metrics={['total_leads', 'conversao_rate', 'ticket_medio']}
  timeRange={{from: '2024-01', to: '2024-12'}}
/>
```

---

## 📊 Métricas Calculadas (Biblioteca)

```typescript
// server/analytics/metrics.ts
export const METRICS_LIBRARY = {
  // Métricas Básicas
  total_leads: {
    sql: "COUNT(DISTINCT leads.id)",
    label: "Total de Leads",
    format: "number",
  },

  // Métricas de Conversão
  conversao_rate: {
    sql: '(COUNT(DISTINCT CASE WHEN stage = "fechado" THEN id END) / COUNT(DISTINCT id)) * 100',
    label: "Taxa de Conversão",
    format: "percentage",
  },

  // Métricas de Tempo
  tempo_medio_conversao: {
    sql: "AVG(DATEDIFF(validatedAt, createdAt))",
    label: "Tempo Médio até Conversão (dias)",
    format: "number",
  },

  // Métricas de Valor
  ticket_medio: {
    sql: "AVG(leadConversions.dealValue)",
    label: "Ticket Médio",
    format: "currency",
  },

  // Métricas de Qualidade
  qualidade_media: {
    sql: "AVG(qualidadeScore)",
    label: "Score de Qualidade Médio",
    format: "number",
  },

  // Métricas de Concentração
  hhi_index: {
    sql: "SUM(POW(market_share, 2))",
    label: "Índice HHI (Concentração)",
    format: "number",
  },

  // Métricas de Crescimento
  growth_rate_mom: {
    sql: "((current_month - previous_month) / previous_month) * 100",
    label: "Crescimento MoM",
    format: "percentage",
  },
};
```

---

## 🚀 Roadmap de Implementação

### **Fase 1: Fundação (2-3 dias)**

- [ ] Criar tabelas de agregação (analytics\_\*)
- [ ] Implementar motor de agregação básico
- [ ] Criar query builder dinâmico
- [ ] Implementar biblioteca de métricas

### **Fase 2: Dashboards Core (3-4 dias)**

- [ ] Dashboard Executive Overview
- [ ] Dashboard Market Intelligence
- [ ] Componentes reutilizáveis (AnalyticsCard, DynamicChart)
- [ ] Sistema de filtros globais

### **Fase 3: Funcionalidades Avançadas (2-3 dias)**

- [ ] Drill-down hierárquico
- [ ] Comparação lado a lado
- [ ] Exportação (Excel, PDF, PNG)
- [ ] Análise de cohort

### **Fase 4: Inteligência (3-4 dias)**

- [ ] Análise RFM
- [ ] Alertas inteligentes
- [ ] Previsões básicas (lead scoring)
- [ ] Clusterização de mercados

### **Fase 5: Performance & Otimização (1-2 dias)**

- [ ] Índices de banco de dados
- [ ] Cache de queries frequentes
- [ ] Lazy loading de gráficos
- [ ] Testes de carga

---

## 💡 Benefícios Esperados

### **Para Gestores:**

- ✅ Visão 360° do negócio em tempo real
- ✅ Identificação rápida de oportunidades e riscos
- ✅ Decisões baseadas em dados concretos
- ✅ ROI mensurável de ações comerciais

### **Para Analistas:**

- ✅ Exploração livre de dados (self-service)
- ✅ Drill-down ilimitado
- ✅ Comparações flexíveis
- ✅ Exportação para análises externas

### **Para Vendedores:**

- ✅ Leads priorizados por score
- ✅ Insights de mercado em tempo real
- ✅ Alertas de oportunidades quentes
- ✅ Histórico completo de interações

---

## 🔧 Stack Tecnológico Recomendado

### **Backend:**

- **Agregação**: Node.js + node-cron
- **Query Builder**: Drizzle ORM + SQL raw
- **Cache**: Redis (opcional, para queries frequentes)
- **ML**: Python + scikit-learn (API separada)

### **Frontend:**

- **Gráficos**: Recharts (já instalado) + D3.js (para visualizações avançadas)
- **Tabelas**: TanStack Table (filtros, ordenação, paginação)
- **Exportação**: html2canvas (PNG), jsPDF (PDF), xlsx (Excel)
- **Estado**: Zustand (para filtros globais)

### **Banco de Dados:**

- **OLTP**: MySQL (atual, para transações)
- **OLAP**: Tabelas de agregação no mesmo MySQL
- **Futuro**: Considerar ClickHouse para analytics de grande escala

---

## 📚 Referências e Inspirações

1. **Looker** (Google): Modelo de métricas calculadas e drill-down
2. **Tableau**: Interface de filtros dinâmicos e comparações
3. **Metabase**: Self-service analytics e query builder
4. **Amplitude**: Análise de cohort e funil
5. **Mixpanel**: Segmentação avançada e RFM

---

## 🎯 Próximos Passos Imediatos

1. **Validar arquitetura** com stakeholders
2. **Priorizar dashboards** (qual implementar primeiro?)
3. **Definir métricas críticas** (top 10 mais importantes)
4. **Criar protótipo** de 1 dashboard completo
5. **Iterar baseado em feedback**

---

**Documento criado em:** 2024-01-20  
**Versão:** 1.0  
**Autor:** Manus AI - Data Engineering Analysis
