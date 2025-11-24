# Fase 4 - Pendências para Refatoração com Qualidade

## 🔴 PENDÊNCIAS CRÍTICAS

### research-wizard/ (3 componentes)

#### 1. PreResearchInterface.tsx (9.4K) - PRIORIDADE ALTA

- [ ] Adicionar constantes extraídas
- [ ] Criar interfaces completas
- [ ] Adicionar useCallback para handlers
- [ ] Adicionar useMemo para computed values
- [ ] Remover any types
- [ ] Melhorar tipagem

#### 2. StepPreview.tsx (7.2K) - PRIORIDADE ALTA

- [ ] Adicionar constantes extraídas
- [ ] Criar interfaces completas
- [ ] Adicionar useCallback para handlers
- [ ] Adicionar useMemo para computed values
- [ ] Remover any types
- [ ] Melhorar tipagem

#### 3. AllSteps.tsx (1038 linhas) - PRIORIDADE BAIXA (muito grande)

- [ ] Considerar dividir em componentes menores (Step1.tsx, Step2.tsx, etc.)
- [ ] Adicionar constantes extraídas
- [ ] Criar interfaces completas
- [ ] Adicionar useCallback para handlers
- [ ] Adicionar useMemo para computed values
- [ ] Remover any types
- [ ] Melhorar tipagem
- **NOTA:** Este arquivo deveria ser refatorado em uma fase dedicada

## 🟡 CATEGORIAS RESTANTES

### tabs/ (3 componentes) - NÃO INICIADO

- [ ] Verificar e refatorar se necessário

### projects/ (3 componentes) - NÃO INICIADO

- [ ] Verificar e refatorar se necessário

### reports/ (2 componentes) - NÃO INICIADO

- [ ] Verificar e refatorar se necessário

### ui/ (53 componentes - shadcn) - NÃO INICIADO

- [ ] Verificar se já estão OK (biblioteca padrão)
- [ ] Corrigir apenas se necessário

## ✅ PADRÃO DE QUALIDADE A APLICAR

Para cada componente:

1. **'use client'** no topo (se necessário)
2. **Imports absolutos** (`@/lib/trpc/client`, `@/components/ui/...`)
3. **Constantes extraídas** (COLORS, OPTIONS, CONFIG, FIELDS, etc.)
4. **Interfaces completas** (não usar `any`)
5. **Tipos específicos** (criar types quando necessário)
6. **useCallback** para TODOS os handlers
7. **useMemo** para computed values
8. **Funções helper** extraídas (quando lógica complexa)
9. **Código DRY** (não repetir estruturas)
10. **Type safety** (`as const`, type assertions explícitos)

## 📈 ORDEM DE EXECUÇÃO RECOMENDADA

1. ✅ PreResearchInterface.tsx (2h)
2. ✅ StepPreview.tsx (1h)
3. ✅ tabs/ (1-2h)
4. ✅ projects/ (1-2h)
5. ✅ reports/ (1h)
6. ✅ ui/ verificação (1h)
7. ⏸️ AllSteps.tsx (deixar para depois - 4-6h)

**Total estimado:** 8-10 horas (sem AllSteps)

---

**Próxima ação:** Refatorar PreResearchInterface.tsx com qualidade máxima
