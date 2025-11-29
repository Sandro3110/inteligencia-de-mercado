# Análise de Funções de Exportação

## Resumo
Encontradas **6 implementações** de exportação na aplicação.

## Status das Implementações

### ✅ 1. Dashboard - handleExport
**Arquivo:** `app/(app)/dashboard/page.tsx:119`  
**Status:** ✅ **CORRETO**  
**Implementação:**
- Mostra toast "Gerando arquivo Excel..."
- Chama `/api/export/excel?pesquisaId=${pesquisaId}`
- Faz download automático do blob
- Mostra toast de sucesso

---

### ✅ 2. Projects - handleExport
**Arquivo:** `app/(app)/projects/[id]/page.tsx:36`  
**Status:** ✅ **CORRETO** (corrigido recentemente)  
**Implementação:**
- Mostra toast "Gerando arquivo Excel..."
- Chama `/api/export/excel?pesquisaId=${pesquisaId}`
- Faz download automático do blob
- Mostra toast de sucesso

---

### ✅ 3. Projects - handleExportAll
**Arquivo:** `app/(app)/projects/[id]/page.tsx:129`  
**Status:** ✅ **CORRETO**  
**Implementação:**
- Valida se há pesquisas
- Mostra toast loading
- Usa mutation `exportProjectMutation`
- Exporta projeto completo

---

### ✅ 4. Survey Results - handleExport
**Arquivo:** `app/(app)/projects/[id]/surveys/[surveyId]/results/page.tsx:100`  
**Status:** ✅ **CORRETO**  
**Implementação:**
- Usa `exportProjectMutation.mutateAsync`
- Converte base64 para blob
- Faz download automático
- Mostra toast de sucesso

---

### ❌ 5. CompararMercadosModal - handleExportPDF
**Arquivo:** `components/CompararMercadosModal.tsx:436`  
**Status:** ❌ **INCOMPLETO**  
**Problema:**
```typescript
const handleExportPDF = useCallback(() => {
  toast.info(TOAST_MESSAGES.EXPORT_INFO);
}, []);
```
- Apenas mostra mensagem informativa
- NÃO implementa exportação real
- Precisa implementar geração de PDF

---

### ✅ 6. MercadoAccordionCard - handleExportTab
**Arquivo:** `components/MercadoAccordionCard.tsx:559`  
**Status:** ✅ **CORRETO**  
**Implementação:**
- Suporta 3 formatos: CSV, Excel, PDF
- Mapeia dados corretamente por tipo de entidade
- Usa funções de exportação apropriadas

---

## Conclusão

**Total:** 6 implementações  
**Corretas:** 5 ✅  
**Incompletas:** 1 ❌  

### Ação Necessária
Apenas **CompararMercadosModal.handleExportPDF** precisa ser implementado. Atualmente apenas mostra mensagem mas não exporta nada.
