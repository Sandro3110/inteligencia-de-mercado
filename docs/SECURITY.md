# 🔒 Guia de Segurança

Este documento descreve as práticas de segurança implementadas no projeto.

## 📋 Índice

- [Security Headers](#security-headers)
- [Autenticação](#autenticação)
- [Autorização](#autorização)
- [Proteção de Dados](#proteção-de-dados)
- [Auditoria de Dependências](#auditoria-de-dependências)
- [Best Practices](#best-practices)

---

## 🛡️ Security Headers

O projeto implementa security headers recomendados pela OWASP.

### Headers Configurados

```typescript
// next.config.ts
headers: [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)'
  }
]
```

### O que cada header faz:

- **Strict-Transport-Security (HSTS):** Força HTTPS por 2 anos.
- **X-Frame-Options:** Previne clickjacking.
- **X-Content-Type-Options:** Previne MIME sniffing.
- **X-XSS-Protection:** Ativa proteção XSS do navegador.
- **Referrer-Policy:** Controla informações de referrer.
- **Permissions-Policy:** Restringe APIs do navegador.

---

## 🔐 Autenticação

### Supabase Auth

O projeto utiliza **Supabase Auth** para autenticação segura.

**Recursos:**
- Email/senha com confirmação
- OAuth (Google, GitHub, etc.)
- Magic links
- MFA (Multi-Factor Authentication)
- Session management
- Password reset

### Proteção de Rotas

Rotas protegidas verificam autenticação:

```tsx
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

---

## 🔑 Autorização

### Role-Based Access Control (RBAC)

O sistema implementa RBAC para controle de acesso:

```typescript
// Types
type Role = 'admin' | 'user' | 'guest';

// Check permission
function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}

// Protect API route
export async function GET(request: Request) {
  const user = await getCurrentUser();
  
  if (!hasPermission(user, 'read:data')) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // ...
}
```

---

## 🗄️ Proteção de Dados

### Variáveis de Ambiente

**Nunca commite secrets no código!**

```env
# ❌ Bad
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# ✅ Good
DATABASE_URL="${DATABASE_URL}"
```

### Sanitização de Inputs

Sempre sanitize inputs do usuário:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

// Validate and sanitize
const result = schema.safeParse(input);
if (!result.success) {
  throw new Error('Invalid input');
}
```

### SQL Injection Prevention

Use ORM (Drizzle) com prepared statements:

```typescript
// ❌ Bad - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good - Safe with Drizzle
const user = await db.select().from(users).where(eq(users.email, email));
```

### XSS Prevention

React escapa automaticamente, mas tenha cuidado com `dangerouslySetInnerHTML`:

```tsx
// ❌ Bad - XSS vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good - Sanitize first
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### CSRF Protection

Next.js protege contra CSRF automaticamente, mas para APIs externas:

```typescript
// Verify origin
const origin = request.headers.get('origin');
if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
  return new Response('Forbidden', { status: 403 });
}
```

---

## 🔍 Auditoria de Dependências

### Vulnerabilidades Conhecidas

**Status Atual:**
- 4 vulnerabilidades moderadas (esbuild - dev only)
- 1 vulnerabilidade alta (xlsx - precisa atualização)

### Ações Necessárias

1. **Atualizar xlsx:**
   ```bash
   npm update xlsx
   ```

2. **Atualizar drizzle-kit (breaking change):**
   ```bash
   npm install drizzle-kit@latest
   ```

### Auditoria Regular

Execute auditoria regularmente:

```bash
# Audit
npm audit

# Fix automaticamente
npm audit fix

# Fix com breaking changes
npm audit fix --force
```

---

## 🛠️ Best Practices

### 1. Princípio do Menor Privilégio

Dê apenas as permissões necessárias:

```typescript
// ❌ Bad
const user = { role: 'admin' };

// ✅ Good
const user = { 
  role: 'user',
  permissions: ['read:own_data', 'write:own_data']
};
```

### 2. Validação de Inputs

Valide todos os inputs do usuário:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
});
```

### 3. Rate Limiting

Implemente rate limiting para prevenir abuso:

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

const { success } = await ratelimit.limit(ip);
if (!success) {
  return new Response('Too many requests', { status: 429 });
}
```

### 4. Logging Seguro

Não logue informações sensíveis:

```typescript
// ❌ Bad
logger.info('User logged in', { password: user.password });

// ✅ Good
logger.info('User logged in', { userId: user.id });
```

### 5. Secrets Management

Use serviços de secrets management:

```typescript
// ✅ Good
const apiKey = process.env.API_KEY;

// Para produção, use:
// - Vercel Environment Variables
// - AWS Secrets Manager
// - HashiCorp Vault
```

### 6. HTTPS Everywhere

Force HTTPS em produção:

```typescript
// middleware.ts
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https')) {
  return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`);
}
```

### 7. Content Security Policy (CSP)

Implemente CSP para prevenir XSS:

```typescript
// next.config.ts
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
]
```

---

## 📊 Checklist de Segurança

Antes de ir para produção, verifique:

### Código
- [ ] Inputs são validados e sanitizados
- [ ] Queries usam prepared statements
- [ ] Não há secrets no código
- [ ] XSS e CSRF estão prevenidos
- [ ] Rate limiting está implementado

### Infraestrutura
- [ ] HTTPS está ativo
- [ ] Security headers estão configurados
- [ ] Firewall está configurado
- [ ] Backups estão automatizados
- [ ] Logs estão sendo coletados

### Autenticação/Autorização
- [ ] Senhas são hasheadas (bcrypt, argon2)
- [ ] MFA está disponível
- [ ] Sessions expiram
- [ ] RBAC está implementado
- [ ] Tokens são seguros (JWT com secret forte)

### Dependências
- [ ] Auditoria de dependências foi executada
- [ ] Vulnerabilidades críticas foram corrigidas
- [ ] Dependências estão atualizadas
- [ ] Licenças foram verificadas

### Monitoramento
- [ ] Logs de segurança estão ativos
- [ ] Alertas de segurança estão configurados
- [ ] Sentry está monitorando erros
- [ ] Tentativas de login falhadas são logadas

---

## 🚨 Resposta a Incidentes

### Em caso de incidente de segurança:

1. **Contenha:** Isole o sistema afetado.
2. **Investigue:** Determine a causa e o escopo.
3. **Corrija:** Aplique patches e correções.
4. **Comunique:** Notifique usuários afetados (se necessário).
5. **Documente:** Registre o incidente e lições aprendidas.

---

## 📞 Contato de Segurança

Para reportar vulnerabilidades de segurança:

- **Email:** security@intelmarket.com.br
- **PGP Key:** [link para chave pública]

**Não divulgue vulnerabilidades publicamente antes de recebermos e corrigirmos.**

---

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [CWE Top 25](https://cwe.mitre.org/top25/)
