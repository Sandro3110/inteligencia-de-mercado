# Correção dos Erros 401 (Unauthorized) - Documentação Completa

## 📋 Resumo Executivo

**Problema**: Console do navegador exibia 4 erros 401 (Unauthorized) ao acessar a aplicação.

**Causa Raiz**: Endpoints SSE (Server-Sent Events) não tinham middleware de autenticação aplicado, mas o handler verificava autenticação, resultando em rejeição de todas as conexões.

**Solução**: Criação de middleware de autenticação compartilhado e aplicação aos endpoints SSE.

**Status**: ✅ **RESOLVIDO** - Console limpo, SSE conectando com sucesso.

---

## 🔍 Investigação

### Endpoints Afetados

1. `/api/notifications/stream` - Notificações em tempo real (4 tentativas de conexão)
2. `/api/enrichment/progress/:jobId` - Progresso de enriquecimento (potencial problema)

### Fluxo do Problema

```
Frontend → GET /api/notifications/stream
           ↓
Server (Express) → handleNotificationStream()
           ↓
Verifica req.user → undefined (sem middleware)
           ↓
Retorna 401 Unauthorized
           ↓
Console do navegador → "Failed to load resource: 401"
```

### Comparação com Endpoints Funcionais

| Endpoint | Middleware | Status |
|----------|-----------|--------|
| `/api/trpc/*` | ✅ `createContext` (tRPC) | ✅ Funciona |
| `/api/notifications/stream` | ❌ Nenhum | ❌ **401 Error** |
| `/api/enrichment/progress/:jobId` | ❌ Nenhum | ⚠️ Vulnerável |

---

## 🛠️ Solução Implementada

### 1. Criação do Middleware de Autenticação

**Arquivo**: `server/_core/authMiddleware.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import { sdk } from './sdk';
import type { User } from '../../drizzle/schema';

// Estender tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware que requer autenticação
 * Retorna 401 se usuário não estiver autenticado
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Authentication failed:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Middleware que tenta autenticar mas permite acesso sem autenticação
 * Útil para endpoints que podem ser públicos ou privados
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await sdk.authenticateRequest(req);
    req.user = user || undefined;
  } catch (error) {
    req.user = undefined;
  }
  
  next();
}
```

### 2. Aplicação do Middleware aos Endpoints SSE

**Arquivo**: `server/_core/index.ts`

```typescript
import { requireAuth } from "./authMiddleware";

// SSE endpoint for enrichment progress (requer autenticação)
app.get("/api/enrichment/progress/:jobId", requireAuth, setupSSE);

// SSE endpoint for real-time notifications (requer autenticação)
const { handleNotificationStream } = await import('../notificationStream');
app.get("/api/notifications/stream", requireAuth, handleNotificationStream);
```

### 3. Atualização do Handler SSE

**Arquivo**: `server/notificationStream.ts`

```typescript
export function handleNotificationStream(req: Request, res: Response) {
  // Autenticação já foi verificada pelo middleware requireAuth
  const user = req.user;
  if (!user) {
    // Fallback - não deveria acontecer se middleware estiver configurado
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  // ... resto do código
}
```

---

## ✅ Validação

### Testes Realizados

1. ✅ **Navegação na aplicação** - Múltiplas páginas acessadas sem erros
2. ✅ **Console do navegador** - Nenhum erro 401 detectado
3. ✅ **Logs do servidor** - SSE conectando com sucesso:
   ```
   [SSE] Cliente conectado: 7MYPzQ9L6jXiry6KYekTwQ-1763789343181 (user: 7MYPzQ9L6jXiry6KYekTwQ)
   ```
4. ✅ **Carregamento de dados** - Todas as queries tRPC funcionando normalmente

### Antes vs Depois

**Antes**:
```
Console:
❌ Failed to load resource: 401 (Unauthorized)
❌ Failed to load resource: 401 (Unauthorized)
❌ Failed to load resource: 401 (Unauthorized)
❌ Failed to load resource: 401 (Unauthorized)

Server Log:
(nenhuma conexão SSE)
```

**Depois**:
```
Console:
✅ (limpo - sem erros)

Server Log:
✅ [SSE] Cliente conectado: <clientId> (user: <userId>)
```

---

## 📚 Arquitetura da Solução

### Fluxo de Autenticação Corrigido

```
Frontend → GET /api/notifications/stream
           ↓
Server (Express) → requireAuth middleware
           ↓
sdk.authenticateRequest(req) → Valida sessão/cookie
           ↓
req.user = User | null
           ↓
Se user existe → next() → handleNotificationStream()
Se user null → 401 Unauthorized
           ↓
Handler SSE → Usa req.user (já autenticado)
           ↓
Conexão SSE estabelecida ✅
```

### Camadas de Segurança

1. **Middleware de Autenticação** (`requireAuth`)
   - Valida sessão/cookie antes de processar requisição
   - Injeta `req.user` para uso no handler

2. **Handler SSE** (`handleNotificationStream`)
   - Verifica `req.user` (fallback de segurança)
   - Filtra notificações por `userId`

3. **Event Emitter** (`notificationEmitter`)
   - Broadcast apenas para usuário correto
   - Isolamento de dados por usuário

---

## 🎯 Benefícios da Solução

1. **✅ Segurança**: Endpoints SSE agora exigem autenticação válida
2. **✅ Consistência**: Mesmo padrão de autenticação em toda a aplicação
3. **✅ Reutilização**: Middleware pode ser aplicado a outros endpoints
4. **✅ Manutenibilidade**: Lógica de autenticação centralizada
5. **✅ Tipagem**: TypeScript reconhece `req.user` globalmente

---

## 🔧 Uso Futuro

### Aplicar Autenticação a Novos Endpoints

```typescript
import { requireAuth, optionalAuth } from './server/_core/authMiddleware';

// Endpoint que REQUER autenticação
app.get("/api/private/data", requireAuth, (req, res) => {
  const user = req.user; // Garantido estar presente
  // ... lógica
});

// Endpoint que ACEITA autenticação opcional
app.get("/api/public/data", optionalAuth, (req, res) => {
  const user = req.user; // Pode ser undefined
  // ... lógica
});
```

---

## 📝 Arquivos Modificados

1. ✅ **Criado**: `server/_core/authMiddleware.ts`
2. ✅ **Modificado**: `server/_core/index.ts`
3. ✅ **Modificado**: `server/notificationStream.ts`
4. ✅ **Documentado**: `docs/correcao-erro-401.md`

---

## 🎓 Lições Aprendidas

1. **Middleware Express não é automático**: Endpoints precisam explicitamente aplicar middleware
2. **SSE requer autenticação manual**: Diferente de tRPC que tem `createContext` automático
3. **Tipagem global ajuda**: Declaração global de `req.user` previne erros de tipo
4. **Logs são essenciais**: Log do servidor confirmou conexão SSE bem-sucedida

---

## ✨ Conclusão

O problema foi **100% resolvido** através da criação de um middleware de autenticação compartilhado e sua aplicação aos endpoints SSE. A solução é **segura**, **reutilizável** e **mantém consistência** com o resto da aplicação.

**Data da Correção**: 22 de novembro de 2025  
**Versão**: Fase 66 - Correção dos Erros 401
