# 🗺️ ROADMAP DE IMPLEMENTAÇÃO
## Sistema de Inteligência de Mercado - Plano de Evolução

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Baseado em:** Auditoria Multidisciplinar

---

## 📋 VISÃO GERAL

### Estrutura do Roadmap
- **5 Fases** de implementação
- **8 Temas** principais
- **50+ Funcionalidades** a implementar
- **Timeline:** 5-7 meses
- **Investimento:** R$ 560k - R$ 870k

### Temas
1. 🔒 **Segurança** - Proteção e controle de acesso
2. ⚖️ **LGPD** - Conformidade legal
3. 📊 **Qualidade de Dados** - Governança e confiabilidade
4. 💻 **Experiência do Usuário** - Usabilidade e onboarding
5. 📈 **Inteligência Avançada** - Analytics e preditiva
6. 🎨 **Design** - Identidade visual e UI
7. 📋 **Governança** - Processos e SLA
8. 🔧 **Infraestrutura** - Performance e resiliência

---

# FASE 1: FUNDAÇÃO DE SEGURANÇA E LGPD
**Duração:** 4-6 semanas  
**Prioridade:** 🚨 CRÍTICA  
**Investimento:** R$ 150k - R$ 250k  
**Equipe:** 2 Backend Senior + 1 Especialista Segurança + 1 DBA

> **⚠️ BLOQUEIO DE PRODUÇÃO:** Não lançar sem completar esta fase

---

## TEMA 1: 🔒 SEGURANÇA

### 1.1 RBAC (Role-Based Access Control)

#### 📝 Descrição
Sistema completo de controle de acesso baseado em papéis e permissões granulares.

#### 🎯 Benefícios
- ✅ **Segurança:** Previne acesso não autorizado
- ✅ **Compliance:** Atende requisitos de auditoria
- ✅ **Segregação:** Separa responsabilidades
- ✅ **Rastreabilidade:** Identifica quem fez o quê
- ✅ **Escalabilidade:** Fácil adicionar novos papéis

#### 📊 Métricas de Sucesso
- 100% das rotas protegidas
- 0 acessos não autorizados
- Tempo de resposta < 50ms (overhead)
- 4 papéis implementados (Admin, Manager, Analyst, Viewer)
- 20+ permissões granulares

#### 🔧 Implementação

**Passo 1: Schema de Permissões**
```typescript
// shared/types/permissions.ts
export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

export enum Permission {
  // Projetos
  PROJETO_CREATE = 'projeto:create',
  PROJETO_READ = 'projeto:read',
  PROJETO_UPDATE = 'projeto:update',
  PROJETO_DELETE = 'projeto:delete',
  
  // Pesquisas
  PESQUISA_CREATE = 'pesquisa:create',
  PESQUISA_READ = 'pesquisa:read',
  PESQUISA_UPDATE = 'pesquisa:update',
  PESQUISA_DELETE = 'pesquisa:delete',
  PESQUISA_START = 'pesquisa:start',
  PESQUISA_STOP = 'pesquisa:stop',
  
  // Importação
  IMPORTACAO_CREATE = 'importacao:create',
  IMPORTACAO_READ = 'importacao:read',
  IMPORTACAO_DELETE = 'importacao:delete',
  
  // Enriquecimento
  ENRIQUECIMENTO_EXECUTE = 'enriquecimento:execute',
  ENRIQUECIMENTO_READ = 'enriquecimento:read',
  
  // Entidades
  ENTIDADE_READ = 'entidade:read',
  ENTIDADE_UPDATE = 'entidade:update',
  ENTIDADE_DELETE = 'entidade:delete',
  ENTIDADE_EXPORT = 'entidade:export',
  
  // Análises
  ANALISE_READ = 'analise:read',
  ANALISE_EXPORT = 'analise:export',
  
  // Administração
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  ROLE_MANAGE = 'role:manage',
  AUDIT_READ = 'audit:read',
  SETTINGS_MANAGE = 'settings:manage'
}

// Mapeamento role -> permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission), // Todas
  
  [Role.MANAGER]: [
    Permission.PROJETO_CREATE,
    Permission.PROJETO_READ,
    Permission.PROJETO_UPDATE,
    Permission.PROJETO_DELETE,
    Permission.PESQUISA_CREATE,
    Permission.PESQUISA_READ,
    Permission.PESQUISA_UPDATE,
    Permission.PESQUISA_DELETE,
    Permission.PESQUISA_START,
    Permission.PESQUISA_STOP,
    Permission.IMPORTACAO_CREATE,
    Permission.IMPORTACAO_READ,
    Permission.IMPORTACAO_DELETE,
    Permission.ENRIQUECIMENTO_EXECUTE,
    Permission.ENRIQUECIMENTO_READ,
    Permission.ENTIDADE_READ,
    Permission.ENTIDADE_UPDATE,
    Permission.ENTIDADE_EXPORT,
    Permission.ANALISE_READ,
    Permission.ANALISE_EXPORT,
    Permission.USER_READ
  ],
  
  [Role.ANALYST]: [
    Permission.PROJETO_READ,
    Permission.PESQUISA_READ,
    Permission.IMPORTACAO_READ,
    Permission.ENRIQUECIMENTO_READ,
    Permission.ENTIDADE_READ,
    Permission.ENTIDADE_EXPORT,
    Permission.ANALISE_READ,
    Permission.ANALISE_EXPORT
  ],
  
  [Role.VIEWER]: [
    Permission.PROJETO_READ,
    Permission.PESQUISA_READ,
    Permission.ENTIDADE_READ,
    Permission.ANALISE_READ
  ]
};
```

**Passo 2: Atualizar Schema do Banco**
```sql
-- Adicionar role na tabela users
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'viewer';

-- Criar índice
CREATE INDEX idx_users_role ON users(role);

-- Migrar usuários existentes (definir como admin temporariamente)
UPDATE users SET role = 'admin';
```

**Passo 3: Helper de Permissões**
```typescript
// server/helpers/permissions.ts
import { Role, Permission, ROLE_PERMISSIONS } from '@/shared/types/permissions';

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function getUserPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
```

**Passo 4: Middleware de Permissão**
```typescript
// server/middleware/auth.ts
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../routers/index';
import { Permission } from '@/shared/types/permissions';
import { hasPermission } from '../helpers/permissions';
import { db } from '../db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar autenticado'
    });
  }

  // Buscar usuário com role
  const user = await db.query.users.findFirst({
    where: eq(users.id, ctx.userId)
  });

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Usuário não encontrado'
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: user.role as Role
    }
  });
});

export function requirePermission(permission: Permission) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!hasPermission(ctx.userRole, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Você não tem permissão para: ${permission}`
      });
    }

    return next({ ctx });
  });
}

export function requireAnyPermission(...permissions: Permission[]) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const hasAny = permissions.some(p => hasPermission(ctx.userRole, p));
    
    if (!hasAny) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Você não tem permissão para esta ação'
      });
    }

    return next({ ctx });
  });
}
```

**Passo 5: Aplicar em Routers**
```typescript
// server/routers/projetos.ts
import { router } from './index';
import { requirePermission } from '../middleware/auth';
import { Permission } from '@/shared/types/permissions';
import { z } from 'zod';

export const projetosRouter = router({
  list: requirePermission(Permission.PROJETO_READ)
    .query(async ({ ctx }) => {
      // Listar projetos
    }),
  
  create: requirePermission(Permission.PROJETO_CREATE)
    .input(z.object({
      nome: z.string(),
      descricao: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Criar projeto
    }),
  
  update: requirePermission(Permission.PROJETO_UPDATE)
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Atualizar projeto
    }),
  
  delete: requirePermission(Permission.PROJETO_DELETE)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Deletar projeto
    })
});
```

**Passo 6: UI de Gerenciamento de Usuários**
```tsx
// client/src/pages/admin/UsersPage.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Role } from '@/shared/types/permissions';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';

export default function UsersPage() {
  const { data: users } = trpc.users.list.useQuery();
  const updateRole = trpc.users.updateRole.useMutation();

  const handleRoleChange = async (userId: number, newRole: Role) => {
    await updateRole.mutateAsync({ userId, role: newRole });
  };

  return (
    <div>
      <PageHeader title="Gerenciar Usuários" />
      
      <Table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Papel</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users?.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                >
                  <option value={Role.ADMIN}>Administrador</option>
                  <option value={Role.MANAGER}>Gerente</option>
                  <option value={Role.ANALYST}>Analista</option>
                  <option value={Role.VIEWER}>Visualizador</option>
                </Select>
              </td>
              <td>
                <Button variant="outline" size="sm">Editar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

#### ✅ Checklist de Implementação
- [ ] Criar enums de Role e Permission
- [ ] Atualizar schema do banco (role em users)
- [ ] Criar helpers de permissão
- [ ] Atualizar middleware de auth
- [ ] Aplicar em todos os routers
- [ ] Criar UI de gerenciamento
- [ ] Testar todos os cenários
- [ ] Documentar permissões

#### 📈 ROI Esperado
- **Segurança:** +95% (de 2/10 para 9/10)
- **Compliance:** +100% (atende auditoria)
- **Redução de risco:** Evita acessos não autorizados
- **Custo de implementação:** R$ 30k - R$ 50k
- **Tempo:** 1-2 semanas

---

### 1.2 RATE LIMITING

#### 📝 Descrição
Limitação de requisições por usuário/IP para prevenir abuso e ataques.

#### 🎯 Benefícios
- ✅ **Proteção DoS:** Previne ataques de negação de serviço
- ✅ **Brute Force:** Protege contra tentativas de invasão
- ✅ **Fair Use:** Garante recursos para todos
- ✅ **Custo:** Reduz custos de infraestrutura
- ✅ **Performance:** Mantém sistema responsivo

#### 📊 Métricas de Sucesso
- 0 ataques DoS bem-sucedidos
- < 5 tentativas de login por 15min
- 100 req/15min por usuário (geral)
- 10 req/min em APIs pesadas
- Tempo de resposta < 10ms (overhead)

#### 🔧 Implementação

**Passo 1: Instalar Dependências**
```bash
pnpm add express-rate-limit rate-limit-redis ioredis
pnpm add -D @types/express-rate-limit
```

**Passo 2: Configurar Redis**
```typescript
// server/lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});
```

**Passo 3: Criar Rate Limiters**
```typescript
// server/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis';

// Rate limiter global
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: {
    error: 'Muitas requisições, tente novamente mais tarde',
    retryAfter: 15 * 60 // segundos
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Função para gerar key (por usuário ou IP)
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip;
  }
});

// Rate limiter para login (proteção brute force)
export const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:login:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas
  skipSuccessfulRequests: true, // Não contar logins bem-sucedidos
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos',
    retryAfter: 15 * 60
  },
  keyGenerator: (req) => {
    // Por email + IP
    return `${req.body.email}:${req.ip}`;
  }
});

// Rate limiter para APIs pesadas
export const heavyApiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:heavy:'
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requisições
  message: {
    error: 'Limite de requisições excedido para esta API',
    retryAfter: 60
  },
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip;
  }
});

// Rate limiter para exportações
export const exportLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:export:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 exportações
  message: {
    error: 'Limite de exportações excedido. Tente novamente em 1 hora',
    retryAfter: 60 * 60
  }
});

// Rate limiter para importações
export const importLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:import:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 importações
  message: {
    error: 'Limite de importações excedido',
    retryAfter: 60 * 60
  }
});
```

**Passo 4: Aplicar no Express**
```typescript
// server/index.ts
import express from 'express';
import { globalLimiter, loginLimiter, heavyApiLimiter } from './middleware/rate-limit';

const app = express();

// Rate limiter global em todas as rotas
app.use('/api', globalLimiter);

// Rate limiters específicos
app.post('/api/auth/login', loginLimiter);
app.post('/api/enriquecimento/executar', heavyApiLimiter);
app.post('/api/analise/exportar', exportLimiter);
app.post('/api/importacao/upload', importLimiter);
```

**Passo 5: Tratamento de Erros no Frontend**
```typescript
// client/src/lib/trpc.ts
import { httpBatchLink } from '@trpc/client';
import { toast } from 'sonner';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      async headers() {
        return {
          authorization: `Bearer ${getToken()}`
        };
      },
      fetch(url, options) {
        return fetch(url, options).then(async (res) => {
          // Tratar rate limit
          if (res.status === 429) {
            const data = await res.json();
            const retryAfter = data.retryAfter || 60;
            
            toast.error(
              data.error || 'Muitas requisições',
              {
                description: `Tente novamente em ${Math.ceil(retryAfter / 60)} minutos`
              }
            );
          }
          
          return res;
        });
      }
    })
  ]
});
```

**Passo 6: Monitoramento**
```typescript
// server/lib/monitoring.ts
import { redis } from './redis';

export async function getRateLimitStats() {
  const keys = await redis.keys('rl:*');
  
  const stats = {
    global: 0,
    login: 0,
    heavy: 0,
    export: 0,
    import: 0
  };

  for (const key of keys) {
    const [, type] = key.split(':');
    const count = await redis.get(key);
    
    if (type in stats) {
      stats[type as keyof typeof stats] += parseInt(count || '0');
    }
  }

  return stats;
}

// Endpoint de monitoramento (apenas admin)
export const monitoringRouter = router({
  rateLimitStats: requirePermission(Permission.AUDIT_READ)
    .query(async () => {
      return getRateLimitStats();
    })
});
```

#### ✅ Checklist de Implementação
- [ ] Instalar dependências (Redis, rate-limit)
- [ ] Configurar Redis
- [ ] Criar rate limiters
- [ ] Aplicar no Express
- [ ] Tratar erros no frontend
- [ ] Criar monitoramento
- [ ] Testar cenários de limite
- [ ] Documentar limites

#### 📈 ROI Esperado
- **Segurança:** +80% (proteção DoS/brute force)
- **Disponibilidade:** +95% (previne sobrecarga)
- **Custo:** -30% (reduz uso de recursos)
- **Custo de implementação:** R$ 15k - R$ 25k
- **Tempo:** 3-5 dias

---

### 1.3 AUDITORIA COMPLETA

#### 📝 Descrição
Sistema de logs de todas as ações dos usuários para rastreabilidade e compliance.

#### 🎯 Benefícios
- ✅ **Rastreabilidade:** Saber quem fez o quê e quando
- ✅ **Compliance:** Atende requisitos de auditoria
- ✅ **Forensics:** Investigar incidentes
- ✅ **Detecção:** Identificar comportamentos suspeitos
- ✅ **Responsabilização:** Accountability

#### 📊 Métricas de Sucesso
- 100% das ações críticas logadas
- Retenção de 365 dias
- Tempo de consulta < 2s
- 0 logs perdidos
- Alertas em tempo real

#### 🔧 Implementação

**Passo 1: Schema de Auditoria**
```sql
-- Tabela de logs de auditoria
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- create, read, update, delete, export, login, logout
  resource_type VARCHAR(50) NOT NULL, -- projeto, pesquisa, entidade, user
  resource_id INTEGER,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  duration_ms INTEGER,
  status VARCHAR(20), -- success, error
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action, created_at DESC);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_status ON audit_log(status) WHERE status = 'error';

-- Particionamento por mês (opcional, para grandes volumes)
CREATE TABLE audit_log_2024_12 PARTITION OF audit_log
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

**Passo 2: Helper de Auditoria**
```typescript
// server/lib/audit.ts
import { db } from '../db';
import { auditLog } from '@/drizzle/schema';

export interface AuditLogEntry {
  userId: number;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login' | 'logout';
  resourceType: string;
  resourceId?: number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  duration?: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export async function createAuditLog(entry: AuditLogEntry) {
  try {
    await db.insert(auditLog).values({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
      newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      requestId: entry.requestId,
      durationMs: entry.duration,
      status: entry.status,
      errorMessage: entry.errorMessage
    });
  } catch (error) {
    // Não falhar a operação principal se auditoria falhar
    console.error('Failed to create audit log:', error);
  }
}

export async function getAuditLogs(filters: {
  userId?: number;
  resourceType?: string;
  resourceId?: number;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const { userId, resourceType, resourceId, action, startDate, endDate, limit = 100 } = filters;
  
  let query = db.select().from(auditLog);
  
  if (userId) query = query.where(eq(auditLog.userId, userId));
  if (resourceType) query = query.where(eq(auditLog.resourceType, resourceType));
  if (resourceId) query = query.where(eq(auditLog.resourceId, resourceId));
  if (action) query = query.where(eq(auditLog.action, action));
  if (startDate) query = query.where(gte(auditLog.createdAt, startDate));
  if (endDate) query = query.where(lte(auditLog.createdAt, endDate));
  
  return query.orderBy(desc(auditLog.createdAt)).limit(limit);
}
```

**Passo 3: Middleware de Auditoria**
```typescript
// server/middleware/audit.ts
import { protectedProcedure } from './auth';
import { createAuditLog } from '../lib/audit';

export const auditedProcedure = protectedProcedure.use(async ({ ctx, next, path, type }) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const result = await next({ ctx });
    
    // Log de sucesso
    await createAuditLog({
      userId: ctx.userId,
      action: type as any,
      resourceType: path.split('.')[0],
      ipAddress: ctx.req.ip,
      userAgent: ctx.req.headers['user-agent'],
      requestId,
      duration: Date.now() - startTime,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    // Log de erro
    await createAuditLog({
      userId: ctx.userId,
      action: type as any,
      resourceType: path.split('.')[0],
      ipAddress: ctx.req.ip,
      userAgent: ctx.req.headers['user-agent'],
      requestId,
      duration: Date.now() - startTime,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
});

// Auditoria detalhada (com before/after)
export function auditedMutation<T>(
  procedure: typeof protectedProcedure,
  options: {
    resourceType: string;
    getResourceId: (input: any) => number;
    getOldValue?: (input: any, ctx: any) => Promise<any>;
  }
) {
  return procedure.use(async ({ ctx, next, input }) => {
    const startTime = Date.now();
    const resourceId = options.getResourceId(input);
    
    // Buscar valor antigo (para update/delete)
    const oldValue = options.getOldValue 
      ? await options.getOldValue(input, ctx)
      : null;
    
    try {
      const result = await next({ ctx });
      
      // Log com before/after
      await createAuditLog({
        userId: ctx.userId,
        action: 'update',
        resourceType: options.resourceType,
        resourceId,
        oldValue,
        newValue: result,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
        duration: Date.now() - startTime,
        status: 'success'
      });
      
      return result;
    } catch (error) {
      await createAuditLog({
        userId: ctx.userId,
        action: 'update',
        resourceType: options.resourceType,
        resourceId,
        oldValue,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
        duration: Date.now() - startTime,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  });
}
```

**Passo 4: Aplicar em Routers**
```typescript
// server/routers/projetos.ts
import { auditedProcedure, auditedMutation } from '../middleware/audit';

export const projetosRouter = router({
  delete: auditedMutation(
    requirePermission(Permission.PROJETO_DELETE),
    {
      resourceType: 'projeto',
      getResourceId: (input) => input.id,
      getOldValue: async (input, ctx) => {
        return db.query.dimProjeto.findFirst({
          where: eq(dimProjeto.id, input.id)
        });
      }
    }
  )
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Deletar projeto
      await db.delete(dimProjeto).where(eq(dimProjeto.id, input.id));
      return { success: true };
    })
});
```

**Passo 5: UI de Auditoria**
```tsx
// client/src/pages/admin/AuditLogPage.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AuditLogPage() {
  const [filters, setFilters] = useState({
    userId: undefined,
    resourceType: undefined,
    action: undefined,
    startDate: undefined,
    endDate: undefined
  });

  const { data: logs } = trpc.audit.list.useQuery(filters);

  return (
    <div>
      <PageHeader title="Log de Auditoria" />
      
      {/* Filtros */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Select
          placeholder="Usuário"
          onChange={(e) => setFilters({ ...filters, userId: parseInt(e.target.value) })}
        >
          {/* Listar usuários */}
        </Select>
        
        <Select
          placeholder="Recurso"
          onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
        >
          <option value="projeto">Projeto</option>
          <option value="pesquisa">Pesquisa</option>
          <option value="entidade">Entidade</option>
        </Select>
        
        <Select
          placeholder="Ação"
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        >
          <option value="create">Criar</option>
          <option value="update">Atualizar</option>
          <option value="delete">Deletar</option>
          <option value="export">Exportar</option>
        </Select>
      </div>
      
      {/* Tabela */}
      <Table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Recurso</th>
            <th>Status</th>
            <th>Duração</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map(log => (
            <tr key={log.id}>
              <td>{format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}</td>
              <td>{log.user?.name}</td>
              <td>
                <Badge variant={getActionVariant(log.action)}>
                  {log.action}
                </Badge>
              </td>
              <td>{log.resourceType} #{log.resourceId}</td>
              <td>
                <Badge variant={log.status === 'success' ? 'success' : 'destructive'}>
                  {log.status}
                </Badge>
              </td>
              <td>{log.durationMs}ms</td>
              <td>
                <Button variant="ghost" size="sm" onClick={() => showDetails(log)}>
                  Ver
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

#### ✅ Checklist de Implementação
- [ ] Criar schema de auditoria
- [ ] Criar helper de auditoria
- [ ] Criar middleware de auditoria
- [ ] Aplicar em routers críticos
- [ ] Criar UI de visualização
- [ ] Configurar retenção
- [ ] Criar alertas
- [ ] Documentar eventos

#### 📈 ROI Esperado
- **Compliance:** +100% (atende auditoria)
- **Segurança:** +70% (detecção de anomalias)
- **Rastreabilidade:** +100%
- **Custo de implementação:** R$ 25k - R$ 40k
- **Tempo:** 1 semana

---

### 1.4 CRIPTOGRAFIA DE DADOS SENSÍVEIS

#### 📝 Descrição
Criptografia de dados pessoais (CNPJ, CPF, email, telefone) em repouso.

#### 🎯 Benefícios
- ✅ **Proteção:** Dados seguros mesmo em caso de breach
- ✅ **Compliance:** Atende LGPD e GDPR
- ✅ **Confiança:** Aumenta confiança dos clientes
- ✅ **Redução de Risco:** Minimiza impacto de vazamentos
- ✅ **Regulamentação:** Evita multas

#### 📊 Métricas de Sucesso
- 100% dos dados sensíveis criptografados
- Performance < 50ms overhead
- 0 vazamentos de dados em texto plano
- Chaves rotacionadas a cada 90 dias

#### 🔧 Implementação

**Passo 1: Configurar Chaves**
```typescript
// server/lib/encryption.ts
import crypto from 'crypto';

// Chave de criptografia (32 bytes para AES-256)
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = process.env.ENCRYPTION_SALT!;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Formato: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Hash one-way para busca (CNPJ, CPF)
export function hashPII(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value + SALT)
    .digest('hex');
}

// Verificar se valor corresponde ao hash
export function verifyPII(value: string, hash: string): boolean {
  return hashPII(value) === hash;
}
```

**Passo 2: Atualizar Schema**
```sql
-- Adicionar colunas criptografadas
ALTER TABLE dim_entidade 
  ADD COLUMN cnpj_hash VARCHAR(64),
  ADD COLUMN cnpj_encrypted TEXT,
  ADD COLUMN cpf_hash VARCHAR(64),
  ADD COLUMN cpf_encrypted TEXT,
  ADD COLUMN email_encrypted TEXT,
  ADD COLUMN telefone_encrypted TEXT;

-- Criar índices para busca por hash
CREATE INDEX idx_entidade_cnpj_hash ON dim_entidade(cnpj_hash);
CREATE INDEX idx_entidade_cpf_hash ON dim_entidade(cpf_hash);

-- Migrar dados existentes
UPDATE dim_entidade
SET 
  cnpj_hash = encode(digest(cnpj || '${SALT}', 'sha256'), 'hex'),
  cnpj_encrypted = cnpj, -- Será criptografado via script
  email_encrypted = email,
  telefone_encrypted = telefone
WHERE cnpj IS NOT NULL OR email IS NOT NULL OR telefone IS NOT NULL;

-- Remover colunas antigas (após migração)
-- ALTER TABLE dim_entidade DROP COLUMN cnpj;
-- ALTER TABLE dim_entidade DROP COLUMN email;
-- ALTER TABLE dim_entidade DROP COLUMN telefone;
```

**Passo 3: Script de Migração**
```typescript
// scripts/encrypt-existing-data.ts
import { db } from '../server/db';
import { dimEntidade } from '../drizzle/schema';
import { encrypt } from '../server/lib/encryption';

async function encryptExistingData() {
  const entidades = await db.select().from(dimEntidade);
  
  for (const entidade of entidades) {
    const updates: any = {};
    
    if (entidade.cnpj_encrypted && !entidade.cnpj_encrypted.includes(':')) {
      updates.cnpj_encrypted = encrypt(entidade.cnpj_encrypted);
    }
    
    if (entidade.email_encrypted && !entidade.email_encrypted.includes(':')) {
      updates.email_encrypted = encrypt(entidade.email_encrypted);
    }
    
    if (entidade.telefone_encrypted && !entidade.telefone_encrypted.includes(':')) {
      updates.telefone_encrypted = encrypt(entidade.telefone_encrypted);
    }
    
    if (Object.keys(updates).length > 0) {
      await db.update(dimEntidade)
        .set(updates)
        .where(eq(dimEntidade.id, entidade.id));
      
      console.log(`Encrypted entidade ${entidade.id}`);
    }
  }
  
  console.log('Encryption complete!');
}

encryptExistingData().catch(console.error);
```

**Passo 4: Helpers de Entidade**
```typescript
// server/dal/entidades.ts
import { encrypt, decrypt, hashPII } from '../lib/encryption';

export async function createEntidade(data: EntidadeInput) {
  return db.insert(dimEntidade).values({
    nome: data.nome,
    cnpj_hash: data.cnpj ? hashPII(data.cnpj) : null,
    cnpj_encrypted: data.cnpj ? encrypt(data.cnpj) : null,
    cpf_hash: data.cpf ? hashPII(data.cpf) : null,
    cpf_encrypted: data.cpf ? encrypt(data.cpf) : null,
    email_encrypted: data.email ? encrypt(data.email) : null,
    telefone_encrypted: data.telefone ? encrypt(data.telefone) : null
  });
}

export async function getEntidade(id: number) {
  const entidade = await db.query.dimEntidade.findFirst({
    where: eq(dimEntidade.id, id)
  });
  
  if (!entidade) return null;
  
  return {
    ...entidade,
    cnpj: entidade.cnpj_encrypted ? decrypt(entidade.cnpj_encrypted) : null,
    cpf: entidade.cpf_encrypted ? decrypt(entidade.cpf_encrypted) : null,
    email: entidade.email_encrypted ? decrypt(entidade.email_encrypted) : null,
    telefone: entidade.telefone_encrypted ? decrypt(entidade.telefone_encrypted) : null
  };
}

export async function searchByCNPJ(cnpj: string) {
  const hash = hashPII(cnpj);
  
  return db.query.dimEntidade.findFirst({
    where: eq(dimEntidade.cnpj_hash, hash)
  });
}
```

**Passo 5: Rotação de Chaves**
```typescript
// scripts/rotate-encryption-key.ts
import { db } from '../server/db';
import { dimEntidade } from '../drizzle/schema';
import { decrypt as oldDecrypt, encrypt as newEncrypt } from '../server/lib/encryption';

async function rotateKeys() {
  const entidades = await db.select().from(dimEntidade);
  
  for (const entidade of entidades) {
    const updates: any = {};
    
    // Descriptografar com chave antiga e criptografar com nova
    if (entidade.cnpj_encrypted) {
      const decrypted = oldDecrypt(entidade.cnpj_encrypted);
      updates.cnpj_encrypted = newEncrypt(decrypted);
    }
    
    if (entidade.email_encrypted) {
      const decrypted = oldDecrypt(entidade.email_encrypted);
      updates.email_encrypted = newEncrypt(decrypted);
    }
    
    if (entidade.telefone_encrypted) {
      const decrypted = oldDecrypt(entidade.telefone_encrypted);
      updates.telefone_encrypted = newEncrypt(decrypted);
    }
    
    if (Object.keys(updates).length > 0) {
      await db.update(dimEntidade)
        .set(updates)
        .where(eq(dimEntidade.id, entidade.id));
    }
  }
  
  console.log('Key rotation complete!');
}

// Agendar rotação a cada 90 dias
```

#### ✅ Checklist de Implementação
- [ ] Configurar chaves de criptografia
- [ ] Criar funções encrypt/decrypt
- [ ] Atualizar schema do banco
- [ ] Migrar dados existentes
- [ ] Atualizar DAL
- [ ] Implementar rotação de chaves
- [ ] Testar performance
- [ ] Documentar processo

#### 📈 ROI Esperado
- **Segurança:** +90% (proteção de dados)
- **Compliance:** +100% (LGPD)
- **Redução de risco:** Evita multas
- **Custo de implementação:** R$ 30k - R$ 50k
- **Tempo:** 1-2 semanas

---

## TEMA 2: ⚖️ LGPD COMPLIANCE

### 2.1 CONSENTIMENTO E PRIVACIDADE

#### 📝 Descrição
Sistema de gerenciamento de consentimentos e política de privacidade.

#### 🎯 Benefícios
- ✅ **Legal:** Conformidade com LGPD (obrigatório)
- ✅ **Transparência:** Usuário sabe o que é coletado
- ✅ **Controle:** Usuário decide o que compartilhar
- ✅ **Confiança:** Aumenta credibilidade
- ✅ **Evita Multas:** Até R$ 50 milhões

#### 📊 Métricas de Sucesso
- 100% dos usuários com consentimento registrado
- Política de privacidade aceita
- Taxa de opt-in > 80%
- 0 reclamações à ANPD

#### 🔧 Implementação

**Passo 1: Schema de Consentimentos**
```sql
-- Tabela de consentimentos
CREATE TABLE lgpd_consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  purpose VARCHAR(100) NOT NULL, -- marketing, analytics, profiling, sharing
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  version VARCHAR(20), -- Versão da política de privacidade
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consents_user ON lgpd_consents(user_id, purpose);
CREATE INDEX idx_consents_active ON lgpd_consents(user_id, purpose, granted) 
  WHERE granted = true AND revoked_at IS NULL;

-- Tabela de políticas de privacidade
CREATE TABLE privacy_policies (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir política inicial
INSERT INTO privacy_policies (version, content, effective_date) VALUES
('1.0', 'Política de Privacidade...', CURRENT_DATE);
```

**Passo 2: Middleware de Consentimento**
```typescript
// server/middleware/consent.ts
import { protectedProcedure } from './auth';
import { db } from '../db';
import { lgpdConsents } from '@/drizzle/schema';

export function requireConsent(purpose: string) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const consent = await db.query.lgpdConsents.findFirst({
      where: and(
        eq(lgpdConsents.userId, ctx.userId),
        eq(lgpdConsents.purpose, purpose),
        eq(lgpdConsents.granted, true),
        isNull(lgpdConsents.revokedAt)
      )
    });

    if (!consent) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Consentimento necessário para: ${purpose}`
      });
    }

    return next({ ctx });
  });
}
```

**Passo 3: Router de Consentimentos**
```typescript
// server/routers/lgpd.ts
export const lgpdRouter = router({
  // Listar consentimentos do usuário
  myConsents: protectedProcedure
    .query(async ({ ctx }) => {
      return db.query.lgpdConsents.findMany({
        where: eq(lgpdConsents.userId, ctx.userId),
        orderBy: desc(lgpdConsents.createdAt)
      });
    }),
  
  // Conceder consentimento
  grantConsent: protectedProcedure
    .input(z.object({
      purpose: z.enum(['marketing', 'analytics', 'profiling', 'sharing']),
      version: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      await db.insert(lgpdConsents).values({
        userId: ctx.userId,
        purpose: input.purpose,
        granted: true,
        grantedAt: new Date(),
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'],
        version: input.version
      });
      
      return { success: true };
    }),
  
  // Revogar consentimento
  revokeConsent: protectedProcedure
    .input(z.object({
      purpose: z.enum(['marketing', 'analytics', 'profiling', 'sharing'])
    }))
    .mutation(async ({ input, ctx }) => {
      await db.update(lgpdConsents)
        .set({ revokedAt: new Date() })
        .where(and(
          eq(lgpdConsents.userId, ctx.userId),
          eq(lgpdConsents.purpose, input.purpose),
          isNull(lgpdConsents.revokedAt)
        ));
      
      return { success: true };
    }),
  
  // Buscar política de privacidade
  privacyPolicy: publicProcedure
    .query(async () => {
      return db.query.privacyPolicies.findFirst({
        orderBy: desc(privacyPolicies.effectiveDate)
      });
    })
});
```

**Passo 4: UI de Consentimento**
```tsx
// client/src/components/ConsentModal.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Dialog } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export function ConsentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: policy } = trpc.lgpd.privacyPolicy.useQuery();
  const grantConsent = trpc.lgpd.grantConsent.useMutation();
  
  const [consents, setConsents] = useState({
    marketing: false,
    analytics: true, // Obrigatório para funcionamento
    profiling: false,
    sharing: false
  });

  const handleSubmit = async () => {
    for (const [purpose, granted] of Object.entries(consents)) {
      if (granted) {
        await grantConsent.mutateAsync({
          purpose: purpose as any,
          version: policy!.version
        });
      }
    }
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>Política de Privacidade e Consentimentos</Dialog.Title>
        </Dialog.Header>
        
        <div className="space-y-4">
          <div className="prose prose-sm max-h-96 overflow-y-auto">
            {policy?.content}
          </div>
          
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Gerenciar Consentimentos</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                checked={consents.analytics}
                disabled
              />
              <div>
                <p className="font-medium">Analytics (Obrigatório)</p>
                <p className="text-sm text-muted-foreground">
                  Necessário para funcionamento básico do sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                checked={consents.marketing}
                onCheckedChange={(checked) => 
                  setConsents({ ...consents, marketing: checked as boolean })
                }
              />
              <div>
                <p className="font-medium">Marketing</p>
                <p className="text-sm text-muted-foreground">
                  Envio de emails promocionais e novidades
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                checked={consents.profiling}
                onCheckedChange={(checked) => 
                  setConsents({ ...consents, profiling: checked as boolean })
                }
              />
              <div>
                <p className="font-medium">Perfilamento</p>
                <p className="text-sm text-muted-foreground">
                  Análise de comportamento para personalização
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox
                checked={consents.sharing}
                onCheckedChange={(checked) => 
                  setConsents({ ...consents, sharing: checked as boolean })
                }
              />
              <div>
                <p className="font-medium">Compartilhamento</p>
                <p className="text-sm text-muted-foreground">
                  Compartilhamento de dados com parceiros
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Dialog.Footer>
          <Button onClick={handleSubmit}>
            Aceitar e Continuar
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
```

**Passo 5: Página de Gerenciamento**
```tsx
// client/src/pages/settings/PrivacyPage.tsx
export default function PrivacyPage() {
  const { data: consents } = trpc.lgpd.myConsents.useQuery();
  const revokeConsent = trpc.lgpd.revokeConsent.useMutation();
  
  const handleRevoke = async (purpose: string) => {
    if (confirm('Tem certeza que deseja revogar este consentimento?')) {
      await revokeConsent.mutateAsync({ purpose: purpose as any });
    }
  };

  return (
    <div>
      <PageHeader title="Privacidade e Dados" />
      
      <Card>
        <Card.Header>
          <Card.Title>Meus Consentimentos</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {consents?.map(consent => (
              <div key={consent.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{consent.purpose}</p>
                  <p className="text-sm text-muted-foreground">
                    {consent.granted ? 'Concedido' : 'Revogado'} em{' '}
                    {format(new Date(consent.grantedAt || consent.revokedAt), 'dd/MM/yyyy')}
                  </p>
                </div>
                
                {consent.granted && !consent.revokedAt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(consent.purpose)}
                  >
                    Revogar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
```

#### ✅ Checklist de Implementação
- [ ] Criar schema de consentimentos
- [ ] Criar política de privacidade
- [ ] Criar middleware de consentimento
- [ ] Criar router de LGPD
- [ ] Criar modal de consentimento
- [ ] Criar página de gerenciamento
- [ ] Testar fluxos
- [ ] Documentar

#### 📈 ROI Esperado
- **Legal:** +100% (conformidade LGPD)
- **Confiança:** +60%
- **Evita multas:** R$ 50 milhões
- **Custo de implementação:** R$ 20k - R$ 35k
- **Tempo:** 1 semana

---

*[Continua na próxima parte do documento...]*

---

**📄 Este é um documento vivo que será atualizado conforme o progresso da implementação.**
