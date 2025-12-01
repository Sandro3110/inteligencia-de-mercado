# ✅ FASE 1: Análise de Schema - CONCLUÍDA

**Data:** 01/12/2025  
**Status:** ✅ Validado

---

## 📊 Schema da Tabela `pesquisas`

| Campo                     | Tipo        | Nullable | Default      |
| ------------------------- | ----------- | -------- | ------------ |
| id                        | integer     | NO       | nextval(...) |
| projectId                 | integer     | NO       | -            |
| nome                      | varchar     | NO       | -            |
| descricao                 | text        | YES      | -            |
| dataImportacao            | timestamp   | YES      | now()        |
| **totalClientes**         | **integer** | YES      | 0            |
| **clientesEnriquecidos**  | **integer** | YES      | 0            |
| **status**                | **varchar** | YES      | 'importado'  |
| ativo                     | integer     | NO       | 1            |
| createdAt                 | timestamp   | YES      | now()        |
| updatedAt                 | timestamp   | YES      | now()        |
| qtdConcorrentesPorMercado | integer     | YES      | 5            |
| qtdLeadsPorMercado        | integer     | YES      | 10           |
| qtdProdutosPorCliente     | integer     | YES      | 3            |

**Campos críticos para SP:**

- `id`, `projectId`, `nome`, `descricao`, `status`
- `totalClientes`, `clientesEnriquecidos`

---

## 📊 Schema das Tabelas Relacionadas

### clientes

- `id` (integer)
- `pesquisaId` (integer) ← FK
- `qualidadeScore` (integer)
- `enriquecido` (boolean) - **NOTA: não retornado, verificar**
- `latitude`, `longitude` (numeric)

### leads

- `id` (integer)
- `pesquisaId` (integer) ← FK
- `qualidadeScore` (integer)
- `latitude`, `longitude` (numeric)

### concorrentes

- `id` (integer)
- `pesquisaId` (integer) ← FK
- `qualidadeScore` (integer)
- `latitude`, `longitude` (numeric)

### mercados_unicos

- `id` (integer)
- `pesquisaId` (integer) ← FK

### produtos

- `id` (integer)
- `pesquisaId` (integer) ← FK

---

## 🔍 Queries Mapeadas em `pesquisas.getByIdWithCounts`

**Localização:** `server/routers/pesquisas.ts` linhas 100-130

### Query 1: Estatísticas de Clientes

```typescript
db.select({
  total: count(),
  enriquecidos: sql`COUNT(CASE WHEN ${clientes.enriquecido} = true THEN 1 END)::int`,
})
  .from(clientes)
  .where(eq(clientes.pesquisaId, id));
```

**Retorna:** `{ total: number, enriquecidos: number }`

### Query 2: Contagem de Leads

```typescript
db.select({ count: count() }).from(leads).where(eq(leads.pesquisaId, id));
```

**Retorna:** `{ count: number }`

### Query 3: Contagem de Mercados

```typescript
db.select({ count: count() }).from(mercadosUnicos).where(eq(mercadosUnicos.pesquisaId, id));
```

**Retorna:** `{ count: number }`

### Query 4: Contagem de Produtos

```typescript
db.select({ count: count() }).from(produtos).where(eq(produtos.pesquisaId, id));
```

**Retorna:** `{ count: number }`

### Query 5: Contagem de Concorrentes

```typescript
db.select({ count: count() }).from(concorrentes).where(eq(concorrentes.pesquisaId, id));
```

**Retorna:** `{ count: number }`

### Query 6: Qualidade Média de Clientes

```typescript
db.select({ avg: avg(clientes.qualidadeScore) })
  .from(clientes)
  .where(and(eq(clientes.pesquisaId, id), sql`${clientes.qualidadeScore} IS NOT NULL`));
```

**Retorna:** `{ avg: number | null }`

### Query 7: Qualidade Média de Leads

```typescript
db.select({ avg: avg(leads.qualidadeScore) })
  .from(leads)
  .where(and(eq(leads.pesquisaId, id), sql`${leads.qualidadeScore} IS NOT NULL`));
```

**Retorna:** `{ avg: number | null }`

### Query 8: Qualidade Média de Concorrentes

```typescript
db.select({ avg: avg(concorrentes.qualidadeScore) })
  .from(concorrentes)
  .where(and(eq(concorrentes.pesquisaId, id), sql`${concorrentes.qualidadeScore} IS NOT NULL`));
```

**Retorna:** `{ avg: number | null }`

### Query 9: Total de Enriquecimento Geográfico

```typescript
db.select({
  clientes: sql`COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::int`,
  leads: sql`COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::int`,
  concorrentes: sql`COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::int`
})
.from(clientes)
.leftJoin(leads, ...)
.leftJoin(concorrentes, ...)
```

**Retorna:** `{ clientes: number, leads: number, concorrentes: number }`

---

## 📋 Formato de Retorno Esperado pelo Frontend

```typescript
{
  id: number,
  projectId: number,
  nome: string,
  descricao: string | null,
  status: string,
  totalClientes: number,
  clientesEnriquecidos: number,
  leadsCount: number,
  mercadosCount: number,
  produtosCount: number,
  concorrentesCount: number,
  clientesQualidadeMedia: number,  // Math.round(avg)
  leadsQualidadeMedia: number,     // Math.round(avg)
  concorrentesQualidadeMedia: number, // Math.round(avg)
  geoTotal: number  // clientes + leads + concorrentes com lat/lng
}
```

---

## 🎯 Índices Existentes Relevantes

✅ `idx_dashboard_leads_pesquisa` ON leads(pesquisaId)  
✅ `idx_dashboard_mercados_pesquisa` ON mercados_unicos(pesquisaId)  
✅ `idx_dashboard_concorrentes_pesquisa` ON concorrentes(pesquisaId)  
✅ `idx_dashboard_produtos_pesquisa` ON produtos(pesquisaId)  
✅ `idx_dashboard_clientes_geo` ON clientes(pesquisaId, latitude, longitude) WHERE ...  
✅ `idx_dashboard_leads_geo` ON leads(pesquisaId, latitude, longitude) WHERE ...  
✅ `idx_dashboard_concorrentes_geo` ON concorrentes(pesquisaId, latitude, longitude) WHERE ...

**Conclusão:** Índices já existem, SP pode usar eficientemente.

---

## ✅ Validação da Fase 1

- ✅ Schema documentado
- ✅ Queries mapeadas (9 queries identificadas)
- ✅ Formato de retorno definido
- ✅ Índices verificados
- ✅ Tipos de dados confirmados

**Status:** Pronto para FASE 2 (Criar SP)

---

**Tempo:** 15 minutos  
**Próxima Fase:** FASE 2 - Criar SP `get_pesquisa_details`
