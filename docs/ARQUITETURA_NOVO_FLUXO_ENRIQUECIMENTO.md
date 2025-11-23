# Arquitetura Proposta: Novo Fluxo de Enriquecimento

**Autor:** Manus AI  
**Data:** 20 de Novembro de 2025  
**Versão:** 1.0  
**Status:** Proposta para Validação

---

## 📋 Sumário Executivo

Este documento apresenta a **arquitetura redesenhada** do fluxo de enriquecimento, incorporando validação rigorosa de entrada de dados, flexibilização de parâmetros de pesquisa (quantidade de concorrentes e leads) e integração com OpenAI para pré-pesquisa automática. A nova arquitetura transforma o processo de criação de pesquisas em um **wizard guiado de 7 steps**, garantindo qualidade de dados desde a entrada até o enriquecimento final.

### Principais Mudanças

A arquitetura proposta introduz quatro mudanças fundamentais em relação ao fluxo atual. Primeiro, estabelece uma **política de validação obrigatória** na entrada de dados, impedindo que informações incorretas ou incompletas entrem no sistema. Segundo, implementa **três métodos de entrada de dados** (manual, planilha e pré-pesquisa com IA), oferecendo flexibilidade ao usuário. Terceiro, **flexibiliza os parâmetros de pesquisa**, permitindo que cada pesquisa defina sua própria quantidade de concorrentes e leads a buscar. Quarto, integra **OpenAI para pré-pesquisa automática**, transformando inputs simples (nome de cliente ou site) em dados estruturados e validados.

---

## 🎯 Objetivos da Redesign

### 1. Qualidade de Dados Garantida

O sistema atual permite entrada de dados sem validação rigorosa, resultando em registros incompletos ou incorretos que comprometem o enriquecimento posterior. A nova arquitetura implementa **validação em múltiplas camadas**, garantindo que apenas dados corretos e completos sejam gravados no banco de dados.

### 2. Flexibilidade de Parâmetros

Atualmente, a quantidade de concorrentes e leads buscados é fixa ou definida globalmente. A nova arquitetura permite que **cada pesquisa configure seus próprios parâmetros**, adaptando-se a diferentes necessidades de mercado. Por exemplo, uma pesquisa de mercado altamente competitivo pode buscar 20 concorrentes, enquanto uma pesquisa de nicho pode buscar apenas 5.

### 3. Automação Inteligente com IA

A integração com OpenAI permite que o usuário forneça **inputs mínimos** (apenas nome da empresa ou site) e o sistema automaticamente pesquisa, estrutura e valida os dados. Isso reduz drasticamente o tempo de preparação de dados e elimina erros de digitação ou formatação.

### 4. Experiência de Usuário Guiada

O novo wizard de 7 steps guia o usuário através de todo o processo, desde a seleção/criação do projeto até o início do enriquecimento. Cada step valida os dados antes de avançar, garantindo que o usuário não cometa erros e compreenda exatamente o que está acontecendo.

---

## 🏗️ Arquitetura Atual vs. Proposta

### Fluxo Atual (Simplificado)

O fluxo atual de enriquecimento segue uma sequência linear com validação mínima:

```
1. Usuário acessa /enrichment
2. Usuário seleciona template e configurações
3. Usuário clica em "Iniciar Enriquecimento"
4. Sistema busca clientes existentes no banco
5. Sistema enriquece dados via APIs
6. Sistema busca concorrentes (quantidade fixa)
7. Sistema busca leads (quantidade fixa)
8. Sistema grava resultados no banco
```

**Problemas Identificados:**

- **Sem validação de entrada:** Clientes podem ter dados incompletos ou incorretos
- **Parâmetros fixos:** Quantidade de concorrentes/leads não é configurável por pesquisa
- **Sem opção de pré-pesquisa:** Usuário precisa preparar dados manualmente antes
- **Sem wizard guiado:** Usuário pode cometer erros de configuração
- **Sem separação clara:** Criação de pesquisa e enriquecimento são misturados

### Fluxo Proposto (Wizard de 7 Steps)

A nova arquitetura separa claramente a **criação de pesquisa** do **enriquecimento de dados**, implementando um wizard guiado:

```
┌─────────────────────────────────────────────────────────────┐
│                    WIZARD DE CRIAÇÃO DE PESQUISA             │
└─────────────────────────────────────────────────────────────┘

STEP 1: Selecionar/Criar Projeto
  ├─ Opção A: Selecionar projeto existente (dropdown)
  └─ Opção B: Criar novo projeto (nome + descrição + cor)

STEP 2: Nomear Pesquisa
  ├─ Nome da pesquisa (obrigatório)
  ├─ Descrição da pesquisa (opcional)
  └─ Validação: Nome único dentro do projeto

STEP 3: Configurar Parâmetros de Pesquisa
  ├─ Quantidade de concorrentes a buscar por mercado (1-50, padrão: 10)
  ├─ Quantidade de leads a buscar por mercado (1-100, padrão: 10)
  └─ Validação: Valores dentro dos limites permitidos

STEP 4: Escolher Método de Entrada de Dados
  ├─ Opção A: Entrada Manual (formulário)
  ├─ Opção B: Upload de Planilha (CSV/Excel)
  └─ Opção C: Pré-Pesquisa com IA (nome ou site → dados estruturados)

STEP 5: Inserir/Validar Dados de Entrada
  ├─ Se Manual: Formulário com validação campo a campo
  ├─ Se Planilha: Upload → Mapeamento de colunas → Validação
  └─ Se IA: Input simples → Pesquisa OpenAI → Revisão de dados estruturados

STEP 6: Revisar e Confirmar
  ├─ Exibir resumo completo:
  │   ├─ Projeto selecionado
  │   ├─ Nome da pesquisa
  │   ├─ Parâmetros (qtd_concorrentes, qtd_leads)
  │   ├─ Número de clientes a processar
  │   └─ Dados de entrada validados (preview)
  └─ Botão "Confirmar e Gravar Dados"

STEP 7: Gravar Dados e Iniciar Enriquecimento
  ├─ Gravar pesquisa no banco (tabela pesquisas)
  ├─ Gravar clientes no banco (tabela clientes)
  ├─ Criar relacionamentos iniciais
  └─ Redirecionar para /enrichment-progress com runId
```

**Benefícios da Nova Arquitetura:**

- ✅ **Validação rigorosa** em cada step antes de avançar
- ✅ **Parâmetros flexíveis** configurados por pesquisa
- ✅ **Três métodos de entrada** para diferentes necessidades
- ✅ **Pré-pesquisa com IA** para automação máxima
- ✅ **Separação clara** entre criação de pesquisa e enriquecimento
- ✅ **Experiência guiada** com feedback visual em cada step
- ✅ **Dados gravados antes** de iniciar enriquecimento (segurança)

---

## 📊 Diagrama de Arquitetura Completo

### Visão Geral dos Componentes

A nova arquitetura é composta por **5 camadas principais** que interagem de forma orquestrada:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Wizard UI    │  │ Formulários  │  │ Upload de    │          │
│  │ (7 Steps)    │  │ de Validação │  │ Planilha     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE VALIDAÇÃO                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Schema       │  │ Business     │  │ Data Quality │          │
│  │ Validation   │  │ Rules        │  │ Checks       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CAMADA DE PRÉ-PESQUISA (IA)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ OpenAI       │  │ Structured   │  │ Data         │          │
│  │ Integration  │  │ Output       │  │ Normalization│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE PERSISTÊNCIA                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Pesquisas    │  │ Clientes     │  │ Parâmetros   │          │
│  │ (tabela)     │  │ (tabela)     │  │ (JSON)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CAMADA DE ENRIQUECIMENTO                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Enrichment   │  │ Competitor   │  │ Lead         │          │
│  │ Engine       │  │ Search       │  │ Generation   │          │
│  │ (existente)  │  │ (flexível)   │  │ (flexível)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados Detalhado

O fluxo de dados atravessa as camadas de forma sequencial, com validações em cada etapa:

**1. Entrada de Dados (Camada de Apresentação)**

O usuário interage com o wizard de 7 steps, fornecendo dados através de um dos três métodos disponíveis. O wizard coleta informações em cada step e mantém estado local até a confirmação final.

**2. Validação Multi-Camada (Camada de Validação)**

Antes de gravar no banco, os dados passam por três tipos de validação:

- **Schema Validation:** Verifica tipos de dados, formatos e campos obrigatórios (ex: CNPJ válido, email válido, URL válida)
- **Business Rules:** Aplica regras de negócio (ex: nome de pesquisa único dentro do projeto, quantidade de concorrentes entre 1-50)
- **Data Quality Checks:** Verifica qualidade dos dados (ex: cliente sem CNPJ e sem site é rejeitado, dados duplicados são identificados)

**3. Pré-Pesquisa com IA (Camada de Pré-Pesquisa) - Opcional**

Se o usuário escolher o método "Pré-Pesquisa com IA", o sistema:

1. Recebe input simples (nome da empresa OU site)
2. Envia prompt estruturado para OpenAI
3. OpenAI pesquisa informações públicas e retorna dados estruturados
4. Sistema normaliza e valida output da IA
5. Usuário revisa e confirma dados antes de gravar

**4. Persistência no Banco (Camada de Persistência)**

Após validação bem-sucedida, os dados são gravados no banco de dados:

1. Criar ou reusar projeto (tabela `projects`)
2. Criar pesquisa com parâmetros (tabela `pesquisas`)
3. Gravar clientes validados (tabela `clientes`)
4. Criar relacionamentos iniciais (tabela `clientes_mercados`)

**5. Enriquecimento (Camada de Enriquecimento)**

Após dados gravados, o sistema inicia o enriquecimento:

1. Ler parâmetros da pesquisa (`qtd_concorrentes`, `qtd_leads`)
2. Executar fluxo de enriquecimento existente
3. Buscar concorrentes (quantidade configurada na pesquisa)
4. Gerar leads (quantidade configurada na pesquisa)
5. Calcular scores de qualidade
6. Atualizar status da pesquisa

---

## 🗄️ Mudanças no Banco de Dados

### Alterações na Tabela `pesquisas`

A tabela `pesquisas` precisa de **dois novos campos** para armazenar os parâmetros configuráveis:

```sql
ALTER TABLE pesquisas
ADD COLUMN qtd_concorrentes INT DEFAULT 10 COMMENT 'Quantidade de concorrentes a buscar por mercado',
ADD COLUMN qtd_leads INT DEFAULT 10 COMMENT 'Quantidade de leads a gerar por mercado';
```

**Schema Atualizado:**

| Campo                | Tipo                  | Descrição                                      | Padrão      |
| -------------------- | --------------------- | ---------------------------------------------- | ----------- |
| id                   | int PK AUTO_INCREMENT | ID único da pesquisa                           | -           |
| projectId            | int FK                | Referência ao projeto                          | -           |
| nome                 | varchar(255)          | Nome da pesquisa                               | -           |
| descricao            | text                  | Descrição da pesquisa                          | NULL        |
| dataImportacao       | timestamp             | Data de importação dos dados                   | NOW()       |
| totalClientes        | int                   | Total de clientes importados                   | 0           |
| clientesEnriquecidos | int                   | Total de clientes enriquecidos                 | 0           |
| status               | enum                  | Status (importado/enriquecendo/concluido/erro) | 'importado' |
| **qtd_concorrentes** | **int**               | **Quantidade de concorrentes a buscar**        | **10**      |
| **qtd_leads**        | **int**               | **Quantidade de leads a gerar**                | **10**      |
| ativo                | int                   | Flag de ativo (1) ou inativo (0)               | 1           |
| createdAt            | timestamp             | Data de criação                                | NOW()       |
| updatedAt            | timestamp             | Data da última atualização                     | NOW()       |

**Validações:**

- `qtd_concorrentes`: Valor entre 1 e 50
- `qtd_leads`: Valor entre 1 e 100

### Nova Tabela `pesquisa_configs` (Opcional)

Para maior flexibilidade futura, podemos criar uma tabela separada para armazenar configurações avançadas em formato JSON:

```sql
CREATE TABLE pesquisa_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pesquisaId INT NOT NULL,
  configKey VARCHAR(100) NOT NULL,
  configValue TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pesquisaId) REFERENCES pesquisas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_config (pesquisaId, configKey)
);
```

**Exemplos de Configurações:**

| pesquisaId | configKey           | configValue                     |
| ---------- | ------------------- | ------------------------------- |
| 1          | qtd_concorrentes    | 20                              |
| 1          | qtd_leads           | 50                              |
| 1          | filtros_geograficos | {"ufs": ["SP", "RJ", "MG"]}     |
| 1          | filtros_porte       | {"portes": ["Médio", "Grande"]} |

---

## 🎨 Interface do Wizard (7 Steps)

### Step 1: Selecionar/Criar Projeto

**Objetivo:** Definir em qual projeto a pesquisa será criada.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1 de 7: Selecionar ou Criar Projeto               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Você deseja criar uma nova pesquisa em qual projeto?   │
│                                                          │
│  ○ Selecionar projeto existente                         │
│     ┌────────────────────────────────────┐             │
│     │ [Dropdown: Agro ▼]                 │             │
│     └────────────────────────────────────┘             │
│                                                          │
│  ○ Criar novo projeto                                   │
│     ┌────────────────────────────────────┐             │
│     │ Nome do projeto:                   │             │
│     │ [_____________________________]    │             │
│     │                                    │             │
│     │ Descrição (opcional):              │             │
│     │ [_____________________________]    │             │
│     │ [_____________________________]    │             │
│     │                                    │             │
│     │ Cor de identificação:              │             │
│     │ [🎨 Color Picker]                  │             │
│     └────────────────────────────────────┘             │
│                                                          │
│                                   [Próximo →]            │
└─────────────────────────────────────────────────────────┘
```

**Validações:**

- Se "Selecionar projeto existente": Projeto deve estar ativo
- Se "Criar novo projeto": Nome obrigatório, mínimo 3 caracteres

### Step 2: Nomear Pesquisa

**Objetivo:** Definir nome e descrição da pesquisa.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 2 de 7: Nomear Pesquisa                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Projeto selecionado: Agro                              │
│                                                          │
│  Nome da pesquisa: *                                    │
│  ┌────────────────────────────────────┐                │
│  │ [_____________________________]    │                │
│  └────────────────────────────────────┘                │
│  Ex: "Embalagens Plásticas Q4 2025"                     │
│                                                          │
│  Descrição (opcional):                                  │
│  ┌────────────────────────────────────┐                │
│  │ [_____________________________]    │                │
│  │ [_____________________________]    │                │
│  │ [_____________________________]    │                │
│  └────────────────────────────────────┘                │
│                                                          │
│  [← Voltar]                          [Próximo →]        │
└─────────────────────────────────────────────────────────┘
```

**Validações:**

- Nome obrigatório, mínimo 3 caracteres
- Nome único dentro do projeto (verificação em tempo real)

### Step 3: Configurar Parâmetros de Pesquisa

**Objetivo:** Definir quantidade de concorrentes e leads a buscar.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 3 de 7: Configurar Parâmetros de Pesquisa         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Defina quantos concorrentes e leads deseja buscar      │
│  para cada mercado identificado.                        │
│                                                          │
│  Quantidade de concorrentes por mercado: *              │
│  ┌────────────────────────────────────┐                │
│  │ [10___] (1-50)                     │                │
│  └────────────────────────────────────┘                │
│  ├─────────┬─────────┬─────────┬─────────┐            │
│  │    5    │   10    │   20    │   50    │            │
│  │ (Baixo) │(Padrão) │ (Alto)  │ (Máx)   │            │
│  └─────────┴─────────┴─────────┴─────────┘            │
│                                                          │
│  Quantidade de leads por mercado: *                     │
│  ┌────────────────────────────────────┐                │
│  │ [10___] (1-100)                    │                │
│  └────────────────────────────────────┘                │
│  ├─────────┬─────────┬─────────┬─────────┐            │
│  │   10    │   25    │   50    │  100    │            │
│  │(Padrão) │ (Médio) │ (Alto)  │ (Máx)   │            │
│  └─────────┴─────────┴─────────┴─────────┘            │
│                                                          │
│  💡 Dica: Mercados altamente competitivos exigem       │
│     mais concorrentes. Nichos podem usar valores       │
│     menores.                                            │
│                                                          │
│  [← Voltar]                          [Próximo →]        │
└─────────────────────────────────────────────────────────┘
```

**Validações:**

- `qtd_concorrentes`: Valor entre 1 e 50
- `qtd_leads`: Valor entre 1 e 100
- Valores padrão: 10 para ambos

### Step 4: Escolher Método de Entrada de Dados

**Objetivo:** Permitir que usuário escolha como fornecerá os dados dos clientes.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 4 de 7: Escolher Método de Entrada de Dados       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Como você deseja fornecer os dados dos clientes?       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ ○ Entrada Manual                            │       │
│  │   Preencher formulário campo a campo        │       │
│  │   ✓ Validação em tempo real                 │       │
│  │   ✓ Ideal para poucos clientes (1-10)       │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ ○ Upload de Planilha (CSV/Excel)            │       │
│  │   Importar dados de arquivo                 │       │
│  │   ✓ Validação em lote                       │       │
│  │   ✓ Ideal para muitos clientes (10+)        │       │
│  │   📥 Baixar modelo de planilha               │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ ○ Pré-Pesquisa com IA (OpenAI)              │       │
│  │   Fornecer apenas nome ou site              │       │
│  │   ✓ IA busca e estrutura dados              │       │
│  │   ✓ Ideal para pesquisa rápida              │       │
│  │   ⚡ Automação máxima                        │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  [← Voltar]                          [Próximo →]        │
└─────────────────────────────────────────────────────────┘
```

**Validações:**

- Usuário deve selecionar uma opção antes de avançar

### Step 5A: Inserir Dados - Entrada Manual

**Objetivo:** Permitir entrada manual de dados com validação em tempo real.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 5 de 7: Inserir Dados (Entrada Manual)            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Cliente 1 de 3                                         │
│                                                          │
│  Nome da empresa: *                                     │
│  ┌────────────────────────────────────┐                │
│  │ [Empresa ABC Ltda______________]   │ ✓              │
│  └────────────────────────────────────┘                │
│                                                          │
│  CNPJ (opcional):                                       │
│  ┌────────────────────────────────────┐                │
│  │ [12.345.678/0001-90____________]   │ ✓              │
│  └────────────────────────────────────┘                │
│                                                          │
│  Site oficial (opcional):                               │
│  ┌────────────────────────────────────┐                │
│  │ [https://www.empresaabc.com.br_]   │ ✓              │
│  └────────────────────────────────────┘                │
│                                                          │
│  Produto principal (opcional):                          │
│  ┌────────────────────────────────────┐                │
│  │ [Embalagens plásticas__________]   │                │
│  └────────────────────────────────────┘                │
│                                                          │
│  ⚠️ Atenção: Pelo menos CNPJ OU Site deve ser          │
│     fornecido para garantir enriquecimento de dados.   │
│                                                          │
│  [+ Adicionar outro cliente]                            │
│                                                          │
│  [← Voltar]                          [Próximo →]        │
└─────────────────────────────────────────────────────────┘
```

**Validações em Tempo Real:**

- **Nome:** Obrigatório, mínimo 3 caracteres
- **CNPJ:** Formato válido (XX.XXX.XXX/XXXX-XX), validação de dígitos verificadores
- **Site:** URL válida (http:// ou https://)
- **Regra de negócio:** CNPJ OU Site obrigatório (pelo menos um dos dois)

**Feedback Visual:**

- ✓ Verde: Campo válido
- ✗ Vermelho: Campo inválido (com mensagem de erro abaixo)
- ⚠️ Amarelo: Aviso (ex: "Recomendamos fornecer CNPJ para melhor enriquecimento")

### Step 5B: Inserir Dados - Upload de Planilha

**Objetivo:** Permitir upload de planilha CSV/Excel com validação em lote.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 5 de 7: Inserir Dados (Upload de Planilha)        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Baixe o modelo de planilha                          │
│     📥 [Baixar modelo CSV] [Baixar modelo Excel]        │
│                                                          │
│  2. Preencha a planilha com os dados dos clientes       │
│     Colunas obrigatórias: nome                          │
│     Colunas opcionais: cnpj, site, produto              │
│                                                          │
│  3. Faça upload da planilha preenchida                  │
│     ┌────────────────────────────────────┐             │
│     │  Arraste o arquivo aqui ou clique  │             │
│     │  para selecionar                   │             │
│     │                                    │             │
│     │         📁 Selecionar arquivo      │             │
│     └────────────────────────────────────┘             │
│                                                          │
│  ─────────────────────────────────────────────────      │
│                                                          │
│  Arquivo carregado: clientes.xlsx (15 KB)               │
│  ✓ 25 clientes identificados                            │
│                                                          │
│  Mapeamento de colunas:                                 │
│  ┌────────────────────────────────────┐                │
│  │ Coluna A → nome        [✓]         │                │
│  │ Coluna B → cnpj        [✓]         │                │
│  │ Coluna C → site        [✓]         │                │
│  │ Coluna D → produto     [✓]         │                │
│  └────────────────────────────────────┘                │
│                                                          │
│  Validação:                                             │
│  ✓ 23 clientes válidos                                  │
│  ✗ 2 clientes com erros (ver detalhes)                  │
│                                                          │
│  [Ver erros de validação]                               │
│                                                          │
│  [← Voltar]                          [Próximo →]        │
└─────────────────────────────────────────────────────────┘
```

**Validações em Lote:**

1. **Parsing:** Verificar se arquivo é CSV ou Excel válido
2. **Mapeamento:** Identificar colunas automaticamente ou permitir mapeamento manual
3. **Schema Validation:** Validar cada linha conforme schema (nome obrigatório, CNPJ válido, URL válida)
4. **Business Rules:** CNPJ OU Site obrigatório em cada linha
5. **Duplicados:** Identificar e alertar sobre CNPJs duplicados

**Modal de Erros:**

```
┌─────────────────────────────────────────────────────────┐
│  Erros de Validação (2 clientes)                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Linha 5: Empresa XYZ                                   │
│  ✗ CNPJ inválido: "12.345.678/0001-00"                  │
│  ✗ Site não fornecido (CNPJ ou Site obrigatório)        │
│                                                          │
│  Linha 12: Empresa ABC                                  │
│  ✗ Nome muito curto (mínimo 3 caracteres): "AB"         │
│                                                          │
│  [Baixar relatório de erros (CSV)]                      │
│  [Fechar]                                               │
└─────────────────────────────────────────────────────────┘
```

### Step 5C: Inserir Dados - Pré-Pesquisa com IA

**Objetivo:** Permitir que usuário forneça apenas nome ou site e a IA busque e estruture os dados.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 5 de 7: Inserir Dados (Pré-Pesquisa com IA)       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Forneça o nome da empresa OU o site oficial.           │
│  A IA irá pesquisar e estruturar os dados para você.    │
│                                                          │
│  Cliente 1 de 3                                         │
│                                                          │
│  Nome da empresa OU Site:                               │
│  ┌────────────────────────────────────┐                │
│  │ [Empresa ABC Ltda______________]   │                │
│  └────────────────────────────────────┘                │
│                                                          │
│  [🔍 Pesquisar com IA]                                  │
│                                                          │
│  ─────────────────────────────────────────────────      │
│                                                          │
│  Resultado da Pesquisa:                                 │
│                                                          │
│  ✓ Dados encontrados e estruturados                     │
│                                                          │
│  Nome: Empresa ABC Ltda                [Editar]         │
│  CNPJ: 12.345.678/0001-90              [Editar]         │
│  Site: https://www.empresaabc.com.br   [Editar]         │
│  Produto: Embalagens plásticas         [Editar]         │
│  Cidade: São Paulo                     [Editar]         │
│  UF: SP                                [Editar]         │
│                                                          │
│  [✓ Confirmar dados] [✗ Descartar] [🔄 Pesquisar novamente] │
│                                                          │
│  [+ Adicionar outro cliente]                            │
│                                                          │
│  [← Voltar]                          [Próximo →]        │
└─────────────────────────────────────────────────────────┘
```

**Fluxo de Pré-Pesquisa:**

1. Usuário fornece nome OU site
2. Usuário clica em "Pesquisar com IA"
3. Sistema exibe loading spinner
4. Sistema envia prompt para OpenAI:

```
Você é um assistente de pesquisa de mercado. Sua tarefa é encontrar informações públicas sobre uma empresa e retornar dados estruturados.

INPUT: "Empresa ABC Ltda"

Pesquise informações públicas sobre esta empresa e retorne um JSON com os seguintes campos:
{
  "nome": "Nome oficial da empresa",
  "cnpj": "CNPJ no formato XX.XXX.XXX/XXXX-XX (se encontrado)",
  "site": "URL do site oficial (se encontrado)",
  "produto": "Produto ou serviço principal oferecido",
  "cidade": "Cidade da sede",
  "uf": "Estado da sede (sigla de 2 letras)",
  "telefone": "Telefone de contato (se encontrado)",
  "email": "Email de contato (se encontrado)"
}

Se não encontrar alguma informação, retorne null para aquele campo.
Retorne APENAS o JSON, sem texto adicional.
```

5. OpenAI retorna JSON estruturado
6. Sistema valida JSON (schema validation)
7. Sistema exibe dados para revisão do usuário
8. Usuário pode editar campos antes de confirmar
9. Usuário confirma ou descarta

**Validações:**

- Input obrigatório (nome OU site)
- Output da IA deve ser JSON válido
- Campos retornados devem passar pelas mesmas validações (CNPJ válido, URL válida, etc)
- Usuário DEVE revisar dados antes de confirmar

### Step 6: Revisar e Confirmar

**Objetivo:** Exibir resumo completo antes de gravar dados no banco.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 6 de 7: Revisar e Confirmar                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Revise todas as informações antes de prosseguir.       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ PROJETO                                     │       │
│  │ Nome: Agro                                  │       │
│  │ Descrição: Projeto de pesquisa agrícola    │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ PESQUISA                                    │       │
│  │ Nome: Embalagens Plásticas Q4 2025         │       │
│  │ Descrição: Pesquisa de mercado...          │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ PARÂMETROS                                  │       │
│  │ Concorrentes por mercado: 20                │       │
│  │ Leads por mercado: 50                       │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ CLIENTES                                    │       │
│  │ Total: 25 clientes                          │       │
│  │ Método de entrada: Upload de planilha      │       │
│  │                                             │       │
│  │ [Ver lista completa de clientes]            │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ⚠️ Após confirmar, os dados serão gravados no banco   │
│     e o enriquecimento será iniciado automaticamente.  │
│                                                          │
│  [← Voltar]              [✓ Confirmar e Gravar Dados]   │
└─────────────────────────────────────────────────────────┘
```

**Ações:**

- **Voltar:** Retorna ao step anterior para edição
- **Confirmar e Gravar Dados:** Avança para Step 7

### Step 7: Gravar Dados e Iniciar Enriquecimento

**Objetivo:** Gravar dados no banco e redirecionar para monitoramento de enriquecimento.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  STEP 7 de 7: Gravando Dados e Iniciando Enriquecimento │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │                                             │       │
│  │          🔄 Processando...                  │       │
│  │                                             │       │
│  │  [████████████████░░░░░░░░░░] 65%          │       │
│  │                                             │       │
│  │  ✓ Projeto criado (ID: 3)                   │       │
│  │  ✓ Pesquisa criada (ID: 12)                 │       │
│  │  ✓ 25 clientes gravados no banco            │       │
│  │  🔄 Iniciando enriquecimento...             │       │
│  │                                             │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  Aguarde enquanto preparamos o enriquecimento...        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Sequência de Operações:**

1. **Criar ou reusar projeto** (se novo projeto)
   - INSERT INTO projects (nome, descricao, cor)
   - Retorna projectId

2. **Criar pesquisa com parâmetros**
   - INSERT INTO pesquisas (projectId, nome, descricao, qtd_concorrentes, qtd_leads, totalClientes)
   - Retorna pesquisaId

3. **Gravar clientes no banco**
   - Para cada cliente validado:
     - Calcular clienteHash (hash de nome + cnpj para deduplicação)
     - INSERT INTO clientes (projectId, pesquisaId, nome, cnpj, site, produto, ...)
     - Retorna clienteId

4. **Criar enrichment run**
   - INSERT INTO enrichment_runs (projectId, pesquisaId, totalRecords, status='running')
   - Retorna runId

5. **Redirecionar para monitoramento**
   - Redirecionar para `/enrichment-progress?runId={runId}`
   - Enriquecimento inicia automaticamente em background

---

## 🔧 Implementação Técnica

### Endpoints tRPC Necessários

**1. Validação de Nome de Pesquisa**

```typescript
pesquisas.validateName: publicProcedure
  .input(z.object({
    projectId: z.number(),
    nome: z.string().min(3)
  }))
  .query(async ({ input }) => {
    const existing = await db.select()
      .from(pesquisas)
      .where(
        and(
          eq(pesquisas.projectId, input.projectId),
          eq(pesquisas.nome, input.nome)
        )
      )
      .limit(1);

    return { isUnique: existing.length === 0 };
  });
```

**2. Pré-Pesquisa com OpenAI**

```typescript
enrichment.prePesquisa: publicProcedure
  .input(z.object({
    query: z.string().min(3) // nome OU site
  }))
  .mutation(async ({ input }) => {
    const prompt = `
Você é um assistente de pesquisa de mercado. Sua tarefa é encontrar informações públicas sobre uma empresa e retornar dados estruturados.

INPUT: "${input.query}"

Pesquise informações públicas sobre esta empresa e retorne um JSON com os seguintes campos:
{
  "nome": "Nome oficial da empresa",
  "cnpj": "CNPJ no formato XX.XXX.XXX/XXXX-XX (se encontrado)",
  "site": "URL do site oficial (se encontrado)",
  "produto": "Produto ou serviço principal oferecido",
  "cidade": "Cidade da sede",
  "uf": "Estado da sede (sigla de 2 letras)",
  "telefone": "Telefone de contato (se encontrado)",
  "email": "Email de contato (se encontrado)"
}

Se não encontrar alguma informação, retorne null para aquele campo.
Retorne APENAS o JSON, sem texto adicional.
    `;

    const { invokeLLM } = await import('./_core/llm');
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Você é um assistente de pesquisa de mercado especializado em encontrar informações públicas sobre empresas.' },
        { role: 'user', content: prompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'empresa_info',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              nome: { type: 'string', nullable: true },
              cnpj: { type: 'string', nullable: true },
              site: { type: 'string', nullable: true },
              produto: { type: 'string', nullable: true },
              cidade: { type: 'string', nullable: true },
              uf: { type: 'string', nullable: true },
              telefone: { type: 'string', nullable: true },
              email: { type: 'string', nullable: true }
            },
            required: [],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    const data = JSON.parse(content);

    // Validar dados retornados
    const validated = validateClienteData(data);

    return validated;
  });
```

**3. Criar Pesquisa com Dados**

```typescript
pesquisas.createWithClientes: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    nome: z.string().min(3),
    descricao: z.string().optional(),
    qtd_concorrentes: z.number().min(1).max(50).default(10),
    qtd_leads: z.number().min(1).max(100).default(10),
    clientes: z.array(z.object({
      nome: z.string().min(3),
      cnpj: z.string().optional(),
      site: z.string().url().optional(),
      produto: z.string().optional()
    })).min(1)
  }))
  .mutation(async ({ input, ctx }) => {
    // 1. Criar pesquisa
    const pesquisa = await createPesquisa({
      projectId: input.projectId,
      nome: input.nome,
      descricao: input.descricao,
      qtd_concorrentes: input.qtd_concorrentes,
      qtd_leads: input.qtd_leads,
      totalClientes: input.clientes.length,
      status: 'importado'
    });

    // 2. Gravar clientes
    const clientesIds = [];
    for (const clienteData of input.clientes) {
      const clienteHash = generateHash(clienteData.nome, clienteData.cnpj);
      const cliente = await createCliente({
        projectId: input.projectId,
        pesquisaId: pesquisa.id,
        clienteHash,
        ...clienteData
      });
      clientesIds.push(cliente.id);
    }

    // 3. Criar enrichment run
    const runId = await createEnrichmentRun(
      input.projectId,
      pesquisa.id,
      input.clientes.length
    );

    // 4. Iniciar enriquecimento em background
    executeEnrichmentFlow({
      projectId: input.projectId,
      pesquisaId: pesquisa.id,
      qtd_concorrentes: input.qtd_concorrentes,
      qtd_leads: input.qtd_leads
    }, runId);

    return {
      pesquisaId: pesquisa.id,
      runId,
      clientesCount: clientesIds.length
    };
  });
```

### Funções de Validação

**Schema Validation (Zod)**

```typescript
import { z } from "zod";

export const ClienteSchema = z
  .object({
    nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    cnpj: z
      .string()
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido")
      .optional()
      .or(z.literal("")),
    site: z.string().url("URL inválida").optional().or(z.literal("")),
    produto: z.string().optional(),
  })
  .refine(data => data.cnpj || data.site, {
    message: "CNPJ ou Site deve ser fornecido",
    path: ["cnpj"],
  });

export function validateClienteData(data: unknown) {
  return ClienteSchema.parse(data);
}
```

**Business Rules Validation**

```typescript
export async function validatePesquisaNome(
  projectId: number,
  nome: string
): Promise<boolean> {
  const existing = await db
    .select()
    .from(pesquisas)
    .where(and(eq(pesquisas.projectId, projectId), eq(pesquisas.nome, nome)))
    .limit(1);

  return existing.length === 0;
}

export function validateQtdConcorrentes(qtd: number): boolean {
  return qtd >= 1 && qtd <= 50;
}

export function validateQtdLeads(qtd: number): boolean {
  return qtd >= 1 && qtd <= 100;
}
```

### Ajustes no Fluxo de Enriquecimento

**Ler Parâmetros da Pesquisa**

```typescript
// Antes (valores fixos)
const QTD_CONCORRENTES = 10;
const QTD_LEADS = 10;

// Depois (valores dinâmicos da pesquisa)
export async function executeEnrichmentFlow(
  input: {
    projectId: number;
    pesquisaId: number;
    qtd_concorrentes?: number;
    qtd_leads?: number;
  },
  runId: number
): Promise<void> {
  // Buscar parâmetros da pesquisa
  const pesquisa = await getPesquisaById(input.pesquisaId);

  const qtd_concorrentes =
    input.qtd_concorrentes ?? pesquisa.qtd_concorrentes ?? 10;
  const qtd_leads = input.qtd_leads ?? pesquisa.qtd_leads ?? 10;

  // Usar parâmetros dinâmicos no enriquecimento
  for (const mercado of mercados) {
    // Buscar concorrentes (quantidade configurável)
    const concorrentes = await buscarConcorrentes(mercado, qtd_concorrentes);

    // Gerar leads (quantidade configurável)
    const leads = await gerarLeads(mercado, qtd_leads);
  }
}
```

---

## 📝 Política de Validação de Dados

### Regras Obrigatórias

**1. Dados Mínimos Obrigatórios**

Todo cliente DEVE ter:

- **Nome:** Mínimo 3 caracteres, máximo 255 caracteres
- **CNPJ OU Site:** Pelo menos um dos dois deve ser fornecido

**2. Formatos Válidos**

- **CNPJ:** Formato XX.XXX.XXX/XXXX-XX com dígitos verificadores válidos
- **Site:** URL válida iniciando com http:// ou https://
- **Email:** Formato de email válido (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`)
- **Telefone:** Formato brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX

**3. Unicidade**

- **Nome de Pesquisa:** Único dentro do projeto
- **CNPJ:** Único dentro da pesquisa (alertar sobre duplicados)

### Níveis de Validação

**Nível 1: Schema Validation (Zod)**

Valida tipos de dados, formatos e campos obrigatórios. Executa no frontend e backend.

**Nível 2: Business Rules Validation**

Valida regras de negócio (ex: nome de pesquisa único, CNPJ ou Site obrigatório). Executa no backend.

**Nível 3: Data Quality Checks**

Valida qualidade dos dados (ex: CNPJ com dígitos verificadores válidos, site acessível). Executa no backend após validação inicial.

### Mensagens de Erro Padronizadas

| Erro                            | Mensagem                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| Nome vazio                      | "Nome da empresa é obrigatório"                                |
| Nome curto                      | "Nome deve ter no mínimo 3 caracteres"                         |
| CNPJ inválido                   | "CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX"          |
| Site inválido                   | "URL inválida. Deve iniciar com http:// ou https://"           |
| CNPJ e Site vazios              | "CNPJ ou Site deve ser fornecido para garantir enriquecimento" |
| Nome de pesquisa duplicado      | "Já existe uma pesquisa com este nome neste projeto"           |
| Qtd concorrentes fora do limite | "Quantidade de concorrentes deve estar entre 1 e 50"           |
| Qtd leads fora do limite        | "Quantidade de leads deve estar entre 1 e 100"                 |

---

## 🎬 Exemplo de Fluxo Completo

### Cenário: Criar Pesquisa de Embalagens Plásticas

**Usuário:** João (Analista de Mercado)  
**Objetivo:** Criar pesquisa de mercado para identificar oportunidades no setor de embalagens plásticas

**Passo a Passo:**

**1. Acessar Wizard**

João acessa a aplicação e clica em "Nova Pesquisa" no menu lateral. Sistema abre wizard em `/pesquisa/nova`.

**2. Step 1: Selecionar Projeto**

João seleciona projeto existente "Agro" no dropdown. Clica em "Próximo".

**3. Step 2: Nomear Pesquisa**

João preenche:

- Nome: "Embalagens Plásticas Q4 2025"
- Descrição: "Pesquisa de mercado para identificar clientes potenciais no setor de embalagens plásticas para produtos agrícolas"

Sistema valida em tempo real que nome é único. Clica em "Próximo".

**4. Step 3: Configurar Parâmetros**

João define:

- Quantidade de concorrentes: 20 (mercado altamente competitivo)
- Quantidade de leads: 50 (alto potencial de prospecção)

Clica em "Próximo".

**5. Step 4: Escolher Método de Entrada**

João seleciona "Pré-Pesquisa com IA" (quer testar automação). Clica em "Próximo".

**6. Step 5: Pré-Pesquisa com IA**

João fornece apenas nomes de empresas:

**Cliente 1:**

- Input: "Plastipak"
- Clica em "Pesquisar com IA"
- Sistema retorna:
  - Nome: Plastipak Embalagens Ltda
  - CNPJ: 12.345.678/0001-90
  - Site: https://www.plastipak.com.br
  - Produto: Embalagens plásticas para alimentos
  - Cidade: São Paulo
  - UF: SP
- João revisa e confirma

**Cliente 2:**

- Input: "https://www.braskem.com.br"
- Clica em "Pesquisar com IA"
- Sistema retorna:
  - Nome: Braskem S.A.
  - CNPJ: 42.150.391/0001-70
  - Site: https://www.braskem.com.br
  - Produto: Resinas termoplásticas e petroquímicos
  - Cidade: São Paulo
  - UF: SP
- João revisa e confirma

João adiciona mais 3 clientes da mesma forma. Clica em "Próximo".

**7. Step 6: Revisar e Confirmar**

Sistema exibe resumo:

- Projeto: Agro
- Pesquisa: Embalagens Plásticas Q4 2025
- Concorrentes por mercado: 20
- Leads por mercado: 50
- Total de clientes: 5

João revisa e clica em "Confirmar e Gravar Dados".

**8. Step 7: Gravar e Iniciar**

Sistema executa:

1. ✓ Pesquisa criada (ID: 12)
2. ✓ 5 clientes gravados no banco
3. ✓ Enrichment run criado (ID: 45)
4. 🔄 Iniciando enriquecimento...

Sistema redireciona para `/enrichment-progress?runId=45`.

**9. Monitoramento**

João acompanha progresso em tempo real:

- Barra de progresso: 0% → 100%
- Log de execução mostrando cada etapa
- Notificações toast a cada 25% de progresso

Após 15 minutos, enriquecimento concluído:

- 5 mercados identificados
- 100 concorrentes encontrados (20 por mercado)
- 250 leads gerados (50 por mercado)

João acessa dashboard para analisar resultados.

---

## 🚀 Próximos Passos para Implementação

### Fase 1: Preparação do Banco de Dados

**Tarefas:**

1. Criar migration para adicionar campos `qtd_concorrentes` e `qtd_leads` na tabela `pesquisas`
2. Executar migration no banco de dados de desenvolvimento
3. Atualizar tipos TypeScript do Drizzle (`Pesquisa`, `InsertPesquisa`)
4. Testar queries de leitura/escrita dos novos campos

**Estimativa:** 2 horas

### Fase 2: Implementação de Validações

**Tarefas:**

1. Criar schemas Zod para validação de clientes (`ClienteSchema`)
2. Criar funções de validação de business rules (nome único, CNPJ válido, etc)
3. Criar endpoints tRPC de validação (`pesquisas.validateName`, `enrichment.prePesquisa`)
4. Implementar testes unitários para validações

**Estimativa:** 4 horas

### Fase 3: Integração com OpenAI

**Tarefas:**

1. Criar endpoint `enrichment.prePesquisa` com prompt estruturado
2. Implementar parsing e validação de output da IA
3. Criar interface de revisão de dados pré-pesquisados
4. Testar com casos reais (nomes de empresas conhecidas)

**Estimativa:** 6 horas

### Fase 4: Desenvolvimento do Wizard (Frontend)

**Tarefas:**

1. Criar componente `PesquisaWizard.tsx` com navegação entre steps
2. Implementar Step 1 (Selecionar/Criar Projeto)
3. Implementar Step 2 (Nomear Pesquisa)
4. Implementar Step 3 (Configurar Parâmetros)
5. Implementar Step 4 (Escolher Método de Entrada)
6. Implementar Step 5A (Entrada Manual)
7. Implementar Step 5B (Upload de Planilha)
8. Implementar Step 5C (Pré-Pesquisa com IA)
9. Implementar Step 6 (Revisar e Confirmar)
10. Implementar Step 7 (Gravar e Iniciar)
11. Adicionar validações em tempo real em cada step
12. Adicionar feedback visual (loading, erros, sucesso)

**Estimativa:** 16 horas

### Fase 5: Ajustes no Fluxo de Enriquecimento

**Tarefas:**

1. Modificar `executeEnrichmentFlow` para ler `qtd_concorrentes` e `qtd_leads` da pesquisa
2. Passar parâmetros dinâmicos para funções de busca de concorrentes e leads
3. Atualizar testes de enriquecimento
4. Validar que enriquecimento respeita parâmetros configurados

**Estimativa:** 4 horas

### Fase 6: Testes End-to-End

**Tarefas:**

1. Criar pesquisa via wizard (entrada manual)
2. Criar pesquisa via wizard (upload de planilha)
3. Criar pesquisa via wizard (pré-pesquisa com IA)
4. Validar que dados são gravados corretamente no banco
5. Validar que enriquecimento usa parâmetros corretos
6. Validar que validações impedem dados incorretos
7. Corrigir bugs identificados

**Estimativa:** 6 horas

### Fase 7: Documentação e Entrega

**Tarefas:**

1. Atualizar documentação de usuário (guia de uso do wizard)
2. Atualizar documentação técnica (arquitetura, endpoints, validações)
3. Criar vídeo tutorial do wizard (opcional)
4. Deploy em produção

**Estimativa:** 4 horas

**Estimativa Total:** 42 horas (~5-6 dias de trabalho)

---

## 📊 Resumo da Arquitetura Proposta

### Componentes Principais

| Componente                  | Descrição                                        | Tecnologia              |
| --------------------------- | ------------------------------------------------ | ----------------------- |
| **Wizard UI**               | Interface guiada de 7 steps                      | React + shadcn/ui       |
| **Validação Multi-Camada**  | Schema + Business Rules + Data Quality           | Zod + Custom Functions  |
| **Pré-Pesquisa com IA**     | Automação de entrada de dados                    | OpenAI GPT-4            |
| **Persistência Flexível**   | Armazenamento de parâmetros configuráveis        | MySQL + Drizzle ORM     |
| **Enriquecimento Dinâmico** | Motor de enriquecimento com parâmetros flexíveis | Node.js + APIs Externas |

### Benefícios Esperados

**1. Qualidade de Dados**

- ✅ Validação rigorosa impede entrada de dados incorretos
- ✅ Deduplicação automática via hash
- ✅ Feedback visual em tempo real

**2. Flexibilidade**

- ✅ Parâmetros configuráveis por pesquisa
- ✅ Três métodos de entrada de dados
- ✅ Adaptação a diferentes necessidades de mercado

**3. Automação**

- ✅ Pré-pesquisa com IA reduz trabalho manual em 80%
- ✅ Validação automática de CNPJ, URLs, emails
- ✅ Enriquecimento automático após gravação

**4. Experiência de Usuário**

- ✅ Wizard guiado reduz erros de configuração
- ✅ Feedback visual em cada step
- ✅ Processo claro e intuitivo

---

**Documento preparado por:** Manus AI  
**Data:** 20 de Novembro de 2025  
**Status:** Aguardando validação do usuário  
**Próximo Passo:** Revisão e aprovação para iniciar implementação
