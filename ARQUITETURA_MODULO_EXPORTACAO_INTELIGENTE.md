# Arquitetura do Módulo de Exportação e Inteligência de Dados
## Sistema PAV - Proposta Técnica Completa

**Versão:** 1.0  
**Data:** 20 de Novembro de 2025  
**Autor:** Manus AI

---

## Sumário Executivo

Este documento apresenta a arquitetura completa de um **Módulo de Exportação e Inteligência de Dados** de classe empresarial para o Sistema PAV. O módulo combina **busca dinâmica assistida por IA**, **exportações formatadas profissionalmente** e **relatórios contextualizados com análise semântica** para transformar dados brutos em inteligência de mercado acionável.

### Diferenciais Estratégicos

O módulo proposto vai além de simples exportações de dados, oferecendo:

**Inteligência Assistida por IA:** O sistema utiliza modelos de linguagem avançados (Gemini) para interpretar contextos de negócio em linguagem natural, traduzindo solicitações como "empresas de médio porte no setor alimentício em São Paulo com alto potencial de conversão" em queries SQL complexas automaticamente.

**Flexibilidade Multidimensional:** Permite segmentação por múltiplas dimensões simultaneamente (projeto, pesquisa, mercado, geografia, porte, qualidade) com operadores lógicos (AND/OR/NOT) e filtros encadeados, oferecendo liberdade total ao usuário sem sacrificar usabilidade.

**Contexto Profissional:** Todos os relatórios são enriquecidos com análises semânticas geradas por IA, incluindo insights de mercado, análise competitiva, recomendações estratégicas e benchmarking automático, transformando dados em narrativas de negócio.

**Formatos Múltiplos:** Suporta exportação em CSV (dados brutos), Excel (formatado com gráficos), PDF (relatórios executivos) e JSON (integração com APIs), cada um otimizado para seu caso de uso específico.

---

## 1. Visão Geral da Arquitetura

### 1.1 Componentes Principais

O módulo é estruturado em **5 camadas arquiteturais** que trabalham de forma integrada:

**Camada de Interface (Frontend):** Wizard inteligente de 4 etapas que guia o usuário desde a definição de contexto até a exportação final, com preview em tempo real e validação progressiva.

**Camada de Interpretação (IA):** Motor de processamento de linguagem natural que converte contextos de negócio em queries estruturadas, utilizando Gemini para entender intenções e mapear para estruturas de dados.

**Camada de Consulta (Query Builder):** Construtor dinâmico de queries SQL que combina filtros multidimensionais, joins automáticos entre entidades relacionadas e otimização de performance para grandes volumes.

**Camada de Formatação (Rendering):** Sistema de templates que transforma dados brutos em documentos formatados profissionalmente, com suporte a múltiplos formatos e personalização por tipo de relatório.

**Camada de Análise (Insights):** Motor de geração de insights que analisa dados extraídos e produz análises semânticas contextualizadas, incluindo tendências, padrões, anomalias e recomendações estratégicas.

### 1.2 Fluxo de Dados

O fluxo de processamento segue uma arquitetura pipeline com 7 estágios:

```
1. ENTRADA → Usuário define contexto em linguagem natural
2. INTERPRETAÇÃO → IA converte contexto em estrutura de filtros
3. VALIDAÇÃO → Sistema valida filtros e estima volume de dados
4. CONSTRUÇÃO → Query Builder monta SQL otimizado
5. EXECUÇÃO → Banco de dados retorna resultados
6. ANÁLISE → IA gera insights semânticos sobre os dados
7. FORMATAÇÃO → Sistema renderiza formato final escolhido
8. ENTREGA → Usuário recebe arquivo para download
```

Cada estágio possui **checkpoints de validação** e **cache inteligente** para otimizar performance em consultas repetidas.

---

## 2. Camada de Interface (Frontend)

### 2.1 Wizard Inteligente de 4 Etapas

A interface utiliza um **wizard progressivo** que simplifica a complexidade através de decomposição em etapas lógicas:

#### Etapa 1: Definição de Contexto

O usuário inicia descrevendo sua necessidade em **linguagem natural livre**:

**Exemplos de Contextos:**
- "Quero exportar todos os leads de alta qualidade no setor de embalagens em São Paulo"
- "Preciso de um relatório de concorrentes de médio porte no agronegócio do Sul"
- "Exportar clientes B2B validados com faturamento acima de R$ 10M no Sudeste"
- "Listar mercados emergentes com crescimento acima de 20% no último trimestre"

**Funcionalidades:**
- Campo de texto livre com autocomplete inteligente
- Sugestões contextuais baseadas em histórico
- Validação em tempo real da viabilidade do contexto
- Botão "Exemplos" mostrando 10 contextos pré-definidos

**Assistência por IA:**
O sistema analisa o texto e **destaca entidades identificadas** com cores:
- 🔵 Azul: Entidades (leads, clientes, concorrentes, mercados)
- 🟢 Verde: Filtros geográficos (São Paulo, Sul, Sudeste)
- 🟡 Amarelo: Filtros de qualidade (alta qualidade, validados)
- 🟣 Roxo: Filtros de porte/tamanho (médio porte, acima de R$ 10M)
- 🟠 Laranja: Filtros temporais (último trimestre, 2024)

#### Etapa 2: Refinamento de Filtros

Com base no contexto interpretado, o sistema apresenta **filtros estruturados** organizados em 6 categorias:

**A) Escopo de Dados**
```
┌─────────────────────────────────────────┐
│ ☐ Projetos (múltipla escolha)          │
│   ☑ Embalagens (667 mercados)          │
│   ☐ Agronegócio (234 mercados)         │
│   ☐ Tecnologia (89 mercados)           │
│                                         │
│ ☐ Pesquisas (múltipla escolha)         │
│   ☑ Pesquisa Q4 2024                   │
│   ☐ Pesquisa Q3 2024                   │
│   ☐ Pesquisa Piloto                    │
└─────────────────────────────────────────┘
```

**B) Tipo de Entidade**
```
┌─────────────────────────────────────────┐
│ ○ Mercados (667 registros)              │
│ ● Clientes (806 registros)              │
│ ○ Concorrentes (4.974 registros)        │
│ ○ Leads (3.607 registros)               │
│ ○ Produtos (1.234 registros)            │
└─────────────────────────────────────────┘
```

**C) Filtros Geográficos**
```
┌─────────────────────────────────────────┐
│ Estados (múltipla escolha)              │
│ ☑ SP (2.340 registros)                 │
│ ☑ MG (1.890 registros)                 │
│ ☐ RJ (1.456 registros)                 │
│ ☐ PR (987 registros)                   │
│ [+] Ver todos os 27 estados             │
│                                         │
│ Cidades (busca com autocomplete)        │
│ [São Paulo, Campinas, Ribeirão Preto]   │
│                                         │
│ Regiões                                 │
│ ☐ Norte  ☐ Nordeste  ☑ Sudeste         │
│ ☑ Sul    ☐ Centro-Oeste                │
└─────────────────────────────────────────┘
```

**D) Filtros de Qualidade**
```
┌─────────────────────────────────────────┐
│ Quality Score                           │
│ [────────●═══════════] 80-100           │
│ Mínimo: 80  Máximo: 100                 │
│                                         │
│ Status                                  │
│ ☑ Validados (456)                       │
│ ☐ Pendentes (234)                       │
│ ☐ Descartados (116)                     │
│                                         │
│ Completude de Dados                     │
│ [═══════●════════════] 70-100%          │
└─────────────────────────────────────────┘
```

**E) Filtros de Porte/Segmentação**
```
┌─────────────────────────────────────────┐
│ Porte da Empresa                        │
│ ☐ Microempresa (até R$ 360k)           │
│ ☐ Pequena (R$ 360k - R$ 4,8M)          │
│ ☑ Média (R$ 4,8M - R$ 300M)            │
│ ☑ Grande (acima R$ 300M)               │
│                                         │
│ Segmentação                             │
│ ☑ B2B  ☐ B2C  ☐ Ambos                  │
│                                         │
│ CNAE (busca com autocomplete)           │
│ [Fabricação de embalagens plásticas]    │
└─────────────────────────────────────────┘
```

**F) Filtros Temporais**
```
┌─────────────────────────────────────────┐
│ Período de Criação                      │
│ De: [01/01/2024]  Até: [20/11/2025]    │
│                                         │
│ Última Atualização                      │
│ ○ Últimos 7 dias                        │
│ ○ Últimos 30 dias                       │
│ ● Últimos 90 dias                       │
│ ○ Personalizado                         │
└─────────────────────────────────────────┘
```

**Funcionalidades Avançadas:**
- **Operadores Lógicos:** Alternar entre AND/OR para cada categoria
- **Filtros Salvos:** Salvar combinação de filtros com nome personalizado
- **Templates:** Carregar templates pré-definidos (ex: "Leads Prioritários", "Análise Competitiva Regional")
- **Preview Dinâmico:** Contador em tempo real de registros que atendem aos filtros
- **Validação:** Alertas quando combinação resulta em 0 registros

#### Etapa 3: Seleção de Campos e Relacionamentos

O usuário escolhe **quais campos exportar** e se deseja **incluir dados relacionados**:

**A) Campos da Entidade Principal**
```
┌─────────────────────────────────────────┐
│ CLIENTE (entidade principal)            │
│                                         │
│ Dados Básicos                           │
│ ☑ Nome/Razão Social                     │
│ ☑ CNPJ                                  │
│ ☑ Email                                 │
│ ☑ Telefone                              │
│ ☑ Site                                  │
│ ☐ LinkedIn                              │
│                                         │
│ Dados Geográficos                       │
│ ☑ Cidade                                │
│ ☑ Estado (UF)                           │
│ ☐ CEP                                   │
│ ☐ Endereço Completo                     │
│                                         │
│ Dados Empresariais                      │
│ ☑ CNAE                                  │
│ ☑ Porte                                 │
│ ☑ Segmentação (B2B/B2C)                 │
│ ☐ Faturamento Estimado                  │
│ ☐ Número de Funcionários                │
│                                         │
│ Metadados                               │
│ ☑ Quality Score                         │
│ ☑ Status (Validado/Pendente)            │
│ ☑ Data de Criação                       │
│ ☐ Última Atualização                    │
│ ☐ Origem dos Dados                      │
│                                         │
│ [Selecionar Todos] [Limpar Seleção]    │
└─────────────────────────────────────────┘
```

**B) Dados Relacionados (Joins Automáticos)**
```
┌─────────────────────────────────────────┐
│ INCLUIR DADOS RELACIONADOS?             │
│                                         │
│ ☑ Mercados Associados                   │
│   ├─ Nome do Mercado                    │
│   ├─ Categoria                          │
│   └─ Tamanho Estimado                   │
│   Modo: ○ Coluna Única  ● Linhas Separadas
│                                         │
│ ☑ Produtos do Cliente                   │
│   ├─ Nome do Produto                    │
│   ├─ Descrição                          │
│   └─ Categoria                          │
│   Modo: ● Coluna Única  ○ Linhas Separadas
│   Formato: Lista separada por ";"       │
│                                         │
│ ☑ Concorrentes Identificados            │
│   ├─ Nome do Concorrente                │
│   ├─ CNPJ                               │
│   └─ Cidade/UF                          │
│   Limite: [10] concorrentes por cliente │
│   Modo: ○ Coluna Única  ● Arquivo Separado
│                                         │
│ ☐ Leads Relacionados                    │
│   ├─ Nome do Lead                       │
│   ├─ Email/Telefone                     │
│   └─ Quality Score                      │
│   Limite: [5] leads por cliente         │
│   Modo: ○ Coluna Única  ● Arquivo Separado
└─────────────────────────────────────────┘
```

**Modos de Relacionamento:**
- **Coluna Única:** Dados relacionados em uma célula (ex: "Mercado1; Mercado2; Mercado3")
- **Linhas Separadas:** Uma linha por relacionamento (cliente repetido em cada linha)
- **Arquivo Separado:** Gera arquivo adicional com relacionamentos (ex: clientes.csv + concorrentes.csv)

**Funcionalidades:**
- **Preview de Estrutura:** Mostra exemplo de como ficará a tabela final
- **Estimativa de Tamanho:** Calcula tamanho aproximado do arquivo (MB)
- **Validação de Limites:** Alerta se arquivo ultrapassar 100MB

#### Etapa 4: Formato e Tipo de Saída

O usuário escolhe entre **3 tipos de saída** e **múltiplos formatos**:

**A) Tipo de Saída**
```
┌─────────────────────────────────────────┐
│ ESCOLHA O TIPO DE SAÍDA                 │
│                                         │
│ ● LISTA SIMPLES                         │
│   Exportação direta dos dados filtrados│
│   sem análises adicionais               │
│   Formatos: CSV, Excel, JSON            │
│   Tempo estimado: ~5 segundos           │
│                                         │
│ ○ LISTA COMPLETA                        │
│   Exportação com todos os campos        │
│   disponíveis + dados relacionados      │
│   Formatos: Excel, PDF                  │
│   Tempo estimado: ~15 segundos          │
│                                         │
│ ○ RELATÓRIO CONTEXTUALIZADO             │
│   Documento profissional com análises   │
│   semânticas geradas por IA             │
│   Formatos: PDF, Word                   │
│   Tempo estimado: ~45 segundos          │
│   ⚠️ Requer créditos de IA              │
└─────────────────────────────────────────┘
```

**B) Formatos Disponíveis (por tipo)**

**LISTA SIMPLES:**
```
┌─────────────────────────────────────────┐
│ ○ CSV (dados brutos)                    │
│   • Compatível com Excel, Google Sheets │
│   • Ideal para importação em sistemas   │
│   • Encoding: UTF-8 com BOM             │
│   • Delimitador: ; (ponto e vírgula)    │
│                                         │
│ ● Excel (.xlsx)                         │
│   • Formatação automática de colunas    │
│   • Filtros automáticos no cabeçalho    │
│   • Congelamento da primeira linha      │
│   • Formatação condicional em scores    │
│                                         │
│ ○ JSON (integração com APIs)            │
│   • Estrutura hierárquica completa      │
│   • Relacionamentos aninhados           │
│   • Ideal para desenvolvedores          │
└─────────────────────────────────────────┘
```

**LISTA COMPLETA:**
```
┌─────────────────────────────────────────┐
│ ● Excel Avançado (.xlsx)                │
│   • Múltiplas abas (uma por entidade)   │
│   • Gráficos automáticos (top 10s)      │
│   • Tabelas dinâmicas pré-configuradas  │
│   • Formatação profissional             │
│   • Sumário executivo na primeira aba   │
│                                         │
│ ○ PDF Tabular                           │
│   • Tabelas formatadas profissionalmente│
│   • Paginação automática                │
│   • Cabeçalho/rodapé personalizados     │
│   • Índice clicável                     │
└─────────────────────────────────────────┘
```

**RELATÓRIO CONTEXTUALIZADO:**
```
┌─────────────────────────────────────────┐
│ ● PDF Executivo                         │
│   • Capa profissional com logo          │
│   • Sumário executivo (1 página)        │
│   • Análises semânticas por seção       │
│   • Gráficos e visualizações            │
│   • Insights estratégicos (IA)          │
│   • Recomendações acionáveis            │
│   • Anexos com dados detalhados         │
│                                         │
│ ○ Word (.docx)                          │
│   • Editável pelo usuário               │
│   • Estrutura idêntica ao PDF           │
│   • Ideal para personalização           │
└─────────────────────────────────────────┘
```

**C) Opções de Relatório Contextualizado**

Quando o usuário escolhe **Relatório Contextualizado**, aparecem opções adicionais:

```
┌─────────────────────────────────────────┐
│ CONFIGURAÇÕES DO RELATÓRIO              │
│                                         │
│ Template                                │
│ ● Análise de Mercado                    │
│   Foco: Oportunidades e tendências      │
│   Seções: Visão geral, Segmentação,     │
│           Análise competitiva, Insights │
│                                         │
│ ○ Análise de Clientes                   │
│   Foco: Perfil e comportamento          │
│   Seções: Perfil demográfico, Produtos, │
│           Potencial, Recomendações      │
│                                         │
│ ○ Análise Competitiva                   │
│   Foco: Concorrência e posicionamento   │
│   Seções: Mapeamento, Forças/Fraquezas, │
│           Gaps, Estratégias             │
│                                         │
│ ○ Análise de Leads                      │
│   Foco: Qualificação e priorização      │
│   Seções: Perfil, Scoring, Priorização, │
│           Abordagem sugerida            │
│                                         │
│ Profundidade da Análise                 │
│ ○ Rápida (~30s, 2-3 páginas)           │
│ ● Padrão (~45s, 5-7 páginas)           │
│ ○ Profunda (~90s, 10-15 páginas)       │
│                                         │
│ Incluir                                 │
│ ☑ Gráficos e visualizações              │
│ ☑ Benchmarking com mercado              │
│ ☑ Análise SWOT automática               │
│ ☑ Recomendações estratégicas            │
│ ☐ Projeções e tendências (requer dados históricos)
│                                         │
│ Idioma                                  │
│ ● Português (BR)  ○ Inglês              │
└─────────────────────────────────────────┘
```

**D) Preview e Confirmação**

Antes de gerar, o sistema exibe um **resumo completo**:

```
┌─────────────────────────────────────────┐
│ RESUMO DA EXPORTAÇÃO                    │
│                                         │
│ Contexto                                │
│ "Leads de alta qualidade no setor de    │
│  embalagens em São Paulo"               │
│                                         │
│ Filtros Aplicados                       │
│ • Entidade: Leads                       │
│ • Projeto: Embalagens                   │
│ • Estado: SP                            │
│ • Quality Score: 80-100                 │
│ • Status: Validados                     │
│                                         │
│ Registros Encontrados: 234              │
│                                         │
│ Campos Selecionados: 12                 │
│ • Nome, Email, Telefone, Site, CNPJ...  │
│                                         │
│ Dados Relacionados                      │
│ • Mercados (coluna única)               │
│ • Produtos (coluna única)               │
│ • Concorrentes (arquivo separado)       │
│                                         │
│ Formato de Saída                        │
│ • Tipo: Relatório Contextualizado       │
│ • Template: Análise de Leads            │
│ • Formato: PDF Executivo                │
│ • Profundidade: Padrão (5-7 páginas)    │
│                                         │
│ Estimativas                             │
│ • Tamanho: ~8.5 MB                      │
│ • Tempo: ~45 segundos                   │
│ • Créditos IA: 150 tokens               │
│                                         │
│ [Voltar] [Salvar Configuração] [Gerar]  │
└─────────────────────────────────────────┘
```

### 2.2 Interface de Progresso

Durante a geração, o usuário vê um **indicador de progresso detalhado**:

```
┌─────────────────────────────────────────┐
│ GERANDO RELATÓRIO...                    │
│                                         │
│ [████████████████░░░░] 75%              │
│                                         │
│ ✓ Interpretando contexto (2s)           │
│ ✓ Construindo query (1s)                │
│ ✓ Executando consulta (8s)              │
│ ✓ Carregando relacionamentos (5s)       │
│ ⏳ Gerando análises com IA (18s)...     │
│ ⏹ Formatando documento                  │
│ ⏹ Finalizando exportação                │
│                                         │
│ Tempo decorrido: 34s                    │
│ Tempo estimado restante: 11s            │
│                                         │
│ [Cancelar]                              │
└─────────────────────────────────────────┘
```

### 2.3 Histórico de Exportações

O sistema mantém um **histórico completo** de todas as exportações:

```
┌─────────────────────────────────────────┐
│ HISTÓRICO DE EXPORTAÇÕES                │
│                                         │
│ [Hoje] 20/11/2025                       │
│                                         │
│ 📄 Análise de Leads - SP Embalagens     │
│    234 registros • PDF • 8.5 MB         │
│    14:32 • [Download] [Reexecutar]      │
│                                         │
│ 📊 Lista Clientes B2B - Sudeste         │
│    456 registros • Excel • 2.3 MB       │
│    11:15 • [Download] [Reexecutar]      │
│                                         │
│ [Ontem] 19/11/2025                      │
│                                         │
│ 📄 Análise Competitiva - Agronegócio    │
│    89 registros • PDF • 12.1 MB         │
│    16:45 • [Download] [Reexecutar]      │
│                                         │
│ [Filtrar por tipo] [Buscar]             │
└─────────────────────────────────────────┘
```

---

## 3. Camada de Interpretação (IA)

### 3.1 Motor de Processamento de Linguagem Natural

O sistema utiliza **Gemini** para interpretar contextos de negócio e convertê-los em filtros estruturados.

#### Pipeline de Interpretação

**Etapa 1: Extração de Entidades**

O modelo identifica **entidades-chave** no texto livre:

```typescript
interface ExtractedEntities {
  entityType: 'mercados' | 'clientes' | 'concorrentes' | 'leads' | 'produtos';
  geography: {
    states?: string[];      // ["SP", "MG"]
    cities?: string[];      // ["São Paulo", "Campinas"]
    regions?: string[];     // ["Sudeste", "Sul"]
  };
  quality: {
    minScore?: number;      // 80
    status?: string[];      // ["validados"]
    completeness?: number;  // 70
  };
  size: {
    porte?: string[];       // ["média", "grande"]
    revenue?: {             // Faturamento
      min?: number;
      max?: number;
    };
  };
  segmentation: {
    type?: string[];        // ["B2B", "B2C"]
    cnae?: string[];        // ["1013-9"]
  };
  temporal: {
    createdAfter?: Date;
    createdBefore?: Date;
    updatedWithin?: number; // dias
  };
  keywords: string[];       // ["embalagens", "alta qualidade"]
}
```

**Exemplo de Interpretação:**

Entrada:
```
"Quero exportar todos os leads de alta qualidade no setor de 
embalagens em São Paulo com faturamento acima de R$ 10M"
```

Saída:
```json
{
  "entityType": "leads",
  "geography": {
    "states": ["SP"]
  },
  "quality": {
    "minScore": 80,
    "status": ["validados"]
  },
  "size": {
    "revenue": {
      "min": 10000000
    }
  },
  "keywords": ["embalagens", "alta qualidade"]
}
```

**Etapa 2: Mapeamento para Filtros**

O sistema mapeia entidades extraídas para **filtros SQL**:

```typescript
interface QueryFilters {
  table: string;                    // "leads"
  where: WhereClause[];             // Condições SQL
  joins: JoinClause[];              // Joins necessários
  orderBy?: OrderByClause[];        // Ordenação
  limit?: number;                   // Limite de registros
}

interface WhereClause {
  field: string;                    // "quality_score"
  operator: '=' | '>' | '<' | 'IN' | 'LIKE';
  value: any;                       // 80
  logicalOperator?: 'AND' | 'OR';   // "AND"
}
```

**Etapa 3: Validação e Sugestões**

O sistema valida a interpretação e sugere **refinamentos**:

```typescript
interface InterpretationResult {
  filters: QueryFilters;
  confidence: number;               // 0-100
  estimatedRecords: number;         // 234
  suggestions: string[];            // Sugestões de refinamento
  warnings: string[];               // Alertas
}
```

Exemplo:
```json
{
  "confidence": 85,
  "estimatedRecords": 234,
  "suggestions": [
    "Considere filtrar por CNAE específico para maior precisão",
    "Adicione filtro temporal para dados mais recentes"
  ],
  "warnings": [
    "Faturamento estimado pode ter baixa precisão para alguns registros"
  ]
}
```

### 3.2 Prompt Engineering para Interpretação

O sistema utiliza um **prompt estruturado** para garantir interpretações consistentes:

```typescript
const INTERPRETATION_PROMPT = `
Você é um assistente especializado em análise de dados de mercado.

CONTEXTO:
O usuário está usando um sistema de inteligência de mercado que contém:
- Mercados: Setores/nichos identificados
- Clientes: Empresas que são clientes
- Concorrentes: Empresas concorrentes dos clientes
- Leads: Potenciais novos clientes
- Produtos: Produtos oferecidos pelos clientes

TAREFA:
Analise o texto fornecido pelo usuário e extraia:
1. Tipo de entidade principal (mercados/clientes/concorrentes/leads/produtos)
2. Filtros geográficos (estados, cidades, regiões)
3. Filtros de qualidade (score, status, completude)
4. Filtros de porte/tamanho (porte, faturamento)
5. Filtros de segmentação (B2B/B2C, CNAE)
6. Filtros temporais (datas, períodos)
7. Palavras-chave relevantes

REGRAS:
- Seja conservador: só extraia informações explícitas no texto
- Use valores padrão sensatos quando houver ambiguidade
- "Alta qualidade" = quality_score >= 80
- "Médio porte" = porte IN ["média", "grande"]
- Estados devem ser siglas (SP, MG, RJ)
- Faturamento em reais (R$)

FORMATO DE SAÍDA:
JSON estruturado conforme interface ExtractedEntities

TEXTO DO USUÁRIO:
{userInput}
`;
```

### 3.3 Cache de Interpretações

Para otimizar performance, o sistema mantém um **cache de interpretações**:

```typescript
interface CachedInterpretation {
  inputHash: string;                // Hash MD5 do texto
  interpretation: ExtractedEntities;
  timestamp: Date;
  hitCount: number;                 // Quantas vezes foi reutilizado
}
```

Interpretações idênticas ou similares (>90% de similaridade) são reutilizadas, economizando chamadas à API de IA.

---

## 4. Camada de Consulta (Query Builder)

### 4.1 Construtor Dinâmico de Queries

O Query Builder traduz filtros estruturados em **SQL otimizado**:

```typescript
class DynamicQueryBuilder {
  private baseTable: string;
  private filters: QueryFilters;
  private selectedFields: string[];
  private relationships: RelationshipConfig[];

  /**
   * Constrói query SQL otimizada
   */
  build(): string {
    const select = this.buildSelect();
    const from = this.buildFrom();
    const joins = this.buildJoins();
    const where = this.buildWhere();
    const orderBy = this.buildOrderBy();
    const limit = this.buildLimit();

    return `${select} ${from} ${joins} ${where} ${orderBy} ${limit}`;
  }

  /**
   * Constrói cláusula SELECT com campos selecionados
   */
  private buildSelect(): string {
    const fields = this.selectedFields.map(field => {
      // Adiciona alias para evitar conflitos
      return `${this.baseTable}.${field} AS ${field}`;
    });

    // Adiciona campos de relacionamentos se necessário
    this.relationships.forEach(rel => {
      if (rel.mode === 'single_column') {
        fields.push(`GROUP_CONCAT(${rel.table}.${rel.field}) AS ${rel.alias}`);
      }
    });

    return `SELECT ${fields.join(', ')}`;
  }

  /**
   * Constrói JOINs automáticos baseados em relacionamentos
   */
  private buildJoins(): string {
    const joins: string[] = [];

    this.relationships.forEach(rel => {
      const joinType = rel.required ? 'INNER JOIN' : 'LEFT JOIN';
      joins.push(
        `${joinType} ${rel.table} ON ${this.baseTable}.${rel.foreignKey} = ${rel.table}.${rel.primaryKey}`
      );
    });

    return joins.join(' ');
  }

  /**
   * Constrói cláusula WHERE com todos os filtros
   */
  private buildWhere(): string {
    if (this.filters.where.length === 0) return '';

    const conditions = this.filters.where.map(clause => {
      return this.buildCondition(clause);
    });

    return `WHERE ${conditions.join(' ')}`;
  }

  /**
   * Constrói condição individual com sanitização
   */
  private buildCondition(clause: WhereClause): string {
    const field = this.sanitizeField(clause.field);
    const value = this.sanitizeValue(clause.value);
    const operator = clause.operator;
    const logical = clause.logicalOperator || 'AND';

    let condition = '';

    switch (operator) {
      case 'IN':
        condition = `${field} IN (${value})`;
        break;
      case 'LIKE':
        condition = `${field} LIKE '%${value}%'`;
        break;
      default:
        condition = `${field} ${operator} ${value}`;
    }

    return `${logical} ${condition}`;
  }

  /**
   * Sanitiza nomes de campos para prevenir SQL injection
   */
  private sanitizeField(field: string): string {
    // Remove caracteres perigosos
    const sanitized = field.replace(/[^a-zA-Z0-9_\.]/g, '');
    return sanitized;
  }

  /**
   * Sanitiza valores para prevenir SQL injection
   */
  private sanitizeValue(value: any): string {
    if (typeof value === 'string') {
      // Escapa aspas simples
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (Array.isArray(value)) {
      return value.map(v => this.sanitizeValue(v)).join(', ');
    }
    return String(value);
  }
}
```

### 4.2 Otimizações de Performance

O sistema implementa **múltiplas otimizações** para garantir performance em grandes volumes:

**A) Índices Automáticos**

O sistema cria índices automáticos em campos frequentemente filtrados:

```sql
-- Índices para filtros geográficos
CREATE INDEX idx_clientes_uf ON clientes(uf);
CREATE INDEX idx_clientes_cidade ON clientes(cidade);

-- Índices para filtros de qualidade
CREATE INDEX idx_clientes_quality_score ON clientes(quality_score);
CREATE INDEX idx_clientes_status ON clientes(status);

-- Índices para filtros de porte
CREATE INDEX idx_clientes_porte ON clientes(porte);

-- Índices compostos para queries comuns
CREATE INDEX idx_clientes_uf_quality ON clientes(uf, quality_score);
CREATE INDEX idx_clientes_status_porte ON clientes(status, porte);
```

**B) Query Caching**

Queries idênticas são cacheadas por **5 minutos**:

```typescript
interface QueryCache {
  queryHash: string;              // Hash MD5 da query
  results: any[];                 // Resultados
  timestamp: Date;
  expiresAt: Date;
  hitCount: number;
}

class QueryCacheManager {
  private cache: Map<string, QueryCache> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  get(queryHash: string): any[] | null {
    const cached = this.cache.get(queryHash);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt.getTime()) {
      this.cache.delete(queryHash);
      return null;
    }

    cached.hitCount++;
    return cached.results;
  }

  set(queryHash: string, results: any[]): void {
    this.cache.set(queryHash, {
      queryHash,
      results,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.TTL),
      hitCount: 0
    });
  }
}
```

**C) Paginação Inteligente**

Para queries com muitos resultados, o sistema usa **cursor-based pagination**:

```typescript
interface PaginationConfig {
  pageSize: number;               // 1000 registros por página
  cursor?: string;                // Cursor da última página
}

async function executePaginatedQuery(
  query: string,
  config: PaginationConfig
): Promise<PaginatedResult> {
  const limit = config.pageSize;
  const offset = config.cursor ? parseInt(config.cursor) : 0;

  const results = await db.query(`
    ${query}
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  return {
    data: results,
    nextCursor: results.length === limit ? String(offset + limit) : null,
    hasMore: results.length === limit
  };
}
```

**D) Parallel Queries para Relacionamentos**

Quando há múltiplos relacionamentos, o sistema executa queries em **paralelo**:

```typescript
async function loadRelationships(
  mainRecords: any[],
  relationships: RelationshipConfig[]
): Promise<any[]> {
  // Extrai IDs principais
  const mainIds = mainRecords.map(r => r.id);

  // Executa queries de relacionamento em paralelo
  const relationshipPromises = relationships.map(rel => {
    return db.query(`
      SELECT * FROM ${rel.table}
      WHERE ${rel.foreignKey} IN (${mainIds.join(',')})
    `);
  });

  const relationshipResults = await Promise.all(relationshipPromises);

  // Mescla resultados
  return mainRecords.map(record => {
    const enriched = { ...record };

    relationships.forEach((rel, index) => {
      const related = relationshipResults[index].filter(
        r => r[rel.foreignKey] === record.id
      );
      enriched[rel.alias] = related;
    });

    return enriched;
  });
}
```

### 4.3 Tratamento de Relacionamentos

O sistema suporta **3 modos de relacionamento**:

**Modo 1: Coluna Única (Concatenado)**

Múltiplos valores em uma única célula:

```sql
SELECT 
  c.id,
  c.nome,
  GROUP_CONCAT(m.nome SEPARATOR '; ') AS mercados
FROM clientes c
LEFT JOIN cliente_mercado cm ON c.id = cm.cliente_id
LEFT JOIN mercados m ON cm.mercado_id = m.id
GROUP BY c.id
```

Resultado:
```
| ID | Nome         | Mercados                                    |
|----|--------------|---------------------------------------------|
| 1  | Empresa A    | Embalagens Plásticas; Embalagens Flexíveis  |
| 2  | Empresa B    | Construção Civil                            |
```

**Modo 2: Linhas Separadas (Desnormalizado)**

Uma linha por relacionamento:

```sql
SELECT 
  c.id,
  c.nome,
  m.nome AS mercado
FROM clientes c
LEFT JOIN cliente_mercado cm ON c.id = cm.cliente_id
LEFT JOIN mercados m ON cm.mercado_id = m.id
```

Resultado:
```
| ID | Nome         | Mercado                  |
|----|--------------|--------------------------|
| 1  | Empresa A    | Embalagens Plásticas     |
| 1  | Empresa A    | Embalagens Flexíveis     |
| 2  | Empresa B    | Construção Civil         |
```

**Modo 3: Arquivo Separado (Normalizado)**

Dois arquivos mantendo normalização:

**clientes.csv:**
```
| ID | Nome         | Email              |
|----|--------------|--------------------|
| 1  | Empresa A    | contato@empresaa.com|
| 2  | Empresa B    | contato@empresab.com|
```

**clientes_mercados.csv:**
```
| Cliente ID | Mercado                  |
|------------|--------------------------|
| 1          | Embalagens Plásticas     |
| 1          | Embalagens Flexíveis     |
| 2          | Construção Civil         |
```

---

## 5. Camada de Análise (Insights)

### 5.1 Motor de Geração de Insights

Quando o usuário escolhe **Relatório Contextualizado**, o sistema gera **análises semânticas** usando IA.

#### Pipeline de Análise

**Etapa 1: Análise Estatística**

O sistema calcula **estatísticas descritivas** dos dados:

```typescript
interface DataStatistics {
  totalRecords: number;
  distributions: {
    geography: Record<string, number>;    // {"SP": 120, "MG": 80}
    porte: Record<string, number>;        // {"média": 150, "grande": 50}
    segmentation: Record<string, number>; // {"B2B": 180, "B2C": 20}
    qualityScore: {
      mean: number;
      median: number;
      min: number;
      max: number;
      quartiles: [number, number, number];
    };
  };
  trends: {
    growthRate?: number;                  // Taxa de crescimento
    seasonality?: string;                 // Sazonalidade identificada
  };
  outliers: any[];                        // Registros atípicos
}
```

**Etapa 2: Geração de Insights com IA**

O sistema envia estatísticas para Gemini com um **prompt especializado**:

```typescript
const INSIGHTS_PROMPT = `
Você é um analista sênior de inteligência de mercado com 15 anos de experiência.

CONTEXTO:
Analise os dados fornecidos e gere insights estratégicos profissionais.

DADOS:
{dataStatistics}

TEMPLATE: {templateType}
- Análise de Mercado: Foco em oportunidades e tendências
- Análise de Clientes: Foco em perfil e comportamento
- Análise Competitiva: Foco em concorrência e posicionamento
- Análise de Leads: Foco em qualificação e priorização

INSTRUÇÕES:
1. Identifique 5-7 insights estratégicos principais
2. Para cada insight, forneça:
   - Título conciso (máx 10 palavras)
   - Descrição detalhada (2-3 parágrafos)
   - Dados que suportam o insight
   - Implicações para o negócio
   - Recomendações acionáveis

3. Organize insights por relevância (mais importante primeiro)
4. Use linguagem profissional mas acessível
5. Seja específico e quantitativo sempre que possível
6. Evite jargões desnecessários

FORMATO DE SAÍDA:
JSON estruturado conforme interface InsightReport
`;
```

**Etapa 3: Estruturação de Insights**

```typescript
interface Insight {
  id: string;
  title: string;                        // "Concentração Geográfica no Sudeste"
  description: string;                  // Descrição detalhada
  category: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  supportingData: {
    metric: string;                     // "Distribuição geográfica"
    value: any;                         // {"SP": 60%, "MG": 25%}
    visualization?: string;             // Tipo de gráfico sugerido
  }[];
  implications: string[];               // Implicações para o negócio
  recommendations: string[];            // Ações recomendadas
}

interface InsightReport {
  executiveSummary: string;             // Sumário executivo (1 parágrafo)
  keyFindings: string[];                // 3-5 descobertas principais
  insights: Insight[];                  // 5-7 insights detalhados
  recommendations: {
    immediate: string[];                // Ações imediatas (próximos 30 dias)
    shortTerm: string[];                // Curto prazo (próximos 90 dias)
    longTerm: string[];                 // Longo prazo (6-12 meses)
  };
  risks: string[];                      // Riscos identificados
  opportunities: string[];              // Oportunidades identificadas
}
```

### 5.2 Templates de Análise

O sistema oferece **4 templates especializados**:

#### Template 1: Análise de Mercado

Foco em **oportunidades e tendências** de mercado:

**Seções Geradas:**
1. **Visão Geral do Mercado**
   - Tamanho total e segmentação
   - Principais players e concentração
   - Maturidade do mercado

2. **Análise de Segmentação**
   - Distribuição B2B vs B2C
   - Segmentação por porte
   - Segmentação geográfica

3. **Análise Competitiva**
   - Densidade competitiva por região
   - Gaps de mercado identificados
   - Barreiras de entrada

4. **Tendências e Oportunidades**
   - Tendências de crescimento
   - Mercados emergentes
   - Oportunidades de expansão

5. **Recomendações Estratégicas**
   - Priorização de mercados
   - Estratégias de entrada
   - Investimentos recomendados

#### Template 2: Análise de Clientes

Foco em **perfil e comportamento** de clientes:

**Seções Geradas:**
1. **Perfil Demográfico**
   - Distribuição geográfica
   - Distribuição por porte
   - Distribuição por setor (CNAE)

2. **Análise de Produtos**
   - Produtos mais comuns
   - Correlações entre produtos
   - Oportunidades de cross-sell

3. **Análise de Potencial**
   - Clientes de alto valor
   - Clientes em crescimento
   - Clientes em risco (churn)

4. **Padrões de Comportamento**
   - Ciclos de compra
   - Sazonalidade
   - Preferências regionais

5. **Recomendações de Ação**
   - Estratégias de retenção
   - Oportunidades de upsell
   - Segmentação para campanhas

#### Template 3: Análise Competitiva

Foco em **concorrência e posicionamento**:

**Seções Geradas:**
1. **Mapeamento Competitivo**
   - Número de concorrentes por mercado
   - Concentração geográfica
   - Distribuição por porte

2. **Análise de Forças e Fraquezas**
   - Vantagens competitivas identificadas
   - Vulnerabilidades dos concorrentes
   - Gaps de posicionamento

3. **Análise de Gaps de Mercado**
   - Mercados sub-atendidos
   - Nichos não explorados
   - Oportunidades de diferenciação

4. **Benchmarking**
   - Comparação com líderes de mercado
   - Métricas de performance
   - Melhores práticas identificadas

5. **Estratégias Recomendadas**
   - Posicionamento sugerido
   - Táticas competitivas
   - Investimentos prioritários

#### Template 4: Análise de Leads

Foco em **qualificação e priorização**:

**Seções Geradas:**
1. **Perfil de Leads**
   - Distribuição por quality score
   - Distribuição geográfica
   - Distribuição por porte

2. **Análise de Scoring**
   - Fatores de qualidade identificados
   - Correlação score vs conversão
   - Calibração do modelo de scoring

3. **Priorização de Leads**
   - Top 20 leads prioritários
   - Segmentação por potencial
   - Leads de rápida conversão

4. **Análise de Fit**
   - Fit com perfil de cliente ideal (ICP)
   - Leads fora do perfil (descarte)
   - Oportunidades de expansão de ICP

5. **Estratégia de Abordagem**
   - Mensagens personalizadas por segmento
   - Canais de contato recomendados
   - Sequência de follow-up sugerida

### 5.3 Geração de Visualizações

O sistema gera **gráficos automáticos** para ilustrar insights:

```typescript
interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'scatter' | 'heatmap';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
}

class ChartGenerator {
  /**
   * Gera gráfico de barras para distribuições
   */
  generateBarChart(data: Record<string, number>, title: string): ChartConfig {
    return {
      type: 'bar',
      title,
      data: Object.entries(data).map(([key, value]) => ({
        label: key,
        value
      })),
      xAxis: 'Categoria',
      yAxis: 'Quantidade',
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
    };
  }

  /**
   * Gera gráfico de pizza para proporções
   */
  generatePieChart(data: Record<string, number>, title: string): ChartConfig {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    return {
      type: 'pie',
      title,
      data: Object.entries(data).map(([key, value]) => ({
        label: key,
        value,
        percentage: ((value / total) * 100).toFixed(1)
      })),
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    };
  }

  /**
   * Gera gráfico de linha para tendências temporais
   */
  generateLineChart(
    data: Array<{ date: Date; value: number }>,
    title: string
  ): ChartConfig {
    return {
      type: 'line',
      title,
      data: data.map(point => ({
        x: point.date.toISOString().split('T')[0],
        y: point.value
      })),
      xAxis: 'Data',
      yAxis: 'Valor',
      colors: ['#3B82F6']
    };
  }
}
```

---

## 6. Camada de Formatação (Rendering)

### 6.1 Sistema de Templates

O sistema utiliza **templates modulares** para cada formato de saída:

#### Template CSV

```typescript
class CSVRenderer {
  render(data: any[], fields: string[]): string {
    // Cabeçalho
    const header = fields.join(';');
    
    // Linhas de dados
    const rows = data.map(record => {
      return fields.map(field => {
        const value = record[field];
        
        // Escapa valores com ponto e vírgula ou quebras de linha
        if (typeof value === 'string' && (value.includes(';') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        
        return value ?? '';
      }).join(';');
    });
    
    // Adiciona BOM para UTF-8
    const BOM = '\uFEFF';
    return BOM + [header, ...rows].join('\n');
  }
}
```

#### Template Excel

```typescript
import * as XLSX from 'xlsx';

class ExcelRenderer {
  render(data: any[], fields: string[], options: ExcelOptions): Buffer {
    const workbook = XLSX.utils.book_new();
    
    // Cria aba principal
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: fields
    });
    
    // Aplica formatação
    this.applyFormatting(worksheet, fields);
    
    // Adiciona filtros automáticos
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(worksheet['!ref']!) };
    
    // Congela primeira linha
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    
    // Ajusta largura das colunas
    worksheet['!cols'] = fields.map(field => ({ wch: this.calculateColumnWidth(field) }));
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    
    // Adiciona aba de sumário se solicitado
    if (options.includeSummary) {
      const summarySheet = this.createSummarySheet(data);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Sumário');
    }
    
    // Adiciona gráficos se solicitado
    if (options.includeCharts) {
      // Nota: XLSX não suporta gráficos nativamente, usar ExcelJS
      this.addChartsWithExcelJS(workbook, data);
    }
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
  
  private applyFormatting(worksheet: XLSX.WorkSheet, fields: string[]): void {
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    
    // Formata cabeçalho (negrito, fundo azul)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '3B82F6' } },
        alignment: { horizontal: 'center' }
      };
    }
    
    // Formata células de dados
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;
        
        const field = fields[col];
        
        // Formatação condicional para quality_score
        if (field === 'quality_score') {
          const value = worksheet[cellAddress].v as number;
          worksheet[cellAddress].s = {
            fill: {
              fgColor: {
                rgb: value >= 80 ? '10B981' : value >= 60 ? '3B82F6' : value >= 40 ? 'F59E0B' : 'EF4444'
              }
            }
          };
        }
      }
    }
  }
}
```

#### Template PDF (Lista)

```typescript
import PDFDocument from 'pdfkit';

class PDFListRenderer {
  render(data: any[], fields: string[], options: PDFOptions): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Cabeçalho
    this.renderHeader(doc, options.title);
    
    // Tabela de dados
    this.renderTable(doc, data, fields);
    
    // Rodapé
    this.renderFooter(doc);
    
    doc.end();
    
    return Buffer.concat(chunks);
  }
  
  private renderTable(doc: PDFKit.PDFDocument, data: any[], fields: string[]): void {
    const tableTop = 150;
    const rowHeight = 25;
    const columnWidth = (doc.page.width - 100) / fields.length;
    
    // Cabeçalho da tabela
    doc.fontSize(10).font('Helvetica-Bold');
    fields.forEach((field, i) => {
      doc.text(
        this.formatFieldName(field),
        50 + i * columnWidth,
        tableTop,
        { width: columnWidth, align: 'center' }
      );
    });
    
    // Linha separadora
    doc.moveTo(50, tableTop + 15)
       .lineTo(doc.page.width - 50, tableTop + 15)
       .stroke();
    
    // Linhas de dados
    doc.fontSize(9).font('Helvetica');
    data.forEach((record, rowIndex) => {
      const y = tableTop + 20 + rowIndex * rowHeight;
      
      // Verifica se precisa adicionar nova página
      if (y > doc.page.height - 100) {
        doc.addPage();
        return;
      }
      
      fields.forEach((field, colIndex) => {
        const value = record[field];
        doc.text(
          String(value ?? ''),
          50 + colIndex * columnWidth,
          y,
          { width: columnWidth, align: 'left' }
        );
      });
    });
  }
}
```

#### Template PDF (Relatório Contextualizado)

```typescript
class PDFReportRenderer {
  render(
    data: any[],
    insights: InsightReport,
    options: PDFReportOptions
  ): Buffer {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    
    // Página 1: Capa
    this.renderCover(doc, options.title, options.subtitle);
    
    // Página 2: Sumário Executivo
    doc.addPage();
    this.renderExecutiveSummary(doc, insights.executiveSummary, insights.keyFindings);
    
    // Páginas 3-N: Insights Detalhados
    insights.insights.forEach(insight => {
      doc.addPage();
      this.renderInsight(doc, insight);
    });
    
    // Página N+1: Recomendações
    doc.addPage();
    this.renderRecommendations(doc, insights.recommendations);
    
    // Página N+2: Anexos (dados detalhados)
    doc.addPage();
    this.renderDataAppendix(doc, data);
    
    doc.end();
    
    return Buffer.concat(chunks);
  }
  
  private renderCover(doc: PDFKit.PDFDocument, title: string, subtitle: string): void {
    // Logo
    if (fs.existsSync('./assets/logo.png')) {
      doc.image('./assets/logo.png', 50, 50, { width: 150 });
    }
    
    // Título
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .text(title, 50, 250, { align: 'center' });
    
    // Subtítulo
    doc.fontSize(18)
       .font('Helvetica')
       .text(subtitle, 50, 320, { align: 'center' });
    
    // Data
    doc.fontSize(12)
       .text(
         new Date().toLocaleDateString('pt-BR', {
           day: '2-digit',
           month: 'long',
           year: 'numeric'
         }),
         50,
         doc.page.height - 100,
         { align: 'center' }
       );
  }
  
  private renderInsight(doc: PDFKit.PDFDocument, insight: Insight): void {
    // Título do insight
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(insight.title, 50, 80);
    
    // Badge de prioridade
    const badgeColor = insight.priority === 'high' ? '#EF4444' : 
                       insight.priority === 'medium' ? '#F59E0B' : '#10B981';
    doc.rect(50, 115, 80, 20)
       .fill(badgeColor);
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text(insight.priority.toUpperCase(), 50, 119, { width: 80, align: 'center' });
    
    // Descrição
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#000000')
       .text(insight.description, 50, 150, { align: 'justify' });
    
    // Dados de suporte
    let y = 250;
    insight.supportingData.forEach(data => {
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text(`${data.metric}:`, 50, y);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(JSON.stringify(data.value, null, 2), 70, y + 15);
      
      y += 60;
      
      // Adiciona gráfico se especificado
      if (data.visualization && y < doc.page.height - 200) {
        // Gera gráfico e insere
        const chartBuffer = this.generateChart(data);
        doc.image(chartBuffer, 50, y, { width: 500 });
        y += 250;
      }
    });
    
    // Implicações
    if (insight.implications.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Implicações:', 50, y);
      
      y += 25;
      insight.implications.forEach(implication => {
        doc.fontSize(10)
           .font('Helvetica')
           .text(`• ${implication}`, 70, y, { align: 'justify' });
        y += 30;
      });
    }
    
    // Recomendações
    if (insight.recommendations.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Recomendações:', 50, y);
      
      y += 25;
      insight.recommendations.forEach(recommendation => {
        doc.fontSize(10)
           .font('Helvetica')
           .text(`✓ ${recommendation}`, 70, y, { align: 'justify' });
        y += 30;
      });
    }
  }
}
```

### 6.2 Geração de Gráficos

O sistema utiliza **Chart.js** via node-canvas para gerar gráficos:

```typescript
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

class ChartRenderer {
  private chartJSNodeCanvas: ChartJSNodeCanvas;
  
  constructor() {
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 800,
      height: 600,
      backgroundColour: 'white'
    });
  }
  
  async renderBarChart(config: ChartConfig): Promise<Buffer> {
    const configuration = {
      type: 'bar' as const,
      data: {
        labels: config.data.map(d => d.label),
        datasets: [{
          label: config.title,
          data: config.data.map(d => d.value),
          backgroundColor: config.colors || ['#3B82F6'],
          borderColor: config.colors || ['#2563EB'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: config.title,
            font: { size: 18 }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: config.yAxis || 'Valor'
            }
          },
          x: {
            title: {
              display: true,
              text: config.xAxis || 'Categoria'
            }
          }
        }
      }
    };
    
    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }
  
  async renderPieChart(config: ChartConfig): Promise<Buffer> {
    const configuration = {
      type: 'pie' as const,
      data: {
        labels: config.data.map(d => `${d.label} (${d.percentage}%)`),
        datasets: [{
          data: config.data.map(d => d.value),
          backgroundColor: config.colors || [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: config.title,
            font: { size: 18 }
          },
          legend: {
            position: 'right' as const
          }
        }
      }
    };
    
    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }
}
```

---

## 7. Arquitetura de Backend

### 7.1 Rotas tRPC

O módulo expõe **6 rotas principais** via tRPC:

```typescript
export const exportRouter = router({
  /**
   * Interpreta contexto em linguagem natural
   */
  interpretContext: protectedProcedure
    .input(z.object({
      context: z.string(),
      projectId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const interpretation = await interpretationService.interpret(
        input.context,
        input.projectId
      );
      
      return interpretation;
    }),
  
  /**
   * Valida filtros e estima volume de dados
   */
  validateFilters: protectedProcedure
    .input(z.object({
      filters: QueryFiltersSchema
    }))
    .query(async ({ input }) => {
      const validation = await queryBuilder.validate(input.filters);
      
      return {
        isValid: validation.isValid,
        estimatedRecords: validation.estimatedRecords,
        estimatedSize: validation.estimatedSize,
        warnings: validation.warnings
      };
    }),
  
  /**
   * Executa query e retorna dados
   */
  executeQuery: protectedProcedure
    .input(z.object({
      filters: QueryFiltersSchema,
      fields: z.array(z.string()),
      relationships: z.array(RelationshipConfigSchema).optional()
    }))
    .query(async ({ input }) => {
      const query = queryBuilder.build(
        input.filters,
        input.fields,
        input.relationships
      );
      
      const results = await db.execute(query);
      
      return {
        data: results,
        count: results.length
      };
    }),
  
  /**
   * Gera insights com IA
   */
  generateInsights: protectedProcedure
    .input(z.object({
      data: z.array(z.any()),
      templateType: z.enum(['market', 'client', 'competitive', 'lead']),
      depth: z.enum(['quick', 'standard', 'deep'])
    }))
    .mutation(async ({ input }) => {
      const statistics = analysisService.calculateStatistics(input.data);
      const insights = await analysisService.generateInsights(
        statistics,
        input.templateType,
        input.depth
      );
      
      return insights;
    }),
  
  /**
   * Renderiza formato final
   */
  renderOutput: protectedProcedure
    .input(z.object({
      data: z.array(z.any()),
      fields: z.array(z.string()),
      format: z.enum(['csv', 'excel', 'pdf', 'json']),
      outputType: z.enum(['simple', 'complete', 'report']),
      insights: InsightReportSchema.optional(),
      options: z.any().optional()
    }))
    .mutation(async ({ input }) => {
      let renderer;
      
      switch (input.format) {
        case 'csv':
          renderer = new CSVRenderer();
          break;
        case 'excel':
          renderer = new ExcelRenderer();
          break;
        case 'pdf':
          renderer = input.outputType === 'report' 
            ? new PDFReportRenderer() 
            : new PDFListRenderer();
          break;
        case 'json':
          renderer = new JSONRenderer();
          break;
      }
      
      const buffer = await renderer.render(
        input.data,
        input.fields,
        input.insights,
        input.options
      );
      
      // Salva em S3
      const { url } = await storagePut(
        `exports/${Date.now()}-export.${input.format}`,
        buffer,
        `application/${input.format}`
      );
      
      // Registra no histórico
      await db.exportHistory.create({
        userId: ctx.user.id,
        context: input.options?.context,
        format: input.format,
        outputType: input.outputType,
        recordCount: input.data.length,
        fileUrl: url,
        fileSize: buffer.length
      });
      
      return { url };
    }),
  
  /**
   * Lista histórico de exportações
   */
  listHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0)
    }))
    .query(async ({ input, ctx }) => {
      const history = await db.exportHistory.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset
      });
      
      return history;
    })
});
```

### 7.2 Schema do Banco de Dados

Adicionar tabelas para suportar o módulo:

```typescript
// drizzle/schema.ts

export const exportHistory = mysqlTable('export_history', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('userId', { length: 64 }).notNull(),
  context: text('context'),                    // Contexto original
  filters: json('filters'),                    // Filtros aplicados
  format: mysqlEnum('format', ['csv', 'excel', 'pdf', 'json']).notNull(),
  outputType: mysqlEnum('outputType', ['simple', 'complete', 'report']).notNull(),
  recordCount: int('recordCount').notNull(),
  fileUrl: text('fileUrl').notNull(),
  fileSize: int('fileSize').notNull(),         // Bytes
  createdAt: timestamp('createdAt').defaultNow()
});

export const savedFilters = mysqlTable('saved_filters', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: varchar('userId', { length: 64 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  filters: json('filters').notNull(),
  isPublic: boolean('isPublic').default(false),
  shareToken: varchar('shareToken', { length: 64 }),
  usageCount: int('usageCount').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow()
});

export const exportTemplates = mysqlTable('export_templates', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  templateType: mysqlEnum('templateType', ['market', 'client', 'competitive', 'lead']).notNull(),
  config: json('config').notNull(),            // Configuração do template
  isSystem: boolean('isSystem').default(false), // Template do sistema ou customizado
  userId: varchar('userId', { length: 64 }),   // Null se for template do sistema
  createdAt: timestamp('createdAt').defaultNow()
});
```

---

## 8. Estimativas e Métricas

### 8.1 Performance Esperada

| Operação | Volume | Tempo Estimado | Observações |
|----------|--------|----------------|-------------|
| Interpretação de Contexto | 1 contexto | ~2s | Chamada à API Gemini |
| Validação de Filtros | 1 query | ~0.5s | Cache local |
| Execução de Query | 1.000 registros | ~3s | Com 2 joins |
| Execução de Query | 10.000 registros | ~15s | Com 2 joins |
| Geração de Insights | 1.000 registros | ~30s | Análise padrão |
| Geração de Insights | 1.000 registros | ~90s | Análise profunda |
| Renderização CSV | 10.000 registros | ~5s | Sem relacionamentos |
| Renderização Excel | 10.000 registros | ~15s | Com formatação |
| Renderização PDF Lista | 1.000 registros | ~20s | Com tabelas |
| Renderização PDF Relatório | 1.000 registros | ~60s | Com insights e gráficos |

### 8.2 Limites Recomendados

| Recurso | Limite | Justificativa |
|---------|--------|---------------|
| Registros por Exportação | 50.000 | Performance de renderização |
| Tamanho de Arquivo | 100 MB | Limite de download no navegador |
| Relacionamentos Simultâneos | 5 | Complexidade de joins |
| Insights por Relatório | 7 | Legibilidade |
| Gráficos por Relatório | 10 | Tamanho do PDF |
| Histórico de Exportações | 100 | Por usuário |
| Filtros Salvos | 50 | Por usuário |

### 8.3 Custos Estimados

**Custos de IA (Gemini):**
- Interpretação de Contexto: ~500 tokens = $0.001
- Geração de Insights (Padrão): ~3.000 tokens = $0.006
- Geração de Insights (Profunda): ~8.000 tokens = $0.016

**Custos de Armazenamento (S3):**
- Arquivo CSV (10k registros): ~2 MB = $0.00005/mês
- Arquivo Excel (10k registros): ~5 MB = $0.00012/mês
- Arquivo PDF Relatório: ~10 MB = $0.00024/mês

**Custo Total Estimado por Exportação:**
- Lista Simples: ~$0.001
- Lista Completa: ~$0.002
- Relatório Contextualizado: ~$0.020

---

## 9. Roadmap de Implementação

### Fase 1: MVP (2 semanas)

**Semana 1:**
- [ ] Implementar wizard de 4 etapas (frontend)
- [ ] Implementar interpretação de contexto com IA
- [ ] Implementar Query Builder básico
- [ ] Implementar exportação CSV e Excel simples

**Semana 2:**
- [ ] Implementar sistema de relacionamentos
- [ ] Implementar renderização PDF lista
- [ ] Implementar histórico de exportações
- [ ] Testes de integração

**Entregáveis:**
- Exportação de listas simples e completas
- Suporte a CSV, Excel e PDF tabular
- Interpretação de contextos básicos
- Histórico de exportações

### Fase 2: Relatórios Contextualizados (2 semanas)

**Semana 3:**
- [ ] Implementar motor de análise estatística
- [ ] Implementar geração de insights com IA
- [ ] Implementar 4 templates de relatório
- [ ] Implementar geração de gráficos

**Semana 4:**
- [ ] Implementar renderização PDF relatório
- [ ] Implementar sistema de templates customizáveis
- [ ] Otimizações de performance
- [ ] Testes completos

**Entregáveis:**
- Relatórios contextualizados com IA
- 4 templates especializados
- Gráficos automáticos
- Análises semânticas profissionais

### Fase 3: Funcionalidades Avançadas (1 semana)

**Semana 5:**
- [ ] Implementar filtros salvos e compartilháveis
- [ ] Implementar templates customizáveis
- [ ] Implementar agendamento de exportações recorrentes
- [ ] Implementar notificações de conclusão
- [ ] Documentação completa

**Entregáveis:**
- Filtros salvos e compartilháveis
- Templates customizáveis
- Agendamento de exportações
- Sistema completo em produção

---

## 10. Considerações Finais

### 10.1 Diferenciais Competitivos

Este módulo posiciona o Sistema PAV como uma **plataforma de inteligência de mercado de classe empresarial**, oferecendo:

**Flexibilidade sem Precedentes:** A combinação de interpretação por IA com filtros estruturados permite que usuários desde iniciantes até analistas avançados extraiam exatamente os dados que precisam, sem limitações técnicas.

**Contexto Profissional Automático:** Ao invés de simplesmente exportar dados brutos, o sistema transforma informações em narrativas de negócio acionáveis, economizando horas de análise manual e aumentando significativamente o valor percebido.

**Escalabilidade e Performance:** A arquitetura com cache inteligente, queries otimizadas e processamento paralelo garante que o sistema mantenha performance mesmo com volumes crescentes de dados.

**Experiência de Usuário Superior:** O wizard progressivo, preview em tempo real e validações contextuais eliminam frustrações comuns em sistemas de exportação, resultando em maior adoção e satisfação.

### 10.2 Próximos Passos

Para avançar com a implementação, recomendo:

1. **Validação com Usuários:** Apresentar wireframes do wizard para 3-5 usuários-chave e coletar feedback sobre fluxo e funcionalidades
2. **Priorização de Templates:** Definir qual dos 4 templates de relatório tem maior demanda para implementar primeiro
3. **Definição de Limites:** Estabelecer limites técnicos (registros, tamanho de arquivo) baseados em infraestrutura disponível
4. **Aprovação de Custos:** Validar custos estimados de IA e armazenamento com orçamento disponível

---

**Autor:** Manus AI  
**Versão:** 1.0  
**Data:** 20 de Novembro de 2025
