# Tabela de Qualidade dos Componentes

## Visão Geral por Categoria

| Categoria | Total | Qualidade Máxima | Superficial | Não Feito | % Completo |
|-----------|-------|------------------|-------------|-----------|------------|
| export/ | 12 | 12 | 0 | 0 | 100% |
| maps/ | 8 | 8 | 0 | 0 | 100% |
| analytics/ | 4 | 4 | 0 | 0 | 100% |
| skeletons/ | 4 | 4 | 0 | 0 | 100% |
| research-wizard/ | 5 | 3 | 0 | 2 | 60% |
| tabs/ | 3 | 3 | 0 | 0 | 100% |
| projects/ | 3 | 3 | 0 | 0 | 100% |
| reports/ | 2 | 0 | 2 | 0 | 0% |
| ui/ (shadcn) | 54 | 54 | 0 | 0 | 100% |
| raiz/ | 61 | 0 | 59 | 2 | 0% |
| **TOTAL** | **156** | **91** | **61** | **4** | **58%** |

## Componentes Superficiais (Principais)

| Componente | Tamanho | Complexidade | Tempo Estimado |
|------------|---------|--------------|----------------|
| AlertConfig.tsx | 12K | Média-Alta | 2h |
| AppSidebar.tsx | 17K | Alta | 3h |
| CompararMercadosModal.tsx | 20K | Muito Alta | 4h |
| DraftRecoveryModal.tsx | 15K | Alta | 2-3h |
| GlobalSearch.tsx | 8K | Média | 1-2h |
| KanbanBoard.tsx | 5K | Média | 1h |
| MercadoAccordionCard.tsx | 26K | Muito Alta | 5h |
| ReportGenerator.tsx | 13K | Alta | 2-3h |
| ScheduleEnrichment.tsx | 10K | Média-Alta | 2h |
| UnifiedFilterPanel.tsx | 8K | Média | 1-2h |
| AutomationTab.tsx | 16K | Alta | 3-4h |
| ScheduleTab.tsx | 9.8K | Média-Alta | 2-3h |
| + 49 componentes menores | 1-7K | Baixa-Média | 15-20h |

**Total estimado:** 60-75 horas

## Componentes Não Feitos

| Componente | Tamanho | Linhas | Complexidade | Tempo Estimado | Recomendação |
|------------|---------|--------|--------------|----------------|--------------|
| AllSteps.tsx | 34K | 1038 | Muito Alta | 6-8h | Dividir em Step1-7.tsx |
| DetailPopup.tsx | 38K | ~1000 | Muito Alta | 8-10h | Dividir em componentes |

**Total estimado:** 14-18 horas

## Priorização para Refatoração

### Prioridade ALTA (15-20h)
Componentes críticos usados em muitos lugares:

1. GlobalSearch.tsx (8K) - 1-2h
2. UnifiedFilterPanel.tsx (8K) - 1-2h
3. AppSidebar.tsx (17K) - 3h
4. DashboardLayout.tsx (11K) - 2h
5. ReportGenerator.tsx (13K) - 2-3h
6. AlertConfig.tsx (12K) - 2h
7. ScheduleEnrichment.tsx (10K) - 2h
8. TagManager.tsx (5K) - 1h
9. TagFilter.tsx (4K) - 1h
10. SavedFilters.tsx (2K) - 30min

### Prioridade MÉDIA (20-25h)
Componentes importantes mas menos usados:

1. CompararMercadosModal.tsx (20K) - 4h
2. DraftRecoveryModal.tsx (15K) - 2-3h
3. MercadoAccordionCard.tsx (26K) - 5h
4. AutomationTab.tsx (16K) - 3-4h
5. ScheduleTab.tsx (9.8K) - 2-3h
6. KanbanBoard.tsx (5K) - 1h
7. CostEstimator.tsx (5.8K) - 1h
8. ColumnMapper.tsx (7.7K) - 1-2h

### Prioridade ESPECIAL (14-18h)
Componentes gigantes (precisam estratégia dedicada):

1. AllSteps.tsx (34K, 1038 linhas) - 6-8h
2. DetailPopup.tsx (38K) - 8-10h

## Recomendação Final

**Estratégia Híbrida (30-40h):**

1. Fase 5 - Testes (4-6h)
2. Prioridade ALTA (15-20h) - 10 componentes críticos
3. Componentes Gigantes (14-18h) - AllSteps + DetailPopup
4. Deploy (2h)

**Total:** 35-46 horas para ter um projeto de altíssima qualidade

**Resultado:** 
- 100% dos componentes críticos com qualidade máxima
- 100% dos componentes gigantes refatorados
- Sistema em produção
- Base sólida para manutenção futura
