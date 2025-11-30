# Auditoria Completa - Mapa e CleanEnrichment

## 1. AUDITORIA DO SCHEMA

### 1.1 Tabela: enrichment_jobs

```typescript
status: varchar({ length: 50 }).default('pending').notNull();
updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow();
```

**Análise:**

- `status` aceita strings até 50 caracteres ✅
- `updatedAt` usa `mode: 'string'` → DEVE receber string ISO, NÃO objeto Date ⚠️

### 1.2 Tabela: clientes

```typescript
updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow();
latitude: varchar({ length: 255 });
longitude: varchar({ length: 255 });
```

**Análise:**

- `updatedAt` usa `mode: 'string'` → DEVE receber string ISO ⚠️
- `latitude` e `longitude` são VARCHAR, não NUMERIC ⚠️

### 1.3 Tabela: pesquisas

```typescript
updatedAt: timestamp('updatedAt', { mode: 'string' }).defaultNow();
```

**Análise:**

- `updatedAt` usa `mode: 'string'` → DEVE receber string ISO ⚠️

---

## 2. AUDITORIA DAS APIs

### 2.1 API: pesquisas.cleanEnrichment

**Input:**

```typescript
{
  pesquisaId: number;
}
```

**Output Esperado:**

```typescript
{
  success: boolean;
  message: string;
  stats: {
    leadsRemoved: number;
    concorrentesRemoved: number;
    produtosRemoved: number;
    mercadosRemoved: number;
    clientesReset: number;
    jobsCancelled: number;
  }
}
```

**Problemas Identificados:**

1. ❌ Linha 646, 741, 753: Usa `new Date()` ao invés de `new Date().toISOString()`
2. ❌ Não há tratamento de erro adequado se `inArray` falhar
3. ❌ Transação não está sendo usada (pode deixar dados inconsistentes)

### 2.2 API: map.getMapData

**Input:**

```typescript
{
  projectId?: number | null;
  pesquisaId?: number | null;
  entityTypes?: ('clientes' | 'leads' | 'concorrentes')[];
  filters?: {
    uf?: string | null;
    cidade?: string | null;
    setor?: string | null;
    porte?: string | null;
    qualidade?: string | null;
  };
}
```

**Output Esperado:**

```typescript
Array<{
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  latitude: number;
  longitude: number;
  cidade: string;
  uf: string;
  [key: string]: unknown;
}>;
```

**Problemas Identificados:**

1. ❌ `latitude` e `longitude` são VARCHAR no banco, mas retornados como number
2. ❌ `parseFloat()` pode retornar NaN se o valor for inválido
3. ❌ Não há validação se `mapData` é realmente um array no frontend

---

## 3. ANÁLISE DOS ERROS

### 3.1 Erro: "Cannot convert undefined or null to object"

**Causa:** Frontend tenta acessar propriedades de um objeto que é `null` ou `undefined`
**Localização:** Provavelmente em `mapStats` ou `availableFilters`
**Solução:** Adicionar validação e fallbacks

### 3.2 Erro: "Não foi possível limpar os dados"

**Causa:** `updatedAt: new Date()` está enviando objeto Date ao invés de string ISO
**Localização:** Linhas 646, 741, 753 em `pesquisas.ts`
**Solução:** Usar `.toISOString()` em TODOS os lugares

### 3.3 Erro: "Failed query: update enrichment_jobs..."

**Causa:** Tipo de dado incompatível (Date object vs string)
**Solução:** Garantir que TODOS os timestamps usem `.toISOString()`

---

## 4. PLANO DE REFATORAÇÃO

### 4.1 Função cleanEnrichment

**Mudanças:**

1. ✅ Substituir TODOS `new Date()` por `new Date().toISOString()`
2. ✅ Adicionar transação para garantir consistência
3. ✅ Melhorar tratamento de erros
4. ✅ Adicionar logs detalhados

**Arquivos:**

- `server/routers/pesquisas.ts` (linhas 600-770)

### 4.2 Página do Mapa

**Mudanças:**

1. ✅ Validar que `mapData` é array antes de usar
2. ✅ Validar que `mapStats` não é null antes de passar para componentes
3. ✅ Adicionar tratamento de erro robusto
4. ✅ Garantir que `parseFloat` não retorna NaN

**Arquivos:**

- `app/(app)/map/page.tsx`
- `server/routers/map.ts`
- `components/map/MapContainer.tsx`

---

## 5. CHECKLIST DE IMPLEMENTAÇÃO

### cleanEnrichment:

- [ ] Verificar TODOS os `updatedAt` no arquivo
- [ ] Adicionar transação
- [ ] Melhorar logs
- [ ] Testar com dados reais

### Mapa:

- [ ] Validar `mapData` é array
- [ ] Validar `mapStats` não é null
- [ ] Validar coordenadas antes de `parseFloat`
- [ ] Adicionar fallbacks para todos os casos
- [ ] Testar com filtros diferentes

---

## 6. PRÓXIMOS PASSOS

1. Implementar correções no cleanEnrichment
2. Implementar correções no mapa
3. Testar localmente se possível
4. Deploy e validação final

---

## 7. ERROS ENCONTRADOS NA ANÁLISE DOS LOGS

### 7.1 Erro: "Failed query: delete from enrichment_runs where = $1"

**Causa:** Tentando usar `enrichmentRuns.pesquisaId` mas a tabela só tem `projectId`
**Localização:** Linha 666 em `pesquisas.ts`
**Solução:** ✅ Usar `enrichmentRuns.projectId` e `pesquisa.projectId`

### 7.2 Erro: "The 'string' argument must be of type string... Received an instance of Date"

**Causa:** Todos os timestamps no schema usam `mode: 'string'` mas o código passa `new Date()`
**Localizações encontradas:**

- ✅ `pesquisas.ts:646` - updatedAt em enrichmentJobs
- ✅ `pesquisas.ts:741` - updatedAt em clientes
- ✅ `pesquisas.ts:753` - updatedAt em pesquisas
- ✅ `geocodingRouter.ts:102` - startedAt em geocodingJobs
- ✅ `geocodingRouter.ts:316` - completedAt em geocodingJobs
  **Solução:** ✅ Usar `.toISOString()` em TODOS os lugares

### 7.3 Erro: "Cannot convert undefined or null to object" (Mapa)

**Causa:** Frontend tenta acessar propriedades de objetos que são `null` ou `undefined`
**Possíveis localizações:**

- `mapStats` pode ser undefined
- `availableFilters` pode ser undefined
- `entities` pode não ser array
  **Solução:** Adicionar validações e fallbacks robustos

---

## 8. CORREÇÕES APLICADAS

### ✅ cleanEnrichment:

1. Corrigido `enrichmentRuns.pesquisaId` → `enrichmentRuns.projectId`
2. Corrigido TODOS os `new Date()` → `new Date().toISOString()`
3. Adicionado try-catch para cancelamento de jobs
4. Verificação se há jobs antes de cancelar

### ⏳ Mapa (Pendente):

1. Validar que `mapData` é array
2. Validar que `mapStats` não é null
3. Validar coordenadas antes de `parseFloat`
4. Adicionar fallbacks para todos os casos

---

## 9. PRÓXIMA AÇÃO

Agora vou refatorar a página do mapa para ser mais robusta e evitar o erro "Cannot convert undefined or null to object".
