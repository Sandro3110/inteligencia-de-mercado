# 📦 Drill-Down para Produtos

**Adaptação da lógica de Setores para Produtos**  
**Data:** 01/12/2025

---

## 🎯 ESTRUTURA DE DRILL-DOWN PARA PRODUTOS

### **NÍVEL 1: CATEGORIAS DE PRODUTOS**

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 Análise de Produtos                                      │
│ Ranking por categorias de produtos                          │
├─────────────────────────────────────────────────────────────┤
│ [Filtros: Projeto | Pesquisa | Qualidade]   [Excel] [CSV]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Categoria          | Produtos | Clientes | Ações           │
│  ──────────────────────────────────────────────────────     │
│  📦 Embalagens      |    145   |   890    | [Ver Detalhes] ▶│
│  🔧 Componentes     |    98    |   654    | [Ver Detalhes] ▶│
│  🥄 Colchões        |    76    |   543    | [Ver Detalhes] ▶│
│  🏗️ Materiais       |    54    |   432    | [Ver Detalhes] ▶│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Características:**

- ✅ **Simples**: Apenas categorias de produtos
- ✅ **Rápido**: Query leve (GROUP BY categoria)
- ✅ **Informativo**: Quantidade de produtos + clientes
- ✅ **Acionável**: Botão para drill-down

**Query:**

```typescript
const categorias = await db
  .select({
    categoria: produtos.categoria,
    totalProdutos: sql<number>`COUNT(DISTINCT ${produtos.nome})::INTEGER`,
    totalClientes: sql<number>`COUNT(DISTINCT ${produtos.clienteId})::INTEGER`,
  })
  .from(produtos)
  .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
  .where(inArray(clientes.pesquisaId, pesquisaIds))
  .groupBy(produtos.categoria)
  .orderBy(desc(sql`COUNT(DISTINCT ${produtos.clienteId})`));
```

**Performance:** ~0.2s ⚡  
**Dados:** ~10-15 linhas (categorias)

---

### **NÍVEL 2: PRODUTOS DA CATEGORIA**

**Quando:** Usuário clica em "Ver Detalhes" de uma categoria

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar para Categorias                                    │
│                                                              │
│ 📦 Embalagens                                               │
│ Produtos mais vendidos desta categoria                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Produto                  | Clientes | Ações                │
│  ──────────────────────────────────────────────────────     │
│  Embalagens Plásticas     |    90    | [Ver Clientes] ▶    │
│  Colchão de Espuma        |    34    | [Ver Clientes] ▶    │
│  Colchão de Molas         |    27    | [Ver Clientes] ▶    │
│  Embalagem Plástica       |    26    | [Ver Clientes] ▶    │
│  Filmes Plásticos         |    24    | [Ver Clientes] ▶    │
│  Embalagens de Papelão    |    23    | [Ver Clientes] ▶    │
│  ...                                                         │
│                                                              │
│  [Carregar Mais]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Características:**

- ✅ **Contextual**: Apenas produtos da categoria selecionada
- ✅ **Ranking**: Ordenado por número de clientes
- ✅ **Simples**: Apenas 1 botão (Ver Clientes)
- ✅ **Paginado**: 50 produtos por vez

**Query:**

```typescript
const produtos = await db
  .select({
    nome: produtos.nome,
    clientes: sql<number>`COUNT(DISTINCT ${produtos.clienteId})::INTEGER`,
  })
  .from(produtos)
  .innerJoin(clientes, eq(produtos.clienteId, clientes.id))
  .where(and(eq(produtos.categoria, categoriaId), inArray(clientes.pesquisaId, pesquisaIds)))
  .groupBy(produtos.nome)
  .orderBy(desc(sql`COUNT(DISTINCT ${produtos.clienteId})`))
  .limit(50)
  .offset(page * 50);
```

**Performance:** ~0.3s ⚡  
**Dados:** 50 linhas por página

---

### **NÍVEL 3: CLIENTES DO PRODUTO**

**Quando:** Usuário clica em "Ver Clientes" de um produto

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar para Produtos                                      │
│                                                              │
│ 📦 Embalagens › Embalagens Plásticas › Clientes            │
│ 90 clientes encontrados                                     │
├─────────────────────────────────────────────────────────────┤
│ [Exportar Excel] [Exportar CSV]                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Cliente           | Setor      | Cidade      | UF | Ações  │
│  ────────────────────────────────────────────────────────   │
│  Empresa ABC       | Indústria  | São Paulo   | SP | [Ver]  │
│  Comércio XYZ      | Varejo     | Campinas    | SP | [Ver]  │
│  Indústria 123     | Metalurgia | Belo Horiz. | MG | [Ver]  │
│  ...                                                         │
│                                                              │
│  [Carregar Mais]                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Características:**

- ✅ **Específico**: Apenas clientes que compram este produto
- ✅ **Completo**: Nome, setor, localização
- ✅ **Exportável**: Excel/CSV
- ✅ **Navegável**: Breadcrumb completo
- ✅ **Paginado**: 50 clientes por vez

**Query:**

```typescript
const clientesDoProduto = await db
  .select({
    id: clientes.id,
    nome: clientes.nome,
    setor: clientes.setor,
    cidade: clientes.cidade,
    uf: clientes.uf,
    qualidade: clientes.qualidadeClassificacao,
  })
  .from(clientes)
  .innerJoin(produtos, eq(produtos.clienteId, clientes.id))
  .where(and(eq(produtos.nome, produtoNome), inArray(clientes.pesquisaId, pesquisaIds)))
  .orderBy(desc(clientes.qualidadeScore))
  .limit(50)
  .offset(page * 50);
```

**Performance:** ~0.2s ⚡  
**Dados:** 50 linhas por página

---

## 📊 COMPARAÇÃO: SETORES vs PRODUTOS

| Aspecto            | Setores                           | Produtos                |
| ------------------ | --------------------------------- | ----------------------- |
| **Nível 1**        | Categorias de Setores             | Categorias de Produtos  |
| **Nível 2**        | Setores (com 3 botões)            | Produtos (com 1 botão)  |
| **Nível 3**        | Clientes/Leads/Concorrentes       | Clientes do Produto     |
| **Botões Nível 2** | 3 (Clientes, Leads, Concorrentes) | 1 (Clientes)            |
| **Complexidade**   | Maior (3 tipos de dados)          | Menor (apenas clientes) |

---

## 🎯 DIFERENÇAS IMPORTANTES

### **1. PRODUTOS TEM APENAS CLIENTES**

**Motivo:**

- Produtos estão vinculados a clientes (tabela `produtos`)
- Não existem "produtos de leads" ou "produtos de concorrentes"
- Simplifica a navegação (apenas 1 botão no Nível 2)

### **2. RANKING POR CLIENTES**

**Motivo:**

- Métrica mais relevante: "Quantos clientes compram este produto?"
- Não faz sentido "score de oportunidade" para produtos
- Ordenação simples: mais clientes = mais importante

### **3. BREADCRUMB MAIS SIMPLES**

**Setores:**

```
🏭 Indústria › Metalurgia › Clientes
```

**Produtos:**

```
📦 Embalagens › Embalagens Plásticas › Clientes
```

---

## 🏗️ ARQUITETURA DE DADOS (PRODUTOS)

### **Nível 1: Categorias**

```typescript
// Query: GROUP BY categoria
SELECT
  categoria,
  COUNT(DISTINCT nome) as produtos,
  COUNT(DISTINCT clienteId) as clientes
FROM produtos
GROUP BY categoria
ORDER BY clientes DESC
```

**Performance:** 0.2s  
**Memória:** ~1KB

---

### **Nível 2: Produtos**

```typescript
// Query: GROUP BY nome + filtro categoria
SELECT
  nome,
  COUNT(DISTINCT clienteId) as clientes
FROM produtos
WHERE categoria = 'Embalagens'
GROUP BY nome
ORDER BY clientes DESC
LIMIT 50 OFFSET 0
```

**Performance:** 0.3s  
**Memória:** ~5KB

---

### **Nível 3: Clientes**

```typescript
// Query: JOIN clientes + filtro produto
SELECT
  c.id, c.nome, c.setor, c.cidade, c.uf
FROM clientes c
INNER JOIN produtos p ON p.clienteId = c.id
WHERE p.nome = 'Embalagens Plásticas'
ORDER BY c.qualidadeScore DESC
LIMIT 50 OFFSET 0
```

**Performance:** 0.2s  
**Memória:** ~5KB

---

## 📋 IMPLEMENTAÇÃO UNIFICADA

### **Componentes Reutilizáveis:**

```typescript
// Componente genérico de drill-down
<DrillDownTable
  level={1}
  title="Análise de Produtos"
  columns={['Categoria', 'Produtos', 'Clientes']}
  data={categorias}
  onDrillDown={(categoria) => navigateToLevel2(categoria)}
/>

<DrillDownTable
  level={2}
  title={`${categoria} › Produtos`}
  columns={['Produto', 'Clientes']}
  data={produtos}
  onDrillDown={(produto) => navigateToLevel3(produto)}
  onBack={() => navigateToLevel1()}
/>

<DrillDownTable
  level={3}
  title={`${categoria} › ${produto} › Clientes`}
  columns={['Cliente', 'Setor', 'Cidade', 'UF']}
  data={clientes}
  onBack={() => navigateToLevel2()}
  exportable={true}
/>
```

**Benefício:**

- ✅ Mesmo componente para Setores e Produtos
- ✅ Menos código para manter
- ✅ Comportamento consistente
- ✅ Fácil de testar

---

## 🎨 WIREFRAME COMPLETO (PRODUTOS)

### **Fluxo de Navegação:**

```
┌─────────────────────────────────────────────┐
│ NÍVEL 1: CATEGORIAS                         │
│                                              │
│ Categoria          | Produtos | Clientes    │
│ ───────────────────────────────────────     │
│ 📦 Embalagens      |   145    |   890       │
│    [Ver Detalhes] ────────────┐             │
└────────────────────────────────│────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────┐
│ NÍVEL 2: PRODUTOS                           │
│ ← Voltar                                    │
│                                              │
│ 📦 Embalagens › Produtos                    │
│                                              │
│ Produto                | Clientes           │
│ ──────────────────────────────────          │
│ Embalagens Plásticas   |   90              │
│    [Ver Clientes] ──────────────┐           │
└──────────────────────────────────│──────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────┐
│ NÍVEL 3: CLIENTES                           │
│ ← Voltar                                    │
│                                              │
│ 📦 Embalagens › Embalagens Plásticas ›     │
│    Clientes                                 │
│                                              │
│ Cliente      | Setor      | Cidade  | UF   │
│ ──────────────────────────────────────      │
│ Empresa ABC  | Indústria  | SP      | SP   │
│ Comércio XYZ | Varejo     | Campinas| SP   │
│                                              │
│ [Exportar Excel] [Exportar CSV]             │
└─────────────────────────────────────────────┘
```

---

## 🚀 BENEFÍCIOS ESPECÍFICOS PARA PRODUTOS

1. ✅ **Mais simples que Setores** (apenas 1 botão no Nível 2)
2. ✅ **Ranking claro** (produtos mais vendidos)
3. ✅ **Análise de portfólio** (quais produtos têm mais clientes)
4. ✅ **Cross-sell** (ver quais clientes compram produto X)
5. ✅ **Segmentação** (clientes por produto)

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Sprint 1: Produtos Nível 1** - 2h

- [ ] Criar query de categorias de produtos
- [ ] Criar componente `ProductCategoriesView`
- [ ] Adicionar botão "Ver Detalhes"
- [ ] Testar performance

### **Sprint 2: Produtos Nível 2** - 2h

- [ ] Criar query de produtos por categoria
- [ ] Criar componente `ProductsView`
- [ ] Adicionar botão "Ver Clientes"
- [ ] Implementar navegação (voltar)
- [ ] Adicionar paginação

### **Sprint 3: Produtos Nível 3** - 2h

- [ ] Criar query de clientes por produto
- [ ] Criar componente `ProductClientsView`
- [ ] Adicionar exportação (Excel/CSV)
- [ ] Implementar breadcrumb
- [ ] Adicionar paginação

**Tempo Total:** 6 horas  
**Impacto:** ALTO  
**Risco:** BAIXO (mais simples que Setores)

---

## 🎯 RESUMO FINAL

### **Produtos é MAIS SIMPLES que Setores:**

| Aspecto                    | Setores                           | Produtos     |
| -------------------------- | --------------------------------- | ------------ |
| **Níveis**                 | 3                                 | 3            |
| **Botões Nível 2**         | 3                                 | 1            |
| **Tipos de Dados**         | 3 (Clientes, Leads, Concorrentes) | 1 (Clientes) |
| **Complexidade**           | Alta                              | Baixa        |
| **Tempo de Implementação** | 10-14h                            | 6h           |

### **Recomendação:**

✅ **Implementar Produtos PRIMEIRO** (mais simples, 6h)  
✅ **Depois implementar Setores** (mais complexo, 10-14h)

**Benefício:**

- Validar conceito de drill-down no mais simples
- Aprender com Produtos antes de fazer Setores
- Entregar valor mais rápido (6h vs 10-14h)

---

**Posso começar a implementação de Produtos agora?**
