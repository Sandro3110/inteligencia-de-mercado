# 🏗️ Nova Arquitetura de Dados - Padronizada e Otimizada

## 🎯 PRINCÍPIOS DE DESIGN

1. **Padronização de Campos:** Todos os campos com mesmo propósito têm **mesmo nome** e **mesma estrutura**
2. **Integridade Referencial:** Foreign Keys obrigatórias em TODOS os relacionamentos
3. **Zero Órfãos:** Campos críticos são NOT NULL
4. **Normalização Geográfica:** Dimensão geografia única
5. **Cubo Dimensional:** Navegação multidimensional completa
6. **Performance:** Índices otimizados para queries comuns

---

## 📐 ESTRUTURA DIMENSIONAL (Star Schema Simplificado)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DIM_PESQUISAS                               │
│  id (PK), nome, data_inicio, data_fim, status                  │
│  project_id (FK → projects)                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ FK (pesquisa_id)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼─────────┐  ┌────▼──────────┐
│ DIM_GEOGRAFIA  │  │  DIM_MERCADOS  │  │ DIM_PRODUTOS  │
│ (normalizada)  │  │  (setores)     │  │ (categorias)  │
└───────┬────────┘  └──────┬─────────┘  └────┬──────────┘
        │                  │                  │
        │ FK               │ FK               │ FK
        │                  │                  │
┌───────▼──────────────────▼──────────────────▼────────┐
│              FATO_ENTIDADES (Tabela Unificada)       │
│  id, tipo_entidade, pesquisa_id, geografia_id,      │
│  mercado_id, nome, cnpj, qualidade_score, ...       │
└──────────────────────────────────────────────────────┘
         │
         │ 1:N
         │
┌────────▼──────────┐
│ ENTIDADE_PRODUTOS │
│ (N:N)             │
│ entidade_id (FK)  │
│ produto_id (FK)   │
└───────────────────┘
```

---

## 📋 TABELAS DIMENSIONAIS

### 1. **dim_geografia** (Dimensão Geográfica)

```sql
CREATE TABLE dim_geografia (
  id SERIAL PRIMARY KEY,

  -- Campos padronizados
  cidade VARCHAR(255) NOT NULL,
  uf CHAR(2) NOT NULL,
  regiao VARCHAR(50) NOT NULL,

  -- Coordenadas
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(cidade, uf)
);

CREATE INDEX idx_dim_geografia_uf ON dim_geografia(uf);
CREATE INDEX idx_dim_geografia_regiao ON dim_geografia(regiao);
CREATE INDEX idx_dim_geografia_cidade_uf ON dim_geografia(cidade, uf);
```

**Benefícios:**

- Elimina redundância (cidade/uf repetidos em todas as tabelas)
- Garante consistência geográfica
- Facilita drill-down por região → estado → cidade

---

### 2. **dim_mercados** (Dimensão Setores/Mercados)

```sql
CREATE TABLE dim_mercados (
  id SERIAL PRIMARY KEY,

  -- Identificação
  mercado_hash VARCHAR(255) UNIQUE,
  nome VARCHAR(255) NOT NULL,

  -- Classificação (padronizado)
  categoria VARCHAR(100) NOT NULL,
  segmentacao VARCHAR(50),

  -- Informações de mercado
  tamanho_mercado TEXT,
  crescimento_anual TEXT,
  tendencias TEXT,
  principais_players TEXT,

  -- Relacionamentos
  pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dim_mercados_pesquisa ON dim_mercados(pesquisa_id);
CREATE INDEX idx_dim_mercados_categoria ON dim_mercados(categoria);
CREATE INDEX idx_dim_mercados_hash ON dim_mercados(mercado_hash);
```

---

### 3. **dim_produtos** (Dimensão Produtos)

```sql
CREATE TABLE dim_produtos (
  id SERIAL PRIMARY KEY,

  -- Identificação
  produto_hash VARCHAR(255) UNIQUE,
  nome VARCHAR(255) NOT NULL,

  -- Classificação (padronizado)
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,

  -- Atributos comerciais
  preco TEXT,
  unidade VARCHAR(50),
  ativo BOOLEAN DEFAULT TRUE,

  -- Relacionamentos
  mercado_id INTEGER REFERENCES dim_mercados(id) ON DELETE SET NULL,
  pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dim_produtos_pesquisa ON dim_produtos(pesquisa_id);
CREATE INDEX idx_dim_produtos_categoria ON dim_produtos(categoria);
CREATE INDEX idx_dim_produtos_mercado ON dim_produtos(mercado_id);
CREATE INDEX idx_dim_produtos_hash ON dim_produtos(produto_hash);
```

---

## 📊 TABELA FATO (Entidades Unificadas)

### **fato_entidades** (Clientes, Leads, Concorrentes)

```sql
CREATE TABLE fato_entidades (
  id SERIAL PRIMARY KEY,

  -- Tipo de entidade (padronizado)
  tipo_entidade VARCHAR(20) NOT NULL CHECK (tipo_entidade IN ('cliente', 'lead', 'concorrente')),

  -- Hash único (padronizado)
  entidade_hash VARCHAR(255) UNIQUE,

  -- Identificação (padronizado)
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),

  -- Relacionamentos obrigatórios (padronizado)
  pesquisa_id INTEGER NOT NULL REFERENCES pesquisas(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  geografia_id INTEGER NOT NULL REFERENCES dim_geografia(id),
  mercado_id INTEGER NOT NULL REFERENCES dim_mercados(id),

  -- Contato (padronizado)
  email VARCHAR(500),
  telefone VARCHAR(50),
  site_oficial VARCHAR(500),
  linkedin VARCHAR(500),
  instagram VARCHAR(500),

  -- Classificação (padronizado)
  cnae VARCHAR(20),
  porte VARCHAR(50),
  segmentacao_b2b_b2c VARCHAR(10),

  -- Financeiro (padronizado)
  faturamento_declarado TEXT,
  faturamento_estimado TEXT,
  numero_estabelecimentos TEXT,

  -- Qualidade (padronizado)
  qualidade_score INTEGER,
  qualidade_classificacao VARCHAR(50),

  -- Validação (padronizado)
  validation_status VARCHAR(50),
  validation_notes TEXT,
  validated_by VARCHAR(64),
  validated_at TIMESTAMP,

  -- Campos específicos de leads
  lead_stage VARCHAR(50),
  stage_updated_at TIMESTAMP,
  cliente_origem_id INTEGER REFERENCES fato_entidades(id), -- Conversão

  -- Metadados (padronizado)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices otimizados
CREATE INDEX idx_fato_entidades_tipo ON fato_entidades(tipo_entidade);
CREATE INDEX idx_fato_entidades_pesquisa ON fato_entidades(pesquisa_id);
CREATE INDEX idx_fato_entidades_geografia ON fato_entidades(geografia_id);
CREATE INDEX idx_fato_entidades_mercado ON fato_entidades(mercado_id);
CREATE INDEX idx_fato_entidades_hash ON fato_entidades(entidade_hash);
CREATE INDEX idx_fato_entidades_qualidade ON fato_entidades(qualidade_score);
CREATE INDEX idx_fato_entidades_tipo_pesquisa ON fato_entidades(tipo_entidade, pesquisa_id);
CREATE INDEX idx_fato_entidades_cliente_origem ON fato_entidades(cliente_origem_id);
```

**Benefícios:**

- **Campos padronizados:** Mesmo nome para mesma função
- **Queries simplificadas:** Uma tabela para todas as entidades
- **Manutenção fácil:** Adicionar campo = uma única alteração
- **Performance:** Índices compostos otimizados

---

## 🔗 TABELAS DE RELACIONAMENTO (N:N)

### **entidade_produtos** (N:N)

```sql
CREATE TABLE entidade_produtos (
  id SERIAL PRIMARY KEY,

  -- Relacionamentos
  entidade_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES dim_produtos(id) ON DELETE CASCADE,

  -- Tipo de relacionamento
  tipo_relacao VARCHAR(50), -- 'fabricante', 'distribuidor', 'consumidor', etc.

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraint
  UNIQUE(entidade_id, produto_id)
);

CREATE INDEX idx_entidade_produtos_entidade ON entidade_produtos(entidade_id);
CREATE INDEX idx_entidade_produtos_produto ON entidade_produtos(produto_id);
```

---

### **entidade_competidores** (N:N) - Análise Competitiva

```sql
CREATE TABLE entidade_competidores (
  id SERIAL PRIMARY KEY,

  -- Relacionamentos
  entidade_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE,
  competidor_id INTEGER NOT NULL REFERENCES fato_entidades(id) ON DELETE CASCADE,
  mercado_id INTEGER NOT NULL REFERENCES dim_mercados(id),

  -- Análise competitiva
  nivel_competicao VARCHAR(50), -- 'direto', 'indireto', 'potencial'

  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraint
  UNIQUE(entidade_id, competidor_id, mercado_id),
  CHECK (entidade_id != competidor_id)
);

CREATE INDEX idx_entidade_competidores_entidade ON entidade_competidores(entidade_id);
CREATE INDEX idx_entidade_competidores_competidor ON entidade_competidores(competidor_id);
CREATE INDEX idx_entidade_competidores_mercado ON entidade_competidores(mercado_id);
```

---

## 📜 TABELAS DE HISTÓRICO (Auditoria)

### **fato_entidades_history**

```sql
CREATE TABLE fato_entidades_history (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL,

  -- Snapshot completo (JSONB)
  data_snapshot JSONB NOT NULL,

  -- Tipo de mudança
  change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted'
  changed_by VARCHAR(64),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fato_entidades_history_entidade ON fato_entidades_history(entidade_id);
CREATE INDEX idx_fato_entidades_history_changed_at ON fato_entidades_history(changed_at);
```

---

## 🔄 MAPEAMENTO: TABELAS ANTIGAS → NOVAS

| Tabela Antiga              | Tabela Nova    | Observações                                        |
| -------------------------- | -------------- | -------------------------------------------------- |
| **clientes**               | fato_entidades | tipo_entidade = 'cliente'                          |
| **leads**                  | fato_entidades | tipo_entidade = 'lead'                             |
| **concorrentes**           | fato_entidades | tipo_entidade = 'concorrente'                      |
| **produtos**               | dim_produtos   | Normalizado                                        |
| **mercados_unicos**        | dim_mercados   | Normalizado                                        |
| **clientes_mercados**      | ❌ REMOVIDO    | Relacionamento direto em fato_entidades.mercado_id |
| **clientes.cidade/uf**     | dim_geografia  | Normalizado                                        |
| **leads.cidade/uf**        | dim_geografia  | Normalizado                                        |
| **concorrentes.cidade/uf** | dim_geografia  | Normalizado                                        |

---

## 📊 CAMPOS PADRONIZADOS (Mesmo Nome em Todas as Tabelas)

| Campo                       | Tipo                  | Descrição                  | Tabelas                                    |
| --------------------------- | --------------------- | -------------------------- | ------------------------------------------ |
| **id**                      | SERIAL                | Primary Key                | TODAS                                      |
| **pesquisa_id**             | INTEGER NOT NULL      | FK → pesquisas             | TODAS (exceto dim_geografia)               |
| **project_id**              | INTEGER NOT NULL      | FK → projects              | TODAS (exceto dim_geografia)               |
| **created_at**              | TIMESTAMP             | Data de criação            | TODAS                                      |
| **updated_at**              | TIMESTAMP             | Data de atualização        | TODAS                                      |
| **nome**                    | VARCHAR(255) NOT NULL | Nome da entidade           | fato_entidades, dim_mercados, dim_produtos |
| **categoria**               | VARCHAR(100) NOT NULL | Categoria/Classificação    | dim_mercados, dim_produtos                 |
| **qualidade_score**         | INTEGER               | Score de qualidade (0-100) | fato_entidades                             |
| **qualidade_classificacao** | VARCHAR(50)           | Classificação (A/B/C/D)    | fato_entidades                             |

---

## ✅ BENEFÍCIOS DA NOVA ARQUITETURA

1. ✅ **Padronização Total:** Campos com mesmo nome e estrutura
2. ✅ **Zero Órfãos:** Foreign Keys obrigatórias
3. ✅ **Manutenção Simplificada:** Mudança em um lugar
4. ✅ **Queries Unificadas:** Uma tabela para clientes/leads/concorrentes
5. ✅ **Performance:** Índices compostos otimizados
6. ✅ **Cubo Dimensional:** Navegação multidimensional completa
7. ✅ **Normalização:** Elimina redundância (geografia, mercados)
8. ✅ **Integridade:** Constraints garantem consistência
9. ✅ **Análise Competitiva:** Relacionamento N:N estruturado
10. ✅ **Rastreamento de Conversão:** Lead → Cliente

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Revisar e aprovar arquitetura
2. ⏳ Criar scripts DDL (CREATE TABLE)
3. ⏳ Criar scripts de migração de dados
4. ⏳ Otimizar índices
5. ⏳ Ajustar enriquecimento
6. ⏳ Refatorar queries e routers
7. ⏳ Testar performance
8. ⏳ Deploy em produção
