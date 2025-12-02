# 🧊 CUBO DIMENSIONAL COMPLETO - IntelMarket

**Data:** 01/12/2025  
**Conceito:** Modelo dimensional navegável em todas as direções

---

## 🎯 INSIGHT CRÍTICO

> **Projeto e Pesquisa são DIMENSÕES, não atributos!**
>
> Um cliente, lead, concorrente ou mercado pode existir em:
>
> - Múltiplos **Projetos** (dimensão espacial/organizacional)
> - Múltiplas **Pesquisas** (dimensão temporal/qualificação)

---

## 📊 ARQUITETURA DIMENSIONAL

### **FATO CENTRAL: `fato_entidade_contexto`**

**Conceito:**

> A tabela de fatos registra a **existência de uma entidade em um contexto específico** (projeto + pesquisa).

**Granularidade:**

- Uma linha = Uma entidade + em um projeto + em uma pesquisa

**Exemplo:**

```
| entidade_id | projeto_id | pesquisa_id | tipo_entidade | status | qualidade |
|-------------|------------|-------------|---------------|--------|-----------|
| 1           | 1          | 1           | cliente       | ativo  | 85        |
| 1           | 1          | 2           | cliente       | ativo  | 92        | ← Mesma entidade, pesquisa diferente (re-enriquecida)
| 1           | 2          | 3           | cliente       | ativo  | 88        | ← Mesma entidade, projeto diferente
| 2           | 1          | 1           | lead          | prospect| 70       |
| 3           | 1          | 1           | concorrente   | ativo  | 65        |
```

---

## 🧊 DIMENSÕES DO CUBO

### **1. dim_entidade (Quem?)**

**Conceito:** A entidade única (cliente, lead, concorrente)

**Atributos:**

- `id` (PK)
- `entidade_hash` (UNIQUE - deduplicação)
- `tipo_entidade` (cliente/lead/concorrente)
- `nome`
- `cnpj`
- `email`
- `telefone`
- `site`
- `created_at`
- `updated_at`

**Características:**

- ✅ Entidade existe **UMA VEZ**
- ✅ Dados **imutáveis** (identificação)
- ✅ Não tem projeto_id nem pesquisa_id aqui!

---

### **2. dim_projeto (Onde? Contexto Organizacional)**

**Conceito:** Contexto de negócio que agrupa entidades

**Atributos:**

- `id` (PK)
- `nome` (ex: "Expansão Sul 2025")
- `descricao`
- `owner_id`
- `status` (ativo/arquivado)
- `created_at`
- `updated_at`

**Características:**

- ✅ Projeto é **contexto organizacional**
- ✅ Uma entidade pode estar em **N projetos**
- ✅ Cada projeto pode ter **N pesquisas**

---

### **3. dim_pesquisa (Quando? Contexto Temporal/Qualificação)**

**Conceito:** Snapshot de enriquecimento em um momento específico

**Atributos:**

- `id` (PK)
- `projeto_id` (FK → dim_projeto)
- `nome` (ex: "Enriquecimento Inicial - Jan/2025")
- `descricao`
- `status` (pendente/em_progresso/concluida)
- `started_at`
- `completed_at`
- `created_at`

**Características:**

- ✅ Pesquisa é **snapshot temporal**
- ✅ Uma entidade pode estar em **N pesquisas**
- ✅ Cada pesquisa pertence a **1 projeto**
- ✅ Registra **qualidade em um momento**

---

### **4. dim_geografia (Onde? Localização Física)**

**Conceito:** Localização geográfica hierárquica

**Atributos:**

- `id` (PK)
- `cidade`
- `uf`
- `regiao`
- `latitude`
- `longitude`
- `populacao`
- `pib`

**Características:**

- ✅ Hierarquia: Região → Estado → Cidade
- ✅ Dados geográficos enriquecidos

---

### **5. dim_mercado (O Quê? Setor/Mercado)**

**Conceito:** Mercado/setor de atuação

**Atributos:**

- `id` (PK)
- `mercado_hash` (UNIQUE)
- `nome` (ex: "Construção Civil")
- `categoria` (ex: "B2B")
- `segmentacao`
- `tamanho_mercado`
- `crescimento_anual`
- `tendencias`

**Características:**

- ✅ Mercado existe **UMA VEZ**
- ✅ Pode estar em **N projetos/pesquisas**

---

### **6. dim_produto (O Quê? Produto/Serviço)**

**Conceito:** Produto ou serviço oferecido

**Atributos:**

- `id` (PK)
- `produto_hash` (UNIQUE)
- `nome` (ex: "Cimento Portland")
- `categoria` (ex: "Materiais de Construção")
- `descricao`
- `preco_medio`
- `unidade`

**Características:**

- ✅ Produto existe **UMA VEZ**
- ✅ Pode estar em **N projetos/pesquisas**

---

### **7. dim_status_qualificacao (Como? Status)**

**Conceito:** Status de qualificação da entidade

**Atributos:**

- `id` (PK)
- `codigo` (ativo/inativo/prospect/lead_qualificado/lead_desqualificado)
- `nome` (ex: "Cliente Ativo")
- `descricao`
- `cor` (para UI)
- `ordem` (para ordenação)

**Características:**

- ✅ Tabela de domínio (lookup)
- ✅ Facilita mudanças de nomenclatura

---

## 🔗 TABELA DE FATOS

### **`fato_entidade_contexto`**

**Conceito:**

> Registra a **existência e estado de uma entidade** em um **contexto específico** (projeto + pesquisa).

**Atributos:**

#### **Chaves Dimensionais (FKs):**

- `entidade_id` (FK → dim_entidade)
- `projeto_id` (FK → dim_projeto)
- `pesquisa_id` (FK → dim_pesquisa)
- `geografia_id` (FK → dim_geografia)
- `mercado_id` (FK → dim_mercado)
- `status_qualificacao_id` (FK → dim_status_qualificacao)

#### **Métricas (Fatos):**

- `qualidade_score` (0-100)
- `qualidade_classificacao` (A/B/C/D)
- `faturamento_estimado` (R$)
- `num_estabelecimentos` (int)
- `num_funcionarios` (int)

#### **Metadados:**

- `observacoes` (text)
- `added_at` (quando foi adicionado ao projeto/pesquisa)
- `enriched_at` (quando foi enriquecido)
- `updated_at`

#### **Constraint:**

- UNIQUE(`entidade_id`, `projeto_id`, `pesquisa_id`)

---

## 🔗 RELACIONAMENTOS N:N

### **`fato_entidade_produto`**

**Conceito:** Uma entidade oferece N produtos em um contexto

**Atributos:**

- `entidade_id` (FK → dim_entidade)
- `produto_id` (FK → dim_produto)
- `projeto_id` (FK → dim_projeto)
- `pesquisa_id` (FK → dim_pesquisa)
- `tipo_relacao` (principal/secundario/complementar)
- `volume_estimado` (opcional)
- `added_at`

**Constraint:**

- UNIQUE(`entidade_id`, `produto_id`, `projeto_id`, `pesquisa_id`)

---

### **`fato_entidade_competidor`**

**Conceito:** Uma entidade compete com N outras entidades em um contexto

**Atributos:**

- `entidade_id` (FK → dim_entidade) - cliente/lead
- `competidor_id` (FK → dim_entidade) - concorrente
- `projeto_id` (FK → dim_projeto)
- `pesquisa_id` (FK → dim_pesquisa)
- `nivel_competicao` (direto/indireto/potencial)
- `diferencial_competitivo` (text)
- `added_at`

**Constraint:**

- UNIQUE(`entidade_id`, `competidor_id`, `projeto_id`, `pesquisa_id`)

---

## 🧊 NAVEGAÇÃO DO CUBO

### **EIXOS PRINCIPAIS:**

1. **Entidade** (cliente/lead/concorrente)
2. **Projeto** (contexto organizacional)
3. **Pesquisa** (contexto temporal/qualificação)
4. **Geografia** (localização)
5. **Mercado** (setor)
6. **Produto** (oferta)
7. **Status** (qualificação)

---

## 📊 EXEMPLOS DE QUERIES MULTIDIMENSIONAIS

### **1. Clientes Ativos por Projeto**

```sql
SELECT
  p.nome AS projeto,
  COUNT(*) AS total_clientes
FROM fato_entidade_contexto fec
JOIN dim_entidade e ON e.id = fec.entidade_id
JOIN dim_projeto p ON p.id = fec.projeto_id
JOIN dim_status_qualificacao sq ON sq.id = fec.status_qualificacao_id
WHERE e.tipo_entidade = 'cliente'
  AND sq.codigo = 'ativo'
GROUP BY p.nome;
```

### **2. Evolução de Qualidade ao Longo das Pesquisas**

```sql
SELECT
  e.nome AS cliente,
  ps.nome AS pesquisa,
  ps.completed_at AS data,
  fec.qualidade_score
FROM fato_entidade_contexto fec
JOIN dim_entidade e ON e.id = fec.entidade_id
JOIN dim_pesquisa ps ON ps.id = fec.pesquisa_id
WHERE e.id = 1 -- Cliente específico
ORDER BY ps.completed_at;
```

### **3. Mercados por Projeto e Pesquisa**

```sql
SELECT
  p.nome AS projeto,
  ps.nome AS pesquisa,
  m.nome AS mercado,
  COUNT(DISTINCT fec.entidade_id) AS total_entidades
FROM fato_entidade_contexto fec
JOIN dim_projeto p ON p.id = fec.projeto_id
JOIN dim_pesquisa ps ON ps.id = fec.pesquisa_id
JOIN dim_mercado m ON m.id = fec.mercado_id
GROUP BY p.nome, ps.nome, m.nome;
```

### **4. Produtos por Cliente em Múltiplos Projetos**

```sql
SELECT
  e.nome AS cliente,
  p.nome AS projeto,
  prod.nome AS produto,
  fep.tipo_relacao
FROM fato_entidade_produto fep
JOIN dim_entidade e ON e.id = fep.entidade_id
JOIN dim_projeto p ON p.id = fep.projeto_id
JOIN dim_produto prod ON prod.id = fep.produto_id
WHERE e.id = 1 -- Cliente específico
ORDER BY p.nome, fep.tipo_relacao;
```

### **5. Concorrentes por Mercado e Geografia**

```sql
SELECT
  m.nome AS mercado,
  g.cidade,
  g.uf,
  COUNT(DISTINCT fec.entidade_id) AS total_concorrentes,
  AVG(fec.qualidade_score) AS qualidade_media
FROM fato_entidade_contexto fec
JOIN dim_entidade e ON e.id = fec.entidade_id
JOIN dim_mercado m ON m.id = fec.mercado_id
JOIN dim_geografia g ON g.id = fec.geografia_id
WHERE e.tipo_entidade = 'concorrente'
  AND fec.projeto_id = 1
  AND fec.pesquisa_id = 1
GROUP BY m.nome, g.cidade, g.uf;
```

---

## 🔄 IMPACTO NO FLUXO DE IMPORTAÇÃO

### **ANTES (Modelo Antigo):**

```
Importar CSV → Inserir em `clientes` (com projeto_id fixo)
```

### **AGORA (Modelo Dimensional):**

```
1. Importar CSV
2. Criar/Buscar Entidade em `dim_entidade` (sem projeto/pesquisa)
3. Criar Projeto em `dim_projeto`
4. Criar Pesquisa "Importação Inicial" em `dim_pesquisa`
5. Inserir contexto em `fato_entidade_contexto` (entidade + projeto + pesquisa)
```

---

## 🔄 IMPACTO NO FLUXO DE ENRIQUECIMENTO

### **ANTES (Modelo Antigo):**

```
Enriquecer → Atualizar registro em `clientes`
```

### **AGORA (Modelo Dimensional):**

```
1. Criar nova Pesquisa "Enriquecimento Jan/2025" em `dim_pesquisa`
2. Para cada entidade:
   - Enriquecer dados
   - Inserir NOVO contexto em `fato_entidade_contexto` (mesma entidade, nova pesquisa)
   - Manter contexto anterior (histórico)
```

**Resultado:**

- ✅ Histórico completo de qualificações
- ✅ Comparação temporal (antes vs depois)
- ✅ Rollback possível (voltar para pesquisa anterior)

---

## 🔄 IMPACTO NO RELACIONAMENTO CLIENTE ↔ PROJETO

### **ANTES (Proposta Inicial):**

```
Tabela: cliente_projeto (N:N simples)
```

### **AGORA (Modelo Dimensional):**

```
Não precisa de tabela separada!
O relacionamento está em `fato_entidade_contexto`
```

**Exemplo:**

```sql
-- Buscar todos os projetos de um cliente
SELECT DISTINCT p.*
FROM fato_entidade_contexto fec
JOIN dim_projeto p ON p.id = fec.projeto_id
WHERE fec.entidade_id = 1;

-- Buscar todos os clientes de um projeto
SELECT DISTINCT e.*
FROM fato_entidade_contexto fec
JOIN dim_entidade e ON e.id = fec.entidade_id
WHERE fec.projeto_id = 1
  AND e.tipo_entidade = 'cliente';
```

---

## 📊 COMPARAÇÃO: MODELO ANTIGO vs DIMENSIONAL

| Aspecto                            | Modelo Antigo        | Modelo Dimensional                  |
| ---------------------------------- | -------------------- | ----------------------------------- |
| **Entidade em múltiplos projetos** | ❌ Duplica registro  | ✅ Um registro, múltiplos contextos |
| **Histórico de enriquecimento**    | ❌ Sobrescreve dados | ✅ Mantém histórico completo        |
| **Comparação temporal**            | ❌ Impossível        | ✅ Fácil (pesquisa 1 vs 2)          |
| **Rollback**                       | ❌ Impossível        | ✅ Voltar para pesquisa anterior    |
| **Mercado muda**                   | ❌ Perde histórico   | ✅ Mantém histórico                 |
| **Produto muda**                   | ❌ Perde histórico   | ✅ Mantém histórico                 |
| **Análise multidimensional**       | ❌ Difícil           | ✅ Nativa                           |
| **Drill-down**                     | ❌ Limitado          | ✅ Qualquer direção                 |

---

## 🎯 BENEFÍCIOS DO CUBO DIMENSIONAL

### **1. Flexibilidade Total**

- ✅ Cliente pode estar em N projetos
- ✅ Cliente pode ter N pesquisas (histórico)
- ✅ Mercado pode estar em N projetos
- ✅ Produto pode estar em N projetos

### **2. Histórico Completo**

- ✅ Toda mudança é registrada (nova pesquisa)
- ✅ Comparação temporal fácil
- ✅ Rollback possível
- ✅ Auditoria completa

### **3. Análise Multidimensional**

- ✅ Drill-down em qualquer direção
- ✅ Slice & Dice (fatiar dados)
- ✅ Pivot (trocar eixos)
- ✅ Agregações complexas

### **4. Performance**

- ✅ Índices otimizados por dimensão
- ✅ Queries pré-calculadas (materialized views)
- ✅ Cache por dimensão

### **5. Governança**

- ✅ Dados imutáveis (dimensões)
- ✅ Fatos rastreáveis
- ✅ Integridade referencial garantida

---

## ❓ PERGUNTAS PARA VOCÊ

### **1. Modelo Dimensional:**

- ✅ Você concorda com `fato_entidade_contexto` como fato central?
- ✅ Você concorda que Projeto e Pesquisa são dimensões?
- ❓ Precisa de mais dimensões? (ex: dim_tempo separada?)

### **2. Histórico:**

- ✅ Você quer manter histórico completo de pesquisas?
- ✅ Ou pode sobrescrever (sem histórico)?
- ❓ Quantas pesquisas por projeto (limite)?

### **3. Granularidade:**

- ✅ Você concorda que granularidade é: entidade + projeto + pesquisa?
- ❓ Ou precisa ser mais fino? (ex: entidade + projeto + pesquisa + data?)

### **4. Relacionamentos:**

- ✅ Você concorda que `cliente_projeto` não é mais necessário?
- ✅ Você concorda que relacionamento está em `fato_entidade_contexto`?

### **5. Performance:**

- ❓ Quantos projetos simultâneos você espera? (10? 100? 1000?)
- ❓ Quantas pesquisas por projeto? (5? 10? 50?)
- ❓ Quantas entidades por projeto? (100? 1000? 10000?)

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Validar modelo dimensional com você
2. ✅ Ajustar schema do banco (criar `fato_entidade_contexto`)
3. ✅ Refatorar fluxo de importação
4. ✅ Refatorar fluxo de enriquecimento
5. ✅ Criar queries de exemplo
6. ✅ Implementar

---

**Agora me diga:** Este modelo dimensional resolve o problema? Está alinhado com sua visão? 🧊
