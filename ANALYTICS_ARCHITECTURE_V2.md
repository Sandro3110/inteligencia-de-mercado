# 📊 Arquitetura de Analytics - Gestor PAV (Lead Generation Intelligence)

## 🎯 Contexto e Escopo

O **Gestor PAV** é uma ferramenta de **inteligência pré-vendas** focada em:

1. **Pesquisa de Mercado Estruturada** - Mapeamento de mercados, clientes e concorrentes
2. **Geração de Leads Qualificados** - Garimpo objetivo com scoring e enriquecimento
3. **Exportação para Salesforce** - Leads tratados são enviados para gestão comercial

**O analytics deve responder:**

- Quais mercados geram leads de maior qualidade?
- Qual metodologia de garimpo é mais eficaz?
- Quanto esforço (tempo/custo) investir em cada mercado?
- Qual a taxa de conversão de leads enviados ao Salesforce?
- Como otimizar o processo de pesquisa e enriquecimento?

---

## 📐 Arquitetura Proposta (Ajustada ao Escopo)

### **Camada 1: Métricas de Pesquisa e Garimpo**

Tabelas de agregação focadas em **eficácia da pesquisa**:

```sql
-- Agregação por Mercado (principal unidade de análise)
CREATE TABLE analytics_mercados (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  pesquisaId INT,
  mercadoId INT NOT NULL,
  periodo DATE NOT NULL,

  -- Métricas de Cobertura
  total_clientes INT DEFAULT 0,
  total_concorrentes INT DEFAULT 0,
  total_leads_gerados INT DEFAULT 0,
  taxa_cobertura_mercado DECIMAL(5,2), -- % do mercado mapeado

  -- Métricas de Qualidade
  qualidade_media_leads DECIMAL(5,2),
  leads_alta_qualidade INT, -- score >= 80
  leads_media_qualidade INT, -- score 50-79
  leads_baixa_qualidade INT, -- score < 50

  -- Métricas de Enriquecimento
  leads_enriquecidos INT,
  taxa_sucesso_enriquecimento DECIMAL(5,2),
  tempo_medio_enriquecimento_min DECIMAL(10,2),
  custo_enriquecimento_total DECIMAL(10,2),

  -- Métricas de Validação
  leads_validados INT,
  leads_aprovados INT, -- status: rich
  leads_descartados INT, -- status: discarded
  taxa_aprovacao DECIMAL(5,2),

  -- Métricas de Exportação (integração Salesforce)
  leads_exportados_sf INT,
  leads_convertidos_sf INT, -- feedback do Salesforce
  taxa_conversao_sf DECIMAL(5,2),

  -- Métricas de Esforço
  horas_pesquisa DECIMAL(10,2),
  custo_total DECIMAL(10,2),
  roi DECIMAL(10,2), -- (valor_gerado - custo) / custo

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mercado_periodo (mercadoId, periodo),
  INDEX idx_project_pesquisa (projectId, pesquisaId)
);

-- Agregação por Pesquisa (batch de trabalho)
CREATE TABLE analytics_pesquisas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  pesquisaId INT NOT NULL,

  -- Métricas Gerais
  total_mercados_mapeados INT,
  total_clientes_base INT,
  total_leads_gerados INT,
  taxa_conversao_cliente_lead DECIMAL(5,2), -- leads / clientes

  -- Qualidade Agregada
  qualidade_media_geral DECIMAL(5,2),
  distribuicao_qualidade JSON, -- {alta: X, media: Y, baixa: Z}

  -- Performance de Enriquecimento
  taxa_sucesso_enriquecimento DECIMAL(5,2),
  tempo_total_enriquecimento_horas DECIMAL(10,2),
  custo_total_enriquecimento DECIMAL(10,2),

  -- Resultados Salesforce
  leads_exportados_sf INT,
  leads_convertidos_sf INT,
  taxa_conversao_sf DECIMAL(5,2),
  valor_pipeline_gerado DECIMAL(15,2),

  -- ROI da Pesquisa
  custo_total_pesquisa DECIMAL(10,2),
  valor_gerado DECIMAL(15,2),
  roi DECIMAL(10,2),

  data_inicio DATE,
  data_conclusao DATE,
  duracao_dias INT,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project (projectId),
  INDEX idx_pesquisa (pesquisaId)
);

-- Análise de Eficácia por Dimensão
CREATE TABLE analytics_dimensoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  pesquisaId INT,

  dimensao_tipo ENUM('uf', 'porte', 'segmentacao', 'categoria') NOT NULL,
  dimensao_valor VARCHAR(100) NOT NULL, -- ex: 'SP', 'Médio', 'B2B'

  total_leads INT,
  qualidade_media DECIMAL(5,2),
  taxa_conversao_sf DECIMAL(5,2),
  custo_medio_lead DECIMAL(10,2),
  roi DECIMAL(10,2),

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dimensao (dimensao_tipo, dimensao_valor),
  INDEX idx_project_pesquisa (projectId, pesquisaId)
);

-- Histórico de Performance (evolução temporal)
CREATE TABLE analytics_timeline (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projectId INT NOT NULL,
  data DATE NOT NULL,

  leads_gerados_dia INT,
  leads_enriquecidos_dia INT,
  leads_validados_dia INT,
  leads_exportados_sf_dia INT,

  qualidade_media_dia DECIMAL(5,2),
  custo_dia DECIMAL(10,2),

  -- Métricas acumuladas
  leads_acumulados INT,
  custo_acumulado DECIMAL(10,2),
  valor_gerado_acumulado DECIMAL(15,2),

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_data (projectId, data)
);
```

---

## 📊 Dashboards Propostos (Ajustados)

### **Dashboard 1: Research Overview (Visão Geral da Pesquisa)**

**Objetivo:** Monitorar progresso e qualidade da pesquisa em andamento

**KPIs Principais:**

- Total de Mercados Mapeados
- Total de Leads Gerados
- Qualidade Média dos Leads (score)
- Taxa de Aprovação (validação)
- Leads Prontos para Exportação

**Gráficos:**

1. **Funil de Qualificação**

   ```
   Clientes Base → Leads Gerados → Leads Enriquecidos → Leads Validados → Leads Aprovados → Exportados SF
   ```

   - Mostrar taxa de conversão em cada etapa
   - Identificar gargalos no processo

2. **Distribuição de Qualidade** (Pie Chart)
   - Alta Qualidade (score >= 80): X leads
   - Média Qualidade (score 50-79): Y leads
   - Baixa Qualidade (score < 50): Z leads

3. **Evolução Temporal** (Line Chart)
   - Leads gerados por dia/semana
   - Qualidade média ao longo do tempo
   - Taxa de enriquecimento diária

4. **Top 10 Mercados** (Bar Chart)
   - Por volume de leads
   - Por qualidade média
   - Por taxa de aprovação

**Filtros:**

- Projeto, Pesquisa
- Período (últimos 7/30/90 dias)
- Mercado, UF, Porte, Segmentação

---

### **Dashboard 2: Lead Quality Intelligence (Inteligência de Qualidade)**

**Objetivo:** Entender quais características geram leads de maior qualidade

**Análises:**

1. **Qualidade por Dimensão** (Heatmap)
   - Eixo X: UF
   - Eixo Y: Porte
   - Cor: Qualidade média
   - Tamanho bolha: Volume de leads

2. **Matriz de Qualidade vs Volume**
   - Quadrante 1 (Alto volume + Alta qualidade): **Mercados Estrela** ⭐
   - Quadrante 2 (Baixo volume + Alta qualidade): **Nichos Valiosos** 💎
   - Quadrante 3 (Alto volume + Baixa qualidade): **Requer Filtragem** ⚠️
   - Quadrante 4 (Baixo volume + Baixa qualidade): **Evitar** ❌

3. **Análise de Correlação**
   - Quais atributos correlacionam com alta qualidade?
   - Porte vs Qualidade
   - Segmentação (B2B/B2C) vs Qualidade
   - Região vs Qualidade

4. **Perfil do Lead Ideal**
   - Características comuns dos leads com score > 90
   - Recomendações de onde focar garimpo

**Ações Sugeridas:**

- "Investir mais em mercados X, Y, Z (alta qualidade)"
- "Aplicar filtros mais rigorosos em mercados A, B (baixa qualidade)"
- "Explorar região Sul (sub-explorada, alta qualidade)"

---

### **Dashboard 3: Operational Efficiency (Eficiência Operacional)**

**Objetivo:** Otimizar processo de pesquisa e enriquecimento

**Métricas:**

1. **Performance de Enriquecimento**
   - Taxa de sucesso por fonte de dados
   - Tempo médio de enriquecimento por lead
   - Custo por lead enriquecido
   - Campos com maior taxa de preenchimento

2. **Performance de Validação**
   - Tempo médio de validação por lead
   - Taxa de aprovação por validador
   - Motivos de descarte mais comuns
   - Backlog de validação (leads pendentes)

3. **Análise de Custos**
   - Custo por lead gerado
   - Custo por lead qualificado (score >= 80)
   - Custo por mercado
   - Breakdown de custos (enriquecimento, validação, operação)

4. **Gargalos Identificados**
   - Etapas com maior tempo de processamento
   - Mercados com baixa taxa de enriquecimento
   - Alertas de anomalias (queda de qualidade, aumento de custo)

**Gráficos:**

- **Waterfall Chart**: Breakdown de custos por etapa
- **Gantt Chart**: Timeline de pesquisas em andamento
- **Scatter Plot**: Custo vs Qualidade por mercado

---

### **Dashboard 4: Salesforce Integration & ROI (Integração e Retorno)**

**Objetivo:** Medir eficácia dos leads enviados ao Salesforce e calcular ROI

**Métricas de Integração:**

1. **Pipeline Gerado**
   - Total de leads exportados para Salesforce
   - Leads que viraram oportunidades (feedback SF)
   - Leads que viraram vendas (feedback SF)
   - Valor total do pipeline gerado

2. **Taxa de Conversão por Origem**
   - Conversão SF por mercado
   - Conversão SF por UF
   - Conversão SF por porte
   - Conversão SF por faixa de qualidade

3. **Análise de ROI**

   ```
   ROI = (Valor Gerado - Custo Total) / Custo Total * 100
   ```

   - ROI por pesquisa
   - ROI por mercado
   - ROI acumulado do projeto
   - Payback period (tempo para recuperar investimento)

4. **Feedback Loop**
   - Comparar score interno vs conversão SF
   - Ajustar modelo de scoring baseado em resultados reais
   - Identificar falsos positivos (alto score, baixa conversão)
   - Identificar falsos negativos (baixo score, alta conversão)

**Gráficos:**

- **Sankey Diagram**: Fluxo de leads (Pesquisa → Validação → SF → Oportunidade → Venda)
- **ROI Timeline**: Evolução do ROI ao longo do tempo
- **Comparison Chart**: Score PAV vs Taxa de Conversão SF

---

## 🔧 Funcionalidades Específicas

### **1. Lead Scoring Otimizado**

Modelo de scoring baseado em múltiplos fatores:

```typescript
interface LeadScoringModel {
  // Completude de Dados (0-30 pontos)
  completude: {
    campos_obrigatorios: 15; // CNPJ, nome, site
    campos_opcionais: 10; // email, telefone, linkedin
    campos_enriquecidos: 5; // porte, faturamento, nº estabelecimentos
  };

  // Qualidade de Dados (0-30 pontos)
  qualidade: {
    dados_validados: 15; // CNPJ válido, site ativo
    dados_consistentes: 10; // cidade/UF, porte/faturamento
    dados_atualizados: 5; // última atualização < 6 meses
  };

  // Fit com Mercado (0-25 pontos)
  fit: {
    porte_adequado: 10; // Médio/Grande empresa
    segmentacao_alvo: 10; // B2B > B2C para alguns mercados
    regiao_prioritaria: 5; // Sul/Sudeste
  };

  // Potencial de Conversão (0-15 pontos)
  potencial: {
    mercado_aquecido: 5; // Mercado com alta conversão histórica
    concorrencia_baixa: 5; // Poucos concorrentes mapeados
    crescimento_mercado: 5; // Mercado em expansão
  };
}

// Score final: 0-100 pontos
// >= 80: Alta Qualidade (prioridade máxima)
// 50-79: Média Qualidade (validar manualmente)
// < 50: Baixa Qualidade (descartar ou re-enriquecer)
```

### **2. Recomendações Automáticas**

Sistema de recomendações baseado em dados históricos:

```typescript
interface Recomendacao {
  tipo: 'mercado' | 'regiao' | 'metodologia' | 'filtro',
  prioridade: 'alta' | 'media' | 'baixa',
  titulo: string,
  descricao: string,
  impacto_estimado: {
    leads_adicionais: number,
    qualidade_esperada: number,
    custo_estimado: number,
    roi_esperado: number
  },
  acao: string // Texto acionável
}

// Exemplos:
{
  tipo: 'mercado',
  prioridade: 'alta',
  titulo: 'Expandir em Mercado de Software B2B',
  descricao: 'Mercado apresenta ROI 3x superior à média e baixa cobertura atual (23%)',
  impacto_estimado: {
    leads_adicionais: 150,
    qualidade_esperada: 85,
    custo_estimado: 5000,
    roi_esperado: 280
  },
  acao: 'Criar nova pesquisa focada em Software B2B nas regiões Sul e Sudeste'
}
```

### **3. Alertas Operacionais**

Alertas focados em **eficiência operacional**:

```typescript
const ALERTAS_OPERACIONAIS = [
  {
    tipo: "qualidade_baixa",
    condicao: "qualidade_media_ultimos_7d < 60",
    mensagem:
      "Qualidade média dos leads caiu para {valor}. Revisar critérios de garimpo.",
    acao: "Ajustar filtros de pesquisa ou melhorar enriquecimento",
  },
  {
    tipo: "enriquecimento_lento",
    condicao: "tempo_medio_enriquecimento > 10min",
    mensagem: "Enriquecimento está levando {valor} min/lead. Verificar APIs.",
    acao: "Otimizar chamadas de API ou aumentar paralelismo",
  },
  {
    tipo: "backlog_validacao",
    condicao: "leads_pendentes_validacao > 100",
    mensagem: "{valor} leads aguardando validação há mais de 3 dias.",
    acao: "Alocar mais validadores ou automatizar validação simples",
  },
  {
    tipo: "custo_elevado",
    condicao: "custo_por_lead > media_historica * 1.5",
    mensagem: "Custo por lead subiu {percentual}% acima da média.",
    acao: "Revisar fontes de dados ou metodologia de garimpo",
  },
  {
    tipo: "conversao_sf_baixa",
    condicao: "taxa_conversao_sf_ultimos_30d < 15%",
    mensagem: "Taxa de conversão no Salesforce caiu para {valor}%.",
    acao: "Revisar critérios de qualificação ou alinhar com time comercial",
  },
];
```

### **4. Exportação para Salesforce**

Interface de exportação com mapeamento de campos:

```typescript
interface SalesforceExport {
  // Mapeamento de campos PAV → Salesforce
  fieldMapping: {
    "leads.nome": "Lead.Company";
    "leads.cnpj": "Lead.CNPJ__c";
    "leads.email": "Lead.Email";
    "leads.telefone": "Lead.Phone";
    "leads.site": "Lead.Website";
    "leads.uf": "Lead.State";
    "leads.cidade": "Lead.City";
    "leads.porte": "Lead.Porte__c";
    "leads.qualidadeScore": "Lead.Score__c";
    "mercadosUnicos.nome": "Lead.Mercado__c";
    "pesquisas.nome": "Lead.Origem_Pesquisa__c";
  };

  // Filtros de exportação
  filters: {
    qualidadeMinima: 70;
    statusValidacao: ["rich"];
    mercadosExcluidos: [];
    jaExportados: false; // Não exportar duplicados
  };

  // Configurações de sincronização
  sync: {
    modo: "manual" | "automatico";
    frequencia: "diaria" | "semanal";
    horario: "08:00";
    notificarErros: true;
  };

  // Feedback de conversão (webhook do Salesforce)
  feedback: {
    leadId: number;
    salesforceId: string;
    status: "Open" | "Contacted" | "Qualified" | "Converted" | "Lost";
    oportunidadeId?: string;
    valorOportunidade?: number;
    dataConversao?: Date;
  };
}
```

---

## 📈 Métricas-Chave (KPIs)

### **Métricas de Produtividade**

- **Leads Gerados por Dia** - Velocidade de garimpo
- **Taxa de Enriquecimento** - % de leads enriquecidos com sucesso
- **Tempo Médio de Ciclo** - Da pesquisa à exportação SF
- **Custo por Lead** - Custo total / leads gerados

### **Métricas de Qualidade**

- **Score Médio de Leads** - Qualidade geral da base
- **Taxa de Aprovação** - % de leads validados como "rich"
- **Taxa de Completude** - % de campos preenchidos
- **Taxa de Duplicação** - % de leads duplicados (evitar)

### **Métricas de Eficácia**

- **Taxa de Conversão SF** - % de leads que viram oportunidades
- **Valor de Pipeline Gerado** - Soma de oportunidades criadas
- **ROI da Pesquisa** - (Valor gerado - Custo) / Custo
- **Payback Period** - Tempo para recuperar investimento

### **Métricas de Cobertura**

- **% de Mercado Mapeado** - Cobertura por mercado
- **Densidade de Leads por UF** - Concentração geográfica
- **Diversificação de Portfólio** - Nº de mercados ativos

---

## 🚀 Roadmap de Implementação (Ajustado)

### **Fase 1: Fundação (2 dias)**

- [ ] Criar tabelas de analytics (mercados, pesquisas, dimensoes, timeline)
- [ ] Implementar motor de agregação (cron job diário)
- [ ] Criar biblioteca de métricas calculadas
- [ ] Implementar sistema de scoring otimizado

### **Fase 2: Dashboard Research Overview (2 dias)**

- [ ] Criar página ResearchOverviewDashboard.tsx
- [ ] Implementar funil de qualificação interativo
- [ ] Criar gráfico de distribuição de qualidade
- [ ] Criar evolução temporal de leads
- [ ] Implementar Top 10 mercados
- [ ] Sistema de filtros globais

### **Fase 3: Dashboard Lead Quality Intelligence (2 dias)**

- [ ] Criar página LeadQualityDashboard.tsx
- [ ] Implementar heatmap de qualidade por dimensão
- [ ] Criar matriz qualidade vs volume
- [ ] Implementar análise de correlação
- [ ] Gerar perfil do lead ideal
- [ ] Sistema de recomendações automáticas

### **Fase 4: Dashboard Operational Efficiency (1-2 dias)**

- [ ] Criar página OperationalEfficiencyDashboard.tsx
- [ ] Implementar métricas de enriquecimento
- [ ] Criar análise de custos (waterfall chart)
- [ ] Implementar detecção de gargalos
- [ ] Sistema de alertas operacionais

### **Fase 5: Dashboard Salesforce Integration & ROI (2 dias)**

- [ ] Criar página SalesforceROIDashboard.tsx
- [ ] Implementar métricas de pipeline gerado
- [ ] Criar análise de ROI por dimensão
- [ ] Implementar Sankey diagram (fluxo de leads)
- [ ] Sistema de feedback loop (SF → PAV)
- [ ] Ajuste automático de scoring baseado em conversões

### **Fase 6: Integrações e Otimizações (1-2 dias)**

- [ ] Implementar exportação para Salesforce (API)
- [ ] Criar webhook para receber feedback de conversão
- [ ] Otimizar queries com índices
- [ ] Implementar cache de métricas frequentes
- [ ] Testes de carga e performance

---

## 💡 Diferenciais da Solução

### **1. Foco em Ação, Não Apenas Visualização**

Cada dashboard inclui **recomendações acionáveis**:

- "Investir 40% mais em Mercado X (ROI 3x)"
- "Aplicar filtro de porte >= Médio em Mercado Y (reduz custo 30%)"
- "Priorizar validação de leads da região Sul (conversão SF 45%)"

### **2. Feedback Loop Automático**

Integração bidirecional com Salesforce:

- PAV → SF: Exporta leads qualificados
- SF → PAV: Recebe feedback de conversão
- PAV ajusta scoring baseado em resultados reais

### **3. Otimização Contínua**

Sistema aprende com dados históricos:

- Identifica padrões de sucesso
- Recomenda onde investir esforço
- Alerta sobre desvios de performance

### **4. Visão End-to-End**

Acompanha lead desde pesquisa até venda:

```
Pesquisa → Garimpo → Enriquecimento → Validação → Exportação SF → Oportunidade → Venda
```

---

## 🎯 Próximos Passos

1. **Validar escopo** - Confirmar que esta arquitetura atende às necessidades
2. **Priorizar dashboards** - Qual implementar primeiro?
3. **Definir integração Salesforce** - API disponível? Campos customizados?
4. **Implementar MVP** - Dashboard Research Overview + métricas básicas
5. **Iterar baseado em feedback** - Ajustar conforme uso real

---

**Documento criado em:** 2024-01-20  
**Versão:** 2.0 (Ajustado ao escopo de Lead Generation)  
**Autor:** Manus AI - Lead Generation Intelligence Architecture
