# 🔍 ANÁLISE PROFUNDA: TODOS OS PROBLEMAS IDENTIFICADOS

## 📊 EVIDÊNCIAS ANALISADAS

### **Screenshots:**

1. `/sectors` - "Nenhuma categoria de setor encontrada"
2. `/products` - "Nenhuma categoria de produto encontrada"
3. Filtros selecionados: TechFilms + Base Inicial

### **Logs Analisados:**

- `pasted_content_6.txt` - 82 linhas de erros
- `pasted_content_7.txt` - 117 linhas de erros
- `logs_result(14).json` - Logs JSON do Vercel

---

## 🚨 **PROBLEMAS IDENTIFICADOS (TODOS)**

### **PROBLEMA 1: Router `unifiedMap` NÃO EXISTE** ❌❌❌

**Evidência (linhas 2, 5, 20, 31, 36, 42, 48, 54, 61, 67, 70, 76, 87, 90, 97, 103, 106, 112):**

```
api/trpc/unifiedMap.getAvailableFilters?batch=1&input=...
Failed to load resource: the server responded with a status of 404 ()
```

**Causa Raiz:**

- Componente `FiltersPanel` chama `trpc.unifiedMap.getAvailableFilters.useQuery()`
- Router `unifiedMap` **NÃO EXISTE** no `_app.ts`
- Erro 404 (Not Found)

**Impacto:**

- ❌ Filtros dinâmicos (Setor, Porte, Qualidade) não carregam
- ❌ Selects ficam vazios
- ❌ Queries falham repetidamente (retry infinito)

---

### **PROBLEMA 2: Procedures `getCategories` FALHANDO (500)** ❌❌

**Evidência (linhas 34, 39, 45, 64, 73, 79, 100, 109, 115):**

```
api/trpc/sectorDrillDown.getCategories?batch=1&input={"0":{"json":{"pesquisaIds":[1]}}}
Failed to load resource: the server responded with a status of 500 ()

api/trpc/productDrillDown.getCategories?batch=1&input={"0":{"json":{"pesquisaIds":[1]}}}
Failed to load resource: the server responded with a status of 500 ()
```

**Causa Raiz:**

- Procedures `sectorDrillDown.getCategories` e `productDrillDown.getCategories` existem
- Mas estão retornando erro 500 (Internal Server Error)
- Provavelmente erro na query SQL ou lógica do procedure

**Impacto:**

- ❌ Nível 1 (Categorias) não carrega
- ❌ Mensagem "Nenhuma categoria encontrada"
- ❌ Drill-down não funciona

---

### **PROBLEMA 3: Query `auth.me` FALHANDO (500)** ❌

**Evidência (linhas 8):**

```
api/trpc/auth.me?batch=1&input=...
Failed to load resource: the server responded with a status of 500 ()
```

**Causa Raiz:**

- Query `auth.me` falhando
- Pode estar afetando autenticação/contexto

**Impacto:**

- ⚠️ Pode afetar permissões
- ⚠️ Pode afetar contexto do usuário

---

### **PROBLEMA 4: Filtros com `projectId: null` e `pesquisaId: null`** ❌

**Evidência (linhas 2, 5, 20, 54, 87, 90):**

```
unifiedMap.getAvailableFilters?batch=1&input={"0":{"json":{"projectId":null,"pesquisaId":null}}}
```

**Causa Raiz:**

- Componente `FiltersPanel` está chamando query COM `projectId: null` e `pesquisaId: null`
- Deveria esperar valores válidos antes de chamar

**Impacto:**

- ❌ Queries desnecessárias (404)
- ❌ Performance ruim (retry infinito)

---

### **PROBLEMA 5: `useSelectedProject` retorna `NaN`** ❌

**Evidência (linhas 1, 10, 12):**

```
useSelectedProject - selectedProjectId: NaN
```

**Causa Raiz:**

- Hook `useSelectedProject` está retornando `NaN` em vez de `number | undefined`
- Provavelmente problema de conversão de tipo

**Impacto:**

- ⚠️ Pode afetar lógica de seleção de projeto
- ⚠️ Pode causar bugs em outros componentes

---

## 📋 **RESUMO: PRIORIDADE DE CORREÇÃO**

| Problema                                  | Severidade | Impacto                 | Prioridade |
| ----------------------------------------- | ---------- | ----------------------- | ---------- |
| **1. Router `unifiedMap` não existe**     | 🔴 CRÍTICO | Filtros não funcionam   | **P0**     |
| **2. `getCategories` retorna 500**        | 🔴 CRÍTICO | Drill-down não funciona | **P0**     |
| **3. `auth.me` retorna 500**              | 🟡 MÉDIO   | Pode afetar auth        | **P1**     |
| **4. Filtros com `null`**                 | 🟡 MÉDIO   | Performance ruim        | **P1**     |
| **5. `useSelectedProject` retorna `NaN`** | 🟢 BAIXO   | Pode causar bugs        | **P2**     |

---

## 🎯 **PLANO DE CORREÇÃO**

### **CORREÇÃO 1: Criar router `unifiedMap`** (P0)

**Opção A:** Criar router novo

```typescript
// server/routers/unified-map.ts
export const unifiedMapRouter = router({
  getAvailableFilters: publicProcedure
    .input(
      z.object({
        projectId: z.number().optional(),
        pesquisaId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      // Implementar lógica
      return {
        setores: [],
        portes: [],
        qualidades: [],
      };
    }),
});
```

**Opção B:** Usar router existente

- Verificar se `unifiedMap` existe com outro nome
- Atualizar imports

---

### **CORREÇÃO 2: Corrigir `getCategories`** (P0)

**Investigar:**

1. Verificar procedure `sectorDrillDown.getCategories`
2. Verificar query SQL
3. Verificar se tabelas existem
4. Verificar se dados existem

**Possíveis causas:**

- ❌ Query SQL incorreta
- ❌ Campo `setor` ou `produto` não existe
- ❌ Dados vazios no banco

---

### **CORREÇÃO 3: Corrigir `auth.me`** (P1)

**Investigar:**

- Verificar procedure `auth.me`
- Verificar se contexto de auth está correto

---

### **CORREÇÃO 4: Adicionar validação de filtros** (P1)

```typescript
// FiltersPanel.tsx
const { data: availableFilters } = trpc.unifiedMap.getAvailableFilters.useQuery(
  {
    projectId: filters.projectId,
    pesquisaId: filters.pesquisaId,
  },
  {
    enabled: !!filters.projectId, // ✅ Só chama se projectId válido
  }
);
```

---

### **CORREÇÃO 5: Corrigir `useSelectedProject`** (P2)

```typescript
// Verificar conversão de tipo
const projectId = Number(localStorage.getItem('selectedProjectId'));
if (isNaN(projectId)) {
  return undefined; // ✅ Retorna undefined em vez de NaN
}
```

---

## ✅ **PRÓXIMOS PASSOS**

1. **Investigar router `unifiedMap`** - Verificar se existe ou criar
2. **Investigar `getCategories`** - Ver logs do servidor
3. **Corrigir em ordem de prioridade** (P0 → P1 → P2)
4. **Testar cada correção** individualmente
5. **Validar solução completa**

---

## 🔥 **CONCLUSÃO**

**Identificados 5 problemas críticos:**

- 2 problemas P0 (bloqueantes)
- 2 problemas P1 (importantes)
- 1 problema P2 (menor)

**Causa raiz principal:**

- Router `unifiedMap` não existe (404)
- Procedures `getCategories` falhando (500)

**Próxima ação:**
Investigar código do servidor para confirmar diagnóstico e aplicar correções.
