# 🎯 PLANO DE EXECUÇÃO CRONOLÓGICO
## Implementação Incremental e Segura

**Princípios:**
- ✅ Não quebrar funcionalidades existentes
- ✅ Implementação incremental (uma sessão por vez)
- ✅ Testes após cada sessão
- ✅ Rollback disponível
- ✅ Foco em segurança e governança

---

## 📋 ESTRUTURA DO PLANO

### **5 FASES** | **20 SESSÕES** | **60+ ATIVIDADES**

**Timeline:** 20-24 semanas (5-6 meses)  
**Investimento:** R$ 560k - R$ 870k  
**Equipe:** 2-3 devs + 1 DBA + 1 segurança

---

# FASE 1: FUNDAÇÃO DE SEGURANÇA
**Duração:** 6 semanas  
**Objetivo:** Tornar a aplicação segura e auditável  
**Prioridade:** 🚨 CRÍTICA

---

## SESSÃO 1.1: PREPARAÇÃO DO AMBIENTE
**Duração:** 3 dias  
**Objetivo:** Preparar infraestrutura para segurança

### Atividades

#### 1.1.1 Configurar Redis para Rate Limiting
```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Configurar Redis
sudo nano /etc/redis/redis.conf
# Descomentar: bind 127.0.0.1
# Alterar: maxmemory 256mb
# Alterar: maxmemory-policy allkeys-lru

# Reiniciar
sudo systemctl restart redis
sudo systemctl enable redis

# Testar
redis-cli ping
# Deve retornar: PONG
```

**Checklist:**
- [ ] Redis instalado
- [ ] Redis configurado
- [ ] Redis iniciando automaticamente
- [ ] Conexão testada

---

#### 1.1.2 Gerar Chaves de Criptografia
```bash
# Gerar chave de criptografia (32 bytes para AES-256)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar salt
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Adicionar ao .env
echo "ENCRYPTION_KEY=<chave_gerada>" >> .env
echo "ENCRYPTION_SALT=<salt_gerado>" >> .env
```

**Checklist:**
- [ ] Chave gerada
- [ ] Salt gerado
- [ ] Variáveis adicionadas ao .env
- [ ] .env no .gitignore

---

#### 1.1.3 Criar Branch de Desenvolvimento
```bash
# Criar branch para FASE 1
git checkout -b fase-1-seguranca

# Criar estrutura de pastas
mkdir -p server/middleware
mkdir -p server/lib
mkdir -p shared/types
mkdir -p scripts

# Commit inicial
git add .
git commit -m "chore: Preparar ambiente para FASE 1 - Segurança"
```

**Checklist:**
- [ ] Branch criada
- [ ] Estrutura de pastas criada
- [ ] Commit realizado

---

#### 1.1.4 Backup do Banco de Dados
```bash
# Criar backup antes de qualquer mudança
pg_dump -h localhost -U postgres -d inteligencia_mercado > backup_pre_fase1_$(date +%Y%m%d).sql

# Comprimir
gzip backup_pre_fase1_$(date +%Y%m%d).sql

# Mover para pasta segura
mv backup_pre_fase1_*.sql.gz ~/backups/
```

**Checklist:**
- [ ] Backup criado
- [ ] Backup comprimido
- [ ] Backup armazenado

---

**Resultado da Sessão 1.1:**
- ✅ Ambiente preparado
- ✅ Chaves geradas
- ✅ Branch criada
- ✅ Backup realizado

**Tempo:** 3 dias  
**Risco:** Baixo

---

## SESSÃO 1.2: IMPLEMENTAR RBAC (Parte 1 - Backend)
**Duração:** 5 dias  
**Objetivo:** Criar sistema de permissões

### Atividades

#### 1.2.1 Criar Types de Permissões
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
  
  // Importação
  IMPORTACAO_CREATE = 'importacao:create',
  IMPORTACAO_READ = 'importacao:read',
  
  // Enriquecimento
  ENRIQUECIMENTO_EXECUTE = 'enriquecimento:execute',
  
  // Entidades
  ENTIDADE_READ = 'entidade:read',
  ENTIDADE_UPDATE = 'entidade:update',
  ENTIDADE_DELETE = 'entidade:delete',
  ENTIDADE_EXPORT = 'entidade:export',
  
  // Análises
  ANALISE_READ = 'analise:read',
  ANALISE_EXPORT = 'analise:export',
  
  // Admin
  USER_MANAGE = 'user:manage',
  ROLE_MANAGE = 'role:manage',
  AUDIT_READ = 'audit:read'
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  
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
    Permission.IMPORTACAO_CREATE,
    Permission.IMPORTACAO_READ,
    Permission.ENRIQUECIMENTO_EXECUTE,
    Permission.ENTIDADE_READ,
    Permission.ENTIDADE_UPDATE,
    Permission.ENTIDADE_EXPORT,
    Permission.ANALISE_READ,
    Permission.ANALISE_EXPORT
  ],
  
  [Role.ANALYST]: [
    Permission.PROJETO_READ,
    Permission.PESQUISA_READ,
    Permission.IMPORTACAO_READ,
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

**Checklist:**
- [ ] Arquivo criado
- [ ] Enums definidos
- [ ] Mapeamento role->permissions criado
- [ ] Sem erros TypeScript

---

#### 1.2.2 Atualizar Schema do Banco
```sql
-- drizzle/migrations/0003_add_rbac.sql

-- Adicionar coluna role
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'viewer';

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Migrar usuários existentes para admin (temporário)
UPDATE users 
SET role = 'admin' 
WHERE role IS NULL OR role = '';

-- Adicionar constraint
ALTER TABLE users
  ADD CONSTRAINT check_role 
  CHECK (role IN ('admin', 'manager', 'analyst', 'viewer'));
```

**Executar migração:**
```bash
# Criar arquivo de migração
cat > drizzle/migrations/0003_add_rbac.sql << 'EOF'
-- SQL acima
EOF

# Executar
pnpm db:push

# Verificar
psql -d inteligencia_mercado -c "SELECT id, name, email, role FROM users LIMIT 5;"
```

**Checklist:**
- [ ] Migration criada
- [ ] Migration executada
- [ ] Coluna role adicionada
- [ ] Índice criado
- [ ] Constraint adicionado
- [ ] Dados migrados
- [ ] Verificação realizada

---

#### 1.2.3 Atualizar Schema Drizzle
```typescript
// drizzle/schema.ts

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name'),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('viewer'), // NOVO
  created_at: timestamp('created_at').defaultNow(),
});
```

**Checklist:**
- [ ] Schema atualizado
- [ ] Sem erros TypeScript
- [ ] Build passando

---

#### 1.2.4 Criar Helper de Permissões
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

**Checklist:**
- [ ] Arquivo criado
- [ ] Funções implementadas
- [ ] Sem erros TypeScript

---

#### 1.2.5 Atualizar Middleware de Auth
```typescript
// server/middleware/auth.ts
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../routers/index';
import { Permission, Role } from '@/shared/types/permissions';
import { hasPermission } from '../helpers/permissions';
import { db } from '../db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// Procedure protegido (requer autenticação)
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

// Procedure que requer permissão específica
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

// Procedure que requer qualquer uma das permissões
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

**Checklist:**
- [ ] Middleware atualizado
- [ ] protectedProcedure busca role
- [ ] requirePermission implementado
- [ ] requireAnyPermission implementado
- [ ] Sem erros TypeScript

---

#### 1.2.6 Testar RBAC Backend
```typescript
// server/routers/__tests__/rbac.test.ts
import { describe, it, expect } from 'vitest';
import { hasPermission } from '../helpers/permissions';
import { Role, Permission } from '@/shared/types/permissions';

describe('RBAC', () => {
  it('Admin deve ter todas as permissões', () => {
    expect(hasPermission(Role.ADMIN, Permission.PROJETO_CREATE)).toBe(true);
    expect(hasPermission(Role.ADMIN, Permission.USER_MANAGE)).toBe(true);
  });
  
  it('Viewer não deve poder criar projetos', () => {
    expect(hasPermission(Role.VIEWER, Permission.PROJETO_CREATE)).toBe(false);
  });
  
  it('Manager deve poder criar projetos', () => {
    expect(hasPermission(Role.MANAGER, Permission.PROJETO_CREATE)).toBe(true);
  });
  
  it('Analyst não deve poder deletar entidades', () => {
    expect(hasPermission(Role.ANALYST, Permission.ENTIDADE_DELETE)).toBe(false);
  });
});
```

**Executar testes:**
```bash
pnpm test rbac
```

**Checklist:**
- [ ] Testes criados
- [ ] Todos os testes passando
- [ ] Cobertura > 80%

---

**Resultado da Sessão 1.2:**
- ✅ RBAC implementado no backend
- ✅ Migrations executadas
- ✅ Testes passando
- ✅ Sem quebras

**Tempo:** 5 dias  
**Risco:** Médio

---

## SESSÃO 1.3: IMPLEMENTAR RBAC (Parte 2 - Aplicar em Routers)
**Duração:** 4 dias  
**Objetivo:** Proteger todas as rotas

### Atividades

#### 1.3.1 Atualizar Router de Projetos
```typescript
// server/routers/projetos.ts
import { router } from './index';
import { requirePermission } from '../middleware/auth';
import { Permission } from '@/shared/types/permissions';
import { z } from 'zod';

export const projetosRouter = router({
  list: requirePermission(Permission.PROJETO_READ)
    .query(async ({ ctx }) => {
      // Código existente
    }),
  
  create: requirePermission(Permission.PROJETO_CREATE)
    .input(z.object({
      nome: z.string(),
      codigo: z.string().optional(),
      descricao: z.string().optional(),
      centroCusto: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Código existente
    }),
  
  update: requirePermission(Permission.PROJETO_UPDATE)
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Código existente
    }),
  
  delete: requirePermission(Permission.PROJETO_DELETE)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Código existente
    })
});
```

**Checklist:**
- [ ] Todas as procedures protegidas
- [ ] Permissões corretas
- [ ] Código existente preservado
- [ ] Sem erros TypeScript

---

#### 1.3.2 Atualizar Router de Pesquisas
```typescript
// server/routers/pesquisas.ts
export const pesquisasRouter = router({
  list: requirePermission(Permission.PESQUISA_READ)
    .query(async ({ ctx }) => { /* ... */ }),
  
  create: requirePermission(Permission.PESQUISA_CREATE)
    .input(/* ... */)
    .mutation(async ({ input, ctx }) => { /* ... */ }),
  
  update: requirePermission(Permission.PESQUISA_UPDATE)
    .input(/* ... */)
    .mutation(async ({ input, ctx }) => { /* ... */ }),
  
  delete: requirePermission(Permission.PESQUISA_DELETE)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => { /* ... */ }),
  
  start: requirePermission(Permission.PESQUISA_START)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => { /* ... */ })
});
```

**Checklist:**
- [ ] Todas as procedures protegidas
- [ ] Código existente preservado

---

#### 1.3.3 Atualizar Demais Routers
**Lista de routers a atualizar:**
- [ ] importacao.ts
- [ ] entidades.ts
- [ ] entidade.ts
- [ ] cubo.ts
- [ ] temporal.ts
- [ ] geografia.ts
- [ ] mercado.ts

**Padrão a seguir:**
```typescript
// Sempre usar requirePermission antes da procedure
export const router = router({
  action: requirePermission(Permission.RESOURCE_ACTION)
    .input(/* ... */)
    .query/mutation(async ({ input, ctx }) => { /* ... */ })
});
```

**Checklist:**
- [ ] Todos os routers atualizados
- [ ] Build passando
- [ ] Sem erros TypeScript

---

#### 1.3.4 Testar Permissões em Desenvolvimento
```bash
# Iniciar servidor
pnpm dev

# Testar com diferentes roles
# 1. Criar usuário viewer
# 2. Tentar criar projeto (deve falhar)
# 3. Tentar listar projetos (deve funcionar)
# 4. Mudar para manager
# 5. Tentar criar projeto (deve funcionar)
```

**Checklist:**
- [ ] Viewer não pode criar
- [ ] Manager pode criar
- [ ] Admin pode tudo
- [ ] Mensagens de erro claras

---

**Resultado da Sessão 1.3:**
- ✅ Todos os routers protegidos
- ✅ Permissões aplicadas
- ✅ Testes manuais OK
- ✅ Sem quebras

**Tempo:** 4 dias  
**Risco:** Médio

---

## SESSÃO 1.4: IMPLEMENTAR RATE LIMITING
**Duração:** 3 dias  
**Objetivo:** Proteger contra abuso

### Atividades

#### 1.4.1 Instalar Dependências
```bash
pnpm add express-rate-limit rate-limit-redis ioredis
pnpm add -D @types/express-rate-limit
```

**Checklist:**
- [ ] Dependências instaladas
- [ ] package.json atualizado

---

#### 1.4.2 Configurar Redis Client
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
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
});
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Redis conectando
- [ ] Logs aparecendo

---

#### 1.4.3 Criar Rate Limiters
```typescript
// server/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis';

// Global: 100 req/15min
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Muitas requisições, tente novamente mais tarde',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id?.toString() || req.ip
});

// Login: 5 tentativas/15min
export const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:login:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    error: 'Muitas tentativas de login',
    retryAfter: 15 * 60
  },
  keyGenerator: (req) => `${req.body.email}:${req.ip}`
});

// APIs pesadas: 10 req/min
export const heavyApiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:heavy:'
  }),
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Limite de requisições excedido',
    retryAfter: 60
  }
});
```

**Checklist:**
- [ ] Arquivo criado
- [ ] 3 limiters criados
- [ ] Sem erros TypeScript

---

#### 1.4.4 Aplicar no Express
```typescript
// server/index.ts
import express from 'express';
import { globalLimiter, loginLimiter, heavyApiLimiter } from './middleware/rate-limit';

const app = express();

// Global em todas as APIs
app.use('/api', globalLimiter);

// Específicos
app.post('/api/auth/login', loginLimiter);
app.post('/api/enriquecimento/executar', heavyApiLimiter);
app.post('/api/importacao/upload', heavyApiLimiter);
```

**Checklist:**
- [ ] Limiters aplicados
- [ ] Servidor iniciando
- [ ] Sem erros

---

#### 1.4.5 Testar Rate Limiting
```bash
# Testar limite global
for i in {1..110}; do
  curl http://localhost:3000/api/projetos/list
  echo "Request $i"
done

# Deve bloquear após 100
```

**Checklist:**
- [ ] Limite funcionando
- [ ] Mensagem de erro correta
- [ ] Header Retry-After presente

---

**Resultado da Sessão 1.4:**
- ✅ Rate limiting implementado
- ✅ Redis funcionando
- ✅ Proteção ativa
- ✅ Sem quebras

**Tempo:** 3 dias  
**Risco:** Baixo

---

## SESSÃO 1.5: IMPLEMENTAR AUDITORIA
**Duração:** 5 dias  
**Objetivo:** Rastrear todas as ações

### Atividades

#### 1.5.1 Criar Schema de Auditoria
```sql
-- drizzle/migrations/0004_add_audit.sql

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id INTEGER,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  duration_ms INTEGER,
  status VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action, created_at DESC);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

**Executar:**
```bash
pnpm db:push
```

**Checklist:**
- [ ] Migration criada
- [ ] Migration executada
- [ ] Tabela criada
- [ ] Índices criados

---

#### 1.5.2 Atualizar Schema Drizzle
```typescript
// drizzle/schema.ts

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: integer('resource_id'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  requestId: varchar('request_id', { length: 36 }),
  durationMs: integer('duration_ms'),
  status: varchar('status', { length: 20 }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow()
});
```

**Checklist:**
- [ ] Schema atualizado
- [ ] Sem erros TypeScript

---

#### 1.5.3 Criar Helper de Auditoria
```typescript
// server/lib/audit.ts
import { db } from '../db';
import { auditLog } from '@/drizzle/schema';

export interface AuditLogEntry {
  userId: number;
  action: string;
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
    console.error('Failed to create audit log:', error);
  }
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Função implementada
- [ ] Sem erros TypeScript

---

#### 1.5.4 Criar Middleware de Auditoria
```typescript
// server/middleware/audit.ts
import { protectedProcedure } from './auth';
import { createAuditLog } from '../lib/audit';

export const auditedProcedure = protectedProcedure.use(async ({ ctx, next, path, type }) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const result = await next({ ctx });
    
    await createAuditLog({
      userId: ctx.userId,
      action: type,
      resourceType: path.split('.')[0],
      ipAddress: ctx.req.ip,
      userAgent: ctx.req.headers['user-agent'],
      requestId,
      duration: Date.now() - startTime,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    await createAuditLog({
      userId: ctx.userId,
      action: type,
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
```

**Checklist:**
- [ ] Middleware criado
- [ ] Logs de sucesso e erro
- [ ] Sem erros TypeScript

---

#### 1.5.5 Aplicar em Ações Críticas
```typescript
// server/routers/projetos.ts

// Substituir requirePermission por auditedProcedure + requirePermission
import { auditedProcedure } from '../middleware/audit';

export const projetosRouter = router({
  delete: auditedProcedure
    .use(requirePermission(Permission.PROJETO_DELETE))
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Código existente
    })
});
```

**Aplicar em:**
- [ ] projetos.delete
- [ ] pesquisas.delete
- [ ] entidades.delete
- [ ] importacao.delete

**Checklist:**
- [ ] Auditoria aplicada
- [ ] Logs sendo criados
- [ ] Sem quebras

---

**Resultado da Sessão 1.5:**
- ✅ Auditoria implementada
- ✅ Logs funcionando
- ✅ Ações críticas rastreadas
- ✅ Sem quebras

**Tempo:** 5 dias  
**Risco:** Baixo

---

## SESSÃO 1.6: IMPLEMENTAR CRIPTOGRAFIA
**Duração:** 6 dias  
**Objetivo:** Proteger dados sensíveis

### Atividades

#### 1.6.1 Criar Funções de Criptografia
```typescript
// server/lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT = process.env.ENCRYPTION_SALT!;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
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

export function hashPII(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value + SALT)
    .digest('hex');
}
```

**Checklist:**
- [ ] Arquivo criado
- [ ] Funções implementadas
- [ ] Testes unitários criados
- [ ] Testes passando

---

#### 1.6.2 Atualizar Schema do Banco
```sql
-- drizzle/migrations/0005_add_encryption.sql

ALTER TABLE dim_entidade 
  ADD COLUMN cnpj_hash VARCHAR(64),
  ADD COLUMN cnpj_encrypted TEXT,
  ADD COLUMN email_encrypted TEXT,
  ADD COLUMN telefone_encrypted TEXT;

CREATE INDEX idx_entidade_cnpj_hash ON dim_entidade(cnpj_hash);
```

**Executar:**
```bash
pnpm db:push
```

**Checklist:**
- [ ] Migration criada
- [ ] Migration executada
- [ ] Colunas adicionadas
- [ ] Índice criado

---

#### 1.6.3 Migrar Dados Existentes
```typescript
// scripts/encrypt-existing-data.ts
import { db } from '../server/db';
import { dimEntidade } from '../drizzle/schema';
import { encrypt, hashPII } from '../server/lib/encryption';
import { eq } from 'drizzle-orm';

async function encryptExistingData() {
  console.log('🔐 Iniciando criptografia de dados existentes...');
  
  const entidades = await db.select().from(dimEntidade);
  let count = 0;
  
  for (const entidade of entidades) {
    const updates: any = {};
    
    if (entidade.cnpj) {
      updates.cnpj_hash = hashPII(entidade.cnpj);
      updates.cnpj_encrypted = encrypt(entidade.cnpj);
    }
    
    if (entidade.email) {
      updates.email_encrypted = encrypt(entidade.email);
    }
    
    if (entidade.telefone) {
      updates.telefone_encrypted = encrypt(entidade.telefone);
    }
    
    if (Object.keys(updates).length > 0) {
      await db.update(dimEntidade)
        .set(updates)
        .where(eq(dimEntidade.id, entidade.id));
      
      count++;
      if (count % 100 === 0) {
        console.log(`✅ ${count} entidades criptografadas`);
      }
    }
  }
  
  console.log(`🎉 Concluído! ${count} entidades criptografadas`);
}

encryptExistingData().catch(console.error);
```

**Executar:**
```bash
tsx scripts/encrypt-existing-data.ts
```

**Checklist:**
- [ ] Script criado
- [ ] Script executado
- [ ] Dados criptografados
- [ ] Backup realizado antes

---

#### 1.6.4 Atualizar DAL de Entidades
```typescript
// server/dal/entidades.ts
import { encrypt, decrypt, hashPII } from '../lib/encryption';

export async function createEntidade(data: EntidadeInput) {
  return db.insert(dimEntidade).values({
    nome: data.nome,
    cnpj_hash: data.cnpj ? hashPII(data.cnpj) : null,
    cnpj_encrypted: data.cnpj ? encrypt(data.cnpj) : null,
    email_encrypted: data.email ? encrypt(data.email) : null,
    telefone_encrypted: data.telefone ? encrypt(data.telefone) : null,
    // ... outros campos
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
    email: entidade.email_encrypted ? decrypt(entidade.email_encrypted) : null,
    telefone: entidade.telefone_encrypted ? decrypt(entidade.telefone_encrypted) : null
  };
}
```

**Checklist:**
- [ ] DAL atualizado
- [ ] Create criptografando
- [ ] Get descriptografando
- [ ] Busca por hash funcionando

---

#### 1.6.5 Testar Criptografia
```bash
# Testar em desenvolvimento
pnpm dev

# 1. Criar nova entidade
# 2. Verificar no banco (deve estar criptografado)
# 3. Buscar entidade (deve retornar descriptografado)
# 4. Buscar por CNPJ (deve funcionar via hash)
```

**Checklist:**
- [ ] Dados criptografados no banco
- [ ] Dados descriptografados na API
- [ ] Busca funcionando
- [ ] Performance OK (<50ms overhead)

---

**Resultado da Sessão 1.6:**
- ✅ Criptografia implementada
- ✅ Dados migrados
- ✅ DAL atualizado
- ✅ Sem quebras

**Tempo:** 6 dias  
**Risco:** Alto (migração de dados)

---

## CHECKPOINT FASE 1
**Duração:** 2 dias  
**Objetivo:** Validar e consolidar

### Atividades

#### CP1.1 Testes Completos
```bash
# Rodar todos os testes
pnpm test

# Verificar cobertura
pnpm test:coverage

# Deve ter > 70% cobertura
```

**Checklist:**
- [ ] Todos os testes passando
- [ ] Cobertura > 70%
- [ ] Sem warnings

---

#### CP1.2 Merge para Main
```bash
# Atualizar branch
git checkout fase-1-seguranca
git pull origin main
git merge main

# Resolver conflitos (se houver)

# Merge para main
git checkout main
git merge fase-1-seguranca

# Push
git push origin main
```

**Checklist:**
- [ ] Branch atualizada
- [ ] Conflitos resolvidos
- [ ] Merge realizado
- [ ] Push concluído

---

#### CP1.3 Deploy em Staging
```bash
# Deploy
git tag v1.1.0-fase1
git push origin v1.1.0-fase1

# Aguardar deploy automático
```

**Checklist:**
- [ ] Tag criada
- [ ] Deploy realizado
- [ ] Staging funcionando

---

#### CP1.4 Documentação
```markdown
# CHANGELOG.md

## [1.1.0] - 2024-12-XX

### Segurança
- Implementado RBAC completo (4 papéis, 20+ permissões)
- Implementado Rate Limiting (proteção DoS/brute force)
- Implementado Auditoria (rastreamento de ações)
- Implementado Criptografia AES-256-GCM (dados sensíveis)

### Melhorias
- Todas as rotas protegidas por permissões
- Logs de auditoria em ações críticas
- Dados pessoais criptografados

### Breaking Changes
- Nenhum (retrocompatível)
```

**Checklist:**
- [ ] CHANGELOG atualizado
- [ ] README atualizado
- [ ] Documentação de API atualizada

---

**Resultado do Checkpoint:**
- ✅ FASE 1 completa
- ✅ Testes passando
- ✅ Deploy realizado
- ✅ Documentação atualizada

**Tempo total FASE 1:** 6 semanas  
**Status:** ✅ CONCLUÍDA

---

# RESUMO DO PLANO

## FASE 1: FUNDAÇÃO DE SEGURANÇA ✅
- Sessão 1.1: Preparação (3 dias)
- Sessão 1.2: RBAC Backend (5 dias)
- Sessão 1.3: RBAC Routers (4 dias)
- Sessão 1.4: Rate Limiting (3 dias)
- Sessão 1.5: Auditoria (5 dias)
- Sessão 1.6: Criptografia (6 dias)
- Checkpoint (2 dias)
**Total:** 28 dias (6 semanas)

## FASE 2: LGPD E QUALIDADE DE DADOS (próxima)
- Sessão 2.1: Consentimentos
- Sessão 2.2: Direito ao Esquecimento
- Sessão 2.3: Portabilidade
- Sessão 2.4: Data Quality Framework
- Sessão 2.5: SCD Type 2
**Total:** 4 semanas

## FASE 3: UX E ONBOARDING (próxima)
- Sessão 3.1: Tour Guiado
- Sessão 3.2: Undo/Redo
- Sessão 3.3: Busca Global
- Sessão 3.4: Wizard de Formulários
**Total:** 3 semanas

## FASE 4: INTELIGÊNCIA AVANÇADA (próxima)
- Sessão 4.1: Análise Preditiva
- Sessão 4.2: Benchmarking
- Sessão 4.3: Alertas Inteligentes
**Total:** 4 semanas

## FASE 5: GOVERNANÇA E INFRA (próxima)
- Sessão 5.1: SLA e Monitoramento
- Sessão 5.2: Disaster Recovery
- Sessão 5.3: Particionamento
**Total:** 3 semanas

---

**TOTAL GERAL:** 20 semanas (5 meses)

---

## 🎯 PRÓXIMOS PASSOS

1. **Revisar este plano** com a equipe
2. **Ajustar timeline** se necessário
3. **Começar Sessão 1.1** (Preparação do Ambiente)
4. **Seguir cronograma** rigorosamente
5. **Reportar progresso** semanalmente

---

**Documento criado em:** Dezembro 2024  
**Versão:** 1.0  
**Status:** Pronto para execução
