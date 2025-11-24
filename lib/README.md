# Lib

Este diretório contém utilitários, hooks, e configurações compartilhadas.

## 📁 Estrutura

```
lib/
├── auth/          # Autenticação e autorização
├── db/            # Database utilities
├── hooks/         # Custom React hooks
├── middleware/    # Middleware functions
├── monitoring/    # Monitoring e alertas
├── trpc/          # tRPC client/server config
├── types/         # TypeScript types compartilhados
└── utils/         # Utility functions
```

## 🔧 Utilitários

### auth/

Funções de autenticação e autorização com Supabase.

```typescript
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
```

### hooks/

Custom React hooks reutilizáveis.

```typescript
import { useDialogComposition } from '@/lib/hooks';

const dialog = useDialogComposition();
```

### monitoring/

Sistema de monitoramento com Sentry, métricas e alertas.

```typescript
import { captureError } from '@/lib/monitoring/alerts';
import { recordMetric } from '@/lib/monitoring/metrics';

captureError(error, { context: 'payment' });
recordMetric('business', 'order_completed', 1);
```

### trpc/

Configuração do tRPC para APIs type-safe.

```typescript
import { trpc } from '@/lib/trpc/client';

const { data } = trpc.projects.list.useQuery();
```

### utils/

Funções utilitárias gerais.

```typescript
import { cn } from '@/lib/utils';

const className = cn('base-class', condition && 'conditional-class');
```

## 📝 Convenções

- **Nomes de arquivos:** camelCase ou kebab-case
- **Exports:** Named exports preferencialmente
- **Types:** Definir em arquivos `.ts` separados quando compartilhados
- **Testes:** Criar testes para funções críticas

## 🧪 Testes

Utilitários críticos possuem testes em `src/__tests__/`.

```bash
npm test
```

## 📚 Documentação

Para mais detalhes:

- [tRPC Documentation](https://trpc.io/)
- [Sentry Documentation](https://docs.sentry.io/)
