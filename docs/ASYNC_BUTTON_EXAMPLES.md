# AsyncButton - Exemplos de Uso

## 📖 Componente Reutilizável para Ações Assíncronas

O `AsyncButton` é um componente que gerencia automaticamente o estado de loading, eliminando a necessidade de criar estados `isLoading` manualmente.

---

## ✅ Exemplo 1: Botão de Salvar Simples

```tsx
import { AsyncButton } from '@/components/ui/async-button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

function SaveButton() {
  const handleSave = async () => {
    const toastId = toast.loading('Salvando...');

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(data),
      });

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

  return (
    <AsyncButton
      onClick={handleSave}
      loadingText="Salvando..."
      icon={<Save className="mr-2 h-4 w-4" />}
    >
      Salvar
    </AsyncButton>
  );
}
```

---

## ✅ Exemplo 2: Botão de Deletar com Confirmação

```tsx
import { AsyncButton } from '@/components/ui/async-button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function DeleteButton({ itemId }: { itemId: string }) {
  const handleDelete = async () => {
    // Confirmação
    if (!confirm('Tem certeza que deseja deletar?')) {
      return;
    }

    const toastId = toast.loading('Deletando...');

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.dismiss(toastId);
        toast.success('✅ Deletado com sucesso!');
      } else {
        toast.dismiss(toastId);
        toast.error('❌ Erro ao deletar');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao deletar');
    }
  };

  return (
    <AsyncButton
      onClick={handleDelete}
      loadingText="Deletando..."
      icon={<Trash2 className="mr-2 h-4 w-4" />}
      variant="destructive"
    >
      Deletar
    </AsyncButton>
  );
}
```

---

## ✅ Exemplo 3: Botão de Aprovar (Caso Real)

```tsx
import { AsyncButton } from '@/components/ui/async-button';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function ApproveButton({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const handleApprove = async () => {
    const toastId = toast.loading('Aprovando usuário...');

    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(toastId);
        toast.success('✅ Usuário aprovado com sucesso!', { duration: 3000 });
        onSuccess();
      } else {
        toast.dismiss(toastId);
        toast.error(`❌ ${data.error || 'Erro ao aprovar usuário'}`, { duration: 4000 });
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao aprovar usuário', { duration: 4000 });
    }
  };

  return (
    <AsyncButton
      onClick={handleApprove}
      loadingText="Aprovando..."
      icon={<CheckCircle className="mr-2 h-4 w-4" />}
      variant="default"
    >
      Aprovar
    </AsyncButton>
  );
}
```

---

## ✅ Exemplo 4: Botão Icon Only (Apenas Ícone)

```tsx
import { AsyncButton } from '@/components/ui/async-button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

function RefreshButton() {
  const handleRefresh = async () => {
    await fetch('/api/refresh', { method: 'POST' });
    toast.success('✅ Atualizado!');
  };

  return (
    <AsyncButton
      onClick={handleRefresh}
      icon={<RefreshCw className="h-4 w-4" />}
      iconOnly={true}
      variant="outline"
      size="icon"
    />
  );
}
```

---

## ✅ Exemplo 5: Botão em Formulário

```tsx
import { AsyncButton } from '@/components/ui/async-button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Enviando...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.dismiss(toastId);
        toast.success('✅ Mensagem enviada!');
        setFormData({ name: '', email: '' });
      } else {
        toast.dismiss(toastId);
        toast.error('❌ Erro ao enviar');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('❌ Erro ao enviar');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nome"
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <AsyncButton
        onClick={async () => await handleSubmit(new Event('submit') as any)}
        loadingText="Enviando..."
        icon={<Send className="mr-2 h-4 w-4" />}
        type="submit"
      >
        Enviar
      </AsyncButton>
    </form>
  );
}
```

---

## 🎨 Props Disponíveis

| Prop          | Tipo                  | Padrão             | Descrição                        |
| ------------- | --------------------- | ------------------ | -------------------------------- |
| `onClick`     | `() => Promise<void>` | **obrigatório**    | Função assíncrona a executar     |
| `loadingText` | `string`              | `"Processando..."` | Texto durante loading            |
| `icon`        | `React.ReactNode`     | `undefined`        | Ícone quando NÃO está em loading |
| `iconOnly`    | `boolean`             | `false`            | Se true, mostra apenas spinner   |
| `disabled`    | `boolean`             | `false`            | Desabilita o botão               |
| `variant`     | `ButtonVariant`       | `"default"`        | Variante do botão shadcn         |
| `size`        | `ButtonSize`          | `"default"`        | Tamanho do botão shadcn          |
| `className`   | `string`              | `""`               | Classes CSS adicionais           |

---

## ✅ Vantagens

1. **Menos código:** Não precisa criar `useState` para loading
2. **Consistência:** Todos os botões têm o mesmo comportamento
3. **Previne cliques múltiplos:** Automaticamente disabled durante loading
4. **Spinner padrão:** Sempre mostra feedback visual
5. **Reutilizável:** Use em qualquer lugar

---

## ❌ Quando NÃO usar

- Quando precisa de controle fino do estado de loading (ex: loading de múltiplos itens)
- Quando o loading precisa ser compartilhado entre componentes
- Quando precisa de lógica complexa de loading

Nesses casos, use o padrão manual com `useState`.

---

## 🔄 Migração

### Antes:

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await fetch('/api/save', { method: 'POST' });
  } finally {
    setIsLoading(false);
  }
};

<Button onClick={handleSave} disabled={isLoading}>
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>;
```

### Depois:

```tsx
const handleSave = async () => {
  await fetch('/api/save', { method: 'POST' });
};

<AsyncButton onClick={handleSave} loadingText="Salvando...">
  Salvar
</AsyncButton>;
```

**3 linhas → 1 linha!** 🎉

---

**Última atualização:** 27/11/2025
