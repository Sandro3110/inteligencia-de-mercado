# Análise dos Erros 401 (Unauthorized)

## ✅ CAUSA RAIZ IDENTIFICADA

O endpoint `/api/notifications/stream` está retornando **401 Unauthorized** porque:

### Problema

1. **Endpoint SSE requer autenticação** (linha 28-32 de `server/notificationStream.ts`):

   ```typescript
   const user = (req as any).user;
   if (!user) {
     res.status(401).json({ error: "Unauthorized" });
     return;
   }
   ```

2. **Middleware de autenticação NÃO é aplicado** ao endpoint SSE
   - O endpoint é registrado diretamente: `app.get("/api/notifications/stream", handleNotificationStream)`
   - **NÃO passa pelo middleware** que injeta `req.user`
   - Apenas endpoints tRPC (`/api/trpc`) passam pelo `createContext` que autentica

3. **Frontend tenta conectar ao SSE** sem autenticação configurada
   - SSE não envia cookies/headers automaticamente como tRPC
   - Resultado: `req.user` é `undefined` → retorna 401

### Comparação

| Endpoint                          | Middleware de Auth          | Status             |
| --------------------------------- | --------------------------- | ------------------ |
| `/api/trpc/*`                     | ✅ `createContext` via tRPC | Funciona           |
| `/api/notifications/stream`       | ❌ Nenhum                   | **401 Error**      |
| `/api/enrichment/progress/:jobId` | ❌ Nenhum                   | Potencial problema |

## Soluções Possíveis

### Opção 1: Adicionar Middleware de Autenticação (Recomendado)

Aplicar o mesmo middleware de autenticação do tRPC ao endpoint SSE:

```typescript
import { sdk } from "./_core/sdk";

// Middleware de autenticação
async function authMiddleware(req, res, next) {
  try {
    req.user = await sdk.authenticateRequest(req);
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Aplicar ao endpoint SSE
app.get("/api/notifications/stream", authMiddleware, handleNotificationStream);
```

### Opção 2: Tornar Endpoint Público (Não Recomendado)

Remover verificação de autenticação - **INSEGURO** para notificações

### Opção 3: Desabilitar SSE Temporariamente

Remover endpoint e chamadas do frontend se não for usado

## Recomendação

**Implementar Opção 1** - Criar middleware de autenticação compartilhado e aplicar aos endpoints SSE.

## Arquivos Afetados

- `server/_core/index.ts` - Registro do endpoint
- `server/notificationStream.ts` - Handler SSE
- `server/_core/context.ts` - Lógica de autenticação (referência)
