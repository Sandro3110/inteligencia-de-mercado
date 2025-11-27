# 🔄 Processo de Ajuste em Massa Controlado

## 🎯 Objetivo

Implementar feedback visual em **109 componentes** de forma **controlada, escalável e sem quebrar funcionalidades existentes**.

---

## 📋 Processo Geral (6 Etapas)

### **1. INVENTÁRIO** 📊

Listar todos os componentes que precisam de ajuste.

### **2. CATEGORIZAÇÃO** 🏷️

Classificar por complexidade (A/B/C).

### **3. PRIORIZAÇÃO** 🎯

Ordenar por impacto × facilidade.

### **4. IMPLEMENTAÇÃO** 🔧

Aplicar padrão de feedback.

### **5. VALIDAÇÃO** ✅

Testar e aprovar.

### **6. DEPLOY** 🚀

Publicar em produção.

---

## 📊 ETAPA 1: Inventário Automatizado

### **Script de Inventário:**

```bash
#!/bin/bash
# scripts/inventory-feedback.sh

echo "=== INVENTÁRIO DE COMPONENTES SEM FEEDBACK ==="

# Todos os componentes
ALL_COMPONENTS=$(find components app/\(app\) -name "*.tsx" | wc -l)

# Com toast
WITH_TOAST=$(find components app/\(app\) -name "*.tsx" -exec grep -l "toast\." {} \; | wc -l)

# Com loading
WITH_LOADING=$(find components app/\(app\) -name "*.tsx" -exec grep -l "isLoading\|loading\|isPending" {} \; | wc -l)

# Sem feedback (estimativa)
WITHOUT_FEEDBACK=$((ALL_COMPONENTS - WITH_TOAST))

echo "Total: $ALL_COMPONENTS"
echo "Com toast: $WITH_TOAST"
echo "Com loading: $WITH_LOADING"
echo "Sem feedback: $WITHOUT_FEEDBACK"

# Listar componentes sem toast
echo ""
echo "=== COMPONENTES SEM TOAST ==="
comm -23 \
  <(find components app/\(app\) -name "*.tsx" | sort) \
  <(find components app/\(app\) -name "*.tsx" -exec grep -l "toast\." {} \; | sort) \
  > /tmp/components_without_feedback.txt

cat /tmp/components_without_feedback.txt
```

**Output:** `components_without_feedback.txt`

---

## 🏷️ ETAPA 2: Categorização Automática

### **Script de Categorização:**

```bash
#!/bin/bash
# scripts/categorize-components.sh

INPUT="/tmp/components_without_feedback.txt"
OUTPUT_A="components_category_A.txt"  # Simples
OUTPUT_B="components_category_B.txt"  # Média
OUTPUT_C="components_category_C.txt"  # Complexa

> $OUTPUT_A
> $OUTPUT_B
> $OUTPUT_C

while read component; do
  # Contar complexidade
  MUTATIONS=$(grep -c "useMutation\|trpc\." "$component" 2>/dev/null || echo 0)
  ASYNC_HANDLERS=$(grep -c "const handle.*async\|onClick.*async" "$component" 2>/dev/null || echo 0)
  STATES=$(grep -c "useState" "$component" 2>/dev/null || echo 0)

  COMPLEXITY=$((MUTATIONS * 3 + ASYNC_HANDLERS * 2 + STATES))

  if [ $COMPLEXITY -le 5 ]; then
    echo "$component" >> $OUTPUT_A
  elif [ $COMPLEXITY -le 15 ]; then
    echo "$component" >> $OUTPUT_B
  else
    echo "$component" >> $OUTPUT_C
  fi
done < $INPUT

echo "Categoria A (Simples): $(wc -l < $OUTPUT_A)"
echo "Categoria B (Média): $(wc -l < $OUTPUT_B)"
echo "Categoria C (Complexa): $(wc -l < $OUTPUT_C)"
```

**Output:** 3 arquivos com componentes categorizados

---

## 🎯 ETAPA 3: Priorização por Impacto

### **Critérios de Priorização:**

```typescript
// scripts/prioritize.ts

interface Component {
  path: string;
  category: 'A' | 'B' | 'C';
  impact: number; // 1-5 (usuário afetado)
  frequency: number; // 1-5 (frequência de uso)
  ease: number; // 1-5 (facilidade)
  risk: number; // 1-5 (risco técnico)
}

function calculatePriority(comp: Component): number {
  return comp.impact * 2 + comp.frequency * 1.5 + comp.ease * 1 - comp.risk * 0.5;
}

// Ordenar por prioridade
components.sort((a, b) => calculatePriority(b) - calculatePriority(a));
```

**Output:** `components_prioritized.json`

---

## 🔧 ETAPA 4: Implementação Padronizada

### **Template por Categoria:**

#### **Categoria A: Substituição Direta**

```typescript
// ANTES
import { Button } from '@/components/ui/button';

<Button onClick={handleSave}>Salvar</Button>

// DEPOIS
import { AsyncButton } from '@/components/ui/async-button';
import { toast } from 'sonner';

const handleSave = async () => {
  const toastId = toast.loading('Salvando...');
  try {
    const response = await fetch('/api/save', { method: 'POST' });
    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Salvo com sucesso!');
    } else {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao salvar');
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao salvar');
  }
};

<AsyncButton onClick={handleSave}>Salvar</AsyncButton>
```

#### **Categoria B: Loading Individual**

```typescript
// ADICIONAR
import { useState } from 'react';
import { toast } from 'sonner';

const [processingId, setProcessingId] = useState<string | null>(null);

const handleAction = async (id: string) => {
  setProcessingId(id);
  const toastId = toast.loading('Processando...');

  try {
    await fetch(`/api/items/${id}/action`, { method: 'POST' });
    toast.dismiss(toastId);
    toast.success('✅ Ação concluída!');
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao processar');
  } finally {
    setProcessingId(null);
  }
};

// MODIFICAR BOTÃO
<Button
  onClick={() => handleAction(item.id)}
  disabled={processingId === item.id}
>
  {processingId === item.id ? 'Processando...' : 'Ação'}
</Button>
```

#### **Categoria C: tRPC Mutation**

```typescript
// ADICIONAR
import { toast } from 'sonner';

const mutation = trpc.resource.create.useMutation({
  onMutate: () => {
    const toastId = toast.loading('Criando...');
    return { toastId };
  },
  onSuccess: (data, variables, context) => {
    toast.dismiss(context.toastId);
    toast.success('✅ Criado com sucesso!');
  },
  onError: (error, variables, context) => {
    toast.dismiss(context?.toastId);
    toast.error(`❌ ${error.message}`);
  },
});
```

---

## ✅ ETAPA 5: Validação (Checklist)

### **Checklist de Validação:**

```markdown
## Checklist de Implementação

### Antes de Commit:

- [ ] Toast de loading aparece ao clicar
- [ ] Toast de sucesso aparece quando OK
- [ ] Toast de erro aparece quando falha
- [ ] Botão fica disabled durante processamento
- [ ] Spinner visual aparece no botão
- [ ] Não é possível clicar múltiplas vezes
- [ ] Toast é dismissado corretamente
- [ ] Funcionalidade original ainda funciona

### Testes Manuais:

- [ ] Testar fluxo de sucesso
- [ ] Testar fluxo de erro (desconectar internet)
- [ ] Testar múltiplos cliques rápidos
- [ ] Testar em mobile
- [ ] Testar com screen reader (acessibilidade)

### Code Review:

- [ ] Código segue padrão do guia
- [ ] Imports corretos
- [ ] Tipos TypeScript corretos
- [ ] Sem console.log desnecessários
- [ ] Comentários removidos
```

---

## 🚀 ETAPA 6: Deploy Controlado

### **Estratégia de Deploy:**

#### **Opção 1: Feature Flag** (Recomendado)

```typescript
// lib/feature-flags.ts
export const FEATURE_FLAGS = {
  NEW_FEEDBACK_UX: process.env.NEXT_PUBLIC_ENABLE_NEW_FEEDBACK === 'true',
};

// Uso
{FEATURE_FLAGS.NEW_FEEDBACK_UX ? (
  <AsyncButton onClick={handleSave}>Salvar</AsyncButton>
) : (
  <Button onClick={handleSave}>Salvar</Button>
)}
```

**Vantagens:**

- ✅ Rollback instantâneo
- ✅ Teste A/B
- ✅ Deploy gradual

#### **Opção 2: Deploy por Fase**

```
Fase 1: 10 componentes (Categoria A)
  ↓ Deploy → Monitorar 24h
Fase 2: 20 componentes (Categoria A+B)
  ↓ Deploy → Monitorar 24h
Fase 3: 30 componentes (Categoria B+C)
  ↓ Deploy → Monitorar 24h
Fase 4: Restante (49 componentes)
  ↓ Deploy → Monitorar 48h
```

#### **Opção 3: Canary Release**

```
1% usuários → 24h
5% usuários → 24h
25% usuários → 24h
100% usuários
```

---

## 📊 Monitoramento Pós-Deploy

### **Métricas a Monitorar:**

```typescript
// lib/analytics.ts

export function trackFeedbackEvent(event: {
  component: string;
  action: 'loading' | 'success' | 'error';
  duration: number;
}) {
  // Enviar para analytics
  analytics.track('feedback_ux_event', event);
}

// Uso
const startTime = Date.now();
const toastId = toast.loading('Salvando...');

try {
  await save();
  toast.dismiss(toastId);
  toast.success('✅ Salvo!');

  trackFeedbackEvent({
    component: 'SaveButton',
    action: 'success',
    duration: Date.now() - startTime,
  });
} catch (error) {
  trackFeedbackEvent({
    component: 'SaveButton',
    action: 'error',
    duration: Date.now() - startTime,
  });
}
```

### **Dashboard de Monitoramento:**

| Métrica              | Alvo | Atual | Status |
| -------------------- | ---- | ----- | ------ |
| Componentes migrados | 109  | 1     | 🟡 1%  |
| Bugs introduzidos    | < 5  | 0     | ✅ OK  |
| Tempo médio de toast | < 3s | -     | -      |
| Satisfação (NPS)     | +30% | -     | -      |
| Tickets de suporte   | -50% | -     | -      |

---

## 🔄 Processo de Replicação

### **1. Criar Branch por Fase:**

```bash
git checkout -b feat/feedback-ux-phase-1
```

### **2. Implementar Lote:**

```bash
# Pegar próximos 10 componentes
head -10 components_prioritized.json > current_batch.json

# Para cada componente
for component in $(cat current_batch.json); do
  echo "Implementando: $component"
  # Abrir no editor
  code "$component"
done
```

### **3. Commit Padronizado:**

```bash
git add components/SaveButton.tsx
git commit -m "feat(ux): adicionar feedback visual em SaveButton

- Adicionar AsyncButton
- Adicionar toast loading/success/error
- Adicionar disabled state
- Categoria: A (Simples)
- Tempo: 8 minutos
- Prioridade: 22.5

Closes #UX-001"
```

### **4. Pull Request Template:**

```markdown
## 🎨 Feedback Visual - Lote #1

### Componentes Modificados:

- [ ] SaveButton (Categoria A)
- [ ] DeleteButton (Categoria A)
- [ ] RefreshButton (Categoria A)

### Checklist:

- [ ] Todos os testes passaram
- [ ] Toast aparece corretamente
- [ ] Botões ficam disabled
- [ ] Funcionalidade original OK
- [ ] Testado em mobile

### Métricas:

- **Tempo total:** 25 minutos
- **Componentes:** 3
- **Categoria:** A (Simples)
- **Bugs:** 0

### Screenshots:

[Anexar GIFs mostrando toast]
```

---

## 🎯 Automação

### **Script de Automação Parcial:**

```bash
#!/bin/bash
# scripts/auto-implement-category-a.sh

# Para componentes Categoria A (muito simples)
# Pode ser automatizado com regex

INPUT="components_category_A.txt"

while read component; do
  echo "Processando: $component"

  # Backup
  cp "$component" "$component.bak"

  # Adicionar import AsyncButton (se não existir)
  if ! grep -q "AsyncButton" "$component"; then
    sed -i "1i import { AsyncButton } from '@/components/ui/async-button';" "$component"
  fi

  # Adicionar import toast (se não existir)
  if ! grep -q "import.*toast.*sonner" "$component"; then
    sed -i "1i import { toast } from 'sonner';" "$component"
  fi

  # Substituir Button por AsyncButton (CUIDADO!)
  # Apenas para casos muito simples
  # sed -i 's/<Button onClick=/<AsyncButton onClick=/g' "$component"
  # sed -i 's/<\/Button>/<\/AsyncButton>/g' "$component"

  echo "✅ Processado: $component"
  echo "⚠️  REVISAR MANUALMENTE!"
done < $INPUT
```

**⚠️ ATENÇÃO:** Automação completa é arriscada. Use apenas para casos muito simples e **sempre revise manualmente**.

---

## 📋 Resumo do Processo

```
INVENTÁRIO (1h)
  ↓
CATEGORIZAÇÃO (2h)
  ↓
PRIORIZAÇÃO (1h)
  ↓
┌─────────────────────────────────┐
│ LOOP DE IMPLEMENTAÇÃO (38h)    │
│                                 │
│ 1. Pegar próximo lote (10 comp)│
│ 2. Implementar padrão           │
│ 3. Validar checklist            │
│ 4. Commit + PR                  │
│ 5. Code review                  │
│ 6. Merge                        │
│ 7. Deploy fase                  │
│ 8. Monitorar 24h                │
│ 9. Repetir                      │
└─────────────────────────────────┘
  ↓
CONCLUSÃO (2h)
  ↓
DOCUMENTAÇÃO FINAL (1h)
```

**Tempo Total:** 45 horas

---

## 🎓 Lições Aprendidas

### **DO:**

✅ Seguir o processo rigorosamente  
✅ Testar antes de commit  
✅ Fazer code review  
✅ Monitorar após deploy  
✅ Documentar problemas

### **DON'T:**

❌ Pular etapas  
❌ Fazer tudo de uma vez  
❌ Confiar em automação 100%  
❌ Ignorar testes  
❌ Fazer deploy sexta-feira

---

**Próximo documento:** `PADRAO_APROVACAO_REPLICACAO.md`

**Data:** 27/11/2025
