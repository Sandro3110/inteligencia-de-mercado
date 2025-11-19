# Auditoria de Dados - Gestor PAV

## Resumo Executivo

Auditoria realizada para comparar os dados reais no banco de dados com os valores exibidos no dashboard da aplicação.

---

## Dados Reais no Banco de Dados

| Entidade | Contagem Real |
|----------|---------------|
| **Mercados** | **1.336** |
| **Clientes** | **1.327** |
| **Concorrentes** | **10.352** |
| **Leads** | **10.330** |

---

## Valores Exibidos no Dashboard

| Entidade | Valor Exibido | Fonte |
|----------|---------------|-------|
| **Mercados** | **Dinâmico** | `mercados?.length` (correto) |
| **Clientes** | **Dinâmico** | `mercados?.reduce(quantidadeClientes)` (correto) |
| **Concorrentes** | **591** | Hardcoded (INCORRETO) |
| **Leads** | **727** | Hardcoded (INCORRETO) |

---

## Diferenças Identificadas

### ✅ Corretos
- **Mercados**: Valor dinâmico baseado na query real
- **Clientes**: Valor dinâmico calculado a partir dos mercados

### ❌ Incorretos (Valores Hardcoded)

#### Concorrentes
- **Valor Real**: 10.352
- **Valor Exibido**: 591
- **Diferença**: -9.761 (17,5x menor que o real)
- **Localização**: `CascadeView.tsx:260`

#### Leads
- **Valor Real**: 10.330
- **Valor Exibido**: 727
- **Diferença**: -9.603 (14,2x menor que o real)
- **Localização**: `CascadeView.tsx:261`

---

## Recomendações

### Prioridade Alta
1. **Substituir valores hardcoded** por queries dinâmicas no backend
2. **Criar endpoints tRPC** para `getTotalConcorrentes()` e `getTotalLeads()`
3. **Atualizar CascadeView** para consumir os valores reais

### Implementação Sugerida

```typescript
// server/db.ts
export async function getTotalConcorrentes(projectId?: number) {
  const db = await getDb();
  if (!db) return 0;
  
  let query = db.select({ count: sql<number>`count(*)` }).from(concorrentes);
  if (projectId) {
    query = query.where(eq(concorrentes.projectId, projectId));
  }
  
  const result = await query;
  return result[0]?.count || 0;
}

export async function getTotalLeads(projectId?: number) {
  const db = await getDb();
  if (!db) return 0;
  
  let query = db.select({ count: sql<number>`count(*)` }).from(leads);
  if (projectId) {
    query = query.where(eq(leads.projectId, projectId));
  }
  
  const result = await query;
  return result[0]?.count || 0;
}
```

```typescript
// server/routers.ts
stats: router({
  totals: publicProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ input }) => ({
      mercados: await getTotalMercados(input.projectId),
      clientes: await getTotalClientes(input.projectId),
      concorrentes: await getTotalConcorrentes(input.projectId),
      leads: await getTotalLeads(input.projectId),
    })),
}),
```

```typescript
// client/src/pages/CascadeView.tsx
const { data: totals } = trpc.stats.totals.useQuery({ projectId: selectedProjectId });

const totalConcorrentes = totals?.concorrentes || 0;
const totalLeads = totals?.leads || 0;
```

---

## Impacto

### Usuário
- **Visualização incorreta** dos dados reais de concorrentes e leads
- **Decisões baseadas em dados desatualizados** (valores 14-17x menores)
- **Perda de confiança** na precisão do sistema

### Sistema
- **Inconsistência** entre banco de dados e interface
- **Manutenção manual** necessária para atualizar valores hardcoded

---

## Próximos Passos

1. Implementar queries dinâmicas para concorrentes e leads
2. Criar testes unitários para garantir precisão dos totais
3. Adicionar cache para otimizar performance das contagens
4. Documentar fonte de dados de cada métrica no dashboard
