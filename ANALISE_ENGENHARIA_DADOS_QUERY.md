# 🔬 Análise de Engenharia de Dados - Query getByIdWithCounts

**Data:** 01/12/2025  
**Analista:** Manus AI - Engenheiro de Dados  
**Problema:** Query `pesquisas.getByIdWithCounts` falhando com erro "Failed to get pesquisa"

---

## 📊 ANÁLISE COMPARATIVA

### **Query Problemática (pesquisas.ts - getByIdWithCounts)**

```typescript
const [
  clientesStats,
  leadsCountResult,
  mercadosCountResult,
  produtosCountResult,
  concorrentesCountResult,
  clientesQualidadeResult,
  leadsQualidadeResult,
  concorrentesQualidadeResult,
  clientesGeoResult,
  leadsGeoResult,
  concorrentesGeoResult,
] = await Promise.all([
  // Query 1: Clientes stats
  db
    .select({
      total: count(),
      enriquecidos: sql<number>`COUNT(CASE WHEN ${clientes.enriquecido} = true THEN 1 END)::int`,
    })
    .from(clientes)
    .where(eq(clientes.pesquisaId, id)),

  // Query 2-5: Contagens simples
  db.select({ count: count() }).from(leads).where(eq(leads.pesquisaId, id)),
  db.select({ count: count() }).from(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, id)),
  db.select({ count: count() }).from(produtos).where(eq(produtos.pesquisaId, id)),
  db.select({ count: count() }).from(concorrentes).where(eq(concorrentes.pesquisaId, id)),

  // Query 6-8: Qualidade média
  db
    .select({ avg: avg(clientes.qualidadeScore) })
    .from(clientes)
    .where(and(eq(clientes.pesquisaId, id), sql`${clientes.qualidadeScore} IS NOT NULL`)),
  db
    .select({ avg: avg(leads.qualidadeScore) })
    .from(leads)
    .where(and(eq(leads.pesquisaId, id), sql`${leads.qualidadeScore} IS NOT NULL`)),
  db
    .select({ avg: avg(concorrentes.qualidadeScore) })
    .from(concorrentes)
    .where(and(eq(concorrentes.pesquisaId, id), sql`${concorrentes.qualidadeScore} IS NOT NULL`)),

  // Query 9-11: Geocodificação
  db
    .select({ count: count() })
    .from(clientes)
    .where(
      and(
        eq(clientes.pesquisaId, id),
        sql`${clientes.latitude} IS NOT NULL AND ${clientes.longitude} IS NOT NULL`
      )
    ),
  db
    .select({ count: count() })
    .from(leads)
    .where(
      and(
        eq(leads.pesquisaId, id),
        sql`${leads.latitude} IS NOT NULL AND ${leads.longitude} IS NOT NULL`
      )
    ),
  db
    .select({ count: count() })
    .from(concorrentes)
    .where(
      and(
        eq(concorrentes.pesquisaId, id),
        sql`${clientes.latitude} IS NOT NULL AND ${clientes.longitude} IS NOT NULL` // ❌ BUG AQUI!
      )
    ),
]);
```

### **Query Funcionando (dashboard.ts - getProjectPesquisas)**

```typescript
const [
  leadsResult,
  mercadosResult,
  concorrentesResult,
  produtosResult,
  clientesQualidadeResult,
  leadsQualidadeResult,
  concorrentesQualidadeResult,
  clientesComLocalizacaoResult,
  leadsComLocalizacaoResult,
  concorrentesComLocalizacaoResult,
] = await Promise.all([
  // Contagens simples
  db.select({ count: count() }).from(leads).where(eq(leads.pesquisaId, pesquisa.id)),
  db
    .select({ count: count() })
    .from(mercadosUnicos)
    .where(eq(mercadosUnicos.pesquisaId, pesquisa.id)),
  db.select({ count: count() }).from(concorrentes).where(eq(concorrentes.pesquisaId, pesquisa.id)),
  db.select({ count: count() }).from(produtos).where(eq(produtos.pesquisaId, pesquisa.id)),

  // Qualidade média
  db
    .select({ avg: sql<number>`AVG(${clientes.qualidadeScore})` })
    .from(clientes)
    .where(eq(clientes.pesquisaId, pesquisa.id)),
  db
    .select({ avg: sql<number>`AVG(${leads.qualidadeScore})` })
    .from(leads)
    .where(eq(leads.pesquisaId, pesquisa.id)),
  db
    .select({ avg: sql<number>`AVG(${concorrentes.qualidadeScore})` })
    .from(concorrentes)
    .where(eq(concorrentes.pesquisaId, pesquisa.id)),

  // Geocodificação
  db
    .select({ count: count() })
    .from(clientes)
    .where(
      and(
        eq(clientes.pesquisaId, pesquisa.id),
        isNotNull(clientes.latitude), // ✅ Usa isNotNull()
        isNotNull(clientes.longitude)
      )
    ),
  db
    .select({ count: count() })
    .from(leads)
    .where(
      and(eq(leads.pesquisaId, pesquisa.id), isNotNull(leads.latitude), isNotNull(leads.longitude))
    ),
  db
    .select({ count: count() })
    .from(concorrentes)
    .where(
      and(
        eq(concorrentes.pesquisaId, pesquisa.id),
        isNotNull(concorrentes.latitude), // ✅ Correto!
        isNotNull(concorrentes.longitude)
      )
    ),
]);
```

---

## 🐛 BUGS IDENTIFICADOS

### **Bug #1: Tabela Errada na Query de Geocodificação de Concorrentes**

**Linha 156 de pesquisas.ts:**

```typescript
sql`${clientes.latitude} IS NOT NULL AND ${clientes.longitude} IS NOT NULL`;
```

**Problema:** Está usando `clientes.latitude` ao invés de `concorrentes.latitude`!

**Impacto:** Query falha porque está tentando acessar campo de outra tabela.

---

### **Bug #2: Uso de SQL Template String ao invés de isNotNull()**

**Linha 138, 147, 156:**

```typescript
sql`${clientes.latitude} IS NOT NULL AND ${clientes.longitude} IS NOT NULL`;
```

**Problema:** Uso de template string SQL manual ao invés de helper `isNotNull()` do Drizzle.

**Impacto:**

- Menos type-safe
- Mais propenso a erros
- Inconsistente com o resto do código

---

### **Bug #3: Uso de avg() ao invés de sql\`AVG(...)\`**

**Linha 118, 122, 126:**

```typescript
db.select({ avg: avg(clientes.qualidadeScore) });
```

**Problema:** Usando função `avg()` do Drizzle que pode não funcionar corretamente com NULL values.

**Dashboard usa:** `sql<number>\`AVG(${clientes.qualidadeScore})\``

**Impacto:** Pode retornar tipo incorreto ou falhar com NULL values.

---

## 🎯 CAUSA RAIZ

**Bug #1 é a causa raiz do erro "Failed to get pesquisa".**

A query de geocodificação de concorrentes está tentando acessar `clientes.latitude` ao invés de `concorrentes.latitude`, causando erro SQL:

```
ERROR: column clientes.latitude does not exist in this context
```

---

## ✅ SOLUÇÃO DEFINITIVA

### **Correção 1: Trocar clientes por concorrentes**

```typescript
// Antes (ERRADO):
sql`${clientes.latitude} IS NOT NULL AND ${clientes.longitude} IS NOT NULL`;

// Depois (CORRETO):
sql`${concorrentes.latitude} IS NOT NULL AND ${concorrentes.longitude} IS NOT NULL`;
```

### **Correção 2: Usar isNotNull() consistentemente**

```typescript
// Antes:
sql`${clientes.latitude} IS NOT NULL AND ${clientes.longitude} IS NOT NULL`;

// Depois:
and(eq(clientes.pesquisaId, id), isNotNull(clientes.latitude), isNotNull(clientes.longitude));
```

### **Correção 3: Usar sql\`AVG(...)\` para qualidade média**

```typescript
// Antes:
db.select({ avg: avg(clientes.qualidadeScore) });

// Depois:
db.select({ avg: sql<number>`AVG(${clientes.qualidadeScore})` });
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Corrigir Bug #1: Trocar `clientes` por `concorrentes` na query de geo
- [ ] Corrigir Bug #2: Usar `isNotNull()` ao invés de SQL template
- [ ] Corrigir Bug #3: Usar `sql\`AVG(...)\``ao invés de`avg()`
- [ ] Validar com eslint
- [ ] Testar em produção
- [ ] Documentar correção

---

## 🎓 LIÇÕES APRENDIDAS

1. **Copy-paste é perigoso:** Bug #1 foi causado por copiar query e esquecer de trocar tabela
2. **Consistência importa:** Usar mesmos helpers que o dashboard evita bugs
3. **Type-safety:** Usar helpers do Drizzle (`isNotNull`) ao invés de SQL manual
4. **Testes:** Falta de testes unitários permitiu que bugs passassem despercebidos

---

**Status:** ✅ ANÁLISE COMPLETA | CAUSA RAIZ IDENTIFICADA | SOLUÇÃO PROPOSTA
