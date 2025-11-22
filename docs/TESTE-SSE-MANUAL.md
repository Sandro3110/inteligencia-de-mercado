# Guia de Testes Manuais - Sistema de Notificações SSE

## Visão Geral

Este guia descreve como executar testes manuais do sistema de notificações em tempo real (SSE) após fazer login no sistema.

## Pré-requisitos

1. ✅ Servidor dev rodando (`pnpm dev`)
2. ✅ Login realizado no sistema
3. ✅ Browser com DevTools (F12)

## Método 1: Teste via Browser Console (Recomendado)

### Passo 1: Fazer Login

Acesse: https://3000-izrmelqgbgh8w93e231so-6564cc02.manus.computer

Faça login com Google/Microsoft/Apple

### Passo 2: Abrir DevTools

Pressione `F12` ou clique com botão direito → "Inspecionar"

### Passo 3: Carregar Script de Teste

No console, cole o conteúdo do arquivo `test-sse-manual.js`:

```bash
# Copiar script para clipboard
cat /home/ubuntu/gestor-pav/test-sse-manual.js
```

Ou acesse diretamente via URL:
```javascript
// No console do browser
const script = document.createElement('script');
script.src = '/test-sse-manual.js';
document.head.appendChild(script);
```

### Passo 4: Executar Testes

```javascript
// Teste rápido de autenticação
await quickAuthTest()

// Executar suite completa de testes
await testSSENotifications()
```

### Resultados Esperados

```
🚀 Iniciando testes de SSE...

📋 Teste 1: Verificando autenticação...
✅ Usuário autenticado: Seu Nome (user-id-123)

📋 Teste 2: Testando rejeição sem autenticação...
✅ Endpoint rejeitou corretamente requisição sem auth (401)

📋 Teste 3: Conectando ao stream SSE...
✅ Conexão SSE estabelecida!
💓 Heartbeat recebido (1)
💓 Heartbeat recebido (2)

📋 Teste 4: Criando notificação de teste...
✅ Notificação criada: notif-abc-123
⏳ Aguardando recebimento via SSE...
🔔 Notificação 1 recebida: { id: "notif-abc-123", title: "Teste SSE Manual", ... }

📋 Teste 5: Listando notificações não lidas...
✅ Total de notificações não lidas: 5

📊 Estatísticas após 10 segundos:
- Heartbeats recebidos: 3
- Notificações recebidas: 1
✅ Sistema de heartbeat funcionando!

🏁 Testes concluídos!
```

## Método 2: Testes Automatizados com Vitest

### Executar Todos os Testes

```bash
cd /home/ubuntu/gestor-pav
pnpm vitest run server/__tests__/
```

### Executar Apenas Testes de Autenticação SSE

```bash
pnpm vitest run server/__tests__/sse-auth.test.ts
```

### Executar Apenas Testes de Monitoramento

```bash
pnpm vitest run server/__tests__/notification-monitor.test.ts
```

### Resultados Esperados (com login)

```
✓ server/__tests__/sse-auth.test.ts (8 tests) 
  ✓ Endpoint /api/enrichment/progress/:jobId
    ✓ deve rejeitar requisições sem autenticação
    ✓ deve aceitar requisições autenticadas
  ✓ Endpoint /api/notifications/stream
    ✓ deve rejeitar requisições sem autenticação
    ✓ deve aceitar requisições autenticadas e retornar SSE
    ✓ deve enviar eventos SSE formatados corretamente
  ✓ Segurança de Cookies
    ✓ deve rejeitar cookies inválidos
    ✓ deve rejeitar cookies expirados ou malformados
  ✓ Headers de Segurança
    ✓ deve incluir headers de segurança adequados

✓ server/__tests__/notification-monitor.test.ts (7 tests)
  ✓ Fluxo Completo de Notificações
    ✓ deve criar notificação e receber via SSE
    ✓ deve receber múltiplas notificações em sequência
  ✓ Verificação de Notificações Existentes
    ✓ deve listar notificações não lidas
    ✓ deve marcar notificação como lida
    ✓ deve deletar notificação
  ✓ Performance e Limites
    ✓ deve lidar com múltiplas conexões SSE simultâneas
    ✓ deve manter conexão SSE por pelo menos 30 segundos

Test Files  2 passed (2)
Tests  15 passed (15)
```

## Método 3: Teste Manual via cURL

### Teste 1: Endpoint sem autenticação (deve falhar)

```bash
curl -i https://3000-izrmelqgbgh8w93e231so-6564cc02.manus.computer/api/notifications/stream
```

**Resultado esperado**: `401 Unauthorized`

### Teste 2: Endpoint com autenticação (deve funcionar)

Primeiro, obtenha o cookie de sessão do browser:

1. Abra DevTools → Application → Cookies
2. Copie o valor de `manus_session`

```bash
curl -i https://3000-izrmelqgbgh8w93e231so-6564cc02.manus.computer/api/notifications/stream \
  -H "Cookie: manus_session=SEU_COOKIE_AQUI"
```

**Resultado esperado**:
```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

:heartbeat

:heartbeat

event: notification
data: {"id":"...","title":"..."}
```

## Método 4: Monitoramento em Tempo Real via Network Tab

### Passo 1: Abrir Network Tab

DevTools (F12) → Aba "Network"

### Passo 2: Filtrar por EventStream

No filtro, selecione "EventStream" ou digite "notifications/stream"

### Passo 3: Observar Eventos

Você verá:
- **Status**: 200 OK
- **Type**: eventsource
- **Size**: (pending) - conexão mantida aberta
- **Time**: Aumentando continuamente

### Passo 4: Ver Eventos Recebidos

Clique na requisição → Aba "EventStream"

Você verá todos os eventos recebidos:
```
:heartbeat
:heartbeat
event: notification
data: {"id":"notif-123","title":"Nova notificação"}
```

## Troubleshooting

### Problema: "401 Unauthorized"

**Causa**: Não está logado ou sessão expirou

**Solução**:
1. Faça logout
2. Faça login novamente
3. Tente novamente

### Problema: "Conexão SSE não estabelece"

**Causa**: Servidor não está rodando

**Solução**:
```bash
cd /home/ubuntu/gestor-pav
pnpm dev
```

### Problema: "Nenhum heartbeat recebido"

**Causa**: Conexão pode estar sendo bloqueada por proxy/firewall

**Solução**:
1. Verifique console do servidor para erros
2. Teste em aba anônima
3. Limpe cookies e tente novamente

### Problema: "Testes automatizados pulam testes"

**Causa**: Vitest não consegue autenticar automaticamente

**Solução**: Use testes manuais via browser console (Método 1)

## Checklist de Validação

Após executar os testes, verifique:

- [ ] ✅ Autenticação funciona corretamente
- [ ] ✅ Endpoint rejeita requisições sem auth (401)
- [ ] ✅ Endpoint aceita requisições com auth (200)
- [ ] ✅ Conexão SSE é estabelecida
- [ ] ✅ Heartbeats são recebidos (a cada 30s)
- [ ] ✅ Notificações são recebidas em tempo real
- [ ] ✅ Múltiplas conexões simultâneas funcionam
- [ ] ✅ Conexão se mantém por 30+ segundos
- [ ] ✅ Headers de segurança estão corretos
- [ ] ✅ Cookies inválidos são rejeitados

## Métricas de Performance

### Latência de Notificações

**Objetivo**: < 1 segundo entre criação e recebimento

**Como medir**:
```javascript
const start = Date.now();
await fetch("/api/trpc/notifications.create", { ... });
// Aguardar evento SSE
const latency = Date.now() - start;
console.log(`Latência: ${latency}ms`);
```

### Taxa de Heartbeat

**Objetivo**: 1 heartbeat a cada 30 segundos

**Como medir**: Contar heartbeats recebidos em 60 segundos (deve ser ~2)

### Conexões Simultâneas

**Objetivo**: Suportar 100+ conexões simultâneas

**Como medir**: Abrir múltiplas abas e conectar ao SSE

## Próximos Passos

Após validar os testes:

1. ✅ Marcar fase 60 como concluída no `todo.md`
2. ✅ Criar checkpoint com `webdev_save_checkpoint`
3. ✅ Documentar resultados dos testes
4. ✅ Considerar adicionar testes E2E com Playwright (opcional)

## Referências

- [Documentação SSE](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Documentação de Segurança SSE](./SECURITY-SSE.md)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

---

**Última Atualização**: 22 de Novembro de 2025  
**Versão**: 1.0  
**Autor**: Sistema Gestor PAV
