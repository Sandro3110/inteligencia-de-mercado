# Fase A: Conclusão da Dívida Técnica do Frontend

**Data de Início:** 24 de novembro de 2025
**Objetivo:** Refatorar 94 componentes restantes com qualidade máxima
**Estimativa:** 60-80 horas

---

## 📊 Resumo do Escopo

| Categoria                   | Quantidade | Status          |
| --------------------------- | ---------- | --------------- |
| Componentes Gigantes (raiz) | 5          | 🔄 Em andamento |
| Componentes Médios (raiz)   | 4          | ⏳ Pendente     |
| Subpasta: analytics         | 4          | ⏳ Pendente     |
| Subpasta: export            | 12         | ⏳ Pendente     |
| Subpasta: maps              | 8          | ⏳ Pendente     |
| Subpasta: projects          | 3          | ⏳ Pendente     |
| Subpasta: reports           | 2          | ⏳ Pendente     |
| Subpasta: research-wizard   | 4          | ⏳ Pendente     |
| Subpasta: skeletons         | 3          | ⏳ Pendente     |
| Subpasta: tabs              | 3          | ⏳ Pendente     |
| Outros componentes          | ~46        | ⏳ Pendente     |
| **TOTAL**                   | **94**     | **0% completo** |

---

## 🎯 Fase 1: Componentes Gigantes (5 componentes)

Estes são os componentes mais complexos e críticos da aplicação.

### 1.1. DetailPopup.tsx (925 linhas)

- **Complexidade:** Muito Alta
- **Estimativa:** 6-8 horas
- **Prioridade:** Crítica
- **Desafios:**
  - Componente gigante com múltiplas responsabilidades
  - Muitas dependências e integrações
  - Lógica de negócio complexa
- **Status:** ⏳ Pendente

### 1.2. MercadoAccordionCard.tsx (947 linhas)

- **Complexidade:** Muito Alta
- **Estimativa:** 6-8 horas
- **Prioridade:** Crítica
- **Desafios:**
  - Componente de visualização complexo
  - Muitos estados e interações
  - Integração com múltiplos sub-componentes
- **Status:** ⏳ Pendente

### 1.3. CompararMercadosModal.tsx (830 linhas)

- **Complexidade:** Alta
- **Estimativa:** 5-7 horas
- **Prioridade:** Alta
- **Desafios:**
  - Lógica de comparação complexa
  - Visualizações com Recharts
  - Múltiplos estados de filtros
- **Status:** ⏳ Pendente

### 1.4. GeoCockpit.tsx (643 linhas)

- **Complexidade:** Alta
- **Estimativa:** 5-6 horas
- **Prioridade:** Alta
- **Desafios:**
  - Integração com Leaflet
  - Lógica de mapas complexa
  - Performance crítica
- **Status:** ⏳ Pendente

### 1.5. DraftRecoveryModal.tsx (660 linhas)

- **Complexidade:** Alta
- **Estimativa:** 5-6 horas
- **Prioridade:** Média
- **Desafios:**
  - Lógica de recuperação de drafts
  - Comparação de estados
  - UI complexa
- **Status:** ⏳ Pendente

**Subtotal Fase 1:** 27-35 horas

---

## 🎯 Fase 2: Componentes Médios da Raiz (4 componentes)

### 2.1. AdvancedFilterBuilder.tsx (561 linhas)

- **Estimativa:** 4-5 horas
- **Status:** ⏳ Pendente

### 2.2. AlertConfig.tsx (606 linhas)

- **Estimativa:** 4-5 horas
- **Status:** ⏳ Pendente

### 2.3. AppSidebar.tsx (663 linhas)

- **Estimativa:** 4-5 horas
- **Status:** ⏳ Pendente

### 2.4. ColumnMapper.tsx (416 linhas)

- **Estimativa:** 3-4 horas
- **Status:** ⏳ Pendente

**Subtotal Fase 2:** 15-19 horas

---

## 🎯 Fase 3: Subpasta analytics (4 componentes)

### 3.1. ComparativeTab.tsx

- **Estimativa:** 2-3 horas
- **Status:** ⏳ Pendente

### 3.2. InteractiveTab.tsx

- **Estimativa:** 2-3 horas
- **Status:** ⏳ Pendente

### 3.3. MetricsTab.tsx

- **Estimativa:** 2-3 horas
- **Status:** ⏳ Pendente

### 3.4. OverviewTab.tsx

- **Estimativa:** 2-3 horas
- **Status:** ⏳ Pendente

**Subtotal Fase 3:** 8-12 horas

---

## 🎯 Fase 4: Subpasta export (12 componentes)

### Componentes:

1. ContextualSuggestions.tsx
2. DepthSelector.tsx
3. ExportProgress.tsx
4. FileSizeEstimate.tsx
5. LimitValidation.tsx
6. RelationshipModeSelector.tsx
7. SaveConfigDialog.tsx
8. SmartAutocomplete.tsx
9. Step1Context.tsx
10. Step2Filters.tsx
11. Step3Fields.tsx
12. Step4Output.tsx

**Estimativa:** 1.5-2 horas por componente
**Subtotal Fase 4:** 18-24 horas

---

## 🎯 Fase 5: Subpasta maps (8 componentes)

### Componentes:

1. CustomMarker.tsx
2. EntityMarker.tsx
3. EntityPopupCard.tsx
4. HeatmapLayer.tsx
5. MapContainer.tsx
6. MapControls.tsx
7. MapFilters.tsx
8. MapLegend.tsx

**Estimativa:** 1.5-2 horas por componente
**Subtotal Fase 5:** 12-16 horas

---

## 🎯 Fase 6: Pastas Restantes (61 componentes)

### Subpastas:

- **projects/** (3 componentes): 4-6 horas
- **reports/** (2 componentes): 3-4 horas
- **research-wizard/** (4 componentes): 6-8 horas
- **skeletons/** (3 componentes): 3-4 horas
- **tabs/** (3 componentes): 4-6 horas
- **Outros componentes** (~46): Estimativa variável

**Subtotal Fase 6:** Estimativa em andamento

---

## ✅ Checklist de Qualidade (Por Componente)

Cada componente deve passar por esta checklist antes de ser considerado completo:

- [ ] 'use client' adicionado (se necessário)
- [ ] Seções organizadas (CONSTANTS, TYPES, HELPERS, SUB-COMPONENTS, MAIN COMPONENT)
- [ ] TODAS as constantes extraídas
- [ ] Zero tipos 'any'
- [ ] Interfaces completas e detalhadas
- [ ] useCallback em TODOS os handlers
- [ ] useMemo em TODOS os computed values
- [ ] Sub-componentes extraídos (quando apropriado)
- [ ] Helper functions extraídas (quando apropriado)
- [ ] Documentação JSDoc completa
- [ ] LucideIcon typing (quando aplicável)
- [ ] Código revisado e testado
- [ ] Commit com mensagem descritiva

---

## 📈 Progresso Geral

**Componentes Refatorados:** 0/94 (0%)
**Tempo Estimado Total:** 60-80 horas
**Tempo Decorrido:** 0 horas

---

## 🎯 Próximo Componente

**Iniciando:** DetailPopup.tsx (925 linhas)
**Status:** 🔄 Em andamento
