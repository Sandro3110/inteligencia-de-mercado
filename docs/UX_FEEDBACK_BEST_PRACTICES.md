# 🎨 Guia de Boas Práticas - Feedback Visual (UX)

## 📊 Auditoria Atual

**Data:** 27/11/2025

### Estatísticas:

- **Total de componentes:** 163
- **Componentes com toast:** 23 (14%)
- **Componentes com loading:** 31 (19%)
- **Componentes SEM feedback adequado:** ~109 (67%)

### ⚠️ Problema Identificado:

**67% dos componentes** não têm feedback visual adequado para ações assíncronas!

---

## 🎯 Lições Aprendidas

### Caso Real: Página `/admin/users`

#### ❌ **ANTES (Problema):**

```typescript
const handleApprove = async (userId: string) => {
  const response = await fetch(`/api/admin/users/${userId}/approve`, {
    method: 'POST',
  });

  if (response.ok) {
    fetchUsers(); // Sem feedback!
  }
};

// Botão sem estado
<Button onClick={() => handleApprove(user.id)}>
  Aprovar
</Button>
```

**Problemas:**

- ❌ Usuário não sabe se clicou
- ❌ Pode clicar múltiplas vezes
- ❌ Não sabe se deu certo ou errado
- ❌ Não sabe quando terminou

#### ✅ **DEPOIS (Solução):**

```typescript
const [processingUserId, setProcessingUserId] = useState<string | null>(null);

const handleApprove = async (userId: string) => {
  setProcessingUserId(userId);
  const toastId = toast.loading('Aprovando usuário...');

  try {
    const response = await fetch(`/api/admin/users/${userId}/approve`, {
      method: 'POST',
    });

    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Usuário aprovado com sucesso!', { duration: 3000 });
      await fetchUsers();
    } else {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao aprovar usuário', { duration: 4000 });
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao aprovar usuário', { duration: 4000 });
  } finally {
    setProcessingUserId(null);
  }
};

// Botão com estado
<Button
  onClick={() => handleApprove(user.id)}
  disabled={processingUserId === user.id}
>
  {processingUserId === user.id ? (
    <>
      <Spinner className="mr-2" />
      Processando...
    </>
  ) : (
    <>
      <CheckCircle className="mr-2" />
      Aprovar
    </>
  )}
</Button>
```

**Benefícios:**

- ✅ Feedback imediato (toast loading)
- ✅ Botão disabled (previne cliques múltiplos)
- ✅ Spinner visual no botão
- ✅ Mensagem de sucesso/erro clara
- ✅ Duração apropriada dos toasts

---

## 📋 Checklist de Boas Práticas

### ✅ Para TODA ação assíncrona (fetch, mutation):

#### 1. **Estado de Loading**

```typescript
const [isLoading, setIsLoading] = useState(false);
// ou
const [processingId, setProcessingId] = useState<string | null>(null);
```

#### 2. **Toast de Loading**

```typescript
const toastId = toast.loading('Processando...');
```

#### 3. **Try/Catch/Finally**

```typescript
try {
  // ação
} catch (error) {
  // erro
} finally {
  setIsLoading(false); // SEMPRE limpar estado
}
```

#### 4. **Toast de Sucesso**

```typescript
toast.dismiss(toastId);
toast.success('✅ Ação concluída com sucesso!', { duration: 3000 });
```

#### 5. **Toast de Erro**

```typescript
toast.dismiss(toastId);
toast.error('❌ Erro ao processar', { duration: 4000 });
```

#### 6. **Botão Disabled**

```typescript
<Button disabled={isLoading}>
  {isLoading ? 'Processando...' : 'Salvar'}
</Button>
```

#### 7. **Spinner Visual**

```typescript
{isLoading && <Spinner className="animate-spin" />}
```

---

## 🎨 Padrões Recomendados

### **Padrão 1: Ação Simples (Salvar, Criar, Deletar)**

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  const toastId = toast.loading('Salvando...');

  try {
    const response = await fetch('/api/resource', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Salvo com sucesso!');
      router.push('/success-page');
    } else {
      const error = await response.json();
      toast.dismiss(toastId);
      toast.error(`❌ ${error.message}`);
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao salvar');
  } finally {
    setIsLoading(false);
  }
};

return (
  <Button onClick={handleSave} disabled={isLoading}>
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Salvando...
      </>
    ) : (
      <>
        <Save className="mr-2 h-4 w-4" />
        Salvar
      </>
    )}
  </Button>
);
```

### **Padrão 2: Ação em Lista (Aprovar, Rejeitar, Deletar Item)**

```typescript
const [processingId, setProcessingId] = useState<string | null>(null);

const handleAction = async (itemId: string) => {
  setProcessingId(itemId);
  const toastId = toast.loading('Processando...');

  try {
    const response = await fetch(`/api/items/${itemId}/action`, {
      method: 'POST',
    });

    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Ação concluída!');
      await refetchList();
    } else {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao processar');
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao processar');
  } finally {
    setProcessingId(null);
  }
};

return items.map(item => (
  <Button
    key={item.id}
    onClick={() => handleAction(item.id)}
    disabled={processingId === item.id}
  >
    {processingId === item.id ? 'Processando...' : 'Ação'}
  </Button>
));
```

### **Padrão 3: Formulário**

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  const toastId = toast.loading('Enviando formulário...');

  try {
    const response = await fetch('/api/form', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      toast.dismiss(toastId);
      toast.success('✅ Formulário enviado com sucesso!');
      resetForm();
    } else {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao enviar formulário');
    }
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('❌ Erro ao enviar formulário');
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* campos */}
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Enviando...' : 'Enviar'}
    </Button>
  </form>
);
```

---

## 🎯 Durações Recomendadas

| Tipo        | Duração     | Razão                                              |
| ----------- | ----------- | -------------------------------------------------- |
| **Sucesso** | 3000ms (3s) | Tempo suficiente para ler, não irritante           |
| **Erro**    | 4000ms (4s) | Usuário precisa de mais tempo para entender o erro |
| **Info**    | 3000ms (3s) | Informação rápida                                  |
| **Loading** | Infinito    | Até ser dismissado manualmente                     |

---

## ❌ Erros Comuns

### 1. **Toast sem ID (duplicação)**

```typescript
// ❌ ERRADO
toast.loading('Carregando...');
toast.dismiss(); // Dismiss todos!

// ✅ CORRETO
const toastId = toast.loading('Carregando...');
toast.dismiss(toastId); // Dismiss apenas este
```

### 2. **Não limpar estado no finally**

```typescript
// ❌ ERRADO
try {
  await action();
  setIsLoading(false);
} catch (error) {
  setIsLoading(false); // Duplicado!
}

// ✅ CORRETO
try {
  await action();
} catch (error) {
  // tratar erro
} finally {
  setIsLoading(false); // Uma vez só!
}
```

### 3. **Botão sem disabled**

```typescript
// ❌ ERRADO
<Button onClick={handleSave}>Salvar</Button>
// Pode clicar múltiplas vezes!

// ✅ CORRETO
<Button onClick={handleSave} disabled={isLoading}>
  Salvar
</Button>
```

### 4. **Toast sem emoji**

```typescript
// ❌ ERRADO
toast.success('Salvo com sucesso');

// ✅ CORRETO
toast.success('✅ Salvo com sucesso!');
```

---

## 🔧 Componente Reutilizável

Veja `components/ui/async-button.tsx` para um botão com loading integrado.

---

## 📊 Próximos Passos

1. ✅ Auditar todos os componentes
2. ⏳ Criar componente `AsyncButton` reutilizável
3. ⏳ Refatorar componentes sem feedback
4. ⏳ Adicionar testes de UX

---

## 🎓 Referências

- [Sonner Toast Documentation](https://sonner.emilkowal.ski/)
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)
- [React Loading Patterns](https://kentcdodds.com/blog/stop-using-isloading-booleans)

---

**Última atualização:** 27/11/2025  
**Autor:** Sistema de Auditoria Automática
