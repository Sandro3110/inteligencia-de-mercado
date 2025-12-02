# 🎯 MODELO FINAL VALIDADO - Com Respostas do Usuário

**Data:** 01/12/2025  
**Status:** Validado pelo usuário - Pronto para implementação

---

## ✅ RESPOSTAS ÀS PERGUNTAS CRÍTICAS

### **1. Dimensão Tempo?**

❌ **NÃO preciso de dim_tempo separada**

✅ **MAS preciso de logs de auditoria completos:**

- `created_at` (data/hora de criação)
- `created_by` (usuário que criou)
- `updated_at` (data/hora última atualização)
- `updated_by` (usuário que atualizou)

**Aplicar em:** TODAS as tabelas (dimensões + fatos)

---

### **2. O que é Projeto?**

✅ **Projeto funciona como:**

- **Agregador** (agrupa entidades relacionadas)
- **Unidade de Negócio** (contexto organizacional)
- **Centro de Custos** (controle financeiro)

**Características:**

- Um projeto pode ter **N pesquisas** (indefinido)
- Múltiplos projetos simultâneos (indefinido)

---

### **3. Granularidade?**

✅ **APROVADA:** Entidade + Projeto + Pesquisa

---

### **4. Relacionamentos?**

✅ **APROVADOS:**

- `fato_entidade_contexto` (fato central)
- Projeto e Pesquisa como dimensões
- Sem necessidade de `cliente_projeto` separado

---

### **5. Volumes Esperados?**

✅ **Indefinido (escalável):**

- Múltiplos projetos simultâneos
- N pesquisas por projeto
- N entidades por pesquisa

**Implicação:** Arquitetura deve ser **altamente escalável**

---

### **6. Origem da Criação da Entidade?**

✅ **CRÍTICO:** Registrar origem da entidade primária

**Origens possíveis:**

1. **Importação manual** (CSV upload)
   - Registrar: nome do arquivo, data, usuário
2. **Processo interno do sistema** (IA/prompt semântico)
   - Registrar: tipo de processo, prompt usado, confiança

**Campos necessários em `dim_entidade`:**

- `origem_tipo` (importacao/ia_prompt/api/manual)
- `origem_arquivo` (nome do CSV, se importação)
- `origem_processo` (nome do processo, se IA)
- `origem_prompt` (prompt usado, se IA)
- `origem_confianca` (0-100, se IA)
- `origem_data` (quando foi criado)
- `origem_usuario` (quem criou)

---

## 🏗️ ARQUITETURA FINAL VALIDADA

### **DIMENSÕES (7)**

#### **1. dim_entidade**

**Conceito:** Entidade única (cliente/lead/concorrente)

**Atributos:**

```sql
CREATE TABLE dim_entidade (
  -- Identificação
  id SERIAL PRIMARY KEY,
  entidade_hash VARCHAR(64) UNIQUE NOT NULL,
  tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')),

  -- Dados básicos
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  email VARCHAR(255),
  telefone VARCHAR(20),
  site VARCHAR(255),

  -- Origem da criação ⭐ NOVO
  origem_tipo VARCHAR(20) NOT NULL CHECK (origem_tipo IN ('importacao', 'ia_prompt', 'api', 'manual')),
  origem_arquivo VARCHAR(255), -- Nome do CSV (se importacao)
  origem_processo VARCHAR(100), -- Nome do processo (se ia_prompt)
  origem_prompt TEXT, -- Prompt usado (se ia_prompt)
  origem_confianca INTEGER, -- 0-100 (se ia_prompt)
  origem_data TIMESTAMP NOT NULL,
  origem_usuario INTEGER, -- FK → users (se manual/importacao)

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER, -- FK → users
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER, -- FK → users

  -- Índices
  INDEX idx_entidade_hash (entidade_hash),
  INDEX idx_entidade_tipo (tipo_entidade),
  INDEX idx_entidade_origem (origem_tipo),
  INDEX idx_entidade_created_at (created_at)
);
```

---

#### **2. dim_projeto**

**Conceito:** Agregador / Unidade de Negócio / Centro de Custos

**Atributos:**

```sql
CREATE TABLE dim_projeto (
  -- Identificação
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE, -- Código do centro de custos (opcional)
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,

  -- Controle
  status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'arquivado', 'concluido')),
  owner_id INTEGER NOT NULL, -- FK → users (responsável)

  -- Metadados de negócio
  unidade_negocio VARCHAR(100), -- Ex: "Vendas Sul", "Marketing Digital"
  centro_custo VARCHAR(50), -- Código contábil
  orcamento_total DECIMAL(15,2), -- Orçamento total do projeto

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER NOT NULL, -- FK → users
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER, -- FK → users

  -- Índices
  INDEX idx_projeto_status (status),
  INDEX idx_projeto_owner (owner_id),
  INDEX idx_projeto_created_at (created_at)
);
```

---

#### **3. dim_pesquisa**

**Conceito:** Snapshot de enriquecimento / Ação de qualificação coletiva

**Atributos:**

```sql
CREATE TABLE dim_pesquisa (
  -- Identificação
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL, -- FK → dim_projeto
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,

  -- Controle de execução
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluida', 'falhou', 'cancelada')),

  -- Métricas
  total_entidades INTEGER DEFAULT 0, -- Quantas entidades foram processadas
  entidades_enriquecidas INTEGER DEFAULT 0, -- Quantas completaram
  entidades_falhadas INTEGER DEFAULT 0, -- Quantas falharam

  -- Logs de execução ⭐ OBRIGATÓRIO
  started_at TIMESTAMP, -- Quando começou
  started_by INTEGER, -- FK → users (quem iniciou)
  completed_at TIMESTAMP, -- Quando terminou
  duration_seconds INTEGER, -- Duração em segundos
  error_message TEXT, -- Mensagem de erro (se falhou)

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER NOT NULL, -- FK → users
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER, -- FK → users

  -- Constraints
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,

  -- Índices
  INDEX idx_pesquisa_projeto (projeto_id),
  INDEX idx_pesquisa_status (status),
  INDEX idx_pesquisa_created_at (created_at),
  INDEX idx_pesquisa_started_at (started_at)
);
```

---

#### **4. dim_geografia**

**Conceito:** Localização geográfica hierárquica

**Atributos:**

```sql
CREATE TABLE dim_geografia (
  -- Identificação
  id SERIAL PRIMARY KEY,
  cidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  regiao VARCHAR(20), -- Norte, Nordeste, Centro-Oeste, Sudeste, Sul

  -- Dados geográficos
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  codigo_ibge VARCHAR(10),
  populacao INTEGER,
  pib_per_capita DECIMAL(12,2),

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,

  -- Constraints
  UNIQUE (cidade, uf),

  -- Índices
  INDEX idx_geografia_uf (uf),
  INDEX idx_geografia_regiao (regiao),
  INDEX idx_geografia_cidade_uf (cidade, uf)
);
```

---

#### **5. dim_mercado**

**Conceito:** Mercado/setor de atuação

**Atributos:**

```sql
CREATE TABLE dim_mercado (
  -- Identificação
  id SERIAL PRIMARY KEY,
  mercado_hash VARCHAR(64) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100), -- Ex: "B2B", "B2C", "B2B2C"

  -- Dados de mercado
  segmentacao VARCHAR(255),
  tamanho_mercado_br DECIMAL(15,2), -- Em R$
  crescimento_anual_pct DECIMAL(5,2), -- %
  tendencias TEXT[], -- Array de tendências
  principais_players TEXT[], -- Array de principais empresas

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,

  -- Índices
  INDEX idx_mercado_hash (mercado_hash),
  INDEX idx_mercado_categoria (categoria),
  INDEX idx_mercado_nome (nome)
);
```

---

#### **6. dim_produto**

**Conceito:** Produto ou serviço oferecido

**Atributos:**

```sql
CREATE TABLE dim_produto (
  -- Identificação
  id SERIAL PRIMARY KEY,
  produto_hash VARCHAR(64) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),

  -- Dados do produto
  descricao TEXT,
  preco_medio DECIMAL(12,2),
  unidade VARCHAR(20), -- kg, unidade, m², etc
  ncm VARCHAR(10), -- Nomenclatura Comum do Mercosul

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,

  -- Índices
  INDEX idx_produto_hash (produto_hash),
  INDEX idx_produto_categoria (categoria),
  INDEX idx_produto_nome (nome)
);
```

---

#### **7. dim_status_qualificacao**

**Conceito:** Status de qualificação (tabela de domínio)

**Atributos:**

```sql
CREATE TABLE dim_status_qualificacao (
  -- Identificação
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL, -- ativo, inativo, prospect, etc
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7), -- Hex color para UI (#00FF00)
  ordem INTEGER, -- Para ordenação

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,

  -- Índices
  INDEX idx_status_codigo (codigo)
);
```

---

### **TABELA DE FATOS**

#### **fato_entidade_contexto**

**Conceito:** Existência e estado de uma entidade em um contexto (projeto + pesquisa)

**Atributos:**

```sql
CREATE TABLE fato_entidade_contexto (
  -- Identificação
  id SERIAL PRIMARY KEY,

  -- Chaves dimensionais (FKs)
  entidade_id INTEGER NOT NULL, -- FK → dim_entidade
  projeto_id INTEGER NOT NULL, -- FK → dim_projeto
  pesquisa_id INTEGER, -- FK → dim_pesquisa (NULL se não enriquecido ainda)
  geografia_id INTEGER, -- FK → dim_geografia
  mercado_id INTEGER, -- FK → dim_mercado
  status_qualificacao_id INTEGER NOT NULL, -- FK → dim_status_qualificacao

  -- Métricas (fatos)
  qualidade_score INTEGER CHECK (qualidade_score BETWEEN 0 AND 100),
  qualidade_classificacao VARCHAR(1) CHECK (qualidade_classificacao IN ('A', 'B', 'C', 'D')),
  faturamento_estimado DECIMAL(15,2),
  num_estabelecimentos INTEGER,
  num_funcionarios INTEGER,

  -- Metadados
  observacoes TEXT,

  -- Logs de contexto ⭐ OBRIGATÓRIO
  added_at TIMESTAMP NOT NULL DEFAULT NOW(), -- Quando foi adicionado ao projeto/pesquisa
  added_by INTEGER, -- FK → users (quem adicionou)
  enriched_at TIMESTAMP, -- Quando foi enriquecido
  enriched_by INTEGER, -- FK → users (quem enriqueceu)

  -- Auditoria ⭐ OBRIGATÓRIO
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,

  -- Constraints
  UNIQUE (entidade_id, projeto_id, pesquisa_id), -- Não pode duplicar contexto
  FOREIGN KEY (entidade_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (pesquisa_id) REFERENCES dim_pesquisa(id) ON DELETE SET NULL,
  FOREIGN KEY (geografia_id) REFERENCES dim_geografia(id) ON DELETE SET NULL,
  FOREIGN KEY (mercado_id) REFERENCES dim_mercado(id) ON DELETE SET NULL,
  FOREIGN KEY (status_qualificacao_id) REFERENCES dim_status_qualificacao(id),

  -- Índices compostos otimizados
  INDEX idx_fec_entidade (entidade_id),
  INDEX idx_fec_projeto (projeto_id),
  INDEX idx_fec_pesquisa (pesquisa_id),
  INDEX idx_fec_geografia (geografia_id),
  INDEX idx_fec_mercado (mercado_id),
  INDEX idx_fec_status (status_qualificacao_id),
  INDEX idx_fec_entidade_projeto (entidade_id, projeto_id),
  INDEX idx_fec_projeto_pesquisa (projeto_id, pesquisa_id),
  INDEX idx_fec_entidade_projeto_pesquisa (entidade_id, projeto_id, pesquisa_id),
  INDEX idx_fec_added_at (added_at),
  INDEX idx_fec_enriched_at (enriched_at)
);
```

---

### **RELACIONAMENTOS N:N**

#### **fato_entidade_produto**

**Conceito:** Entidade oferece N produtos em um contexto

**Atributos:**

```sql
CREATE TABLE fato_entidade_produto (
  -- Identificação
  id SERIAL PRIMARY KEY,

  -- Chaves dimensionais
  entidade_id INTEGER NOT NULL, -- FK → dim_entidade
  produto_id INTEGER NOT NULL, -- FK → dim_produto
  projeto_id INTEGER NOT NULL, -- FK → dim_projeto
  pesquisa_id INTEGER, -- FK → dim_pesquisa

  -- Metadados
  tipo_relacao VARCHAR(20) CHECK (tipo_relacao IN ('principal', 'secundario', 'complementar')),
  volume_estimado DECIMAL(12,2),

  -- Auditoria ⭐ OBRIGATÓRIO
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  added_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,

  -- Constraints
  UNIQUE (entidade_id, produto_id, projeto_id, pesquisa_id),
  FOREIGN KEY (entidade_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES dim_produto(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (pesquisa_id) REFERENCES dim_pesquisa(id) ON DELETE SET NULL,

  -- Índices
  INDEX idx_fep_entidade (entidade_id),
  INDEX idx_fep_produto (produto_id),
  INDEX idx_fep_projeto (projeto_id),
  INDEX idx_fep_pesquisa (pesquisa_id)
);
```

---

#### **fato_entidade_competidor**

**Conceito:** Entidade compete com N outras entidades em um contexto

**Atributos:**

```sql
CREATE TABLE fato_entidade_competidor (
  -- Identificação
  id SERIAL PRIMARY KEY,

  -- Chaves dimensionais
  entidade_id INTEGER NOT NULL, -- FK → dim_entidade (cliente/lead)
  competidor_id INTEGER NOT NULL, -- FK → dim_entidade (concorrente)
  projeto_id INTEGER NOT NULL, -- FK → dim_projeto
  pesquisa_id INTEGER, -- FK → dim_pesquisa

  -- Metadados
  nivel_competicao VARCHAR(20) CHECK (nivel_competicao IN ('direto', 'indireto', 'potencial')),
  diferencial_competitivo TEXT,

  -- Auditoria ⭐ OBRIGATÓRIO
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  added_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER,

  -- Constraints
  UNIQUE (entidade_id, competidor_id, projeto_id, pesquisa_id),
  FOREIGN KEY (entidade_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (competidor_id) REFERENCES dim_entidade(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_id) REFERENCES dim_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (pesquisa_id) REFERENCES dim_pesquisa(id) ON DELETE SET NULL,

  -- Índices
  INDEX idx_feco_entidade (entidade_id),
  INDEX idx_feco_competidor (competidor_id),
  INDEX idx_feco_projeto (projeto_id),
  INDEX idx_feco_pesquisa (pesquisa_id)
);
```

---

## 📊 RESUMO DE CAMPOS DE AUDITORIA

### **TODAS as tabelas devem ter:**

```sql
-- Auditoria obrigatória
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
created_by INTEGER, -- FK → users
updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_by INTEGER, -- FK → users
```

### **Tabelas de fatos devem ter TAMBÉM:**

```sql
-- Logs de ação
added_at TIMESTAMP NOT NULL DEFAULT NOW(),
added_by INTEGER, -- FK → users
```

### **dim_pesquisa deve ter TAMBÉM:**

```sql
-- Logs de execução
started_at TIMESTAMP,
started_by INTEGER,
completed_at TIMESTAMP,
duration_seconds INTEGER,
error_message TEXT,
```

---

## 🎯 IMPACTOS IDENTIFICADOS

### **1. Schema (drizzle/schema.ts)**

- ✅ Adicionar campos de auditoria em TODAS as tabelas
- ✅ Adicionar campos de origem em `dim_entidade`
- ✅ Adicionar campos de logs em `dim_pesquisa`
- ✅ Adicionar `dim_projeto` com metadados de negócio
- ✅ Criar `fato_entidade_contexto` (substituir `fato_entidades`)

### **2. DAL (server/dal/)**

- ✅ Criar helpers de auditoria (auto-preencher created_by, updated_by)
- ✅ Criar helpers de origem (registrar importação vs IA)
- ✅ Atualizar queries para usar `fato_entidade_contexto`

### **3. Índices**

- ✅ Adicionar índices em campos de auditoria (created_at, updated_at)
- ✅ Adicionar índices compostos (entidade + projeto + pesquisa)
- ✅ Adicionar índices em campos de origem (origem_tipo, origem_data)

---

## ❓ VALIDAÇÃO FINAL

**Está tudo correto?**

- ✅ Logs de auditoria completos (created_at, created_by, updated_at, updated_by)
- ✅ Origem da entidade rastreada (importação vs IA)
- ✅ Projeto como agregador/unidade de negócio/centro de custos
- ✅ N projetos, N pesquisas, N entidades (indefinido)
- ✅ Granularidade: entidade + projeto + pesquisa

**Se SIM, próximo passo:**

1. Atualizar schema.ts
2. Criar migration SQL
3. Atualizar DAL
4. Atualizar índices

**Você aprova este modelo final?** 🎯
