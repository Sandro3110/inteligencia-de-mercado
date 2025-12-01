# 🔍 Análise de Índices - Drill-Down Setores e Produtos

## ❌ PROBLEMA CRÍTICO IDENTIFICADO

### Índices Existentes no Schema

**Tabela `clientes`:**

- ✅ `idx_clientes_projectId` (projectId)
- ✅ `unique_cliente_hash` (clienteHash)
- ❌ **FALTA:** índice em `pesquisaId`
- ❌ **FALTA:** índice em `cnae`
- ❌ **FALTA:** índice em `produto` (campo TEXT usado em drill-down)

**Tabela `leads`:**

- ✅ `idx_leads_projectId` (projectId)
- ✅ `unique_lead_hash` (leadHash)
- ✅ `idx_lead_hash` (leadHash)
- ❌ **FALTA:** índice em `pesquisaId`
- ❌ **FALTA:** índice em `setor`

**Tabela `concorrentes`:**

- ✅ `idx_concorrentes_projectId` (projectId)
- ✅ `unique_concorrente_hash` (concorrenteHash)
- ✅ `idx_concorrente_hash` (concorrenteHash)
- ❌ **FALTA:** índice em `pesquisaId`
- ❌ **FALTA:** índice em `setor`
- ❌ **FALTA:** índice em `produto` (campo TEXT usado em drill-down)

---

## 🔥 Queries Problemáticas

### Sector Drill-Down (sector-drill-down.ts)

```typescript
// getCategories - Clientes
db.select({ id: clientes.id })
  .from(clientes)
  .where(
    and(
      inArray(clientes.pesquisaId, pesquisaIds), // ❌ SEM ÍNDICE
      ne(clientes.cnae, null) // ❌ SEM ÍNDICE
    )
  );

// getCategories - Leads
db.select({ id: leads.id })
  .from(leads)
  .where(
    and(
      inArray(leads.pesquisaId, pesquisaIds), // ❌ SEM ÍNDICE
      ne(leads.setor, null) // ❌ SEM ÍNDICE
    )
  );

// getCategories - Concorrentes
db.select({ id: concorrentes.id })
  .from(concorrentes)
  .where(
    and(
      inArray(concorrentes.pesquisaId, pesquisaIds), // ❌ SEM ÍNDICE
      ne(concorrentes.setor, null) // ❌ SEM ÍNDICE
    )
  );
```

### Product Drill-Down (product-drill-down.ts)

```typescript
// getCategories - Clientes
db.select({ id: clientes.id })
  .from(clientes)
  .where(
    and(
      inArray(clientes.pesquisaId, pesquisaIds), // ❌ SEM ÍNDICE
      ne(clientes.produto, null) // ❌ SEM ÍNDICE (TEXT!)
    )
  );

// getCategories - Concorrentes
db.select({ id: concorrentes.id })
  .from(concorrentes)
  .where(
    and(
      inArray(concorrentes.pesquisaId, pesquisaIds), // ❌ SEM ÍNDICE
      ne(concorrentes.produto, null) // ❌ SEM ÍNDICE (TEXT!)
    )
  );
```

---

## ⚠️ Impacto no Desempenho

**Sem índices em `pesquisaId`:**

- PostgreSQL faz **FULL TABLE SCAN** em todas as tabelas
- Com milhares de registros, isso causa **timeout ou erro 500**

**Sem índices em campos TEXT (`produto`):**

- Campos TEXT sem índice são **extremamente lentos** para filtrar
- `ne(campo_text, null)` força scan completo da tabela

**Resultado:**

- Queries demoram muito (>30s)
- Vercel timeout (10s para serverless)
- **Erro 500** retornado ao cliente

---

## ✅ Solução: Adicionar Índices Críticos

### Índices Necessários

```sql
-- Clientes
CREATE INDEX idx_clientes_pesquisaId ON clientes(pesquisaId);
CREATE INDEX idx_clientes_cnae ON clientes(cnae);
CREATE INDEX idx_clientes_produto ON clientes USING gin(to_tsvector('portuguese', produto));

-- Leads
CREATE INDEX idx_leads_pesquisaId ON leads(pesquisaId);
CREATE INDEX idx_leads_setor ON leads(setor);

-- Concorrentes
CREATE INDEX idx_concorrentes_pesquisaId ON concorrentes(pesquisaId);
CREATE INDEX idx_concorrentes_setor ON concorrentes(setor);
CREATE INDEX idx_concorrentes_produto ON concorrentes USING gin(to_tsvector('portuguese', produto));
```

**Nota:** Para campos TEXT, usar **GIN index com full-text search** é mais eficiente que índice B-tree padrão.

---

## 📊 Melhoria Esperada

**Antes (sem índices):**

- Query: 30-60s (timeout)
- Resultado: Erro 500

**Depois (com índices):**

- Query: <100ms
- Resultado: Dados retornados corretamente

---

## 🎯 Próximos Passos

1. ✅ Identificar índices faltantes (FEITO)
2. ⏳ Adicionar índices ao schema.ts
3. ⏳ Gerar migration com drizzle-kit
4. ⏳ Aplicar migration no banco Supabase
5. ⏳ Testar drill-down em produção
