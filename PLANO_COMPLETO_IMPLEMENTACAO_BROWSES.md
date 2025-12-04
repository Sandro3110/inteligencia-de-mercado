# Plano Completo de Implementação - Browses e Cards de Detalhes

**Data:** 04 de dezembro de 2025  
**Autor:** Engenharia de Dados e Arquitetura da Informação  
**Objetivo:** Especificação completa de conteúdo, campos, relacionamentos e ações para cada browse e card de detalhes

---

## 📊 1. BROWSE DE ENTIDADES (Clientes, Leads, Concorrentes)

### 1.1 Conteúdo do Browse (Lista)

**Campos Exibidos na Lista:**

| Campo | Fonte | Exibição | Observação |
|-------|-------|----------|------------|
| **Ícone de Tipo** | `tipo_entidade` | 👥 Cliente / ➕ Lead / 🏢 Concorrente | Badge colorido |
| **Nome** | `nome` | Título principal (negrito, 18px) | Clickável |
| **Nome Fantasia** | `nome_fantasia` | Subtítulo (cinza, 14px) | Se existir |
| **CNPJ** | `cnpj` | Formatado: 00.000.000/0000-00 | Ícone de validação ✅/❌ |
| **Localização** | `cidade` + `uf` | São Paulo/SP | Ícone 📍 |
| **Setor** | `setor` | Badge secundário | Ex: "Tecnologia" |
| **Porte** | `porte` | Badge | Pequeno/Médio/Grande |
| **Contato** | `email` + `telefone` | Ícones clicáveis | ✉️ 📞 |
| **Site** | `site` | Link externo | 🌐 |
| **Score Qualidade** | `score_qualidade_dados` | Progress bar (0-100%) | Verde/Amarelo/Vermelho |
| **Enriquecido** | `enriquecido_em` | Badge "✨ Enriquecido" ou "⚠️ Não enriquecido" | Com data |
| **Criado em** | `created_at` | Relativo: "há 2 dias" | Tooltip com data completa |

**Layout da Lista:**

```
┌────────────────────────────────────────────────────────────────┐
│ 👥 Empresa Alpha Tecnologia Ltda          [Cliente] [Tecnologia]│
│    Alpha Tech                                                   │
│                                                                  │
│ 📋 12.345.678/0001-90 ✅  📍 São Paulo/SP  📦 Pequeno           │
│ ✉️ contato@alpha.com.br  📞 (11) 3456-7890  🌐 www.alpha.com.br│
│                                                                  │
│ Qualidade: ████████░░ 80%  ⚠️ Não enriquecido  📅 há 2 dias    │
└────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Filtros do Browse

**Filtros Herdados (da Gestão de Conteúdo):**
- 📁 **Projeto:** ID do projeto selecionado
- 🔍 **Pesquisa:** ID da pesquisa selecionada
- 📊 **Tipo:** cliente | lead | concorrente

**Filtros Específicos:**

| Filtro | Tipo | Opções | Observação |
|--------|------|--------|------------|
| **Busca Textual** | Input | Nome, CNPJ, Email | Debounce 500ms |
| **Cidade** | Autocomplete | Cidades do banco | Com contador |
| **UF** | Select | Todos os estados | Com contador |
| **Setor** | Autocomplete | Setores do banco | Com contador |
| **Porte** | Select | Pequeno/Médio/Grande | Com contador |
| **Score Qualidade** | Range Slider | 0-100% | Min/Max |
| **Enriquecido** | Toggle | Sim/Não/Todos | 3 estados |
| **Data Criação** | Date Range | De/Até | Calendário |
| **Validações** | Checkboxes | CNPJ ✅ / Email ✅ / Telefone ✅ | Múltipla seleção |

**Layout dos Filtros:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Filtros Ativos:                                          │
│ [Projeto: Expansão Sul 2025 ×] [Pesquisa: SUCESSO TOTAL ×] │
│ [Tipo: Cliente ×] [Limpar Todos]                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Busca: [________________]  Cidade: [__________]  UF: [__▼]  │
│ Setor: [__________]  Porte: [_____▼]  Score: [===|===] 40-80│
│ Enriquecido: ○ Todos ● Sim ○ Não                            │
│ Data: [__/__/____] até [__/__/____]                          │
│ Validações: ☑ CNPJ ☐ Email ☑ Telefone                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.3 Card de Detalhes da Entidade (Sheet/Drawer)

**Estrutura em Abas:**

#### **Aba 1: Dados Cadastrais** 📋

| Seção | Campos |
|-------|--------|
| **Identificação** | nome, nome_fantasia, tipo_entidade, entidade_hash |
| **Documentos** | cnpj (validação ✅/❌), cpf_hash |
| **Contato** | email (validação ✅/❌), telefone (validação ✅/❌), site |
| **Localização** | cidade, uf, região (derivado), código IBGE (se houver) |
| **Dados Comerciais** | porte, setor, produto_principal, segmentacao_b2b_b2c |
| **Estrutura** | num_filiais, num_lojas, num_funcionarios |

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 DADOS CADASTRAIS                                          │
├─────────────────────────────────────────────────────────────┤
│ IDENTIFICAÇÃO                                                │
│ Nome Razão Social: Empresa Alpha Tecnologia Ltda            │
│ Nome Fantasia: Alpha Tech                                    │
│ Tipo: [Cliente] Hash: e5a46fc6...                           │
│                                                              │
│ DOCUMENTOS                                                   │
│ CNPJ: 12.345.678/0001-90 ✅ Válido                          │
│                                                              │
│ CONTATO                                                      │
│ Email: contato@alpha.com.br ✅ Válido [Copiar] [Enviar]     │
│ Telefone: (11) 3456-7890 ❌ Não validado [Copiar] [Ligar]  │
│ Site: www.alpha.com.br [Visitar]                             │
│                                                              │
│ LOCALIZAÇÃO                                                  │
│ Cidade/UF: São Paulo/SP (Região Sudeste)                    │
│ [Ver no Mapa]                                                │
│                                                              │
│ DADOS COMERCIAIS                                             │
│ Porte: Pequeno (50 funcionários)                             │
│ Setor: Tecnologia                                            │
│ Segmentação: B2B                                             │
│ Produto Principal: Software de gestão empresarial            │
│                                                              │
│ ESTRUTURA                                                    │
│ Filiais: 3 | Lojas: 0 | Funcionários: 50                    │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Aba 2: Qualidade de Dados** 📊

| Métrica | Campo | Exibição |
|---------|-------|----------|
| **Score Geral** | `score_qualidade_dados` | Gauge 0-100% |
| **Validações** | `validacao_cnpj`, `validacao_email`, `validacao_telefone` | ✅/❌ com detalhes |
| **Campos Faltantes** | `campos_faltantes` | Lista de campos vazios |
| **Última Validação** | `ultima_validacao` | Data + hora |
| **Status Qualificação** | `status_qualificacao_id` → `dim_status_qualificacao` | Badge colorido |

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 QUALIDADE DE DADOS                                        │
├─────────────────────────────────────────────────────────────┤
│ SCORE GERAL DE QUALIDADE                                     │
│     ┌─────────┐                                              │
│     │   80%   │  ← Gauge circular                            │
│     └─────────┘                                              │
│     Boa qualidade                                            │
│                                                              │
│ VALIDAÇÕES                                                   │
│ ✅ CNPJ: Válido (verificado em 04/12/2025)                  │
│ ✅ Email: Válido (verificado em 04/12/2025)                 │
│ ❌ Telefone: Não validado                                   │
│                                                              │
│ CAMPOS FALTANTES (5)                                         │
│ • cidade                                                     │
│ • uf                                                         │
│ • porte                                                      │
│ • setor                                                      │
│ • produto_principal                                          │
│                                                              │
│ [Enriquecer com IA] [Preencher Manualmente]                 │
│                                                              │
│ Última validação: 04/12/2025 às 09:54                       │
│ Status: [Qualificado] [Alterar Status]                      │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Aba 3: Enriquecimento IA** ✨

| Seção | Campos |
|-------|--------|
| **Status** | `enriquecido_em`, `enriquecido_por`, `cache_hit` |
| **Dados Enriquecidos** | Campos preenchidos pela IA |
| **Histórico** | Logs de enriquecimento |
| **Ações** | Enriquecer novamente, Ver prompt usado |

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ✨ ENRIQUECIMENTO IA                                         │
├─────────────────────────────────────────────────────────────┤
│ STATUS                                                       │
│ ⚠️ Não enriquecido                                          │
│                                                              │
│ [Enriquecer com IA Agora]                                    │
│                                                              │
│ DADOS QUE SERÃO ENRIQUECIDOS:                                │
│ • Cidade e UF (via CNPJ)                                     │
│ • Porte (via número de funcionários)                         │
│ • Setor (via análise do nome e site)                         │
│ • Produto Principal (via análise do site)                    │
│ • Segmentação B2B/B2C                                        │
│                                                              │
│ CUSTO ESTIMADO: 0.05 créditos                                │
│ TEMPO ESTIMADO: 10-15 segundos                               │
└─────────────────────────────────────────────────────────────┘
```

**Se já enriquecido:**

```
┌─────────────────────────────────────────────────────────────┐
│ ✨ ENRIQUECIMENTO IA                                         │
├─────────────────────────────────────────────────────────────┤
│ STATUS                                                       │
│ ✅ Enriquecido em 03/12/2025 às 14:30                       │
│ Por: sandrodireto@gmail.com                                  │
│ Cache: ✅ Hit (dados em cache até 10/12/2025)               │
│                                                              │
│ DADOS ENRIQUECIDOS:                                          │
│ ✅ Cidade/UF: São Paulo/SP                                  │
│ ✅ Porte: Pequeno                                           │
│ ✅ Setor: Tecnologia                                        │
│ ✅ Produto Principal: Software de gestão                    │
│ ✅ Segmentação: B2B                                         │
│                                                              │
│ [Ver Prompt Usado] [Enriquecer Novamente] [Limpar Cache]    │
│                                                              │
│ HISTÓRICO DE ENRIQUECIMENTOS (3)                             │
│ 1. 03/12/2025 14:30 - Enriquecimento completo (0.05 créditos│
│ 2. 02/12/2025 10:15 - Atualização parcial (0.02 créditos)   │
│ 3. 01/12/2025 16:45 - Primeira análise (0.05 créditos)      │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Aba 4: Produtos e Mercados** 📦

| Seção | Fonte | Exibição |
|-------|-------|----------|
| **Produtos** | `fato_entidade_produto` → `dim_produto` | Lista de produtos vinculados |
| **Mercados** | `dim_mercado` (via `entidade_id`) | Lista de mercados vinculados |
| **Ações** | - | Adicionar produto, Adicionar mercado |

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 PRODUTOS E MERCADOS                                       │
├─────────────────────────────────────────────────────────────┤
│ PRODUTOS VINCULADOS (2)                                      │
│                                                              │
│ 1. Smartphone Samsung Galaxy S21                             │
│    Categoria: Eletrônicos                                    │
│    Descrição: O Samsung Galaxy S21 é um smartphone...       │
│    [Ver Detalhes] [Remover]                                  │
│                                                              │
│ 2. Sofá Retrátil e Reclinável 3 lugares                     │
│    Categoria: Móveis                                         │
│    Descrição: Este sofá retrátil e reclinável...            │
│    [Ver Detalhes] [Remover]                                  │
│                                                              │
│ [+ Adicionar Produto]                                        │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ MERCADOS VINCULADOS (1)                                      │
│                                                              │
│ 1. Varejo de Eletrônicos e Móveis Online                    │
│    Categoria: Comércio | Segmentação: B2C                   │
│    Tamanho: R$ 60 bi/ano                                     │
│    Crescimento: 15% ao ano                                   │
│    Score Atratividade: ⭐⭐⭐⭐⭐ (95/100)                    │
│    [Ver Detalhes] [Remover]                                  │
│                                                              │
│ [+ Adicionar Mercado]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Aba 5: Rastreabilidade** 🔍

| Seção | Campos |
|-------|--------|
| **Origem** | `origem_tipo`, `origem_arquivo`, `origem_processo`, `origem_prompt`, `origem_confianca`, `origem_data`, `origem_usuario_id` |
| **Importação** | `importacao_id` → `dim_importacao` |
| **Auditoria** | `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` |

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 RASTREABILIDADE                                           │
├─────────────────────────────────────────────────────────────┤
│ ORIGEM DOS DADOS                                             │
│ Tipo: Importação                                             │
│ Arquivo: test-import.csv                                     │
│ Data: 02/12/2025 às 19:56                                    │
│ Importação ID: #3 [Ver Detalhes da Importação]              │
│                                                              │
│ AUDITORIA                                                    │
│ Criado em: 02/12/2025 às 19:56                              │
│ Criado por: Sistema (importação automática)                 │
│                                                              │
│ Última atualização: 04/12/2025 às 09:54                     │
│ Atualizado por: Sistema (validação automática)              │
│                                                              │
│ HISTÓRICO DE ALTERAÇÕES (5)                                  │
│ 1. 04/12/2025 09:54 - Validação de qualidade                │
│ 2. 03/12/2025 14:30 - Enriquecimento IA                      │
│ 3. 03/12/2025 10:00 - Atualização manual (campo setor)      │
│ 4. 02/12/2025 20:15 - Vinculação a projeto                  │
│ 5. 02/12/2025 19:56 - Criação (importação)                  │
│                                                              │
│ [Ver Log Completo]                                           │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Aba 6: Ações** ⚡

**Ações Disponíveis:**

| Ação | Ícone | Descrição | Condição |
|------|-------|-----------|----------|
| **Editar** | ✏️ | Abrir formulário de edição | Sempre |
| **Enriquecer com IA** | ✨ | Executar enriquecimento | Se não enriquecido ou cache expirado |
| **Converter para Cliente** | 👥 | Mudar tipo de lead → cliente | Se tipo = lead |
| **Converter para Lead** | ➕ | Mudar tipo de cliente → lead | Se tipo = cliente |
| **Exportar PDF** | 📄 | Gerar PDF com dados completos | Sempre |
| **Exportar JSON** | 📋 | Exportar dados estruturados | Sempre |
| **Duplicar** | 📑 | Criar cópia da entidade | Sempre |
| **Arquivar** | 📦 | Soft delete (deleted_at) | Se não arquivado |
| **Restaurar** | ♻️ | Remover soft delete | Se arquivado |
| **Deletar** | 🗑️ | Hard delete (permanente) | Apenas admin |

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ AÇÕES                                                     │
├─────────────────────────────────────────────────────────────┤
│ AÇÕES RÁPIDAS                                                │
│ [✏️ Editar] [✨ Enriquecer com IA] [👥 Converter p/ Cliente]│
│                                                              │
│ EXPORTAR                                                     │
│ [📄 PDF] [📋 JSON] [📊 Excel]                               │
│                                                              │
│ OUTRAS AÇÕES                                                 │
│ [📑 Duplicar] [📦 Arquivar]                                  │
│                                                              │
│ ZONA DE PERIGO                                               │
│ [🗑️ Deletar Permanentemente]                                │
│ ⚠️ Esta ação não pode ser desfeita!                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 2. BROWSE DE PRODUTOS

### 2.1 Conteúdo do Browse (Lista)

**Campos Exibidos na Lista:**

| Campo | Fonte | Exibição |
|-------|-------|----------|
| **Nome** | `nome` | Título principal (negrito, 18px) |
| **Categoria** | `categoria` | Badge colorido |
| **Descrição** | `descricao` | Resumo (2 linhas, truncado) |
| **Público-Alvo** | `publico_alvo` | Badge secundário |
| **Precificação** | `precificacao` | Texto ou badge |
| **Entidade** | `entidade_id` → `dim_entidade.nome` | Link para entidade |
| **Criado em** | `created_at` | Relativo: "há 2 dias" |

**Layout da Lista:**

```
┌────────────────────────────────────────────────────────────────┐
│ 📱 Smartphone Samsung Galaxy S21          [Eletrônicos]        │
│                                                                 │
│ O Samsung Galaxy S21 é um smartphone premium com tela AMOLED...│
│                                                                 │
│ 🎯 Público: Consumidores finais | 💰 R$ 3.500 - R$ 4.500      │
│ 🏢 Entidade: Magazine Luiza                                    │
│ 📅 Criado há 1 dia                                              │
└────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Filtros do Browse de Produtos

| Filtro | Tipo | Opções |
|--------|------|--------|
| **Busca Textual** | Input | Nome, Descrição |
| **Categoria** | Select | Eletrônicos, Móveis, Alimentos, etc |
| **Público-Alvo** | Select | B2B, B2C, Ambos |
| **Entidade** | Autocomplete | Todas as entidades |
| **Data Criação** | Date Range | De/Até |

---

### 2.3 Card de Detalhes do Produto

**Abas:**

#### **Aba 1: Informações Gerais** 📋

| Campo | Exibição |
|-------|----------|
| `nome` | Título |
| `descricao` | Texto completo |
| `categoria` | Badge |
| `funcionalidades` | Lista de bullet points |
| `publico_alvo` | Badge |
| `diferenciais` | Lista de bullet points |
| `tecnologias` | Tags |
| `precificacao` | Texto formatado |

#### **Aba 2: Entidade Vinculada** 🏢

| Campo | Exibição |
|-------|----------|
| `entidade_id` → `dim_entidade` | Card resumido da entidade |
| Link | "Ver detalhes completos da entidade" |

#### **Aba 3: Ações** ⚡

- Editar
- Exportar PDF
- Duplicar
- Arquivar
- Deletar

---

## 🎯 3. BROWSE DE MERCADOS

### 3.1 Conteúdo do Browse (Lista)

**Campos Exibidos na Lista:**

| Campo | Fonte | Exibição |
|-------|-------|----------|
| **Nome** | `nome` | Título principal |
| **Categoria** | `categoria` | Badge |
| **Segmentação** | `segmentacao` | B2B/B2C |
| **Tamanho Mercado** | `tamanho_mercado` | Texto destacado |
| **Crescimento** | `crescimento_anual` | Badge verde/amarelo/vermelho |
| **Score Atratividade** | `score_atratividade` | Estrelas ⭐ (0-100 → 0-5 estrelas) |
| **Sentimento** | `sentimento` | Badge: Positivo/Neutro/Negativo |
| **Entidade** | `entidade_id` → `dim_entidade.nome` | Link |

**Layout da Lista:**

```
┌────────────────────────────────────────────────────────────────┐
│ 🛒 Varejo de Eletrônicos e Móveis Online    [Comércio] [B2C]  │
│                                                                 │
│ 💰 Tamanho: R$ 60 bi/ano | 📈 Crescimento: 15% ao ano          │
│ ⭐⭐⭐⭐⭐ Score Atratividade: 95/100                          │
│ 😊 Sentimento: Positivo                                        │
│                                                                 │
│ 🏢 Entidade: Magazine Luiza                                    │
│ 📅 Criado há 1 dia                                              │
└────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Filtros do Browse de Mercados

| Filtro | Tipo | Opções |
|--------|------|--------|
| **Busca Textual** | Input | Nome |
| **Categoria** | Select | Comércio, Serviços, Indústria, etc |
| **Segmentação** | Select | B2B, B2C, Ambos |
| **Score Atratividade** | Range Slider | 0-100 |
| **Sentimento** | Select | Positivo, Neutro, Negativo |
| **Nível Saturação** | Select | Baixo, Médio, Alto |
| **Entidade** | Autocomplete | Todas as entidades |

---

### 3.3 Card de Detalhes do Mercado

**Abas:**

#### **Aba 1: Visão Geral** 📊

| Campo | Exibição |
|-------|----------|
| `nome` | Título |
| `categoria` | Badge |
| `segmentacao` | Badge |
| `tamanho_mercado` | Destaque |
| `crescimento_anual` | Gráfico de tendência |
| `principais_players` | Lista de empresas |
| `tendencias` | Lista de bullet points |

#### **Aba 2: Análise Estratégica** 🎯

| Campo | Exibição |
|-------|----------|
| `score_atratividade` | Gauge 0-100 |
| `sentimento` | Badge + justificativa |
| `nivel_saturacao` | Gauge |
| `oportunidades` | Lista de bullet points |
| `riscos` | Lista de bullet points |
| `recomendacao_estrategica` | Texto destacado |

#### **Aba 3: Entidade Vinculada** 🏢

| Campo | Exibição |
|-------|----------|
| `entidade_id` → `dim_entidade` | Card resumido |
| Link | "Ver detalhes completos" |

#### **Aba 4: Ações** ⚡

- Editar
- Exportar PDF
- Duplicar
- Arquivar
- Deletar

---

## 🔗 4. RELACIONAMENTOS ENTRE ENTIDADES

### 4.1 Diagrama de Relacionamentos

```
┌─────────────────┐
│  dim_entidade   │
│  (Mestre)       │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         │ 1:N                                 │ 1:N
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│  dim_produto     │                  │  dim_mercado     │
│  entidade_id (FK)│                  │  entidade_id (FK)│
└──────────────────┘                  └──────────────────┘
         │
         │ N:M (via fato_entidade_produto)
         ▼
┌──────────────────────┐
│ fato_entidade_produto│
│  entidade_id (FK)    │
│  produto_id (FK)     │
└──────────────────────┘
```

### 4.2 Navegação entre Entidades

**Fluxo de Navegação:**

1. **Gestão de Conteúdo** → Click em "Clientes" → **Browse de Entidades (tipo=cliente)**
2. **Browse de Entidades** → Duplo click → **Card de Detalhes da Entidade**
3. **Card de Detalhes** (Aba Produtos) → Click em produto → **Card de Detalhes do Produto**
4. **Card de Detalhes do Produto** → Click em entidade → **Volta para Card de Detalhes da Entidade**

**Breadcrumbs:**

```
Gestão de Conteúdo > Clientes > Empresa Alpha Tecnologia Ltda > Produtos > Smartphone Samsung Galaxy S21
```

---

## ⚡ 5. AÇÕES DISPONÍVEIS EM CADA CONTEXTO

### 5.1 Ações no Browse de Entidades

| Ação | Ícone | Descrição | Localização |
|------|-------|-----------|-------------|
| **Duplo Click** | - | Abrir card de detalhes | Linha inteira |
| **Exportar Selecionados** | 📊 | Exportar múltiplas entidades | Toolbar |
| **Enriquecer em Lote** | ✨ | Enriquecer múltiplas entidades | Toolbar |
| **Importar Dados** | 📤 | Abrir modal de importação | Toolbar |
| **Filtros Avançados** | 🔍 | Expandir painel de filtros | Toolbar |

### 5.2 Ações no Card de Detalhes

**Ações Primárias (sempre visíveis):**
- ✏️ Editar
- ✨ Enriquecer com IA
- 📄 Exportar PDF
- ❌ Fechar

**Ações Secundárias (menu dropdown):**
- 📋 Exportar JSON
- 📊 Exportar Excel
- 📑 Duplicar
- 👥 Converter tipo
- 📦 Arquivar
- 🗑️ Deletar

---

## 📋 6. CHECKLIST DE IMPLEMENTAÇÃO COMPLETO

### Backend - APIs

#### **API `/api/entidades`**

- [ ] **Query Parameters:**
  - [ ] `tipo` (cliente|lead|concorrente)
  - [ ] `projeto_id` (number)
  - [ ] `pesquisa_id` (number)
  - [ ] `busca` (string - nome, CNPJ, email)
  - [ ] `cidade` (string)
  - [ ] `uf` (string)
  - [ ] `setor` (string)
  - [ ] `porte` (string)
  - [ ] `score_min` (number 0-100)
  - [ ] `score_max` (number 0-100)
  - [ ] `enriquecido` (boolean)
  - [ ] `data_inicio` (date)
  - [ ] `data_fim` (date)
  - [ ] `validacao_cnpj` (boolean)
  - [ ] `validacao_email` (boolean)
  - [ ] `validacao_telefone` (boolean)
  - [ ] `limit` (number, default: 50)
  - [ ] `offset` (number, default: 0)

- [ ] **Response:**
  - [ ] Retornar 48 campos de `dim_entidade`
  - [ ] JOIN com `fato_entidade_contexto` para filtrar por projeto/pesquisa
  - [ ] JOIN com `dim_status_qualificacao` para status
  - [ ] Incluir `total` count
  - [ ] Incluir `limit` e `offset` para paginação

#### **API `/api/entidades/:id`**

- [ ] **Response:**
  - [ ] Todos os 48 campos de `dim_entidade`
  - [ ] Dados de `dim_importacao` (se `importacao_id` existir)
  - [ ] Dados de `dim_status_qualificacao`
  - [ ] Lista de produtos vinculados (`fato_entidade_produto` → `dim_produto`)
  - [ ] Lista de mercados vinculados (`dim_mercado`)
  - [ ] Histórico de alterações (audit logs)

#### **API `/api/produtos`**

- [ ] **Query Parameters:**
  - [ ] `busca` (nome, descrição)
  - [ ] `categoria` (string)
  - [ ] `publico_alvo` (string)
  - [ ] `entidade_id` (number)
  - [ ] `limit`, `offset`

- [ ] **Response:**
  - [ ] Todos os campos de `dim_produto`
  - [ ] JOIN com `dim_entidade` para nome da entidade
  - [ ] Total count

#### **API `/api/produtos/:id`**

- [ ] **Response:**
  - [ ] Todos os campos de `dim_produto`
  - [ ] Dados completos de `dim_entidade`
  - [ ] Entidades vinculadas (`fato_entidade_produto`)

#### **API `/api/mercados`**

- [ ] **Query Parameters:**
  - [ ] `busca` (nome)
  - [ ] `categoria` (string)
  - [ ] `segmentacao` (B2B|B2C)
  - [ ] `score_min`, `score_max` (0-100)
  - [ ] `sentimento` (Positivo|Neutro|Negativo)
  - [ ] `nivel_saturacao` (Baixo|Médio|Alto)
  - [ ] `entidade_id` (number)
  - [ ] `limit`, `offset`

- [ ] **Response:**
  - [ ] Todos os campos de `dim_mercado`
  - [ ] JOIN com `dim_entidade`
  - [ ] Total count

#### **API `/api/mercados/:id`**

- [ ] **Response:**
  - [ ] Todos os campos de `dim_mercado`
  - [ ] Dados completos de `dim_entidade`

---

### Frontend - Componentes

#### **DesktopTurboPage**

- [ ] Passar `projeto_id` e `pesquisa_id` ao navegar para browse
- [ ] Atualizar `handleRowClick` para incluir query params

#### **EntidadesListPage**

- [ ] **Filtros Herdados:**
  - [ ] Ler `tipo` da URL
  - [ ] Ler `projeto_id` da URL
  - [ ] Ler `pesquisa_id` da URL
  - [ ] Exibir badges de filtros ativos

- [ ] **Filtros Específicos:**
  - [ ] Input de busca textual (debounce 500ms)
  - [ ] Autocomplete de cidade
  - [ ] Select de UF
  - [ ] Autocomplete de setor
  - [ ] Select de porte
  - [ ] Range slider de score (0-100)
  - [ ] Toggle de enriquecido (Sim/Não/Todos)
  - [ ] Date range de criação
  - [ ] Checkboxes de validações (CNPJ, Email, Telefone)

- [ ] **Lista de Entidades:**
  - [ ] Exibir todos os campos conforme layout
  - [ ] Implementar duplo click → abrir `EntidadeDetailsSheet`
  - [ ] Adicionar hint "Duplo clique para ver detalhes"

- [ ] **Toolbar:**
  - [ ] Botão "Exportar Selecionados"
  - [ ] Botão "Enriquecer em Lote"
  - [ ] Botão "Importar Dados"
  - [ ] Botão "Filtros Avançados"

#### **EntidadeDetailsSheet**

- [ ] **Estrutura:**
  - [ ] Usar `Sheet` do shadcn/ui
  - [ ] Largura: 800px
  - [ ] Scroll vertical automático

- [ ] **Aba 1: Dados Cadastrais**
  - [ ] Seção Identificação
  - [ ] Seção Documentos
  - [ ] Seção Contato (com botões Copiar, Enviar, Ligar)
  - [ ] Seção Localização (com botão Ver no Mapa)
  - [ ] Seção Dados Comerciais
  - [ ] Seção Estrutura

- [ ] **Aba 2: Qualidade de Dados**
  - [ ] Gauge de score geral
  - [ ] Lista de validações (✅/❌)
  - [ ] Lista de campos faltantes
  - [ ] Botões "Enriquecer com IA" e "Preencher Manualmente"
  - [ ] Data da última validação
  - [ ] Status de qualificação

- [ ] **Aba 3: Enriquecimento IA**
  - [ ] Status de enriquecimento
  - [ ] Lista de dados enriquecidos
  - [ ] Botão "Enriquecer com IA Agora"
  - [ ] Custo e tempo estimado
  - [ ] Histórico de enriquecimentos
  - [ ] Botões "Ver Prompt", "Enriquecer Novamente", "Limpar Cache"

- [ ] **Aba 4: Produtos e Mercados**
  - [ ] Lista de produtos vinculados
  - [ ] Botão "Adicionar Produto"
  - [ ] Lista de mercados vinculados
  - [ ] Botão "Adicionar Mercado"
  - [ ] Botões "Ver Detalhes" e "Remover" em cada item

- [ ] **Aba 5: Rastreabilidade**
  - [ ] Seção Origem dos Dados
  - [ ] Seção Auditoria
  - [ ] Histórico de Alterações
  - [ ] Botão "Ver Log Completo"

- [ ] **Aba 6: Ações**
  - [ ] Seção Ações Rápidas
  - [ ] Seção Exportar
  - [ ] Seção Outras Ações
  - [ ] Seção Zona de Perigo

#### **ProdutosListPage**

- [ ] Implementar browse com filtros
- [ ] Implementar duplo click → `ProdutoDetailsSheet`
- [ ] Exibir campos conforme layout

#### **ProdutoDetailsSheet**

- [ ] Aba 1: Informações Gerais
- [ ] Aba 2: Entidade Vinculada
- [ ] Aba 3: Ações

#### **MercadosListPage**

- [ ] Implementar browse com filtros
- [ ] Implementar duplo click → `MercadoDetailsSheet`
- [ ] Exibir campos conforme layout

#### **MercadoDetailsSheet**

- [ ] Aba 1: Visão Geral
- [ ] Aba 2: Análise Estratégica
- [ ] Aba 3: Entidade Vinculada
- [ ] Aba 4: Ações

---

## ⏱️ 7. ESTIMATIVA DE TEMPO

### Backend (20 horas)

| Tarefa | Tempo |
|--------|-------|
| API `/api/entidades` completa | 4h |
| API `/api/entidades/:id` completa | 2h |
| API `/api/produtos` completa | 2h |
| API `/api/produtos/:id` completa | 1h |
| API `/api/mercados` completa | 2h |
| API `/api/mercados/:id` completa | 1h |
| tRPC procedures | 4h |
| Testes de integração | 4h |

### Frontend (30 horas)

| Tarefa | Tempo |
|--------|-------|
| DesktopTurboPage (passar filtros) | 1h |
| EntidadesListPage (filtros + duplo click) | 6h |
| EntidadeDetailsSheet (6 abas completas) | 10h |
| ProdutosListPage | 3h |
| ProdutoDetailsSheet | 3h |
| MercadosListPage | 3h |
| MercadoDetailsSheet | 3h |
| Testes E2E | 1h |

### **Total: 50 horas (6-7 dias úteis)**

---

## 🎯 8. PRIORIZAÇÃO

### **Sprint 1 (16h) - Entidades Completo**

1. API `/api/entidades` com filtros completos (4h)
2. API `/api/entidades/:id` com dados completos (2h)
3. DesktopTurboPage passar filtros (1h)
4. EntidadesListPage com filtros e duplo click (6h)
5. EntidadeDetailsSheet (3 abas: Cadastrais, Qualidade, Ações) (3h)

### **Sprint 2 (10h) - Entidades Avançado**

6. EntidadeDetailsSheet (3 abas: Enriquecimento, Produtos/Mercados, Rastreabilidade) (7h)
7. Testes E2E de entidades (1h)
8. Ajustes e refinamentos (2h)

### **Sprint 3 (12h) - Produtos**

9. API `/api/produtos` completa (2h)
10. API `/api/produtos/:id` completa (1h)
11. ProdutosListPage (3h)
12. ProdutoDetailsSheet (3h)
13. Testes (1h)
14. Ajustes (2h)

### **Sprint 4 (12h) - Mercados**

15. API `/api/mercados` completa (2h)
16. API `/api/mercados/:id` completa (1h)
17. MercadosListPage (3h)
18. MercadoDetailsSheet (3h)
19. Testes (1h)
20. Ajustes (2h)

---

## 📊 9. RESUMO EXECUTIVO

**Situação Atual:**
- ✅ Gestão de Conteúdo funcionando com filtros
- ⚠️ Browse de entidades limitado (4 campos, sem filtros, sem duplo click)
- ⚠️ Card de detalhes existe mas não é usado
- ❌ Browse de produtos/mercados são placeholders

**Solução Proposta:**
- ✅ API completa com 48 campos e 10+ filtros
- ✅ Browse com filtros herdados + específicos
- ✅ Duplo click → Sheet/Drawer com 6 abas
- ✅ Browses de produtos e mercados funcionais

**Tempo Total:** 50 horas (6-7 dias úteis)

**Impacto:**
- ✅ Fluxo completo funcionando
- ✅ Visão 360° de cada entidade
- ✅ Rastreabilidade completa
- ✅ Ações contextuais em cada tela
- ✅ Experiência consistente

---

**Próximos Passos:**
1. Aprovar plano completo
2. Iniciar Sprint 1 (Entidades Completo)
3. Validar com usuário
4. Iniciar Sprints 2, 3 e 4

---

**Autor:** Engenharia de Dados e Arquitetura da Informação  
**Revisão:** 04/12/2025 13:40  
**Versão:** 1.0 - Plano Completo
