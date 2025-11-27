# ✅ Padrão de Aprovação e Replicação

## 🎯 Objetivo

Estabelecer critérios claros de aprovação e processo de replicação para garantir qualidade e consistência na implementação de feedback visual em **109 componentes**.

---

## 📋 Critérios de Aprovação

### **1. Critérios Funcionais** (Obrigatórios)

#### ✅ **Toast de Loading**

```typescript
// OBRIGATÓRIO
const toastId = toast.loading('Processando...');
```

**Validação:**

- [ ] Toast aparece IMEDIATAMENTE ao clicar
- [ ] Mensagem é clara e específica
- [ ] Toast tem ID único (para dismiss)

---

#### ✅ **Toast de Sucesso**

```typescript
// OBRIGATÓRIO
toast.dismiss(toastId);
toast.success('✅ [Ação] com sucesso!', { duration: 3000 });
```

**Validação:**

- [ ] Toast anterior é dismissado
- [ ] Mensagem tem emoji ✅
- [ ] Mensagem é específica (não genérica)
- [ ] Duração é 3 segundos

---

#### ✅ **Toast de Erro**

```typescript
// OBRIGATÓRIO
toast.dismiss(toastId);
toast.error('❌ Erro ao [ação]', { duration: 4000 });
```

**Validação:**

- [ ] Toast anterior é dismissado
- [ ] Mensagem tem emoji ❌
- [ ] Mensagem é útil (não técnica demais)
- [ ] Duração é 4 segundos

---

#### ✅ **Botão Disabled**

```typescript
// OBRIGATÓRIO
<Button disabled={isLoading}>
  {isLoading ? 'Processando...' : 'Ação'}
</Button>
```

**Validação:**

- [ ] Botão fica disabled durante processamento
- [ ] Texto muda para indicar processamento
- [ ] Não é possível clicar múltiplas vezes

---

#### ✅ **Spinner Visual**

```typescript
// OBRIGATÓRIO
{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
```

**Validação:**

- [ ] Spinner aparece durante processamento
- [ ] Spinner gira (animação)
- [ ] Tamanho apropriado (h-4 w-4)

---

#### ✅ **Try/Catch/Finally**

```typescript
// OBRIGATÓRIO
try {
  // ação
} catch (error) {
  // erro
} finally {
  setIsLoading(false); // SEMPRE limpar
}
```

**Validação:**

- [ ] Try/catch implementado
- [ ] Finally SEMPRE limpa estado
- [ ] Erro é tratado apropriadamente

---

### **2. Critérios de Qualidade** (Recomendados)

#### ⭐ **Mensagens Específicas**

```typescript
// ❌ RUIM
toast.success('Sucesso!');

// ✅ BOM
toast.success('✅ Usuário aprovado com sucesso!');
```

#### ⭐ **Feedback Progressivo**

```typescript
// Para ações longas (> 3s)
toast.loading('Enviando email... (isso pode levar alguns segundos)');
```

#### ⭐ **Acessibilidade**

```typescript
// Adicionar aria-label
<Button aria-label="Salvar projeto" disabled={isLoading}>
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>
```

---

### **3. Critérios de Performance**

#### ⚡ **Sem Re-renders Desnecessários**

```typescript
// ✅ BOM - Estado local
const [isLoading, setIsLoading] = useState(false);

// ❌ RUIM - Re-render de toda página
const [globalLoading, setGlobalLoading] = useContext(LoadingContext);
```

#### ⚡ **Debounce para Ações Rápidas**

```typescript
// Para ações que podem ser clicadas rapidamente
const debouncedSave = useMemo(() => debounce(handleSave, 300), []);
```

---

## 🔍 Processo de Code Review

### **Checklist do Revisor:**

```markdown
## Code Review - Feedback Visual

### Funcional:

- [ ] Toast de loading implementado
- [ ] Toast de sucesso implementado
- [ ] Toast de erro implementado
- [ ] Botão fica disabled
- [ ] Spinner visual presente
- [ ] Try/catch/finally correto

### Qualidade:

- [ ] Mensagens específicas (não genéricas)
- [ ] Emojis nos toasts (✅ ❌)
- [ ] Durações corretas (3s sucesso, 4s erro)
- [ ] Código limpo (sem console.log)
- [ ] Imports organizados

### Testes:

- [ ] Testei fluxo de sucesso
- [ ] Testei fluxo de erro
- [ ] Testei múltiplos cliques
- [ ] Testei em mobile
- [ ] Funcionalidade original OK

### Performance:

- [ ] Sem re-renders desnecessários
- [ ] Estado local (não global)
- [ ] Sem memory leaks

### Documentação:

- [ ] Comentários removidos
- [ ] Tipos TypeScript corretos
- [ ] Segue padrão do guia

### Decisão:

- [ ] ✅ APROVADO - Pode fazer merge
- [ ] 🔄 MUDANÇAS NECESSÁRIAS - Ver comentários
- [ ] ❌ REJEITADO - Refazer
```

---

## 🎯 Padrão de Replicação

### **Template Categoria A (Simples):**

```typescript
// ========================================
// TEMPLATE CATEGORIA A - BOTÃO SIMPLES
// ========================================

// 1. IMPORTS
import { AsyncButton } from '@/components/ui/async-button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

// 2. HANDLER
const handleSave = async () => {
  const toastId = toast.loading('Salvando...');

  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Salvo com sucesso!', { duration: 3000 });
      // Ação pós-sucesso (ex: redirect, refresh)
    } else {
      const error = await response.json();
      toast.dismiss(toastId);
      toast.error(`❌ ${error.message || 'Erro ao salvar'}`, { duration: 4000 });
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao salvar', { duration: 4000 });
    console.error('Save error:', error);
  }
};

// 3. BOTÃO
<AsyncButton
  onClick={handleSave}
  loadingText="Salvando..."
  icon={<Save className="mr-2 h-4 w-4" />}
>
  Salvar
</AsyncButton>
```

**Tempo estimado:** 5-10 minutos

---

### **Template Categoria B (Média):**

```typescript
// ========================================
// TEMPLATE CATEGORIA B - LISTA COM AÇÕES
// ========================================

// 1. IMPORTS
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// 2. ESTADO
const [processingId, setProcessingId] = useState<string | null>(null);

// 3. HANDLER
const handleApprove = async (userId: string) => {
  setProcessingId(userId);
  const toastId = toast.loading('Aprovando usuário...');

  try {
    const response = await fetch(`/api/users/${userId}/approve`, {
      method: 'POST',
    });

    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Usuário aprovado com sucesso!', { duration: 3000 });
      await refetchUsers(); // Atualizar lista
    } else {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao aprovar usuário', { duration: 4000 });
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao aprovar usuário', { duration: 4000 });
  } finally {
    setProcessingId(null);
  }
};

// 4. BOTÃO NA LISTA
{users.map(user => (
  <Button
    key={user.id}
    onClick={() => handleApprove(user.id)}
    disabled={processingId === user.id}
  >
    {processingId === user.id ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Aprovando...
      </>
    ) : (
      <>
        <CheckCircle className="mr-2 h-4 w-4" />
        Aprovar
      </>
    )}
  </Button>
))}
```

**Tempo estimado:** 15-30 minutos

---

### **Template Categoria C (Complexa):**

```typescript
// ========================================
// TEMPLATE CATEGORIA C - tRPC MUTATION
// ========================================

// 1. IMPORTS
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

// 2. MUTATION COM FEEDBACK
const createProjectMutation = trpc.project.create.useMutation({
  onMutate: () => {
    const toastId = toast.loading('Criando projeto...');
    return { toastId };
  },
  onSuccess: (data, variables, context) => {
    toast.dismiss(context.toastId);
    toast.success('✅ Projeto criado com sucesso!', { duration: 3000 });
    router.push(`/projects/${data.id}`);
  },
  onError: (error, variables, context) => {
    toast.dismiss(context?.toastId);
    toast.error(`❌ ${error.message}`, { duration: 4000 });
  },
});

// 3. HANDLER
const handleCreateProject = async (data: ProjectInput) => {
  await createProjectMutation.mutateAsync(data);
};

// 4. BOTÃO
<Button
  onClick={() => handleCreateProject(formData)}
  disabled={createProjectMutation.isPending}
>
  {createProjectMutation.isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Criando...
    </>
  ) : (
    'Criar Projeto'
  )}
</Button>
```

**Tempo estimado:** 30-60 minutos

---

## 📊 Métricas de Aprovação

### **Critérios Quantitativos:**

| Métrica                    | Mínimo   | Ideal    |
| -------------------------- | -------- | -------- |
| **Tempo de implementação** | < 60 min | < 25 min |
| **Cobertura de checklist** | 100%     | 100%     |
| **Bugs introduzidos**      | 0        | 0        |
| **Testes passando**        | 100%     | 100%     |
| **Code review aprovado**   | Sim      | Sim      |

### **Critérios Qualitativos:**

- ✅ Código legível e manutenível
- ✅ Segue padrão estabelecido
- ✅ Mensagens claras para usuário
- ✅ Performance não degradada
- ✅ Acessibilidade mantida

---

## 🔄 Fluxo de Aprovação

```
DESENVOLVEDOR
  ↓
Implementa padrão
  ↓
Auto-checklist (local)
  ↓
Commit + Push
  ↓
Abre Pull Request
  ↓
CI/CD (testes automatizados)
  ↓ [PASS]
REVISOR
  ↓
Code Review (checklist)
  ↓
┌─────────────┬─────────────┐
│ APROVADO    │ MUDANÇAS    │
│             │ NECESSÁRIAS │
└─────────────┴─────────────┘
      ↓              ↓
    MERGE      DESENVOLVEDOR
      ↓          (corrige)
    DEPLOY           ↓
      ↓         Nova revisão
  MONITORAR
      ↓
    CONCLUÍDO
```

---

## 🎓 Treinamento da Equipe

### **Sessão de Onboarding (1h):**

#### **Parte 1: Teoria (20 min)**

- Por que feedback visual é importante
- Estatísticas da auditoria (67% sem feedback)
- Impacto no usuário e no negócio

#### **Parte 2: Padrões (20 min)**

- Guia de boas práticas
- Templates por categoria
- Exemplos práticos

#### **Parte 3: Hands-on (20 min)**

- Implementar 1 componente juntos
- Code review em grupo
- Dúvidas e discussão

### **Material de Apoio:**

- ✅ `UX_FEEDBACK_BEST_PRACTICES.md`
- ✅ `ASYNC_BUTTON_EXAMPLES.md`
- ✅ `PROCESSO_AJUSTE_MASSA.md`
- ✅ `PADRAO_APROVACAO_REPLICACAO.md` (este)

---

## 🚀 Quick Start para Desenvolvedores

### **Passo a Passo Rápido:**

```bash
# 1. Pegar próximo componente da lista
cat components_prioritized.json | head -1

# 2. Abrir componente
code components/SaveButton.tsx

# 3. Identificar categoria (A/B/C)
# Verificar: mutations, async handlers, estados

# 4. Aplicar template correspondente
# Copiar template da documentação

# 5. Testar localmente
npm run dev
# Testar fluxo de sucesso e erro

# 6. Validar checklist
# Usar checklist de aprovação

# 7. Commit
git add components/SaveButton.tsx
git commit -m "feat(ux): adicionar feedback em SaveButton"

# 8. Push e PR
git push origin feat/feedback-ux-phase-1
gh pr create --title "feat(ux): Feedback visual - Lote 1"
```

---

## 📋 Checklist de Replicação

### **Para Cada Componente:**

```markdown
## Implementação de Feedback - [Nome do Componente]

### Pré-implementação:

- [ ] Componente identificado na lista
- [ ] Categoria definida (A/B/C)
- [ ] Template selecionado
- [ ] Backup criado (git)

### Implementação:

- [ ] Imports adicionados
- [ ] Estado de loading criado (se necessário)
- [ ] Handler modificado com toast
- [ ] Try/catch/finally implementado
- [ ] Botão modificado (disabled + spinner)

### Validação:

- [ ] Teste de sucesso OK
- [ ] Teste de erro OK
- [ ] Teste de múltiplos cliques OK
- [ ] Teste em mobile OK
- [ ] Funcionalidade original OK

### Finalização:

- [ ] Commit feito
- [ ] PR aberto
- [ ] Code review solicitado
- [ ] Aprovado e merged
```

---

## 🎯 Exemplo Completo de Replicação

### **Cenário: Botão "Deletar Projeto"**

#### **1. Identificação:**

- **Componente:** `components/projects/DeleteButton.tsx`
- **Categoria:** A (Simples)
- **Prioridade:** 20.5
- **Tempo estimado:** 8 minutos

#### **2. Implementação:**

```typescript
// ANTES
<Button onClick={() => handleDelete(projectId)}>
  Deletar
</Button>

// DEPOIS
import { AsyncButton } from '@/components/ui/async-button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const handleDelete = async (projectId: string) => {
  if (!confirm('Tem certeza que deseja deletar este projeto?')) {
    return;
  }

  const toastId = toast.loading('Deletando projeto...');

  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Projeto deletado com sucesso!', { duration: 3000 });
      router.push('/projects');
    } else {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao deletar projeto', { duration: 4000 });
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao deletar projeto', { duration: 4000 });
  }
};

<AsyncButton
  onClick={() => handleDelete(projectId)}
  loadingText="Deletando..."
  icon={<Trash2 className="mr-2 h-4 w-4" />}
  variant="destructive"
>
  Deletar
</AsyncButton>
```

#### **3. Validação:**

- ✅ Toast de loading aparece
- ✅ Confirmação antes de deletar
- ✅ Toast de sucesso/erro
- ✅ Redirect após sucesso
- ✅ Botão disabled durante processamento

#### **4. Commit:**

```bash
git commit -m "feat(ux): adicionar feedback em DeleteButton

- Adicionar AsyncButton
- Adicionar toast loading/success/error
- Adicionar confirmação antes de deletar
- Categoria: A (Simples)
- Tempo: 8 minutos
- Prioridade: 20.5

Closes #UX-015"
```

#### **5. Resultado:**

- ⏱️ **Tempo real:** 8 minutos
- ✅ **Aprovado:** Sim
- 🐛 **Bugs:** 0
- 📊 **Progresso:** 2/109 (1.8%)

---

## 🎉 Conclusão

Com este padrão de aprovação e replicação:

1. ✅ **Qualidade garantida** - Checklist rigoroso
2. ✅ **Velocidade** - Templates prontos
3. ✅ **Consistência** - Mesmo padrão em todos
4. ✅ **Escalabilidade** - Processo replicável
5. ✅ **Rastreabilidade** - Métricas e progresso

**Resultado:** 109 componentes com feedback visual de alta qualidade em 45 horas!

---

**Próximo documento:** `ROADMAP_EXECUCAO.md`

**Data:** 27/11/2025
