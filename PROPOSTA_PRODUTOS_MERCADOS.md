# Proposta: Produtos & Mercados - Drill-Down Hierárquico

**Autor:** Manus AI  
**Data:** 30 de Novembro de 2025  
**Projeto:** IntelMarket - Inteligência de Mercado  
**Versão:** 1.0

---

## 1. Visão Geral

Esta proposta apresenta uma funcionalidade inovadora de análise de produtos através de uma **tabela drill-down hierárquica** que organiza dados de Clientes, Leads e Concorrentes partindo de produtos específicos e expandindo para distribuição geográfica, oferecendo uma visão produto-cêntrica complementar às análises existentes.

### Objetivos

A funcionalidade **Produtos & Mercados** visa proporcionar uma análise estruturada que parte do produto como ponto focal, permitindo entender sua distribuição geográfica e identificar onde cada produto tem maior penetração, quais regiões apresentam oportunidades inexploradas e como a concorrência está distribuída geograficamente para cada produto.

### Diferencial Estratégico

Esta funcionalidade inverte a lógica tradicional de análise geográfica. Enquanto **Geoposição** pergunta "quem está em cada região?", e **Visão Mercados** pergunta "quem está em cada mercado?", a funcionalidade **Produtos & Mercados** pergunta "onde cada produto está presente?" e "onde podemos expandir cada produto?". Esta perspectiva é fundamental para estratégias de expansão territorial de produtos específicos.

### Casos de Uso

**Planejamento de Expansão:** Identificar regiões com baixa penetração de um produto específico mas com potencial de mercado (presença de leads qualificados).

**Análise Competitiva por Produto:** Entender onde os concorrentes estão oferecendo produtos similares e identificar regiões com menor competição.

**Otimização de Portfólio:** Identificar produtos com distribuição geográfica limitada que podem ser expandidos para novas regiões.

**Estratégia Regional:** Definir quais produtos priorizar em cada região com base na presença atual de clientes, leads e concorrentes.

---

## 2. Estrutura Hierárquica

### Níveis de Drill-Down

A tabela será organizada em **quatro níveis hierárquicos** que partem do produto e expandem geograficamente:

| Nível                | Descrição                                | Exemplos                                    | Campo no Banco       |
| -------------------- | ---------------------------------------- | ------------------------------------------- | -------------------- |
| **Nível 1: Produto** | Produto específico como ponto de partida | ERP Cloud, CRM Mobile, Sistema de Logística | `nome` (produtos)    |
| **Nível 2: Região**  | Agrupamento macro-geográfico             | Sul, Sudeste, Centro-Oeste, Nordeste, Norte | Derivado de `uf`     |
| **Nível 3: Estado**  | Unidades federativas                     | SP, RJ, MG, RS, SC, PR                      | `uf` (entidades)     |
| **Nível 4: Cidade**  | Municípios específicos                   | São Paulo, Curitiba, Porto Alegre           | `cidade` (entidades) |

### Lógica de Agrupamento

A estrutura hierárquica combina dados das tabelas `produtos`, `clientes`, `leads` e `concorrentes`:

**Nível 1 - Produto:**

- Lista produtos únicos da tabela `produtos`
- Agrupa por `produtos.nome` e `produtos.categoria`
- Calcula totais de clientes com o produto
- Identifica leads e concorrentes com produtos similares (matching por categoria/nome)

**Nível 2 - Região:**

- Agrupa entidades por região geográfica (IBGE)
- Mapeia `uf` para região usando tabela de referência
- Calcula totais por região para o produto selecionado

**Nível 3 - Estado:**

- Lista estados dentro da região
- Mostra distribuição do produto por UF
- Calcula totais por estado

**Nível 4 - Cidade:**

- Lista cidades dentro do estado
- Mostra presença do produto em cada município
- Permite duplo clique para ver entidades específicas

### Exemplo de Hierarquia

```
ERP Cloud (245 clientes, 1.240 leads, 180 concorrentes)
  ├─ Sudeste (120 clientes, 680 leads, 95 concorrentes)
  │   ├─ SP (85 clientes, 480 leads, 65 concorrentes)
  │   │   ├─ São Paulo (52 clientes, 280 leads, 40 concorrentes)
  │   │   ├─ Campinas (18 clientes, 120 leads, 15 concorrentes)
  │   │   └─ Santos (15 clientes, 80 leads, 10 concorrentes)
  │   ├─ RJ (25 clientes, 140 leads, 20 concorrentes)
  │   │   ├─ Rio de Janeiro (18 clientes, 95 leads, 15 concorrentes)
  │   │   └─ Niterói (7 clientes, 45 leads, 5 concorrentes)
  │   └─ MG (10 clientes, 60 leads, 10 concorrentes)
  │       └─ Belo Horizonte (10 clientes, 60 leads, 10 concorrentes)
  ├─ Sul (65 clientes, 320 leads, 45 concorrentes)
  │   ├─ PR (30 clientes, 150 leads, 20 concorrentes)
  │   ├─ SC (20 clientes, 95 leads, 15 concorrentes)
  │   └─ RS (15 clientes, 75 leads, 10 concorrentes)
  └─ Centro-Oeste (35 clientes, 140 leads, 25 concorrentes)

CRM Mobile (180 clientes, 890 leads, 120 concorrentes)
  ├─ Sudeste (95 clientes, 480 leads, 65 concorrentes)
  └─ Sul (45 clientes, 220 leads, 30 concorrentes)

Sistema de Logística (320 clientes, 1.580 leads, 240 concorrentes)
  └─ ...
```

### Relacionamento entre Produtos e Entidades

**Clientes:**

- Relacionamento direto via `produtos.clienteId`
- Um cliente pode ter múltiplos produtos
- Localização vem de `clientes.cidade` e `clientes.uf`

**Leads:**

- Relacionamento indireto via `produtos.mercadoId` = `leads.mercadoId`
- Leads são potenciais compradores de produtos do mercado
- Matching adicional por categoria/setor

**Concorrentes:**

- Relacionamento indireto via `produtos.mercadoId` = `concorrentes.mercadoId`
- Concorrentes oferecem produtos similares no mesmo mercado
- Matching por categoria de produto

---

## 3. Abas de Entidades

Cada nível da hierarquia terá **três abas** para filtrar os dados por tipo de entidade, mantendo consistência com funcionalidades anteriores:

### Aba 1: Clientes 🏢

Exibe clientes que **possuem o produto** no nível selecionado.

**Informações Exibidas:**

- Nome da empresa
- CNPJ
- Produtos adquiridos (quantidade)
- Data de aquisição
- Localização (Cidade/UF)
- Valor do contrato (se disponível)
- Status do relacionamento

**Métricas Específicas:**

- Tempo de uso do produto
- Nível de satisfação (se disponível)
- Produtos complementares adquiridos
- Potencial de upsell

**Ações:**

- Duplo clique para abrir card de detalhes
- Visualizar histórico de produtos
- Ver oportunidades de cross-sell

### Aba 2: Leads 🎯

Exibe leads que são **potenciais compradores do produto** no nível selecionado.

**Informações Exibidas:**

- Nome da empresa
- Setor e Porte
- Qualidade do lead (Alta, Média, Baixa)
- Localização (Cidade/UF)
- Mercado de origem
- Fit com o produto (score)

**Métricas Específicas:**

- Probabilidade de conversão
- Produtos de interesse
- Stage no funil
- Concorrentes em avaliação

**Ações:**

- Duplo clique para abrir card de detalhes
- Visualizar score de fit com produto
- Iniciar processo de conversão
- Ver histórico de interações

### Aba 3: Concorrentes 📊

Exibe concorrentes que **oferecem produtos similares** no nível selecionado.

**Informações Exibidas:**

- Nome da empresa
- Produtos oferecidos
- Localização (Cidade/UF)
- Porte estimado
- Presença de mercado
- Diferenciais conhecidos

**Métricas Específicas:**

- Quantidade de produtos similares
- Overlap de mercado
- Vantagens competitivas
- Pricing (se disponível)

**Ações:**

- Duplo clique para abrir card de detalhes
- Análise competitiva detalhada
- Comparação de características
- Ver market share estimado

---

## 4. Visualização: Tabela Drill-Down + Cards

### 4.1 Modo de Visualização Hierárquica

A página oferecerá visualização hierárquica com expansão progressiva partindo do produto:

**Navegação por Níveis:**

1. **Nível 1 (Produto):** Visão inicial listando todos os produtos cadastrados
   - Ordenação padrão: por quantidade de clientes (decrescente)
   - Opções de ordenação: alfabética, por quantidade de leads, por região com maior presença
   - Filtros: categoria, mercado, status (ativo/inativo)

2. **Nível 2 (Região):** Clique expande para mostrar distribuição por região
   - Exibe: Sul, Sudeste, Centro-Oeste, Nordeste, Norte
   - Totalizadores por região
   - Indicador visual de concentração (heatmap simplificado)

3. **Nível 3 (Estado):** Clique expande para mostrar estados da região
   - Lista UFs com presença do produto
   - Totalizadores por estado
   - Comparação percentual entre estados

4. **Nível 4 (Cidade):** Clique expande para mostrar cidades do estado
   - Lista municípios com presença do produto
   - Totalizadores por cidade
   - Duplo clique abre cards com entidades

**Duplo Clique para Cards:**

- Ao dar **duplo clique** em uma cidade:
  1. Abre modal com visualização em cards
  2. Exibe entidades (clientes/leads/concorrentes) relacionadas ao produto naquela cidade
  3. Reutiliza `EntityDetailCard` para detalhes individuais
  4. Mostra informações específicas do produto no contexto da entidade

**Fluxo Completo:**

```
Lista de Produtos
  └─ Clique em "ERP Cloud"
      └─ Expande Regiões (Sudeste, Sul, Centro-Oeste...)
          └─ Clique em "Sudeste"
              └─ Expande Estados (SP, RJ, MG...)
                  └─ Clique em "SP"
                      └─ Expande Cidades (São Paulo, Campinas...)
                          └─ Duplo clique em "São Paulo"
                              └─ Abre Cards com clientes/leads/concorrentes
                                  └─ Clique em "Empresa A"
                                      └─ Abre DetailModal com informações completas
```

### 4.2 Componentes Reutilizados

Mantendo consistência com funcionalidades anteriores:

| Componente         | Localização                                | Uso                                       |
| ------------------ | ------------------------------------------ | ----------------------------------------- |
| `EntityDetailCard` | `/components/map/EntityDetailCard.tsx`     | Modal de detalhes de entidades            |
| `ErrorBoundary`    | `/components/ErrorBoundary.tsx`            | Tratamento de erros                       |
| Padrão Drill-Down  | Baseado em `GeoTable` e `MarketDrillTable` | Estrutura hierárquica com expand/collapse |

**Novos Componentes a Criar:**

| Componente               | Responsabilidade                                     |
| ------------------------ | ---------------------------------------------------- |
| `ProductDrillTable`      | Tabela hierárquica principal para produtos           |
| `ProductRow`             | Linha de produto (nível 1) com informações agregadas |
| `ProductDetailCard`      | Card com informações detalhadas do produto           |
| `ProductDistributionMap` | Visualização geográfica simplificada (opcional)      |
| `ProductStatsPanel`      | Painel com estatísticas e métricas do produto        |

### 4.3 Informações Adicionais por Produto

Ao expandir um produto, além dos totalizadores, exibir:

**Métricas de Produto:**

- Total de clientes ativos
- Total de leads qualificados
- Total de concorrentes identificados
- Categoria do produto
- Mercados onde está presente
- Taxa de conversão (leads → clientes)

**Distribuição Geográfica:**

- Região com maior presença
- Estados com maior concentração
- Cidades com maior penetração
- Regiões com oportunidades (muitos leads, poucos clientes)

**Análise Competitiva:**

- Quantidade de concorrentes por região
- Market share estimado
- Regiões com baixa competição
- Oportunidades de expansão

---

## 5. Funcionalidades

### 5.1 Expansão/Colapso Hierárquica

- **Produto:** Clique para expandir e ver Regiões
- **Região:** Clique para expandir e ver Estados
- **Estado:** Clique para expandir e ver Cidades
- **Cidade:** Duplo clique para abrir cards com entidades

**Comportamento Inteligente:**

- Ao expandir um produto, carrega dados de regiões sob demanda
- Ao expandir uma região, carrega dados de estados sob demanda
- Ao expandir um estado, carrega dados de cidades sob demanda
- Cache de dados expandidos para navegação rápida

### 5.2 Totalizadores e Métricas

Cada linha mostrará totalizadores agregados:

```
ERP Cloud (245 clientes, 1.240 leads, 180 concorrentes)
  ├─ Sudeste (120 clientes, 680 leads, 95 concorrentes) [49% dos clientes]
  │   ├─ SP (85 clientes, 480 leads, 65 concorrentes) [71% da região]
  │   │   └─ São Paulo (52 clientes, 280 leads, 40 concorrentes) [61% do estado]
```

**Métricas Adicionais:**

- Percentual em relação ao nível superior
- Taxa de conversão (leads/clientes) por região
- Índice de competitividade (concorrentes/clientes)
- Tendência de crescimento (se histórico disponível)

### 5.3 Filtros Globais

Painel de filtros no topo da página:

| Filtro        | Descrição                               | Tipo         |
| ------------- | --------------------------------------- | ------------ |
| **Projeto**   | Filtra por projeto específico           | Dropdown     |
| **Pesquisa**  | Filtra por pesquisa dentro do projeto   | Dropdown     |
| **Categoria** | Filtra produtos por categoria           | Multi-select |
| **Mercado**   | Filtra por mercado de origem            | Dropdown     |
| **Região**    | Filtra por região geográfica            | Multi-select |
| **Estado**    | Filtra por UF específica                | Multi-select |
| **Status**    | Filtra produtos ativos/inativos         | Toggle       |
| **Ordenação** | Ordena por: clientes, leads, alfabética | Dropdown     |

**Filtros Avançados (Expansível):**

- Faixa de quantidade de clientes (min-max)
- Faixa de quantidade de leads (min-max)
- Produtos com/sem concorrentes
- Produtos com oportunidades (muitos leads, poucos clientes)

### 5.4 Busca Inteligente

Campo de busca com múltiplas funcionalidades:

**Busca por:**

- Nome do produto (busca parcial, case-insensitive)
- Categoria do produto
- Nome de cidade
- Nome de estado
- Nome de entidade (cliente/lead/concorrente)

**Sugestões Automáticas:**

- Produtos mais buscados
- Produtos com maior crescimento
- Produtos com oportunidades de expansão

### 5.5 Visualizações Complementares

**Mapa de Calor (Heatmap):**

- Visualização opcional ao lado da tabela
- Mostra intensidade de presença do produto por região
- Cores: Verde (alta presença) → Amarelo (média) → Vermelho (baixa)
- Clique na região do mapa sincroniza com tabela

**Gráfico de Distribuição:**

- Gráfico de barras mostrando top 10 estados por produto
- Gráfico de pizza mostrando distribuição por região
- Gráfico de linha mostrando evolução temporal (se histórico disponível)

### 5.6 Exportação

Botões para exportar dados com foco em produtos:

**Excel (.xlsx):**

- Aba 1: Resumo de produtos (totalizadores gerais)
- Aba 2: Distribuição geográfica por produto
- Aba 3: Lista de clientes por produto e região
- Aba 4: Lista de leads por produto e região
- Aba 5: Lista de concorrentes por produto e região
- Formatação condicional e gráficos embutidos

**CSV:**

- Dados planificados com colunas hierárquicas
- Formato: Produto | Categoria | Região | Estado | Cidade | Clientes | Leads | Concorrentes
- Encoding UTF-8 com BOM para compatibilidade

**PDF:**

- Relatório executivo por produto
- Análise de distribuição geográfica
- Gráficos e visualizações
- Recomendações de expansão
- Análise competitiva

**PowerPoint (.pptx):**

- Apresentação automática com slides por produto
- Slide 1: Visão geral do produto
- Slide 2: Distribuição geográfica (mapa)
- Slide 3: Top 10 cidades
- Slide 4: Análise competitiva
- Slide 5: Oportunidades de expansão

---

## 6. Interface Visual

### Layout Proposto

```
┌───────────────────────────────────────────────────────────────────────────┐
│  📦 Produtos & Mercados                            [🔍 Buscar] [📥]       │
├───────────────────────────────────────────────────────────────────────────┤
│  Filtros: [Projeto ▼] [Pesquisa ▼] [Categoria ☑] [Mercado ▼]            │
│           [Região ☑] [Estado ☑] [Status: Ativo ⚫]  [Limpar Filtros]     │
│  Ordenar por: [Qtd. Clientes ▼]                                          │
├───────────────────────────────────────────────────────────────────────────┤
│  Abas: [🏢 Clientes] [🎯 Leads] [📊 Concorrentes]                         │
├───────────────────────────────────────────────────────────────────────────┤
│  ▼ ERP Cloud (245 clientes, 1.240 leads, 180 concorrentes)               │
│    ▼ Sudeste (120 clientes, 680 leads, 95 concorrentes) [49%]            │
│      ▼ SP (85 clientes, 480 leads, 65 concorrentes) [71% da região]      │
│        ▶ São Paulo (52 clientes, 280 leads, 40 concorrentes)             │
│        ▶ Campinas (18 clientes, 120 leads, 15 concorrentes)              │
│        ▶ Santos (15 clientes, 80 leads, 10 concorrentes)                 │
│      ▶ RJ (25 clientes, 140 leads, 20 concorrentes)                      │
│      ▶ MG (10 clientes, 60 leads, 10 concorrentes)                       │
│    ▶ Sul (65 clientes, 320 leads, 45 concorrentes) [27%]                 │
│    ▶ Centro-Oeste (35 clientes, 140 leads, 25 concorrentes) [14%]        │
│  ▶ CRM Mobile (180 clientes, 890 leads, 120 concorrentes)                │
│  ▶ Sistema de Logística (320 clientes, 1.580 leads, 240 concorrentes)    │
│  ▶ Plataforma de Vendas (145 clientes, 620 leads, 95 concorrentes)       │
├───────────────────────────────────────────────────────────────────────────┤
│  Total: 890 clientes | 4.330 leads | 635 concorrentes | 47 produtos      │
│  [📊 Ver Gráficos] [🗺️ Ver Mapa]  [Excel] [CSV] [PDF] [PowerPoint]      │
└───────────────────────────────────────────────────────────────────────────┘
```

### Cores e Ícones

Mantendo consistência com funcionalidades anteriores:

| Tipo             | Cor Principal      | Cor Secundária           | Ícone |
| ---------------- | ------------------ | ------------------------ | ----- |
| **Clientes**     | Azul (#3B82F6)     | Azul Claro (#DBEAFE)     | 🏢    |
| **Leads**        | Verde (#10B981)    | Verde Claro (#D1FAE5)    | 🎯    |
| **Concorrentes** | Vermelho (#EF4444) | Vermelho Claro (#FEE2E2) | 📊    |
| **Produtos**     | Roxo (#8B5CF6)     | Roxo Claro (#EDE9FE)     | 📦    |

**Indicadores Visuais Específicos:**

- 🎯 Oportunidade de expansão (muitos leads, poucos clientes)
- 🏆 Produto líder (maior quantidade de clientes)
- 📈 Crescimento acelerado (>20% no último período)
- ⚠️ Baixa penetração (<10 clientes)
- 🔥 Alta competição (concorrentes > clientes)
- ✨ Baixa competição (concorrentes < 50% dos clientes)

### Estados Visuais

**Linha de Produto (Nível 1):**

- Fundo: Gradiente roxo suave
- Fonte: Bold, tamanho 16px
- Ícone: 📦 + Chevron expansível
- Badge: Categoria do produto
- Métricas: Totalizadores em destaque

**Linha de Região (Nível 2):**

- Fundo: Branco com borda esquerda roxa
- Fonte: Semibold, tamanho 14px
- Indentação: 20px
- Badge: Percentual em relação ao total
- Ícone: 🗺️ + Chevron

**Linha de Estado (Nível 3):**

- Fundo: Cinza claro (#F9FAFB)
- Fonte: Medium, tamanho 13px
- Indentação: 40px
- Badge: Percentual em relação à região
- Ícone: 📍 + Chevron

**Linha de Cidade (Nível 4):**

- Fundo: Branco
- Fonte: Regular, tamanho 12px
- Indentação: 60px
- Badge: Percentual em relação ao estado
- Hover: Fundo azul claro
- Cursor: Pointer (indica duplo clique)
- Ícone: 📌

---

## 7. Arquitetura Técnica

### 7.1 API Endpoints

**Endpoint Principal:** `trpc.productView.getHierarchicalData`

**Input:**

```typescript
{
  projectId?: number;
  pesquisaId?: number;
  entityType: 'clientes' | 'leads' | 'concorrentes';
  filters?: {
    categoria?: string[];
    mercadoId?: number;
    regiao?: string[];
    uf?: string[];
    status?: 'ativo' | 'inativo' | 'todos';
  };
  orderBy?: 'clientes' | 'leads' | 'alfabetica';
}
```

**Output:**

```typescript
{
  products: [
    {
      id: 1,
      nome: 'ERP Cloud',
      categoria: 'Software',
      mercadoId: 5,
      status: 'ativo',
      regions: [
        {
          name: 'Sudeste',
          states: [
            {
              uf: 'SP',
              cities: [
                {
                  name: 'São Paulo',
                  totals: { clientes: 52, leads: 280, concorrentes: 40 }
                }
              ],
              totals: { clientes: 85, leads: 480, concorrentes: 65 }
            }
          ],
          totals: { clientes: 120, leads: 680, concorrentes: 95 }
        }
      ],
      totals: { clientes: 245, leads: 1240, concorrentes: 180 },
      percentage: 27.5  // % em relação ao total de clientes
    }
  ],
  grandTotals: { clientes: 890, leads: 4330, concorrentes: 635 },
  productCount: 47
}
```

**Endpoint Secundário:** `trpc.productView.getProductEntities`

Busca entidades de um produto em uma cidade específica:

**Input:**

```typescript
{
  produtoId: number;
  cidade: string;
  uf: string;
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
  product: {
    id: 1,
    nome: 'ERP Cloud',
    categoria: 'Software',
    descricao: 'Sistema ERP completo em nuvem',
    mercadoId: 5
  },
  location: {
    cidade: 'São Paulo',
    uf: 'SP',
    regiao: 'Sudeste'
  },
  entities: [...],
  total: 52,
  page: 1,
  pageSize: 20,
  totalPages: 3
}
```

**Endpoint Terciário:** `trpc.productView.getProductStats`

Busca estatísticas detalhadas de um produto:

**Input:**

```typescript
{
  produtoId: number;
  projectId?: number;
  pesquisaId?: number;
}
```

**Output:**

```typescript
{
  product: {
    id: 1,
    nome: 'ERP Cloud',
    categoria: 'Software'
  },
  stats: {
    totalClientes: 245,
    totalLeads: 1240,
    totalConcorrentes: 180,
    taxaConversao: 19.8,  // % (clientes/leads)
    regiaoMaiorPresenca: 'Sudeste',
    estadoMaiorPresenca: 'SP',
    cidadeMaiorPresenca: 'São Paulo',
    regioesComOportunidade: ['Norte', 'Centro-Oeste'],  // muitos leads, poucos clientes
    indiceCompetitividade: 0.73  // concorrentes/clientes
  },
  distribution: {
    byRegion: [...],
    byState: [...],
    byCity: [...]
  }
}
```

### 7.2 Queries SQL

**Query Principal (Produtos com Distribuição Geográfica):**

```sql
WITH product_distribution AS (
  SELECT
    p.id as produto_id,
    p.nome as produto_nome,
    p.categoria,
    p.mercadoId,
    c.uf,
    c.cidade,
    COUNT(DISTINCT c.id) as total_clientes,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT co.id) as total_concorrentes
  FROM produtos p
  LEFT JOIN clientes c ON c.id = p.clienteId
  LEFT JOIN leads l ON l.mercadoId = p.mercadoId AND l.uf = c.uf AND l.cidade = c.cidade
  LEFT JOIN concorrentes co ON co.mercadoId = p.mercadoId AND co.uf = c.uf AND co.cidade = c.cidade
  WHERE p.projectId = $1
    AND ($2::int IS NULL OR p.pesquisaId = $2)
    AND p.ativo = 1
  GROUP BY p.id, p.nome, p.categoria, p.mercadoId, c.uf, c.cidade
)
SELECT * FROM product_distribution
ORDER BY produto_nome, uf, cidade;
```

**Query de Agregação por Região:**

```sql
WITH uf_to_region AS (
  SELECT uf,
    CASE
      WHEN uf IN ('PR', 'SC', 'RS') THEN 'Sul'
      WHEN uf IN ('SP', 'RJ', 'MG', 'ES') THEN 'Sudeste'
      WHEN uf IN ('DF', 'GO', 'MT', 'MS') THEN 'Centro-Oeste'
      WHEN uf IN ('BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA') THEN 'Nordeste'
      WHEN uf IN ('AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
    END as regiao
  FROM (SELECT DISTINCT uf FROM clientes) t
)
SELECT
  pd.produto_id,
  pd.produto_nome,
  r.regiao,
  SUM(pd.total_clientes) as clientes_regiao,
  SUM(pd.total_leads) as leads_regiao,
  SUM(pd.total_concorrentes) as concorrentes_regiao
FROM product_distribution pd
JOIN uf_to_region r ON r.uf = pd.uf
GROUP BY pd.produto_id, pd.produto_nome, r.regiao
ORDER BY pd.produto_nome, r.regiao;
```

### 7.3 Componentes React

**Estrutura de Componentes:**

```
ProductView/
├─ ProductDrillTable.tsx         # Componente principal
├─ ProductRow.tsx                # Linha de produto (nível 1)
├─ RegionRow.tsx                 # Linha de região (nível 2) - reutilizado
├─ StateRow.tsx                  # Linha de estado (nível 3) - reutilizado
├─ CityRow.tsx                   # Linha de cidade (nível 4) - reutilizado
├─ ProductDetailCard.tsx         # Card de detalhes do produto
├─ ProductStatsPanel.tsx         # Painel de estatísticas
├─ ProductDistributionMap.tsx    # Mapa de distribuição (opcional)
├─ EntityListModal.tsx           # Modal com lista de entidades - reutilizado
└─ ProductFilters.tsx            # Painel de filtros
```

### 7.4 Estado da Aplicação

```typescript
const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
const [selectedCity, setSelectedCity] = useState<{
  produto: number;
  cidade: string;
  uf: string;
} | null>(null);
const [activeTab, setActiveTab] = useState<'clientes' | 'leads' | 'concorrentes'>('clientes');
const [filters, setFilters] = useState({
  projectId: undefined,
  pesquisaId: undefined,
  categoria: [],
  mercadoId: undefined,
  regiao: [],
  uf: [],
  status: 'ativo' as 'ativo' | 'inativo' | 'todos',
});
const [orderBy, setOrderBy] = useState<'clientes' | 'leads' | 'alfabetica'>('clientes');
```

---

## 8. Vantagens e Benefícios

### Comparação com Outras Visualizações

| Aspecto                  | Geoposição     | Visão Mercados | Produtos & Mercados | Vantagem Única                  |
| ------------------------ | -------------- | -------------- | ------------------- | ------------------------------- |
| **Ponto de Partida**     | Geografia      | Mercado        | Produto             | Análise produto-cêntrica        |
| **Níveis**               | 3              | 4              | 4                   | Granularidade produto+geografia |
| **Foco**                 | Onde estão     | Que mercados   | Onde cada produto   | Estratégia de produto           |
| **Expansão Territorial** | Não específica | Não específica | Específica          | Planejamento por produto        |
| **Análise de Portfólio** | Limitada       | Média          | Completa            | Otimização de produtos          |

### Benefícios Estratégicos

**Para Gestão de Produtos:**

A funcionalidade permite identificar rapidamente quais produtos têm distribuição geográfica limitada e onde existem oportunidades de expansão. Ao visualizar a presença de cada produto por região, estado e cidade, gestores podem tomar decisões informadas sobre onde investir em marketing, vendas e distribuição para produtos específicos.

**Para Planejamento de Expansão:**

Ao analisar a distribuição geográfica de um produto e cruzar com a presença de leads qualificados, é possível identificar regiões com alto potencial mas baixa penetração atual. Por exemplo, se um produto tem muitos leads no Nordeste mas poucos clientes, isso indica uma oportunidade clara de expansão territorial focada.

**Para Análise Competitiva:**

A visualização de concorrentes por produto e região permite identificar onde a competição é mais intensa e onde existem "oceanos azuis" - regiões com demanda (leads) mas baixa competição. Esta informação é crucial para estratégias de entrada em novos mercados regionais.

**Para Otimização de Portfólio:**

Ao visualizar todos os produtos lado a lado com suas respectivas distribuições geográficas, torna-se evidente quais produtos têm presença nacional e quais são regionais. Esta informação ajuda a decidir quais produtos merecem investimento para expansão e quais devem ser mantidos como ofertas regionais.

**Para Operação de Vendas:**

Equipes de vendas regionais podem usar esta funcionalidade para entender quais produtos já têm presença em sua região e quais são oportunidades de introdução. Ao ver quantos leads existem para produtos ainda não oferecidos localmente, vendedores podem priorizar esforços de prospecção.

### Benefícios Operacionais

**Reutilização de Componentes:**

- Aproveita componentes já desenvolvidos (RegionRow, StateRow, CityRow, EntityDetailCard)
- Reduz tempo de desenvolvimento em aproximadamente 30%
- Garante consistência visual e comportamental
- Facilita manutenção futura

**Performance Otimizada:**

- Carregamento sob demanda (lazy loading) de dados hierárquicos
- Cache de dados expandidos
- Queries SQL otimizadas com índices apropriados
- Paginação de entidades em níveis mais granulares

**Experiência do Usuário:**

- Navegação intuitiva e familiar (mesmo padrão das outras funcionalidades)
- Feedback visual imediato
- Loading states apropriados
- Tratamento robusto de erros

---

## 9. Fluxo de Uso

### Cenário 1: Análise de Distribuição de Produto

**Objetivo:** Entender onde o produto "ERP Cloud" está presente e identificar oportunidades de expansão.

**Passos:**

1. Usuário acessa "Produtos & Mercados" no menu
2. Visualiza lista de produtos ordenados por quantidade de clientes
3. Localiza "ERP Cloud" (245 clientes, 1.240 leads, 180 concorrentes)
4. Clica para expandir e ver distribuição por região
5. Observa que Sudeste tem 49% dos clientes (120 de 245)
6. Identifica que Norte tem apenas 8 clientes mas 95 leads (oportunidade!)
7. Expande Norte → PA → Belém
8. Duplo clique em Belém para ver os 45 leads
9. Analisa qualidade dos leads e decide investir em expansão

**Resultado:** Decisão estratégica de expandir ERP Cloud para região Norte com foco em Belém.

### Cenário 2: Planejamento de Lançamento Regional

**Objetivo:** Decidir em quais regiões lançar o novo produto "CRM Mobile".

**Passos:**

1. Usuário aplica filtro: Categoria "Software", Status "Ativo"
2. Seleciona aba "Leads" para ver demanda potencial
3. Clica em "CRM Mobile" (produto recém-lançado)
4. Expande para ver distribuição de leads por região
5. Identifica: Sudeste (480 leads), Sul (220 leads), Nordeste (180 leads)
6. Compara com presença de concorrentes:
   - Sudeste: 65 concorrentes (alta competição)
   - Sul: 30 concorrentes (média competição)
   - Nordeste: 15 concorrentes (baixa competição!)
7. Decide priorizar lançamento no Nordeste (demanda + baixa competição)
8. Expande Nordeste → BA → Salvador
9. Duplo clique em Salvador (maior cidade) para ver leads
10. Exporta lista de leads para equipe de vendas

**Resultado:** Estratégia de lançamento focada no Nordeste com Salvador como cidade piloto.

### Cenário 3: Análise de Portfólio Regional

**Objetivo:** Entender quais produtos oferecer em uma nova filial em Curitiba.

**Passos:**

1. Usuário aplica filtro: Estado "PR", Cidade "Curitiba"
2. Visualiza todos os produtos com presença em Curitiba
3. Ordena por quantidade de clientes (decrescente)
4. Identifica top 5 produtos:
   - ERP Cloud: 30 clientes
   - Sistema de Logística: 25 clientes
   - CRM Mobile: 18 clientes
   - Plataforma de Vendas: 12 clientes
   - BI Analytics: 8 clientes
5. Troca para aba "Leads" para ver demanda adicional
6. Identifica produtos com muitos leads mas poucos clientes:
   - Automação de Marketing: 2 clientes, 45 leads (oportunidade!)
7. Decide oferecer os top 5 + Automação de Marketing na nova filial
8. Exporta análise completa para PowerPoint

**Resultado:** Portfólio otimizado para nova filial baseado em dados reais de mercado.

### Cenário 4: Análise Competitiva por Produto

**Objetivo:** Avaliar competitividade do produto "Sistema de Logística" por região.

**Passos:**

1. Usuário busca "Sistema de Logística"
2. Clica para expandir distribuição
3. Seleciona aba "Concorrentes"
4. Analisa distribuição de concorrentes:
   - Sudeste: 120 concorrentes, 180 clientes (ratio 0.67)
   - Sul: 45 concorrentes, 85 clientes (ratio 0.53)
   - Centro-Oeste: 25 concorrentes, 55 clientes (ratio 0.45)
5. Identifica Centro-Oeste como região com menor competição
6. Troca para aba "Leads"
7. Verifica 240 leads no Centro-Oeste
8. Expande Centro-Oeste → GO → Goiânia
9. Duplo clique em Goiânia: 8 clientes, 65 leads, 5 concorrentes
10. Decide intensificar esforços de vendas em Goiânia

**Resultado:** Estratégia de vendas focada em região com baixa competição e alta demanda.

---

## 10. Implementação

### Fase 1: API e Queries (3-4 horas)

**Tarefas:**

1. Criar router `productViewRouter` em `/server/routers/product-view.ts`
2. Implementar endpoint `getHierarchicalData`
3. Implementar endpoint `getProductEntities`
4. Implementar endpoint `getProductStats`
5. Criar queries SQL otimizadas com JOINs e agregações
6. Adicionar lógica de mapeamento UF → Região
7. Adicionar tratamento de filtros complexos
8. Implementar ordenação (clientes, leads, alfabética)
9. Integrar no `appRouter` principal
10. Testar endpoints com dados reais

**Entregável:** API funcional retornando dados hierárquicos de produtos

**Desafios Técnicos:**

- Relacionamento indireto entre produtos e leads/concorrentes (via mercadoId)
- Agregação de dados em múltiplos níveis hierárquicos
- Performance com grande quantidade de produtos

### Fase 2: Componentes Base (4-5 horas)

**Tarefas:**

1. Criar `ProductDrillTable.tsx` (componente principal)
2. Implementar `ProductRow.tsx` (nível 1)
3. Reutilizar `RegionRow.tsx` de Geoposição (nível 2)
4. Reutilizar `StateRow.tsx` de Geoposição (nível 3)
5. Reutilizar `CityRow.tsx` de Geoposição (nível 4)
6. Adaptar componentes reutilizados para contexto de produtos
7. Implementar lógica de expansão/colapso hierárquica
8. Implementar totalizadores e percentuais
9. Adicionar indicadores visuais (badges, ícones)
10. Implementar animações de transição

**Entregável:** Tabela hierárquica funcional com 4 níveis

**Reutilização:**

- ~60% dos componentes podem ser reutilizados de Geoposição
- Foco em adaptar ProductRow e integração

### Fase 3: Cards e Modais (2-3 horas)

**Tarefas:**

1. Criar `ProductDetailCard.tsx`
2. Criar `ProductStatsPanel.tsx`
3. Reutilizar `EntityListModal.tsx`
4. Reutilizar `EntityDetailCard.tsx`
5. Implementar duplo clique em cidades
6. Adicionar contexto de produto nos cards
7. Implementar navegação entre cards
8. Adicionar informações específicas de produto
9. Implementar visualização de métricas
10. Adicionar gráficos de distribuição (opcional)

**Entregável:** Sistema completo de cards e modais

### Fase 4: Filtros e Busca (2-3 horas)

**Tarefas:**

1. Criar `ProductFilters.tsx`
2. Implementar filtros globais (projeto, pesquisa, categoria, mercado, região, estado, status)
3. Implementar filtros avançados (faixas, oportunidades)
4. Implementar busca inteligente com sugestões
5. Implementar ordenação (clientes, leads, alfabética)
6. Adicionar lógica de aplicação de filtros
7. Implementar "Limpar Filtros"
8. Adicionar indicadores visuais de filtros ativos
9. Implementar sincronização de filtros com URL (opcional)
10. Testar combinações de filtros

**Entregável:** Sistema completo de filtros e busca

### Fase 5: Exportação (2-3 horas)

**Tarefas:**

1. Implementar exportação Excel com múltiplas abas
2. Implementar exportação CSV planificada
3. Implementar exportação PDF com relatório
4. Implementar exportação PowerPoint (opcional)
5. Adicionar formatação condicional no Excel
6. Adicionar gráficos embutidos no Excel
7. Implementar geração de relatório PDF
8. Adicionar botões de exportação
9. Implementar feedback visual (loading, sucesso, erro)
10. Testar exportações com grandes volumes

**Entregável:** Sistema completo de exportação

### Fase 6: Visualizações Complementares (3-4 horas - Opcional)

**Tarefas:**

1. Criar `ProductDistributionMap.tsx`
2. Implementar mapa de calor (heatmap)
3. Implementar gráfico de barras (top 10 estados)
4. Implementar gráfico de pizza (distribuição por região)
5. Implementar gráfico de linha (evolução temporal)
6. Adicionar sincronização mapa ↔ tabela
7. Implementar toggle de visualização (tabela/mapa/gráficos)
8. Adicionar animações de transição
9. Otimizar performance de renderização
10. Testar em diferentes resoluções

**Entregável:** Visualizações complementares funcionais

### Fase 7: Página e Integração (1-2 horas)

**Tarefas:**

1. Criar página `/app/(app)/product-view/page.tsx`
2. Integrar todos os componentes
3. Adicionar tabs (Clientes/Leads/Concorrentes)
4. Configurar roteamento
5. Adicionar item no menu sidebar ("Produtos & Mercados")
6. Implementar breadcrumbs de navegação
7. Adicionar título e descrição da página
8. Implementar tratamento de erros global
9. Adicionar loading states
10. Testar navegação completa

**Entregável:** Página completa e integrada

### Fase 8: Testes e Refinamentos (2-3 horas)

**Tarefas:**

1. Testar com dados reais de produção
2. Validar performance com grande quantidade de produtos
3. Testar navegação hierárquica completa
4. Validar filtros e combinações
5. Testar exportações
6. Ajustar responsividade mobile
7. Validar acessibilidade (WCAG)
8. Corrigir bugs identificados
9. Otimizar queries SQL se necessário
10. Documentar funcionalidade

**Entregável:** Funcionalidade testada, otimizada e documentada

---

## 11. Checklist de Implementação

### Backend - API

- [ ] Criar router `productViewRouter`
- [ ] Implementar endpoint `getHierarchicalData`
- [ ] Implementar endpoint `getProductEntities`
- [ ] Implementar endpoint `getProductStats`
- [ ] Criar queries SQL com JOINs complexos
- [ ] Implementar agregações por produto/região/estado/cidade
- [ ] Adicionar mapeamento UF → Região
- [ ] Implementar suporte a filtros (categoria, mercado, região, estado, status)
- [ ] Implementar ordenação (clientes, leads, alfabética)
- [ ] Integrar no `appRouter`
- [ ] Adicionar índices no banco para performance
- [ ] Testar endpoints com Postman/Thunder

### Frontend - Componentes

- [ ] Criar `ProductDrillTable.tsx`
- [ ] Criar `ProductRow.tsx`
- [ ] Adaptar `RegionRow.tsx` para contexto de produtos
- [ ] Adaptar `StateRow.tsx` para contexto de produtos
- [ ] Adaptar `CityRow.tsx` para contexto de produtos
- [ ] Criar `ProductDetailCard.tsx`
- [ ] Criar `ProductStatsPanel.tsx`
- [ ] Criar `ProductDistributionMap.tsx` (opcional)
- [ ] Reutilizar `EntityListModal.tsx`
- [ ] Reutilizar `EntityDetailCard.tsx`
- [ ] Criar `ProductFilters.tsx`

### Frontend - Funcionalidades

- [ ] Implementar lógica de expansão/colapso (4 níveis)
- [ ] Implementar totalizadores e percentuais
- [ ] Implementar duplo clique em cidades
- [ ] Implementar tabs (Clientes/Leads/Concorrentes)
- [ ] Implementar filtros globais
- [ ] Implementar filtros avançados
- [ ] Implementar busca inteligente
- [ ] Implementar ordenação
- [ ] Implementar exportação Excel
- [ ] Implementar exportação CSV
- [ ] Implementar exportação PDF
- [ ] Implementar exportação PowerPoint (opcional)
- [ ] Implementar mapa de calor (opcional)
- [ ] Implementar gráficos (opcional)

### Integração

- [ ] Criar página `/product-view`
- [ ] Adicionar item no menu sidebar
- [ ] Configurar roteamento
- [ ] Integrar com tRPC
- [ ] Adicionar tratamento de erros
- [ ] Adicionar loading states
- [ ] Implementar breadcrumbs
- [ ] Adicionar título e descrição

### Testes e Qualidade

- [ ] Testar com dados reais
- [ ] Validar performance (queries SQL)
- [ ] Validar performance (renderização React)
- [ ] Testar navegação hierárquica completa
- [ ] Testar filtros e combinações
- [ ] Testar exportações
- [ ] Testar responsividade mobile
- [ ] Validar acessibilidade (WCAG)
- [ ] Revisar código
- [ ] Documentar funcionalidade
- [ ] Criar guia de usuário

---

## 12. Métricas de Sucesso

### KPIs de Uso

| Métrica                                 | Meta          | Medição                         |
| --------------------------------------- | ------------- | ------------------------------- |
| **Tempo médio de análise por produto**  | < 45 segundos | Analytics de uso                |
| **Taxa de expansão de produtos**        | > 70%         | Eventos de clique em produtos   |
| **Taxa de navegação geográfica**        | > 60%         | Expansão de regiões/estados     |
| **Taxa de duplo clique em cidades**     | > 45%         | Eventos de abertura de cards    |
| **Uso de filtros**                      | > 55%         | Aplicação de filtros por sessão |
| **Uso de busca**                        | > 40%         | Buscas realizadas por sessão    |
| **Exportações realizadas**              | > 25/semana   | Contador de downloads           |
| **Uso de visualizações complementares** | > 30%         | Toggle para mapa/gráficos       |

### KPIs de Performance

| Métrica                            | Meta           | Medição                 |
| ---------------------------------- | -------------- | ----------------------- |
| **Tempo de carregamento inicial**  | < 2.5 segundos | Performance API         |
| **Tempo de expansão de produto**   | < 600ms        | Medição de renderização |
| **Tempo de expansão de região**    | < 500ms        | Medição de renderização |
| **Tempo de query SQL (produtos)**  | < 1.2 segundos | Logs de backend         |
| **Tempo de query SQL (entidades)** | < 800ms        | Logs de backend         |
| **Tamanho do payload (inicial)**   | < 600KB        | Network inspector       |
| **Tamanho do payload (expansão)**  | < 200KB        | Network inspector       |

### KPIs de Negócio

| Métrica                            | Meta        | Medição                                    |
| ---------------------------------- | ----------- | ------------------------------------------ |
| **Identificação de oportunidades** | > 10/semana | Produtos com muitos leads, poucos clientes |
| **Decisões de expansão**           | > 5/mês     | Exportações + feedback de usuários         |
| **Análises competitivas**          | > 15/mês    | Uso da aba Concorrentes                    |
| **Otimizações de portfólio**       | > 3/mês     | Decisões documentadas                      |

---

## 13. Conclusão

A funcionalidade **Produtos & Mercados** completa o trio de visualizações hierárquicas do IntelMarket, oferecendo uma perspectiva única e estratégica focada em produtos. Enquanto **Geoposição** responde "onde estão as entidades" e **Visão Mercados** responde "em quais mercados estão", **Produtos & Mercados** responde "onde cada produto está presente e onde pode expandir".

### Valor Agregado

A implementação desta funcionalidade permitirá aos usuários:

**Planejar expansão territorial por produto** através da identificação de regiões com alta demanda (leads) mas baixa presença atual (clientes). A visualização hierárquica facilita a descoberta de oportunidades geográficas específicas para cada produto do portfólio.

**Otimizar portfólio regional** ao entender quais produtos têm presença nacional e quais são regionais, permitindo decisões informadas sobre quais produtos oferecer em cada região. A análise de leads por produto e região indica demanda potencial para produtos ainda não oferecidos localmente.

**Analisar competitividade por produto e região** identificando onde a competição é mais intensa e onde existem oportunidades de entrada com menor resistência. Esta informação é crucial para estratégias de precificação, marketing e vendas regionalizadas.

**Tomar decisões baseadas em dados** sobre lançamento de produtos, descontinuação, expansão geográfica e alocação de recursos de marketing e vendas. A capacidade de exportar análises completas facilita a comunicação com stakeholders e a documentação de decisões estratégicas.

### Integração com Funcionalidades Existentes

**Produtos & Mercados** complementa perfeitamente as funcionalidades já implementadas:

**Geoposição** oferece visão geográfica macro (todas as entidades por região), **Visão Mercados** oferece visão por características de negócio (segmentação, setor, categoria), e **Produtos & Mercados** oferece visão produto-cêntrica com distribuição geográfica. Juntas, estas três funcionalidades formam um sistema completo de análise de inteligência de mercado.

A reutilização de componentes (RegionRow, StateRow, CityRow, EntityDetailCard) garante consistência visual e comportamental, reduz tempo de desenvolvimento e facilita manutenção futura. Usuários familiarizados com Geoposição e Visão Mercados terão curva de aprendizado mínima para usar Produtos & Mercados.

### Recomendação

**Implementar após conclusão de Visão Mercados**, aproveitando a experiência adquirida e os componentes reutilizáveis já desenvolvidos. A arquitetura modular permite desenvolvimento incremental com entregas parciais funcionais.

**Priorizar Fase 1-5** (API, componentes base, cards, filtros, exportação) para entrega de funcionalidade completa e utilizável. **Fase 6** (visualizações complementares) pode ser implementada posteriormente como melhoria incremental baseada em feedback de usuários.

**Tempo estimado de implementação:** 14-20 horas (aproximadamente 2-3 dias de trabalho)

**Prioridade:** Alta - Funcionalidade estratégica com alto valor para análise de produtos e planejamento de expansão

---

**Documento criado por Manus AI**  
**Versão 1.0 - 30 de Novembro de 2025**
