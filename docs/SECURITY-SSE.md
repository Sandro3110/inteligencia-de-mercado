# Documentação de Segurança - Server-Sent Events (SSE)

## Visão Geral

Este documento descreve a arquitetura de segurança implementada para os endpoints SSE (Server-Sent Events) no sistema Gestor PAV. Todos os endpoints SSE são protegidos por autenticação baseada em cookies de sessão.

## Arquitetura de Autenticação

### Fluxo de Autenticação

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Cliente   │         │   Express    │         │   Backend   │
│  (Browser)  │         │  Middleware  │         │   (tRPC)    │
└─────┬───────┘         └──────┬───────┘         └──────┬──────┘
      │                        │                        │
      │  GET /api/.../stream   │                        │
      ├───────────────────────>│                        │
      │  Cookie: manus_session │                        │
      │                        │                        │
      │                   requireAuth()                 │
      │                        ├───────────────────────>│
      │                        │  verifySessionCookie() │
      │                        │<───────────────────────┤
      │                        │   { user, valid }      │
      │                        │                        │
      │    401 Unauthorized    │                        │
      │<───────────────────────┤ (se inválido)          │
      │                        │                        │
      │    200 OK + SSE        │                        │
      │<───────────────────────┤ (se válido)            │
      │  Content-Type:         │                        │
      │  text/event-stream     │                        │
      │                        │                        │
```

### Componentes de Segurança

#### 1. Middleware `requireAuth`

Localização: `server/_core/authMiddleware.ts`

```typescript
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const sessionCookie = req.cookies[COOKIE_NAME];
    if (!sessionCookie) {
      throw new ForbiddenError("No session cookie provided");
    }

    const { user, valid } = await verifySessionCookie(sessionCookie);
    if (!valid || !user) {
      throw new ForbiddenError("Invalid session cookie");
    }

    // Anexar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
```

**Responsabilidades:**
- Verificar presença do cookie de sessão
- Validar token JWT
- Anexar dados do usuário ao objeto `req`
- Retornar 401 para requisições não autenticadas

#### 2. Verificação de Sessão

Localização: `server/_core/sessionManager.ts`

```typescript
export async function verifySessionCookie(cookie: string): Promise<{
  user: User | null;
  valid: boolean;
}> {
  try {
    const decoded = jwt.verify(cookie, ENV.jwtSecret) as JWTPayload;
    const user = await getUser(decoded.userId);
    return { user, valid: !!user };
  } catch (error) {
    return { user: null, valid: false };
  }
}
```

**Validações:**
- Verificação de assinatura JWT
- Validação de expiração do token
- Verificação de existência do usuário no banco

## Endpoints Protegidos

### 1. `/api/enrichment/progress/:jobId`

**Propósito**: Stream de progresso de enriquecimento de dados

**Autenticação**: ✅ Protegido com `requireAuth`

**Implementação**:
```typescript
app.get("/api/enrichment/progress/:jobId", requireAuth, setupSSE);
```

**Validações Adicionais**:
- Verifica se o job pertence ao usuário autenticado
- Retorna 403 se o usuário não tem permissão

### 2. `/api/notifications/stream`

**Propósito**: Stream de notificações em tempo real

**Autenticação**: ✅ Protegido com `requireAuth`

**Implementação**:
```typescript
app.get("/api/notifications/stream", requireAuth, handleNotificationStream);
```

**Validações Adicionais**:
- Filtra notificações apenas do usuário autenticado
- Implementa heartbeat para manter conexão viva

## Headers de Segurança SSE

Todos os endpoints SSE retornam os seguintes headers:

```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

**Justificativas**:
- `text/event-stream`: Identifica o tipo de conteúdo SSE
- `no-cache`: Previne cache de eventos
- `keep-alive`: Mantém conexão aberta
- `no`: Desabilita buffering em proxies Nginx

## Testes de Segurança

### Suíte de Testes Automatizados

Localização: `server/__tests__/sse-auth.test.ts`

**Casos de Teste** (8 testes):

1. **Rejeição de Requisições Não Autenticadas**
   ```typescript
   it("deve rejeitar requisições sem autenticação", async () => {
     const response = await fetchSSE("/api/enrichment/progress/test-job-123");
     expect(response.status).toBe(401);
   });
   ```

2. **Aceitação de Requisições Autenticadas**
   ```typescript
   it("deve aceitar requisições autenticadas", async () => {
     const response = await fetch(`${BASE_URL}/api/enrichment/progress/${jobId}`, {
       credentials: "include",
     });
     expect(response.status).toBe(200);
   });
   ```

3. **Validação de Cookies Inválidos**
   ```typescript
   it("deve rejeitar cookies inválidos", async () => {
     const response = await fetchSSE(
       "/api/notifications/stream",
       "manus_session=invalid-token"
     );
     expect(response.status).toBe(401);
   });
   ```

4. **Validação de Headers SSE**
   ```typescript
   it("deve incluir headers de segurança adequados", async () => {
     const response = await fetch(`${BASE_URL}/api/notifications/stream`, {
       credentials: "include",
     });
     expect(response.headers.get("content-type")).toContain("text/event-stream");
   });
   ```

### Executando os Testes

```bash
# Executar todos os testes de autenticação SSE
pnpm vitest run server/__tests__/sse-auth.test.ts

# Executar testes de monitoramento
pnpm vitest run server/__tests__/notification-monitor.test.ts

# Executar todos os testes
pnpm vitest run
```

## Vetores de Ataque Mitigados

### 1. Acesso Não Autenticado ✅

**Ataque**: Tentar acessar streams SSE sem autenticação

**Mitigação**: Middleware `requireAuth` rejeita todas as requisições sem cookie válido

**Teste**:
```bash
curl -i http://localhost:3000/api/notifications/stream
# Retorna: 401 Unauthorized
```

### 2. Cookie Forjado ✅

**Ataque**: Tentar usar cookie JWT forjado ou modificado

**Mitigação**: Verificação de assinatura JWT com secret seguro

**Teste**:
```bash
curl -i http://localhost:3000/api/notifications/stream \
  -H "Cookie: manus_session=fake.token.here"
# Retorna: 401 Unauthorized
```

### 3. Cookie Expirado ✅

**Ataque**: Reutilizar cookie expirado

**Mitigação**: Verificação de expiração do token JWT

**Teste**: Automático via `jwt.verify()` que lança erro se expirado

### 4. Session Fixation ✅

**Ataque**: Forçar vítima a usar sessão conhecida

**Mitigação**: Cookies com flags `httpOnly` e `secure` (produção)

**Configuração**:
```typescript
res.cookie(COOKIE_NAME, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
});
```

### 5. CSRF (Cross-Site Request Forgery) ✅

**Ataque**: Fazer requisições SSE de origem maliciosa

**Mitigação**: Cookie com `sameSite: "lax"` previne envio em requisições cross-site

### 6. XSS (Cross-Site Scripting) ✅

**Ataque**: Roubar cookie via JavaScript malicioso

**Mitigação**: Flag `httpOnly` impede acesso via JavaScript

## Boas Práticas Implementadas

### 1. Princípio do Menor Privilégio

- Cada stream SSE filtra dados apenas do usuário autenticado
- Não há acesso a dados de outros usuários

### 2. Defesa em Profundidade

- Autenticação no middleware Express
- Validação adicional no handler SSE
- Verificação de propriedade de recursos (jobs, notificações)

### 3. Logging de Segurança

```typescript
console.log("[Auth Middleware] Authentication failed:", error.message);
console.log("[SSE] User connected:", user.id);
console.log("[SSE] User disconnected:", user.id);
```

### 4. Timeout de Conexões

```typescript
// Heartbeat a cada 30 segundos
const heartbeatInterval = setInterval(() => {
  res.write(":heartbeat\n\n");
}, 30000);

// Limpar ao desconectar
req.on("close", () => {
  clearInterval(heartbeatInterval);
});
```

## Monitoramento e Alertas

### Métricas de Segurança

1. **Taxa de Falhas de Autenticação**
   - Monitorar logs de `[Auth Middleware] Authentication failed`
   - Alertar se > 10% das requisições falharem

2. **Conexões SSE Ativas**
   - Monitorar número de conexões simultâneas
   - Alertar se > 1000 conexões (possível DoS)

3. **Duração de Sessões**
   - Monitorar tempo médio de conexão SSE
   - Alertar se > 1 hora (possível vazamento de recursos)

### Logs de Auditoria

Todos os eventos de autenticação são registrados:

```
[Auth Middleware] Authentication failed: HttpError: Invalid session cookie
[Auth Middleware] User authenticated: user-123
[SSE] User connected: user-123
[SSE] User disconnected: user-123
```

## Checklist de Segurança

- [x] Todos os endpoints SSE protegidos com autenticação
- [x] Cookies com flags de segurança (`httpOnly`, `secure`, `sameSite`)
- [x] Validação de JWT com secret seguro
- [x] Verificação de expiração de tokens
- [x] Filtro de dados por usuário autenticado
- [x] Testes automatizados de segurança
- [x] Logging de eventos de autenticação
- [x] Headers de segurança SSE configurados
- [x] Timeout e limpeza de conexões
- [x] Documentação de arquitetura de segurança

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [SSE Security Considerations](https://html.spec.whatwg.org/multipage/server-sent-events.html#authoring-notes)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## Contato

Para reportar vulnerabilidades de segurança, entre em contato com a equipe de desenvolvimento.

---

**Última Atualização**: 22 de Novembro de 2025
**Versão**: 1.0
**Autor**: Sistema Gestor PAV
