# Proposta: Visão Mercados - Drill-Down Hierárquico

**Autor:** Manus AI  
**Data:** 30 de Novembro de 2025  
**Projeto:** IntelMarket - Inteligência de Mercado  
**Versão:** 1.0

---

## 1. Visão Geral

Esta proposta apresenta uma nova funcionalidade de análise de mercado através de uma **tabela drill-down hierárquica** que organiza dados de Clientes, Leads e Concorrentes por características de mercado, permitindo navegação inteligente desde segmentação macro até mercados específicos.

### Objetivos

A funcionalidade **Visão Mercados** visa proporcionar uma análise estruturada e aprofundada da distribuição de entidades por características de mercado, permitindo identificar padrões, oportunidades e concentrações através de uma navegação hierárquica intuitiva que parte de classificações amplas até chegar em mercados individuais.

### Diferencial

Enquanto a funcionalidade de **Geoposição** organiza dados por localização geográfica (Região → Estado → Cidade), a **Visão Mercados** organiza por características de negócio (Segmentação → Setor → Categoria → Mercado), oferecendo uma perspectiva complementar e estratégica para análise de inteligência de mercado.

---

## 2. Estrutura Hierárquica

### Níveis de Drill-Down

A tabela será organizada em **quatro níveis hierárquicos** baseados em características de mercado:

| Nível                    | Descrição                                        | Exemplos                                       | Campo no Banco           |
| ------------------------ | ------------------------------------------------ | ---------------------------------------------- | ------------------------ |
| **Nível 1: Segmentação** | Modelo de negócio macro                          | B2B, B2C, B2B2C, B2G                           | `segmentacao` (mercados) |
| **Nível 2: Setor**       | Setor econômico de atuação                       | Serviços, Indústria, Comércio, Tecnologia      | `setor` (entidades)      |
| **Nível 3: Categoria**   | Categoria específica dentro do setor             | Software, Consultoria, Manufatura, Varejo      | `categoria` (mercados)   |
| **Nível 4: Mercado**     | Mercado específico mapeado (nível mais granular) | SaaS B2B, E-commerce B2C, Logística Industrial | `nome` (mercados_unicos) |

### Lógica de Agrupamento Inteligente

A estrutura hierárquica utiliza uma combinação de campos das tabelas `mercados_unicos`, `clientes`, `leads` e `concorrentes`:

**Nível 1 - Segmentação:**

- Agrupa por `mercados_unicos.segmentacao`
- Valores típicos: B2B, B2C, B2B2C, B2G, Híbrido
- Representa o modelo de negócio predominante

**Nível 2 - Setor:**

- Agrupa por `clientes.setor`, `leads.setor`, `concorrentes.setor`
- Valores típicos: Serviços, Indústria, Comércio, Tecnologia, Saúde, Educação
- Representa o setor econômico de atuação

**Nível 3 - Categoria:**

- Agrupa por `mercados_unicos.categoria`
- Valores típicos: Software, Consultoria, Manufatura, Varejo, Logística
- Representa a categoria específica dentro do setor

**Nível 4 - Mercado:**

- Exibe mercados individuais da tabela `mercados_unicos`
- Cada mercado tem nome único e características específicas
- Permite visualizar entidades (clientes/leads/concorrentes) vinculadas

### Exemplo de Hierarquia

```
B2B (1.240 clientes, 5.420 leads, 890 concorrentes)
  ├─ Serviços (580 clientes, 2.340 leads, 420 concorrentes)
  │   ├─ Software (320 clientes, 1.580 leads, 250 concorrentes)
  │   │   ├─ SaaS Empresarial (120 clientes, 680 leads, 120 concorrentes)
  │   │   ├─ ERP e Gestão (95 clientes, 450 leads, 65 concorrentes)
  │   │   └─ Business Intelligence (105 clientes, 450 leads, 65 concorrentes)
  │   └─ Consultoria (260 clientes, 760 leads, 170 concorrentes)
  │       ├─ Consultoria Estratégica (140 clientes, 420 leads, 90 concorrentes)
  │       └─ Consultoria de TI (120 clientes, 340 leads, 80 concorrentes)
  └─ Indústria (660 clientes, 3.080 leads, 470 concorrentes)
      ├─ Manufatura (380 clientes, 1.840 leads, 280 concorrentes)
      └─ Logística (280 clientes, 1.240 leads, 190 concorrentes)

B2C (890 clientes, 3.240 leads, 620 concorrentes)
  └─ Comércio (890 clientes, 3.240 leads, 620 concorrentes)
      ├─ E-commerce (520 clientes, 1.980 leads, 380 concorrentes)
      └─ Varejo Físico (370 clientes, 1.260 leads, 240 concorrentes)
```

---

## 3. Abas de Entidades

Cada nível da hierarquia terá **três abas** para filtrar os dados por tipo de entidade, mantendo o padrão estabelecido na funcionalidade de Geoposição:

### Aba 1: Clientes 🏢

Exibe clientes cadastrados no nível selecionado (Segmentação, Setor, Categoria ou Mercado).

**Informações Exibidas:**

- Nome da empresa
- CNPJ
- Setor e Porte
- Localização (Cidade/UF)
- Status de enriquecimento
- Qualidade dos dados

**Ações:**

- Duplo clique para abrir card de detalhes
- Visualização de produtos vinculados
- Histórico de interações

### Aba 2: Leads 🎯

Exibe leads identificados no nível selecionado.

**Informações Exibidas:**

- Nome da empresa
- Setor e Porte
- Qualidade (Alta, Média, Baixa)
- Localização (Cidade/UF)
- Mercado de origem
- Stage do lead

**Ações:**

- Duplo clique para abrir card de detalhes
- Visualização de score de qualidade
- Opções de conversão

### Aba 3: Concorrentes 📊

Exibe concorrentes mapeados no nível selecionado.

**Informações Exibidas:**

- Nome da empresa
- Setor e Porte
- Localização (Cidade/UF)
- Mercado de origem
- Produtos/serviços oferecidos

**Ações:**

- Duplo clique para abrir card de detalhes
- Análise competitiva
- Comparação de características

---

## 4. Visualização: Tabela Drill-Down + Cards

### 4.1 Modo de Visualização Hierárquica

A página oferecerá visualização hierárquica com expansão progressiva:

**Navegação por Níveis:**

1. **Nível 1 (Segmentação):** Visão inicial mostrando B2B, B2C, B2B2C, B2G
2. **Nível 2 (Setor):** Clique expande para mostrar Serviços, Indústria, Comércio, etc.
3. **Nível 3 (Categoria):** Clique expande para mostrar categorias específicas
4. **Nível 4 (Mercado):** Clique expande para mostrar mercados individuais

**Duplo Clique para Cards:**

- Ao dar **duplo clique** em um mercado, abre visualização em cards
- Exibe entidades (clientes/leads/concorrentes) vinculadas ao mercado
- Reutiliza componentes existentes (`EntityDetailCard`)
- Mantém consistência visual com Geoposição

### 4.2 Componentes Reutilizados

Para garantir consistência e manutenibilidade, vamos reutilizar componentes:

| Componente           | Localização                               | Uso                                       |
| -------------------- | ----------------------------------------- | ----------------------------------------- |
| `EntityDetailCard`   | `/components/map/EntityDetailCard.tsx`    | Modal de detalhes de entidades            |
| `ErrorBoundary`      | `/components/ErrorBoundary.tsx`           | Tratamento de erros                       |
| Padrão de Drill-Down | Baseado em `/components/map/GeoTable.tsx` | Estrutura hierárquica com expand/collapse |

**Novos Componentes a Criar:**

| Componente         | Responsabilidade                              |
| ------------------ | --------------------------------------------- |
| `MarketDrillTable` | Tabela hierárquica principal para mercados    |
| `MarketDetailCard` | Card com informações detalhadas do mercado    |
| `MarketStatsPanel` | Painel com estatísticas e métricas do mercado |

---

## 5. Funcionalidades

### 5.1 Expansão/Colapso Hierárquica

- **Segmentação:** Clique para expandir e ver Setores
- **Setor:** Clique para expandir e ver Categorias
- **Categoria:** Clique para expandir e ver Mercados
- **Mercado:** Duplo clique para abrir cards com entidades

### 5.2 Totalizadores Inteligentes

Cada linha mostrará totalizadores agregados das entidades:

```
B2B (1.240 clientes, 5.420 leads, 890 concorrentes)
  ├─ Serviços (580 clientes, 2.340 leads, 420 concorrentes)
  │   ├─ Software (320 clientes, 1.580 leads, 250 concorrentes)
  │   │   └─ SaaS Empresarial (120 clientes, 680 leads, 120 concorrentes)
```

**Métricas Adicionais por Mercado:**

- Tamanho estimado do mercado
- Taxa de crescimento anual
- Quantidade de players principais
- Tendências identificadas

### 5.3 Filtros Globais

Painel de filtros no topo da página:

| Filtro          | Descrição                                       | Tipo         |
| --------------- | ----------------------------------------------- | ------------ |
| **Projeto**     | Filtra por projeto específico                   | Dropdown     |
| **Pesquisa**    | Filtra por pesquisa dentro do projeto           | Dropdown     |
| **Segmentação** | Filtra por B2B, B2C, B2B2C, B2G                 | Multi-select |
| **Setor**       | Filtra por setor econômico                      | Dropdown     |
| **Porte**       | Filtra por porte (Pequeno, Médio, Grande)       | Multi-select |
| **Qualidade**   | Filtra leads por qualidade (Alta, Média, Baixa) | Multi-select |
| **Estado**      | Filtra por UF (opcional, filtro geográfico)     | Dropdown     |

### 5.4 Busca Inteligente

Campo de busca com sugestões automáticas:

- Busca por nome de mercado
- Busca por categoria
- Busca por setor
- Busca por nome de entidade

### 5.5 Exportação

Botões para exportar dados visíveis:

**Excel (.xlsx):**

- Tabela completa com hierarquia preservada
- Abas separadas por tipo de entidade
- Totalizadores calculados
- Formatação condicional por qualidade

**CSV:**

- Dados planificados com colunas hierárquicas
- Compatível com ferramentas de BI
- Encoding UTF-8 com BOM

**PDF:**

- Relatório formatado com gráficos
- Sumário executivo
- Análise de distribuição

---

## 6. Interface Visual

### Layout Proposto

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Visão Mercados                                    [🔍] [📥]     │
├─────────────────────────────────────────────────────────────────────┤
│  Filtros: [Projeto ▼] [Pesquisa ▼] [Segmentação ☑] [Setor ▼]      │
│           [Porte ☑] [Qualidade ☑] [Estado ▼]     [Limpar Filtros]  │
├─────────────────────────────────────────────────────────────────────┤
│  Abas: [🏢 Clientes] [🎯 Leads] [📊 Concorrentes]                   │
├─────────────────────────────────────────────────────────────────────┤
│  ▼ B2B (1.240 clientes)                                             │
│    ▼ Serviços (580 clientes)                                        │
│      ▼ Software (320 clientes)                                      │
│        ▶ SaaS Empresarial (120 clientes)                            │
│        ▶ ERP e Gestão (95 clientes)                                 │
│        ▶ Business Intelligence (105 clientes)                       │
│      ▶ Consultoria (260 clientes)                                   │
│    ▶ Indústria (660 clientes)                                       │
│  ▶ B2C (890 clientes)                                               │
│  ▶ B2B2C (320 clientes)                                             │
│  ▶ B2G (145 clientes)                                               │
├─────────────────────────────────────────────────────────────────────┤
│  Total: 2.595 clientes em 127 mercados        [Excel] [CSV] [PDF]  │
└─────────────────────────────────────────────────────────────────────┘
```

### Cores e Ícones

Mantendo consistência com Geoposição:

| Tipo             | Cor Principal      | Cor Secundária           | Ícone |
| ---------------- | ------------------ | ------------------------ | ----- |
| **Clientes**     | Azul (#3B82F6)     | Azul Claro (#DBEAFE)     | 🏢    |
| **Leads**        | Verde (#10B981)    | Verde Claro (#D1FAE5)    | 🎯    |
| **Concorrentes** | Vermelho (#EF4444) | Vermelho Claro (#FEE2E2) | 📊    |

**Indicadores Visuais:**

- 📈 Mercado em crescimento (>10% ao ano)
- 📉 Mercado em declínio (<0% ao ano)
- ⭐ Mercado prioritário (alta concentração de leads)
- 🔥 Mercado aquecido (alta atividade recente)

### Estados Visuais

**Linha de Segmentação (Nível 1):**

- Fundo: Gradiente suave da cor da entidade
- Fonte: Bold, tamanho 16px
- Ícone: Chevron expansível

**Linha de Setor (Nível 2):**

- Fundo: Branco com borda esquerda colorida
- Fonte: Semibold, tamanho 14px
- Indentação: 20px

**Linha de Categoria (Nível 3):**

- Fundo: Cinza claro (#F9FAFB)
- Fonte: Medium, tamanho 13px
- Indentação: 40px

**Linha de Mercado (Nível 4):**

- Fundo: Branco
- Fonte: Regular, tamanho 12px
- Indentação: 60px
- Hover: Fundo azul claro
- Cursor: Pointer (indica duplo clique)

---

## 7. Arquitetura Técnica

### 7.1 API Endpoints

**Endpoint Principal:** `trpc.marketView.getHierarchicalData`

**Input:**

```typescript
{
  projectId?: number;
  pesquisaId?: number;
  entityType: 'clientes' | 'leads' | 'concorrentes';
  filters?: {
    segmentacao?: string[];
    setor?: string;
    porte?: string[];
    qualidade?: string[];
    uf?: string;
  };
}
```

**Output:**

```typescript
{
  segmentations: [
    {
      name: 'B2B',
      sectors: [
        {
          name: 'Serviços',
          categories: [
            {
              name: 'Software',
              markets: [
                {
                  id: 1,
                  nome: 'SaaS Empresarial',
                  segmentacao: 'B2B',
                  categoria: 'Software',
                  tamanhoMercado: 'R$ 5-10 bilhões',
                  crescimentoAnual: '15%',
                  totals: { clientes: 120, leads: 680, concorrentes: 120 }
                }
              ],
              totals: { clientes: 320, leads: 1580, concorrentes: 250 }
            }
          ],
          totals: { clientes: 580, leads: 2340, concorrentes: 420 }
        }
      ],
      totals: { clientes: 1240, leads: 5420, concorrentes: 890 }
    }
  ],
  grandTotals: { clientes: 2595, leads: 9840, concorrentes: 1890 },
  marketCount: 127
}
```

**Endpoint Secundário:** `trpc.marketView.getMarketEntities`

Busca entidades de um mercado específico:

**Input:**

```typescript
{
  mercadoId: number;
  entityType: 'clientes' | 'leads' | 'concorrentes';
  projectId?: number;
  pesquisaId?: number;
  page?: number;
  pageSize?: number;
}
```

**Output:**

```typescript
{
  market: {
    id: 1,
    nome: 'SaaS Empresarial',
    segmentacao: 'B2B',
    categoria: 'Software',
    tamanhoMercado: 'R$ 5-10 bilhões',
    crescimentoAnual: '15%',
    tendencias: 'Cloud-first, IA integrada, Mobile',
    principaisPlayers: 'Salesforce, Microsoft, Oracle'
  },
  entities: [...],
  total: 120,
  page: 1,
  pageSize: 20,
  totalPages: 6
}
```

### 7.2 Queries SQL

**Query Principal (Hierárquica):**

```sql
WITH market_entities AS (
  SELECT
    m.id as mercado_id,
    m.nome as mercado_nome,
    m.segmentacao,
    m.categoria,
    c.setor,
    COUNT(DISTINCT c.id) as total_clientes,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT co.id) as total_concorrentes
  FROM mercados_unicos m
  LEFT JOIN clientes c ON c.mercadoId = m.id
  LEFT JOIN leads l ON l.mercadoId = m.id
  LEFT JOIN concorrentes co ON co.mercadoId = m.id
  WHERE m.projectId = $1
    AND ($2::int IS NULL OR m.pesquisaId = $2)
  GROUP BY m.id, m.nome, m.segmentacao, m.categoria, c.setor
)
SELECT * FROM market_entities
ORDER BY segmentacao, setor, categoria, mercado_nome;
```

### 7.3 Componentes React

**Estrutura de Componentes:**

```
MarketView/
├─ MarketDrillTable.tsx          # Componente principal
├─ SegmentationRow.tsx           # Linha de segmentação (nível 1)
├─ SectorRow.tsx                 # Linha de setor (nível 2)
├─ CategoryRow.tsx               # Linha de categoria (nível 3)
├─ MarketRow.tsx                 # Linha de mercado (nível 4)
├─ MarketDetailCard.tsx          # Card de detalhes do mercado
├─ MarketStatsPanel.tsx          # Painel de estatísticas
├─ EntityListModal.tsx           # Modal com lista de entidades
└─ MarketFilters.tsx             # Painel de filtros
```

### 7.4 Estado da Aplicação

```typescript
const [expandedSegmentations, setExpandedSegmentations] = useState<Set<string>>(new Set());
const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
const [selectedMarket, setSelectedMarket] = useState<number | null>(null);
const [activeTab, setActiveTab] = useState<'clientes' | 'leads' | 'concorrentes'>('clientes');
const [filters, setFilters] = useState({
  projectId: undefined,
  pesquisaId: undefined,
  segmentacao: [],
  setor: undefined,
  porte: [],
  qualidade: [],
  uf: undefined,
});
```

---

## 8. Vantagens e Benefícios

### Comparação com Outras Visualizações

| Aspecto                 | Geoposição               | Visão Mercados                          | Vantagem                       |
| ----------------------- | ------------------------ | --------------------------------------- | ------------------------------ |
| **Organização**         | Geográfica               | Por mercado                             | Análise estratégica            |
| **Níveis**              | 3 (Região→Estado→Cidade) | 4 (Segmentação→Setor→Categoria→Mercado) | Maior granularidade            |
| **Foco**                | Localização              | Características de negócio              | Insights de mercado            |
| **Análise Competitiva** | Limitada                 | Completa                                | Identificação de oportunidades |
| **Segmentação**         | Não disponível           | Nativa                                  | Filtros mais relevantes        |

### Benefícios Estratégicos

**Para Análise de Mercado:**

- Identificação rápida de mercados com alta concentração de leads
- Visualização clara da distribuição por segmentação (B2B vs B2C)
- Análise de penetração por setor e categoria
- Identificação de mercados sub-explorados

**Para Tomada de Decisão:**

- Priorização de mercados com base em dados quantitativos
- Análise de competitividade por mercado
- Identificação de tendências e oportunidades
- Planejamento estratégico baseado em segmentação

**Para Operação:**

- Navegação intuitiva e rápida
- Filtros relevantes para análise de negócio
- Exportação de dados para apresentações
- Reutilização de componentes (manutenção simplificada)

---

## 9. Fluxo de Uso

### Cenário 1: Análise Exploratória

1. Usuário acessa "Visão Mercados" no menu
2. Visualiza segmentações (B2B, B2C, B2B2C, B2G) com totalizadores
3. Clica em "B2B" para expandir setores
4. Clica em "Serviços" para expandir categorias
5. Clica em "Software" para expandir mercados
6. Duplo clique em "SaaS Empresarial" para ver entidades
7. Clica em uma entidade para ver detalhes completos

### Cenário 2: Análise Focada

1. Usuário aplica filtros: Projeto X, Setor "Tecnologia", Porte "Grande"
2. Sistema filtra e exibe apenas dados relevantes
3. Usuário navega pela hierarquia filtrada
4. Identifica mercado "Cloud Computing B2B"
5. Duplo clique para ver leads de alta qualidade
6. Exporta lista para Excel para análise externa

### Cenário 3: Análise Comparativa

1. Usuário seleciona aba "Leads"
2. Expande "B2B" → "Serviços" → "Software"
3. Compara quantidade de leads entre mercados
4. Identifica "SaaS Empresarial" com 680 leads
5. Troca para aba "Concorrentes"
6. Verifica 120 concorrentes no mesmo mercado
7. Analisa competitividade e toma decisão estratégica

---

## 10. Implementação

### Fase 1: API e Queries (2-3 horas)

**Tarefas:**

1. Criar router `marketViewRouter` em `/server/routers/market-view.ts`
2. Implementar endpoint `getHierarchicalData`
3. Implementar endpoint `getMarketEntities`
4. Criar queries SQL otimizadas com agregações
5. Adicionar tratamento de filtros
6. Integrar no `appRouter` principal

**Entregável:** API funcional retornando dados hierárquicos

### Fase 2: Componentes Base (3-4 horas)

**Tarefas:**

1. Criar `MarketDrillTable.tsx` (componente principal)
2. Implementar `SegmentationRow.tsx`
3. Implementar `SectorRow.tsx`
4. Implementar `CategoryRow.tsx`
5. Implementar `MarketRow.tsx`
6. Adicionar lógica de expansão/colapso
7. Implementar totalizadores

**Entregável:** Tabela hierárquica funcional

### Fase 3: Funcionalidades Avançadas (2-3 horas)

**Tarefas:**

1. Criar `MarketDetailCard.tsx`
2. Criar `MarketStatsPanel.tsx`
3. Criar `EntityListModal.tsx`
4. Implementar duplo clique em mercados
5. Integrar com `EntityDetailCard` existente
6. Adicionar animações de transição

**Entregável:** Navegação completa com cards

### Fase 4: Filtros e Exportação (2 horas)

**Tarefas:**

1. Criar `MarketFilters.tsx`
2. Implementar filtros globais
3. Adicionar busca inteligente
4. Implementar exportação Excel
5. Implementar exportação CSV
6. Adicionar botões de ação

**Entregável:** Filtros e exportação funcionais

### Fase 5: Página e Integração (1-2 horas)

**Tarefas:**

1. Criar página `/app/(app)/market-view/page.tsx`
2. Integrar todos os componentes
3. Adicionar tabs (Clientes/Leads/Concorrentes)
4. Configurar roteamento
5. Adicionar item no menu sidebar
6. Testar navegação completa

**Entregável:** Página completa e integrada

### Fase 6: Testes e Refinamentos (1-2 horas)

**Tarefas:**

1. Testar com dados reais
2. Validar performance com grandes volumes
3. Ajustar responsividade mobile
4. Corrigir bugs identificados
5. Otimizar queries se necessário
6. Documentar funcionalidade

**Entregável:** Funcionalidade testada e documentada

---

## 11. Checklist de Implementação

### Backend

- [ ] Criar router `marketViewRouter`
- [ ] Implementar endpoint `getHierarchicalData`
- [ ] Implementar endpoint `getMarketEntities`
- [ ] Criar queries SQL com agregações
- [ ] Adicionar suporte a filtros
- [ ] Integrar no `appRouter`
- [ ] Testar endpoints com Postman/Thunder

### Frontend - Componentes

- [ ] Criar `MarketDrillTable.tsx`
- [ ] Criar `SegmentationRow.tsx`
- [ ] Criar `SectorRow.tsx`
- [ ] Criar `CategoryRow.tsx`
- [ ] Criar `MarketRow.tsx`
- [ ] Criar `MarketDetailCard.tsx`
- [ ] Criar `MarketStatsPanel.tsx`
- [ ] Criar `EntityListModal.tsx`
- [ ] Criar `MarketFilters.tsx`

### Frontend - Funcionalidades

- [ ] Implementar lógica de expansão/colapso
- [ ] Implementar totalizadores
- [ ] Implementar duplo clique em mercados
- [ ] Implementar tabs (Clientes/Leads/Concorrentes)
- [ ] Implementar filtros globais
- [ ] Implementar busca inteligente
- [ ] Implementar exportação Excel
- [ ] Implementar exportação CSV

### Integração

- [ ] Criar página `/market-view`
- [ ] Adicionar item no menu sidebar
- [ ] Configurar roteamento
- [ ] Integrar com tRPC
- [ ] Adicionar tratamento de erros
- [ ] Adicionar loading states

### Testes e Qualidade

- [ ] Testar com dados reais
- [ ] Validar performance
- [ ] Testar responsividade mobile
- [ ] Validar acessibilidade
- [ ] Revisar código
- [ ] Documentar funcionalidade

---

## 12. Métricas de Sucesso

### KPIs de Uso

| Métrica                        | Meta          | Medição                         |
| ------------------------------ | ------------- | ------------------------------- |
| **Tempo médio de navegação**   | < 30 segundos | Analytics de uso                |
| **Taxa de expansão de níveis** | > 60%         | Eventos de clique               |
| **Taxa de duplo clique**       | > 40%         | Eventos de abertura de cards    |
| **Uso de filtros**             | > 50%         | Aplicação de filtros por sessão |
| **Exportações realizadas**     | > 20/semana   | Contador de downloads           |

### KPIs de Performance

| Métrica                           | Meta         | Medição                 |
| --------------------------------- | ------------ | ----------------------- |
| **Tempo de carregamento inicial** | < 2 segundos | Performance API         |
| **Tempo de expansão de nível**    | < 500ms      | Medição de renderização |
| **Tempo de query SQL**            | < 1 segundo  | Logs de backend         |
| **Tamanho do payload**            | < 500KB      | Network inspector       |

---

## 13. Conclusão

A funcionalidade **Visão Mercados** complementa perfeitamente a **Geoposição**, oferecendo uma perspectiva estratégica e orientada a negócios para análise de inteligência de mercado. Enquanto a Geoposição responde "onde estão", a Visão Mercados responde "em quais mercados estão" e "como estão distribuídos por características de negócio".

### Valor Agregado

A implementação desta funcionalidade permitirá aos usuários:

**Identificar oportunidades** através da análise de mercados com alta concentração de leads e baixa presença de concorrentes. A visualização hierárquica facilita a descoberta de nichos sub-explorados e mercados emergentes com potencial de crescimento.

**Tomar decisões estratégicas** baseadas em dados quantitativos sobre distribuição de entidades por segmentação, setor e categoria. A capacidade de comparar rapidamente diferentes mercados acelera o processo de priorização e alocação de recursos.

**Otimizar operações** através de filtros relevantes e navegação intuitiva que reduzem o tempo necessário para encontrar informações específicas. A reutilização de componentes garante consistência e facilita manutenção futura.

### Recomendação

**Implementar imediatamente** após conclusão da funcionalidade de Geoposição, aproveitando a experiência adquirida e os componentes reutilizáveis já desenvolvidos. A arquitetura modular permite desenvolvimento incremental e testes contínuos.

**Tempo estimado de implementação:** 11-16 horas (aproximadamente 2 dias de trabalho)

**Prioridade:** Alta - Funcionalidade estratégica com alto valor para análise de negócio

---

**Documento criado por Manus AI**  
**Versão 1.0 - 30 de Novembro de 2025**
