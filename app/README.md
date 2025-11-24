# App Directory

Este diretório contém as rotas e layouts do Next.js 14 usando o App Router.

## 📁 Estrutura

```
app/
├── (app)/         # Rotas da aplicação principal
├── (auth)/        # Rotas de autenticação
└── api/           # API routes
```

## 🛣️ Rotas

### (app)/

Rotas protegidas da aplicação principal.

- Layout compartilhado com sidebar
- Requer autenticação
- Dashboard, projetos, relatórios, etc.

### (auth)/

Rotas de autenticação.

- Login, registro, recuperação de senha
- Layout minimalista
- Públicas (sem autenticação)

### api/

API routes do Next.js.

- `/api/health` - Health check
- `/api/live` - Liveness probe
- `/api/ready` - Readiness probe
- `/api/metrics` - Métricas customizadas
- `/api/trpc/[trpc]` - tRPC handler

## 📝 Convenções

### Route Groups

Grupos de rotas usam parênteses `(group)` para organização sem afetar a URL.

```
(app)/dashboard/page.tsx  → /dashboard
(auth)/login/page.tsx     → /login
```

### Arquivos Especiais

- `page.tsx` - Componente da página
- `layout.tsx` - Layout compartilhado
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page

### Server vs Client Components

**Server Components (padrão):**

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData(); // Fetch no servidor
  return <Dashboard data={data} />;
}
```

**Client Components:**

```typescript
'use client'; // Diretiva necessária

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## 🔒 Autenticação

Rotas protegidas usam middleware para verificar autenticação:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession();

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

## 📊 Metadata

Cada página pode definir metadata para SEO:

```typescript
// app/dashboard/page.tsx
export const metadata: Metadata = {
  title: 'Dashboard | Intelmarket',
  description: 'Painel de controle do Intelmarket',
};
```

## 🎨 Layouts

Layouts são compartilhados entre rotas:

```typescript
// app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

## 🧪 Testes

Testes E2E para rotas estão em `e2e/`.

```bash
npm run test:e2e
```

## 📚 Documentação

Para mais detalhes:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
