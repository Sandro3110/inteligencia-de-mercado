# Components

Este diretório contém todos os componentes React do projeto.

## 📁 Estrutura

```
components/
├── ui/                    # Componentes base do Shadcn/UI
├── analytics/             # Componentes de analytics
├── detail-popup/          # Popups de detalhes
├── export/                # Componentes de exportação
├── maps/                  # Componentes de mapas
├── projects/              # Componentes de projetos
├── reports/               # Componentes de relatórios
├── research-wizard/       # Wizard de pesquisa
├── skeletons/             # Loading skeletons
└── tabs/                  # Componentes de tabs
```

## 🎨 Componentes UI (Shadcn/UI)

Os componentes em `ui/` são baseados no [Shadcn/UI](https://ui.shadcn.com/) e seguem os padrões:

- **Composable:** Componentes podem ser compostos
- **Accessible:** Seguem WAI-ARIA guidelines
- **Customizable:** Podem ser customizados via Tailwind
- **Type-safe:** 100% TypeScript

### Componentes Disponíveis

- `Button` - Botões com variantes
- `Input` - Campos de input
- `Card` - Cards com header/footer
- `Badge` - Badges e tags
- `Select` - Dropdowns
- `Dialog` - Modais
- `Accordion` - Acordeões
- E mais...

## 📝 Uso

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <Button variant="default">Click me</Button>
    </Card>
  );
}
```

## 🧪 Testes

Componentes críticos possuem testes em `src/components/__tests__/`.

Para executar os testes:

```bash
npm test
```

## 📚 Documentação

Para mais detalhes sobre componentes específicos, consulte:

- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
