# 🎯 Engenharia de Dados - Arquitetura de Cubo Dimensional

## 📊 OBJETIVO

Criar uma arquitetura de dados onde **TODAS as entidades se relacionam** em uma **matriz multidimensional navegável**, sem órfãos, permitindo análise cruzada em todos os sentidos (OLAP Cube).

---

## 🔍 ANÁLISE DA ESTRUTURA ATUAL

### ❌ PROBLEMAS CRÍTICOS IDENTIFICADOS

#### 1. **ZERO Foreign Keys Implementadas**

```sql
-- Query retornou: []
-- NÃO HÁ CONSTRAINTS DE INTEGRIDADE REFERENCIAL!
```

**Impacto:**

- Dados órfãos podem ser inseridos sem validação
- Relacionamentos não são garantidos
- Exclusões em cascata não funcionam
- Integridade referencial inexistente

---

#### 2. **Campos Nullable em Relacionamentos Críticos**

| Tabela              | Campo Crítico | Nullable  | Problema                 |
| ------------------- | ------------- | --------- | ------------------------ |
| **clientes**        | pesquisaId    | YES ❌    | Cliente sem pesquisa     |
| **clientes**        | cidade        | YES ❌    | Cliente sem localização  |
| **clientes**        | uf            | YES ❌    | Cliente sem localização  |
| **leads**           | mercadoId     | **NO** ✅ | OK                       |
| **leads**           | pesquisaId    | YES ❌    | Lead sem pesquisa        |
| **concorrentes**    | mercadoId     | **NO** ✅ | OK                       |
| **concorrentes**    | pesquisaId    | YES ❌    | Concorrente sem pesquisa |
| **produtos**        | clienteId     | **NO** ✅ | OK                       |
| **produtos**        | mercadoId     | **NO** ✅ | OK                       |
| **produtos**        | pesquisaId    | YES ❌    | Produto sem pesquisa     |
| **mercados_unicos** | categoria     | YES ❌    | Mercado sem categoria    |
| **mercados_unicos** | pesquisaId    | YES ❌    | Mercado sem pesquisa     |

---

#### 3. **Relacionamentos Faltantes**

```
❌ clientes → mercados (via clientes_mercados)
   - Existe tabela de junção MAS sem FK constraints
   - 250 clientes órfãos (31%)

❌ leads → produtos
   - Relacionamento NÃO EXISTE
   - Impossível fazer drill-down de produtos por leads

❌ concorrentes → produtos
   - Campo TEXT (não estruturado)
   - Impossível fazer JOIN eficiente

❌ leads → clientes
   - Relacionamento NÃO EXISTE
   - Impossível rastrear conversão

❌ concorrentes → clientes (competição)
   - Relacionamento NÃO EXISTE
   - Impossível análise competitiva
```

---

## 🎯 ARQUITETURA DIMENSIONAL PROPOSTA (Star Schema)

### Conceito: Tabela Fato + Dimensões

```
                    ┌─────────────────────┐
                    │   DIM_PESQUISAS     │
                    │   (pesquisaId PK)   │
                    └──────────┬──────────┘
                               │
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        │                      │                      │
┌───────▼────────┐    ┌────────▼────────┐    ┌──────▼──────────┐
│ DIM_MERCADOS   │    │  DIM_PRODUTOS   │    │ DIM_GEOGRAFIA   │
│ (mercadoId PK) │    │ (produtoId PK)  │    │ (geografiaId PK)│
│ - categoria    │    │ - categoria     │    │ - cidade        │
│ - nome         │    │ - nome          │    │ - uf            │
│ - segmentacao  │    │ - descricao     │    │ - regiao        │
└───────┬────────┘    └────────┬────────┘    └──────┬──────────┘
        │                      │                      │
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   FATO_ENTIDADES    │
                    │  (entidadeId PK)    │
                    │                     │
                    │ - tipo (cliente/    │
                    │   lead/concorrente) │
                    │ - pesquisaId FK     │
                    │ - mercadoId FK      │
                    │ - geografiaId FK    │
                    │ - nome              │
                    │ - cnpj              │
                    │ - qualidadeScore    │
                    │ - ...               │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ FATO_ENTIDADE_      │
                    │    PRODUTOS         │
                    │  (relação N:N)      │
                    │                     │
                    │ - entidadeId FK     │
                    │ - produtoId FK      │
                    │ - tipo_relacao      │
                    └─────────────────────┘
```

---

## ✅ MODELO NORMALIZADO CORRIGIDO (Alternativa)

### Manter estrutura atual MAS adicionar constraints e relacionamentos

```
┌─────────────────────────────────────────────────────────────────┐
│                     PESQUISAS (Dimensão Temporal)               │
│                     pesquisaId PK NOT NULL                      │
└─────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │ FK                 │ FK                 │ FK
         │                    │                    │
┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐
│ MERCADOS_UNICOS │  │   DIM_GEOGRAFIA │  │  DIM_PRODUTOS   │
│ mercadoId PK    │  │  geografiaId PK │  │  produtoId PK   │
│ pesquisaId FK   │  │  cidade NOT NULL│  │  categoria      │
│ categoria NN    │  │  uf NOT NULL    │  │  nome NOT NULL  │
│ nome NOT NULL   │  │  regiao         │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                      │
         │ FK                 │ FK                   │ FK
         │                    │                      │
┌────────▼────────────────────▼──────────────────────▼────────┐
│                       CLIENTES                               │
│  clienteId PK                                                │
│  pesquisaId FK NOT NULL → pesquisas.id                       │
│  geografiaId FK NOT NULL → dim_geografia.id                  │
│  nome NOT NULL                                               │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ CLIENTES_       │
│  MERCADOS       │◄──────┐
│ (N:N)           │       │
│ clienteId FK NN │       │ FK
│ mercadoId FK NN │       │
└─────────────────┘       │
                          │
┌────────▼────────────────┴──────────────────────────────────┐
│                       PRODUTOS                             │
│  produtoId PK                                              │
│  clienteId FK NOT NULL → clientes.id                       │
│  mercadoId FK NOT NULL → mercados_unicos.id                │
│  pesquisaId FK NOT NULL → pesquisas.id                     │
│  categoria NOT NULL                                        │
│  nome NOT NULL                                             │
└────────────────────────────────────────────────────────────┘
         ▲
         │ FK
         │
┌────────┴────────┐
│ LEADS_PRODUTOS  │
│ (N:N)           │
│ leadId FK NN    │
│ produtoId FK NN │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────────────────────────────────────────┐
│                       LEADS                                 │
│  leadId PK                                                  │
│  pesquisaId FK NOT NULL → pesquisas.id                      │
│  mercadoId FK NOT NULL → mercados_unicos.id                 │
│  geografiaId FK NOT NULL → dim_geografia.id                 │
│  clienteOrigemId FK → clientes.id (conversão)               │
│  nome NOT NULL                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CONCORRENTES                             │
│  concorrenteId PK                                           │
│  pesquisaId FK NOT NULL → pesquisas.id                      │
│  mercadoId FK NOT NULL → mercados_unicos.id                 │
│  geografiaId FK NOT NULL → dim_geografia.id                 │
│  nome NOT NULL                                              │
└────────┬────────────────────────────────────────────────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│ CONCORRENTES_   │
│   PRODUTOS      │
│ (N:N)           │
│ concorrenteId FK│
│ produtoId FK NN │
└─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              CLIENTES_CONCORRENTES (N:N)                    │
│  clienteId FK NOT NULL → clientes.id                        │
│  concorrenteId FK NOT NULL → concorrentes.id                │
│  mercadoId FK NOT NULL → mercados_unicos.id (contexto)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 CORREÇÕES NECESSÁRIAS

### 1. **Criar Dimensão Geografia (Normalização)**

```sql
CREATE TABLE dim_geografia (
  id SERIAL PRIMARY KEY,
  cidade VARCHAR(255) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  regiao VARCHAR(50) NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  UNIQUE(cidade, uf)
);

CREATE INDEX idx_dim_geografia_uf ON dim_geografia(uf);
CREATE INDEX idx_dim_geografia_regiao ON dim_geografia(regiao);
```

**Benefícios:**

- Elimina redundância (cidade/uf repetidos)
- Garante consistência geográfica
- Facilita drill-down por região/estado/cidade

---

### 2. **Adicionar Foreign Keys e Constraints**

```sql
-- CLIENTES
ALTER TABLE clientes
  ADD CONSTRAINT fk_clientes_pesquisa
  FOREIGN KEY (pesquisaId) REFERENCES pesquisas(id) ON DELETE CASCADE;

ALTER TABLE clientes
  ADD CONSTRAINT fk_clientes_geografia
  FOREIGN KEY (geografiaId) REFERENCES dim_geografia(id);

ALTER TABLE clientes
  ALTER COLUMN pesquisaId SET NOT NULL,
  ALTER COLUMN geografiaId SET NOT NULL;

-- CLIENTES_MERCADOS
ALTER TABLE clientes_mercados
  ADD CONSTRAINT fk_cm_cliente
  FOREIGN KEY (clienteId) REFERENCES clientes(id) ON DELETE CASCADE;

ALTER TABLE clientes_mercados
  ADD CONSTRAINT fk_cm_mercado
  FOREIGN KEY (mercadoId) REFERENCES mercados_unicos(id) ON DELETE CASCADE;

-- PRODUTOS
ALTER TABLE produtos
  ADD CONSTRAINT fk_produtos_cliente
  FOREIGN KEY (clienteId) REFERENCES clientes(id) ON DELETE CASCADE;

ALTER TABLE produtos
  ADD CONSTRAINT fk_produtos_mercado
  FOREIGN KEY (mercadoId) REFERENCES mercados_unicos(id);

ALTER TABLE produtos
  ADD CONSTRAINT fk_produtos_pesquisa
  FOREIGN KEY (pesquisaId) REFERENCES pesquisas(id) ON DELETE CASCADE;

ALTER TABLE produtos
  ALTER COLUMN pesquisaId SET NOT NULL,
  ALTER COLUMN categoria SET NOT NULL;

-- MERCADOS_UNICOS
ALTER TABLE mercados_unicos
  ADD CONSTRAINT fk_mercados_pesquisa
  FOREIGN KEY (pesquisaId) REFERENCES pesquisas(id) ON DELETE CASCADE;

ALTER TABLE mercados_unicos
  ALTER COLUMN pesquisaId SET NOT NULL,
  ALTER COLUMN categoria SET NOT NULL;

-- LEADS
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_pesquisa
  FOREIGN KEY (pesquisaId) REFERENCES pesquisas(id) ON DELETE CASCADE;

ALTER TABLE leads
  ADD CONSTRAINT fk_leads_mercado
  FOREIGN KEY (mercadoId) REFERENCES mercados_unicos(id);

ALTER TABLE leads
  ADD CONSTRAINT fk_leads_geografia
  FOREIGN KEY (geografiaId) REFERENCES dim_geografia(id);

ALTER TABLE leads
  ALTER COLUMN pesquisaId SET NOT NULL,
  ALTER COLUMN geografiaId SET NOT NULL;

-- CONCORRENTES
ALTER TABLE concorrentes
  ADD CONSTRAINT fk_concorrentes_pesquisa
  FOREIGN KEY (pesquisaId) REFERENCES pesquisas(id) ON DELETE CASCADE;

ALTER TABLE concorrentes
  ADD CONSTRAINT fk_concorrentes_mercado
  FOREIGN KEY (mercadoId) REFERENCES mercados_unicos(id);

ALTER TABLE concorrentes
  ADD CONSTRAINT fk_concorrentes_geografia
  FOREIGN KEY (geografiaId) REFERENCES dim_geografia(id);

ALTER TABLE concorrentes
  ALTER COLUMN pesquisaId SET NOT NULL,
  ALTER COLUMN geografiaId SET NOT NULL;
```

---

### 3. **Criar Tabelas de Relacionamento N:N**

```sql
-- LEADS_PRODUTOS (N:N)
CREATE TABLE leads_produtos (
  id SERIAL PRIMARY KEY,
  leadId INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  produtoId INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(leadId, produtoId)
);

CREATE INDEX idx_leads_produtos_lead ON leads_produtos(leadId);
CREATE INDEX idx_leads_produtos_produto ON leads_produtos(produtoId);

-- CONCORRENTES_PRODUTOS (N:N)
CREATE TABLE concorrentes_produtos (
  id SERIAL PRIMARY KEY,
  concorrenteId INTEGER NOT NULL REFERENCES concorrentes(id) ON DELETE CASCADE,
  produtoId INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(concorrenteId, produtoId)
);

CREATE INDEX idx_concorrentes_produtos_concorrente ON concorrentes_produtos(concorrenteId);
CREATE INDEX idx_concorrentes_produtos_produto ON concorrentes_produtos(produtoId);

-- CLIENTES_CONCORRENTES (N:N) - Análise Competitiva
CREATE TABLE clientes_concorrentes (
  id SERIAL PRIMARY KEY,
  clienteId INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  concorrenteId INTEGER NOT NULL REFERENCES concorrentes(id) ON DELETE CASCADE,
  mercadoId INTEGER NOT NULL REFERENCES mercados_unicos(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(clienteId, concorrenteId, mercadoId)
);

CREATE INDEX idx_clientes_concorrentes_cliente ON clientes_concorrentes(clienteId);
CREATE INDEX idx_clientes_concorrentes_concorrente ON clientes_concorrentes(concorrenteId);
CREATE INDEX idx_clientes_concorrentes_mercado ON clientes_concorrentes(mercadoId);
```

---

### 4. **Adicionar Campo de Conversão em Leads**

```sql
ALTER TABLE leads
  ADD COLUMN clienteOrigemId INTEGER REFERENCES clientes(id);

CREATE INDEX idx_leads_cliente_origem ON leads(clienteOrigemId);
```

---

## 🔄 PLANO DE MIGRAÇÃO DE DADOS

### Fase 1: Criar dim_geografia e migrar dados

```sql
-- 1. Criar tabela
CREATE TABLE dim_geografia (...);

-- 2. Popular com dados únicos
INSERT INTO dim_geografia (cidade, uf, regiao)
SELECT DISTINCT
  cidade,
  uf,
  CASE
    WHEN uf IN ('AC','AM','AP','PA','RO','RR','TO') THEN 'Norte'
    WHEN uf IN ('AL','BA','CE','MA','PB','PE','PI','RN','SE') THEN 'Nordeste'
    WHEN uf IN ('DF','GO','MS','MT') THEN 'Centro-Oeste'
    WHEN uf IN ('ES','MG','RJ','SP') THEN 'Sudeste'
    WHEN uf IN ('PR','RS','SC') THEN 'Sul'
  END as regiao
FROM (
  SELECT cidade, uf FROM clientes WHERE cidade IS NOT NULL AND uf IS NOT NULL
  UNION
  SELECT cidade, uf FROM leads WHERE cidade IS NOT NULL AND uf IS NOT NULL
  UNION
  SELECT cidade, uf FROM concorrentes WHERE cidade IS NOT NULL AND uf IS NOT NULL
) t
WHERE cidade IS NOT NULL AND uf IS NOT NULL;

-- 3. Adicionar geografiaId nas tabelas
ALTER TABLE clientes ADD COLUMN geografiaId INTEGER;
ALTER TABLE leads ADD COLUMN geografiaId INTEGER;
ALTER TABLE concorrentes ADD COLUMN geografiaId INTEGER;

-- 4. Atualizar geografiaId
UPDATE clientes c
SET geografiaId = g.id
FROM dim_geografia g
WHERE c.cidade = g.cidade AND c.uf = g.uf;

UPDATE leads l
SET geografiaId = g.id
FROM dim_geografia g
WHERE l.cidade = g.cidade AND l.uf = g.uf;

UPDATE concorrentes co
SET geografiaId = g.id
FROM dim_geografia g
WHERE co.cidade = g.cidade AND co.uf = g.uf;
```

---

### Fase 2: Corrigir 250 clientes órfãos

```sql
-- Opção A: Vincular a mercado "Outros" ou "Sem Classificação"
INSERT INTO mercados_unicos (nome, categoria, pesquisaId, projectId)
VALUES ('Sem Classificação', 'Outros', 1, 1)
ON CONFLICT DO NOTHING;

-- Vincular clientes órfãos
INSERT INTO clientes_mercados (clienteId, mercadoId)
SELECT c.id, m.id
FROM clientes c
CROSS JOIN mercados_unicos m
WHERE c.pesquisaId = 1
  AND m.nome = 'Sem Classificação'
  AND NOT EXISTS (
    SELECT 1 FROM clientes_mercados cm WHERE cm.clienteId = c.id
  );

-- Opção B: Re-enriquecer clientes órfãos
-- (Executar script de enriquecimento apenas para esses 250)
```

---

### Fase 3: Parsear produtos de concorrentes e criar relacionamentos

```sql
-- Criar produtos a partir de concorrentes.produto (TEXT)
INSERT INTO produtos (nome, categoria, clienteId, mercadoId, pesquisaId, projectId)
SELECT DISTINCT
  TRIM(UNNEST(STRING_TO_ARRAY(c.produto, ','))) as nome,
  'Produto Concorrente' as categoria,
  0 as clienteId, -- Placeholder (produto sem cliente)
  c.mercadoId,
  c.pesquisaId,
  c.projectId
FROM concorrentes c
WHERE c.produto IS NOT NULL AND c.produto != ''
ON CONFLICT DO NOTHING;

-- Vincular concorrentes aos produtos
INSERT INTO concorrentes_produtos (concorrenteId, produtoId)
SELECT DISTINCT c.id, p.id
FROM concorrentes c
INNER JOIN produtos p ON p.mercadoId = c.mercadoId
WHERE c.produto ILIKE '%' || p.nome || '%';
```

---

### Fase 4: Adicionar Foreign Keys (após dados corrigidos)

```sql
-- Executar todos os ALTER TABLE com ADD CONSTRAINT
-- (ver seção 2 acima)
```

---

## 📊 MATRIZ MULTIDIMENSIONAL RESULTANTE

### Navegação Possível (OLAP Cube):

```
DIMENSÕES:
- Pesquisa (temporal)
- Geografia (região → estado → cidade)
- Mercado (categoria → mercado)
- Produto (categoria → produto)
- Tipo Entidade (cliente, lead, concorrente)

MÉTRICAS:
- Contagem de entidades
- Qualidade Score (média, min, max)
- Faturamento (soma, média)
- Taxa de conversão (leads → clientes)

EXEMPLOS DE ANÁLISE CRUZADA:
1. Clientes por Mercado por Geografia
2. Produtos por Cliente por Mercado
3. Concorrentes por Mercado por Geografia
4. Leads por Produto por Região
5. Taxa de conversão por Mercado
6. Análise competitiva (clientes vs concorrentes por mercado)
```

---

## ✅ BENEFÍCIOS DA ARQUITETURA PROPOSTA

1. ✅ **Zero Órfãos:** Todos os registros têm relacionamentos obrigatórios
2. ✅ **Integridade Referencial:** Foreign Keys garantem consistência
3. ✅ **Navegação Multidimensional:** Drill-down/up em qualquer direção
4. ✅ **Performance:** Índices otimizados para JOINs
5. ✅ **Análise Competitiva:** Relacionamento clientes ↔ concorrentes
6. ✅ **Rastreamento de Conversão:** Leads vinculados a clientes origem
7. ✅ **Produtos Estruturados:** Relacionamento N:N para todas as entidades
8. ✅ **Normalização Geográfica:** Dimensão geografia elimina redundância

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Revisar e aprovar arquitetura proposta
2. ⏳ Criar scripts de migração (DDL + DML)
3. ⏳ Testar em ambiente de staging
4. ⏳ Executar migração em produção
5. ⏳ Ajustar enriquecimento para manter integridade
6. ⏳ Refatorar routers drill-down para usar nova estrutura
7. ⏳ Criar views materializadas para performance (opcional)

---

## ❓ DECISÃO NECESSÁRIA

**Você aprova esta arquitetura?**

Se sim, posso começar a criar os scripts de migração.
