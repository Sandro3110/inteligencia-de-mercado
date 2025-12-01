# ⚠️ Erros TypeScript Pendentes - Schema Atualizado

## 📋 RESUMO

**Total de erros:** ~50 erros
**Causa:** Routers e componentes ainda usam tabelas antigas

**Status:** ✅ ESPERADO - Será corrigido nas próximas fases

---

## 🔧 ERROS POR CATEGORIA

### 1. **Routers Obsoletos** (FASE 3.1 - Refatorar Routers)

#### server/routers/\*.ts

- ❌ Usam tabelas antigas: `clientes`, `leads`, `concorrentes`
- ✅ Devem usar: `fatoEntidades` com filtro `tipo_entidade`

**Arquivos afetados:**

- `server/routers/clientes.ts`
- `server/routers/leads.ts`
- `server/routers/concorrentes.ts`
- `server/routers/map-hierarchical.ts`
- `server/routers/sector-drill-down.ts`
- `server/routers/product-drill-down.ts`

---

### 2. **Componentes Frontend** (FASE 4.1 - Atualizar Componentes)

#### app/(app)/dashboard/page.tsx

- ❌ Propriedades obsoletas: `data.pesquisas`, `data.mercados`, `data.leads`, `data.clientes`
- ✅ Devem usar novo formato de dados

#### app/(app)/map/page.tsx

- ❌ Parâmetros `any` type
- ✅ Adicionar tipos corretos

#### app/(app)/products/page.tsx

- ❌ `trpc.map.xxx` não existe
- ✅ Usar novo endpoint

#### app/(app)/projects/[id]/page.tsx

- ❌ `projects.getById` não existe
- ❌ `pesquisas.getProjectPesquisas` não existe
- ✅ Atualizar para novos endpoints

---

### 3. **Types Faltantes** (FASE 2.2 - DAL)

#### Tipos a criar:

```typescript
// types/entidades.ts
export type TipoEntidade = 'cliente' | 'lead' | 'concorrente';
export type StatusQualificacao =
  | 'ativo'
  | 'inativo'
  | 'prospect'
  | 'lead_qualificado'
  | 'lead_desqualificado';
export type QualidadeClassificacao = 'A' | 'B' | 'C' | 'D';

export interface FatoEntidade {
  id: number;
  tipo_entidade: TipoEntidade;
  entidade_hash: string;
  nome: string;
  cnpj?: string;
  pesquisa_id: number;
  project_id: number;
  geografia_id: number;
  mercado_id: number;
  status_qualificacao: StatusQualificacao;
  qualidade_score?: number;
  qualidade_classificacao?: QualidadeClassificacao;
  // ... outros campos
}

export interface Cliente extends FatoEntidade {
  tipo_entidade: 'cliente';
}

export interface Lead extends FatoEntidade {
  tipo_entidade: 'lead';
  lead_stage?: string;
  cliente_origem_id?: number;
}

export interface Concorrente extends FatoEntidade {
  tipo_entidade: 'concorrente';
}
```

---

## 📅 CRONOGRAMA DE CORREÇÃO

| Fase         | Erros a Corrigir     | Tempo |
| ------------ | -------------------- | ----- |
| **FASE 2.2** | Types faltantes      | 1h    |
| **FASE 3.1** | Routers obsoletos    | 6-8h  |
| **FASE 4.1** | Componentes frontend | 8-10h |

---

## ✅ VALIDAÇÃO FINAL

Após todas as correções, executar:

```bash
# Verificar TypeScript
pnpm tsc --noEmit

# Resultado esperado:
# ✅ 0 erros
```

---

## 📝 NOTAS

- ✅ Schema novo está correto
- ✅ Migration gerada com sucesso
- ✅ Banco de dados atualizado
- ⏳ Código da aplicação será atualizado nas próximas fases

**Não se preocupe com esses erros agora - é parte do processo de refatoração!** 🚀
