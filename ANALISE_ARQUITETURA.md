# Análise Profunda de Arquitetura - Falhas Estruturais

**Data:** 05/12/2024  
**Commit:** d180f18

---

## 🚨 PROBLEMAS ARQUITETURAIS IDENTIFICADOS

### 1. **INCOMPATIBILIDADE DE TIPOS: userId (string vs integer)**

**Sintomas observados:**
- `createdBy: string` no código → `createdBy: integer` no schema
- `updatedBy: string` no código → `updatedBy: integer` no schema  
- `deletedBy: string` no código → `deletedBy: integer` no schema

**Causa raiz:**
O sistema de autenticação usa **UUID strings** para identificar usuários, mas o schema do banco usa **integers** para foreign keys de usuário.

**Impacto:**
- ❌ Impossível rastrear quem criou/atualizou/deletou registros
- ❌ Auditoria quebrada
- ❌ Compliance comprometido

**Solução correta:**
```sql
-- OPÇÃO 1: Mudar schema para UUID
ALTER TABLE dim_entidade 
  ALTER COLUMN created_by TYPE UUID USING created_by::text::uuid;

-- OPÇÃO 2: Criar tabela de mapeamento
CREATE TABLE user_id_mapping (
  integer_id SERIAL PRIMARY KEY,
  uuid_id UUID UNIQUE NOT NULL
);
```

**Solução atual (TEMPORÁRIA):**
- Comentar campos `createdBy`, `updatedBy`, `deletedBy`
- ⚠️ **PERDA DE AUDITORIA**

---

### 2. **SCHEMA DESATUALIZADO vs CÓDIGO**

**Sintomas observados:**
- `statusQualificacaoId` usado no código mas não existe no schema
- `dimProdutoCatalogo` importado mas não exportado
- `dimStatusQualificacao` importado mas não exportado

**Causa raiz:**
O schema do banco evoluiu mas o código DAL não foi atualizado, ou vice-versa.

**Impacto:**
- ❌ Código referencia campos inexistentes
- ❌ Queries falham em runtime
- ❌ Tipos TypeScript mentirosos

**Solução correta:**
1. **Single Source of Truth:** Schema Drizzle deve ser gerado do banco OU banco gerado do schema
2. **Migrations obrigatórias:** Nunca alterar schema sem migration
3. **CI/CD check:** Build deve falhar se schema e banco divergirem

```bash
# Validação automática
pnpm drizzle-kit check
pnpm drizzle-kit push --dry-run
```

---

### 3. **DRIZZLE ORM: TIPOS INCOMPATÍVEIS**

**Sintomas observados:**
- `result.rows` não existe no tipo retornado
- `RowList<Record<string, unknown>[]>` vs esperado `{ rows: T[] }`

**Causa raiz:**
Versão do Drizzle ORM incompatível OU uso incorreto da API.

**Análise:**
```typescript
// Código antigo (Express + Drizzle v0.28)
const result = await db.execute(sql`...`);
return result.rows; // ✅ Funcionava

// Código atual (Next.js + Drizzle v0.30+)
const result = await db.execute(sql`...`);
return result.rows; // ❌ Property 'rows' does not exist
```

**Solução correta:**
```typescript
// Usar API correta do Drizzle
const result = await db.select().from(table).where(...);
// result já é T[], não { rows: T[] }

// OU para SQL raw
const result = await db.execute<T>(sql`...`);
// result é T[], não { rows: T[] }
```

**Solução atual (HACK):**
```typescript
return result as unknown as T[]; // ⚠️ Bypass de tipos
```

---

### 4. **IMPORTS CIRCULARES E ESTRUTURA DE DIRETÓRIOS**

**Sintomas observados:**
- `server/dal/dimensoes/*.ts` importa `from '../db'`
- `server/dal/importacao.ts` importa `from '../../db'`  
- `server/dal/audit-logs.ts` importa `from '../db'`

**Causa raiz:**
Estrutura de diretórios inconsistente:
```
server/
  ├── db.ts
  ├── dal/
  │   ├── audit-logs.ts       (import '../db')
  │   ├── importacao.ts       (import '../db')
  │   └── dimensoes/
  │       └── entidade.ts     (import '../../db')
```

**Impacto:**
- ❌ Confusão sobre paths relativos
- ❌ Refatorações quebram imports
- ❌ Difícil manutenção

**Solução correta:**
```typescript
// Usar path aliases do TypeScript
import { db } from '@/server/db';
import { dimEntidade } from '@/drizzle/schema';

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### 5. **NEXT.JS ANALISANDO CÓDIGO DO SERVIDOR**

**Sintomas observados:**
- 388 warnings: `'dimEntidade' is not exported`
- Webpack tentando bundlar `server/` no client

**Causa raiz:**
Next.js 15 App Router analisa TODO o código importado, incluindo server-side, para otimização.

**Impacto:**
- ⚠️ 388 warnings poluindo logs
- ⚠️ Build mais lento
- ⚠️ Bundle maior (mesmo que não usado)

**Solução correta:**
```javascript
// next.config.mjs
export default {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignorar código server-side no bundle client
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/server': false,
        '@/drizzle': false,
      };
    }
    return config;
  },
};
```

---

### 6. **FALTA DE CAMADA DE ABSTRAÇÃO ENTRE DRIZZLE E TRPC**

**Problema atual:**
```typescript
// DAL retorna tipos Drizzle diretamente
export async function getEntidades() {
  return await db.select().from(dimEntidade); // Tipo: PgTable<...>
}

// tRPC usa tipos Drizzle
export const entidadesRouter = router({
  list: publicProcedure.query(async () => {
    return await DAL.Entidade.getEntidades(); // ❌ Acoplamento
  }),
});
```

**Impacto:**
- ❌ Mudança no schema quebra tRPC
- ❌ Mudança no Drizzle quebra frontend
- ❌ Impossível versionar API

**Solução correta:**
```typescript
// 1. Criar DTOs (Data Transfer Objects)
export interface EntidadeDTO {
  id: number;
  nome: string;
  cnpj: string | null;
  // ... campos públicos
}

// 2. DAL retorna DTOs
export async function getEntidades(): Promise<EntidadeDTO[]> {
  const rows = await db.select().from(dimEntidade);
  return rows.map(toEntidadeDTO); // Mapper
}

// 3. tRPC usa DTOs
export const entidadesRouter = router({
  list: publicProcedure
    .output(z.array(EntidadeDTOSchema))
    .query(async () => {
      return await DAL.Entidade.getEntidades();
    }),
});
```

**Benefícios:**
- ✅ Schema pode mudar sem quebrar API
- ✅ Controle sobre campos expostos
- ✅ Versionamento de API possível
- ✅ Validação de saída

---

## 📊 RESUMO DAS FALHAS

| Falha | Gravidade | Impacto | Status |
|-------|-----------|---------|--------|
| userId string vs integer | 🔴 CRÍTICA | Auditoria quebrada | Temporário (comentado) |
| Schema desatualizado | 🔴 CRÍTICA | Queries falham | Parcial (comentários) |
| Drizzle tipos incompatíveis | 🟡 ALTA | Type safety perdido | Hack (as unknown) |
| Imports inconsistentes | 🟡 ALTA | Manutenção difícil | Não resolvido |
| Next.js bundling server | 🟢 MÉDIA | Warnings, build lento | Não resolvido |
| Falta de DTOs | 🟡 ALTA | Acoplamento forte | Não resolvido |

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### Fase 1: CRÍTICO (Antes de continuar migração)
1. ✅ **Decidir:** UUID ou Integer para userId?
2. ✅ **Migration:** Atualizar schema do banco
3. ✅ **Atualizar:** Todos os DALs para usar tipo correto
4. ✅ **Validar:** Auditoria funcionando

### Fase 2: IMPORTANTE (Após Fase 1)
1. ✅ **Sincronizar:** Schema Drizzle com banco real
2. ✅ **Remover:** Campos inexistentes do código
3. ✅ **Adicionar:** Campos faltantes no schema
4. ✅ **CI/CD:** Validação automática de schema

### Fase 3: MELHORIA (Após migração completa)
1. ✅ **Criar:** Camada de DTOs
2. ✅ **Refatorar:** DALs para retornar DTOs
3. ✅ **Atualizar:** tRPC para usar DTOs
4. ✅ **Path aliases:** Substituir imports relativos

### Fase 4: OTIMIZAÇÃO (Opcional)
1. ✅ **Next.js config:** Ignorar server/ no bundle client
2. ✅ **Drizzle upgrade:** Versão mais recente
3. ✅ **Type generation:** Automatizar tipos do schema

---

## 🚀 DECISÃO IMEDIATA NECESSÁRIA

**PERGUNTA CRÍTICA:**

Você quer:

**A) PARAR A MIGRAÇÃO** e corrigir a arquitetura agora (Fase 1 + 2)?
- ⏱️ Tempo: 2-4 horas
- ✅ Benefício: Base sólida para continuar
- ❌ Custo: Atraso na migração

**B) CONTINUAR COM HACKS** e corrigir depois?
- ⏱️ Tempo: 0 horas agora
- ✅ Benefício: Migração rápida
- ❌ Custo: Débito técnico crescente, bugs em produção

**C) ABORDAGEM HÍBRIDA** (recomendado)?
- Corrigir apenas userId (Fase 1) - 30 min
- Continuar migração com hacks documentados
- Refatorar arquitetura após 100% migrado

---

## 💡 MINHA RECOMENDAÇÃO

**OPÇÃO C - Abordagem Híbrida**

**Justificativa:**
1. userId é CRÍTICO para compliance e auditoria
2. Outros problemas são "feios" mas não bloqueantes
3. Migrar 100% primeiro dá visão completa do sistema
4. Refatorar com código migrado é mais seguro

**Próximos passos:**
1. ✅ Decidir: UUID ou Integer?
2. ✅ Migration do banco (5 min)
3. ✅ Atualizar DALs (15 min)
4. ✅ Testar auditoria (10 min)
5. ✅ **Continuar migração das 25 páginas restantes**
6. ✅ Refatorar arquitetura após 100%

**Qual opção você escolhe?**
