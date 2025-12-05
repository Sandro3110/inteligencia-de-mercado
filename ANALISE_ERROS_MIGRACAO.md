# Análise de Erros - Migração Next.js

## 📊 PADRÕES IDENTIFICADOS (15 correções)

### 1. **INCOMPATIBILIDADE DE ROUTERS tRPC**
- ❌ `trpc.entidade.atualizar` → ✅ `trpc.entidades.update`
- ❌ `trpc.entidade.listar` → ✅ `trpc.entidades.list`
- **Causa:** Código antigo usa nomes diferentes dos routers atuais

### 2. **ESTRUTURA DE RESPOSTA PAGINADA**
- ❌ `projetosData?.projetos` → ✅ `projetosData?.data`
- ❌ `pesquisasData?.pesquisas` → ✅ `pesquisasData?.data`
- **Causa:** ResultadoPaginado<T> sempre retorna `{ data: T[], total, page, ... }`

### 3. **SINTAXE DE TOAST**
- ❌ `toast({ title: 'X', description: 'Y' })` → ✅ `toast.success('X')`
- **Causa:** Sonner usa sintaxe diferente do shadcn/ui useToast

### 4. **NULL vs UNDEFINED**
- ❌ `formData.email || null` → ✅ `formData.email || undefined`
- **Causa:** Zod `.optional()` resulta em `T | undefined`, não `T | null`

### 5. **PROPRIEDADES OPCIONAIS (?:)**
- ❌ `celular?: string | null` → ✅ `celular: string | null`
- **Causa:** `?:` adiciona `| undefined`, causando incompatibilidade entre interfaces

### 6. **NOMES DE CAMPOS INCONSISTENTES**
- ❌ `entidade.enriquecido` → ✅ `entidade.enriquecido_em`
- ❌ `entidade.origem_dados` → ✅ `entidade.origem_data`
- **Causa:** Schema do banco usa nomes diferentes

### 7. **NULL CHECKS FALTANDO**
- ❌ `entidade.score_qualidade >= 80` → ✅ `entidade.score_qualidade != null ? ... : 'Sem avaliação'`
- **Causa:** Campos nullable sem verificação

### 8. **ARGUMENTOS OBRIGATÓRIOS FALTANDO**
- ❌ `trpc.projetos.list.useQuery()` → ✅ `trpc.projetos.list.useQuery({ page: 1, limit: 100 })`
- **Causa:** Procedures requerem argumentos mas não foram passados

### 9. **CAST DE ERRO INCORRETO**
- ❌ `(error as Error).message` → ✅ `error.message`
- **Causa:** TRPCClientErrorLike já tem `.message`

### 10. **CAMPOS FALTANDO NA INTERFACE**
- ❌ Interface sem `created_by`, `updated_by`, `estado`
- **Causa:** Interfaces incompletas comparadas ao schema

---

## 🛠️ SOLUÇÃO SISTEMÁTICA

### FASE 1: CRIAR INTERFACE CANÔNICA
Criar uma interface TypeScript **única e completa** baseada no schema real do banco.

### FASE 2: SCRIPT DE VALIDAÇÃO
Criar script que:
1. Lê todos os arquivos `.tsx` em `app/(dashboard)/`
2. Identifica padrões de erro conhecidos
3. Sugere correções automáticas

### FASE 3: CORREÇÃO EM MASSA
Aplicar correções conhecidas em TODOS os arquivos de uma vez.

---

## 📋 PRÓXIMOS PASSOS

1. ✅ Gerar interface TypeScript canônica do schema
2. ✅ Criar script de correção automatizada
3. ✅ Executar correções em massa
4. ✅ Build local para validar
5. ✅ Commit único com todas as correções
