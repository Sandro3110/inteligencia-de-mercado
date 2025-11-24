# Server

Este diretório contém a lógica de backend do projeto.

## 📁 Estrutura

```
server/
├── _core/         # Core utilities e configurações
├── integrations/  # Integrações com serviços externos
├── lib/           # Bibliotecas compartilhadas
├── renderers/     # Renderizadores (PDF, Excel, etc.)
├── routers/       # tRPC routers
├── scripts/       # Scripts de backend
├── services/      # Business logic
└── utils/         # Utility functions
```

## 🔧 Componentes

### routers/

Rotas tRPC que expõem APIs type-safe.

```typescript
// server/routers/projects.ts
export const projectsRouter = router({
  list: publicProcedure.query(async () => {
    return await db.select().from(projects);
  }),
});
```

### services/

Lógica de negócio organizada por domínio.

```typescript
// server/services/projects/create.ts
export async function createProject(data: CreateProjectInput) {
  // Business logic here
}
```

### integrations/

Integrações com APIs e serviços externos.

```typescript
// server/integrations/google-maps.ts
export async function geocodeAddress(address: string) {
  // Google Maps API integration
}
```

### renderers/

Renderizadores para diferentes formatos.

```typescript
// server/renderers/ExcelRenderer.ts
export class ExcelRenderer {
  async render(data: any[]) {
    // Excel generation logic
  }
}
```

## 📝 Convenções

- **Routers:** Um arquivo por domínio (projects, users, etc.)
- **Services:** Organizar por domínio e funcionalidade
- **Naming:** camelCase para funções, PascalCase para classes
- **Exports:** Named exports
- **Types:** Compartilhar via `lib/types/`

## 🔐 Segurança

- **Validação:** Usar Zod para validar inputs
- **Autorização:** Verificar permissões em cada rota
- **Rate Limiting:** Implementar em rotas públicas
- **Sanitização:** Sanitizar inputs do usuário

```typescript
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const projectsRouter = router({
  create: protectedProcedure.input(createProjectSchema).mutation(async ({ input, ctx }) => {
    // Validated and type-safe input
    return await createProject(input, ctx.user);
  }),
});
```

## 🧪 Testes

Testes de backend estão em `server/__tests__/`.

```bash
npm test
```

## 📚 Documentação

Para mais detalhes:

- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)
