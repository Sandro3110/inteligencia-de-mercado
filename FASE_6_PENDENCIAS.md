# 📋 FASE 6 - PENDÊNCIAS E COMPONENTES RESTANTES

## ✅ Componentes Refatorados com Qualidade Máxima (2/8)

### Seção 6.1 - Modais Complexos (2/3)
1. ✅ **CompararMercadosModal.tsx** (20K, 547→750 linhas)
2. ✅ **DraftRecoveryModal.tsx** (15K, 422→600 linhas)
3. ❌ **ExportModal.tsx** - NÃO EXISTE NO PROJETO

---

## ⏸️ Componentes Grandes - Refatoração Profunda Pendente

### Seção 6.2 - Visualização e Agendamento (0/3)
Estes componentes são MUITO grandes e complexos, requerem refatoração dedicada:

4. ⏸️ **MercadoAccordionCard.tsx** (26K, 723 linhas)
   - Múltiplas queries tRPC
   - 3 tabs (clientes, concorrentes, leads)
   - Batch operations
   - Export functionality
   - Search and filters
   - **Estimativa:** 5-6h de refatoração profunda

5. ⏸️ **AutomationTab.tsx** (16K) - components/reports/
   - Já tem 'use client' e import correto
   - Precisa: constantes, interfaces, useCallback, useMemo
   - **Estimativa:** 3-4h de refatoração profunda

6. ⏸️ **ScheduleTab.tsx** (9.8K) - components/reports/
   - Já tem 'use client' e import correto
   - Precisa: constantes, interfaces, useCallback, useMemo
   - **Estimativa:** 2-3h de refatoração profunda

---

## 🔄 Componentes Médios - A Refatorar

### Seção 6.3 - Componentes Médios (0/4)

7. 🔄 **GeoCockpit.tsx** (13K, 395 linhas)
   - Integração com Leaflet maps
   - 3 steps workflow
   - Coordinate validation
   - **Estimativa:** 2-3h

8. 🔄 **AdvancedFilterBuilder.tsx** (11K)
   - **Estimativa:** 2h

9. 🔄 **NotificationFilters.tsx** (9.1K)
   - **Estimativa:** 1-2h

10. 🔄 **GlobalShortcuts.tsx** (8.3K)
    - **Estimativa:** 1-2h

---

## 📊 Resumo de Pendências

| Categoria | Componentes | Status | Tempo Estimado |
|-----------|-------------|--------|----------------|
| **Modais Complexos** | 2/3 | ✅ 67% | 0h (completo) |
| **Componentes Gigantes** | 0/3 | ⏸️ 0% | 10-13h |
| **Componentes Médios** | 0/4 | 🔄 0% | 6-9h |
| **TOTAL FASE 6** | 2/10 | 20% | 16-22h restantes |

---

## 🎯 Estratégia Recomendada

### Opção 1: Continuar Fase 6 (Componentes Médios)
Refatorar os 4 componentes médios (6-9h) e deixar os 3 gigantes para Fase 7.

**Vantagens:**
- Progresso visível
- Componentes médios são mais gerenciáveis
- Mantém momentum

**Próximos:**
- GeoCockpit.tsx (13K, 395 linhas) - 2-3h
- AdvancedFilterBuilder.tsx (11K) - 2h
- NotificationFilters.tsx (9.1K) - 1-2h
- GlobalShortcuts.tsx (8.3K) - 1-2h

### Opção 2: Pular para Fase 8 (Componentes Pequenos)
Deixar todos os componentes grandes (Fase 6 e 7) para depois e focar nos componentes pequenos e médios restantes.

**Vantagens:**
- Maior quantidade de componentes completos
- Menos complexidade
- Progresso mais rápido

---

## 📝 Notas Importantes

1. **MercadoAccordionCard.tsx** e **DetailPopup.tsx** são componentes CRÍTICOS do sistema
   - Merecem refatoração dedicada e cuidadosa
   - Podem ser divididos em subcomponentes
   - Fase 7 dedicada a eles

2. **AutomationTab.tsx** e **ScheduleTab.tsx** já têm correções essenciais
   - 'use client' adicionado
   - Imports corretos
   - Funcionam corretamente
   - Refatoração profunda é melhoria, não correção

3. **ExportModal.tsx** não existe no projeto
   - Remover do plano original
   - Ajustar contagem total

---

## 🚀 Próxima Ação

**Decisão do usuário:**
- [ ] Continuar Fase 6 com componentes médios (GeoCockpit, AdvancedFilterBuilder, etc.)
- [ ] Pular para Fase 8 (componentes pequenos e médios)
- [ ] Fazer refatoração profunda dos componentes gigantes agora

**Progresso Geral:**
- ✅ Fase 4: 7 componentes
- ✅ Fase 5: 10 componentes críticos
- 🔄 Fase 6: 2/10 componentes (20%)
- **Total:** 19/71 componentes (27%)
