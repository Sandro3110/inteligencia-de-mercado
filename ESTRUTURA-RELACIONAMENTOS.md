# 🎯 Estrutura de Relacionamentos - Descoberta Crítica

## 📊 Tabelas e Dados Disponíveis (pesquisaId = 1)

| Tabela                | Total | Pesquisa 1 | Descrição                                |
| --------------------- | ----- | ---------- | ---------------------------------------- |
| **clientes**          | 807   | 807        | Tabela principal de clientes             |
| **clientes_mercados** | 908   | 908        | **Relacionamento N:N** cliente ↔ mercado |
| **mercados_unicos**   | 900   | 900        | **Tabela de setores/mercados**           |
| **produtos**          | 2.726 | 2.726      | **Tabela de produtos** (com categoria)   |
| **leads**             | 5.455 | 5.455      | Tabela de leads                          |
| **concorrentes**      | 9.079 | 9.079      | Tabela de concorrentes                   |

---

## 🔗 Relacionamentos Descobertos

### 1. **Setor x Cliente** (via mercados_unicos)

```
clientes (807)
    ↓ (clienteId)
clientes_mercados (908)  ← Tabela de junção
    ↓ (mercadoId)
mercados_unicos (900)    ← Contém: nome, categoria, segmentacao
```

**Campos importantes em mercados_unicos:**

- `nome`: "Construção Civil", "Indústria de Alimentos", etc.
- `categoria`: "B2B", "Alimentos e Bebidas", "Indústria", "Saúde", etc.
- `segmentacao`: Descrição do setor

**Dados reais:**

- ✅ **557 clientes** vinculados a mercados via JOIN
- ✅ Mercados mais comuns: Construção Civil (4), Indústria de Alimentos (3), Indústria de Plásticos (2)

---

### 2. **Produto x Cliente** (via produtos)

```
clientes (807)
    ↓ (clienteId)
produtos (2.726)  ← Contém: nome, categoria, descricao
```

**Campos importantes em produtos:**

- `nome`: Nome do produto
- `categoria`: "Embalagens", "Alimentos", "Colchões", "Componentes", etc.
- `descricao`: Descrição do produto
- `clienteId`: FK para clientes
- `mercadoId`: FK para mercados_unicos

**Dados reais:**

- ✅ **151 clientes** com produtos categoria "Embalagens"
- ✅ **47 clientes** com produtos categoria "Alimentos"
- ✅ **42 clientes** com produtos categoria "Colchões"
- ✅ Top 10 categorias de produtos disponíveis

---

## ✅ Queries Corretas com JOIN

### Query 1: Setor x Cliente (via mercados_unicos.categoria)

```sql
SELECT
  m.categoria as setor,
  COUNT(DISTINCT c.id) as total_clientes
FROM clientes c
INNER JOIN clientes_mercados cm ON c.id = cm."clienteId"
INNER JOIN mercados_unicos m ON cm."mercadoId" = m.id
WHERE c."pesquisaId" = 1
  AND m.categoria IS NOT NULL
GROUP BY m.categoria
ORDER BY total_clientes DESC;
```

**Resultado:**

- B2B: 557 clientes ✅

---

### Query 2: Mercado x Cliente (via mercados_unicos.nome)

```sql
SELECT
  m.nome as mercado,
  m.categoria,
  COUNT(DISTINCT c.id) as total_clientes
FROM clientes c
INNER JOIN clientes_mercados cm ON c.id = cm."clienteId"
INNER JOIN mercados_unicos m ON cm."mercadoId" = m.id
WHERE c."pesquisaId" = 1
GROUP BY m.id, m.nome, m.categoria
ORDER BY total_clientes DESC
LIMIT 15;
```

**Resultado:**

- Construção Civil: 4 clientes
- Indústria de Alimentos: 3 clientes
- Indústria de Plásticos: 2 clientes
- etc.

---

### Query 3: Produto x Cliente (via produtos.categoria)

```sql
SELECT
  p.categoria as categoria_produto,
  COUNT(DISTINCT c.id) as total_clientes
FROM clientes c
INNER JOIN produtos p ON c.id = p."clienteId"
WHERE c."pesquisaId" = 1
  AND p.categoria IS NOT NULL
GROUP BY p.categoria
ORDER BY total_clientes DESC;
```

**Resultado:**

- Embalagens: 151 clientes ✅
- Alimentos: 47 clientes ✅
- Colchões: 42 clientes ✅
- Componentes: 40 clientes ✅
- Bebidas: 36 clientes ✅

---

## 🎯 Estratégia para Drill-Down

### Opção 1: Drill-Down por Mercado (Setor)

**Hierarquia:**

```
Categorias de Mercado (ex: "B2B", "Alimentos e Bebidas", "Indústria")
  └─ Mercados (ex: "Construção Civil", "Indústria de Alimentos")
      └─ Clientes (via clientes_mercados JOIN)
```

**Vantagem:**

- ✅ 557 clientes disponíveis
- ✅ Dados estruturados em mercados_unicos
- ✅ Relacionamento N:N bem definido

---

### Opção 2: Drill-Down por Produto

**Hierarquia:**

```
Categorias de Produto (ex: "Embalagens", "Alimentos", "Colchões")
  └─ Produtos (ex: "Embalagem Plástica", "Alimento X")
      └─ Clientes (via produtos.clienteId)
```

**Vantagem:**

- ✅ 2.726 produtos disponíveis
- ✅ Dados bem distribuídos (151 + 47 + 42 + ...)
- ✅ Relacionamento direto com clientes

---

## 🚀 Próximos Passos

1. ✅ Estrutura mapeada
2. ✅ Queries testadas e funcionando
3. ⏳ Refatorar `sector-drill-down.ts` para usar JOINs corretos
4. ⏳ Refatorar `product-drill-down.ts` para usar JOINs corretos
5. ⏳ Testar em produção
