# Guia de Integração de Notificações - Gestor PAV

## ✅ Já Implementado

1. **Tabela `notifications` no banco de dados** - Schema atualizado
2. **Funções CRUD completas** - `/server/db-notifications.ts`
3. **Endpoints tRPC** - `/server/routers/notificationsRouter.ts`
4. **Página de notificações** - `/client/src/pages/Notificacoes.tsx`
5. **Filtros e componentes** - `/client/src/components/NotificationFilters.tsx`
6. **Item no menu** - AppSidebar > Sistema > Notificações
7. **Lead de alta qualidade** - `enrichmentFlow.ts` linha 810-845
8. **Criação de projeto** - `db.ts` linha 1066-1084

---

## 🔧 Integrações Pendentes

### 1. Criação de Pesquisa

**Arquivo:** `server/db.ts` ou onde pesquisas são criadas  
**Função:** `createPesquisa()` ou similar

```typescript
// Adicionar após criar pesquisa
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId: pesquisa.projectId,
  type: 'pesquisa_created',
  title: '📋 Nova Pesquisa Criada',
  message: `A pesquisa "${pesquisa.nome}" foi criada com sucesso`,
  metadata: {
    pesquisaId: pesquisa.id,
    pesquisaNome: pesquisa.nome,
    projectId: pesquisa.projectId,
  },
});
```

---

### 2. Início de Enriquecimento

**Arquivo:** `server/enrichmentFlow.ts`  
**Função:** `enrichClientes()` ou início do fluxo

```typescript
// Adicionar no início do enriquecimento
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'enrichment_started',
  title: '▶️ Enriquecimento Iniciado',
  message: `Iniciando enriquecimento de ${totalClientes} clientes`,
  metadata: {
    projectId,
    totalClientes,
    pesquisaId,
  },
});
```

---

### 3. Conclusão de Enriquecimento

**Arquivo:** `server/enrichmentFlow.ts`  
**Função:** Final do `enrichClientes()` ou callback de conclusão

```typescript
// Adicionar ao concluir enriquecimento
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'enrichment_complete',
  title: '✅ Enriquecimento Concluído',
  message: `Enriquecimento finalizado: ${processedCount}/${totalClientes} clientes processados`,
  metadata: {
    projectId,
    totalClientes,
    processedCount,
    successCount,
    errorCount,
    duration: Date.now() - startTime,
  },
});
```

---

### 4. Erro em Enriquecimento

**Arquivo:** `server/enrichmentFlow.ts`  
**Função:** Bloco `catch` do enriquecimento

```typescript
// Adicionar no catch de erros
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'enrichment_error',
  title: '❌ Erro no Enriquecimento',
  message: `Erro ao processar enriquecimento: ${error.message}`,
  metadata: {
    projectId,
    errorMessage: error.message,
    processedCount,
    totalClientes,
  },
});
```

---

### 5. Alerta de Qualidade

**Arquivo:** `server/enrichmentMonitor.ts`  
**Função:** `checkAlerts()` quando alerta é disparado

```typescript
// Adicionar quando alerta de qualidade é disparado
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'quality_alert',
  title: '⚠️ Alerta de Qualidade',
  message: alertMessage,
  metadata: {
    projectId,
    alertType: 'quality',
    threshold,
    currentValue,
  },
});
```

---

### 6. Circuit Breaker Ativado

**Arquivo:** `server/enrichmentMonitor.ts` ou onde circuit breaker é implementado  
**Função:** Quando circuit breaker é ativado

```typescript
// Adicionar quando circuit breaker é ativado
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'circuit_breaker',
  title: '🔴 Circuit Breaker Ativado',
  message: `Enriquecimento pausado devido a alta taxa de erros (${errorRate}%)`,
  metadata: {
    projectId,
    errorRate,
    errorCount,
    totalProcessed,
  },
});
```

---

### 7. Projeto Hibernado

**Arquivo:** `server/db.ts`  
**Função:** `hibernateProject()`

```typescript
// Adicionar em hibernateProject()
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'project_hibernated',
  title: '💤 Projeto Hibernado',
  message: `O projeto "${project.nome}" foi hibernado por inatividade`,
  metadata: {
    projectId,
    projectName: project.nome,
    reason: 'inactivity',
  },
});
```

---

### 8. Projeto Reativado

**Arquivo:** `server/db.ts`  
**Função:** `reactivateProject()`

```typescript
// Adicionar em reactivateProject()
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'project_reactivated',
  title: '🔄 Projeto Reativado',
  message: `O projeto "${project.nome}" foi reativado com sucesso`,
  metadata: {
    projectId,
    projectName: project.nome,
  },
});
```

---

### 9. Validação em Lote Concluída

**Arquivo:** `server/routers.ts` ou onde validação em lote é processada  
**Função:** Mutations de `batchUpdateValidation`

```typescript
// Adicionar após validação em lote
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ctx.user.id,
  projectId,
  type: 'validation_batch_complete',
  title: '✅ Validação em Lote Concluída',
  message: `${ids.length} itens foram validados com sucesso`,
  metadata: {
    projectId,
    entityType: 'leads', // ou 'clientes', 'concorrentes'
    count: ids.length,
    status: newStatus,
  },
});
```

---

### 10. Exportação Concluída

**Arquivo:** `server/routers/exportRouter.ts` ou onde exportação é processada  
**Função:** Após conclusão da exportação

```typescript
// Adicionar após exportação
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ctx.user.id,
  projectId,
  type: 'export_complete',
  title: '📥 Exportação Concluída',
  message: `Arquivo ${fileName} exportado com sucesso (${itemCount} itens)`,
  metadata: {
    projectId,
    fileName,
    format: 'csv', // ou 'xlsx', 'pdf'
    itemCount,
  },
});
```

---

### 11. Relatório Gerado

**Arquivo:** `server/generateExecutiveReport.ts` ou similar  
**Função:** Após geração do relatório

```typescript
// Adicionar após gerar relatório
const { createNotification } = await import('./db-notifications');
await createNotification({
  userId: ENV.ownerId,
  projectId,
  type: 'report_generated',
  title: '📊 Relatório Gerado',
  message: `Relatório executivo gerado com sucesso`,
  metadata: {
    projectId,
    reportType: 'executive',
    totalLeads: summary.totalLeads,
    highQualityLeads: summary.leadsHighQuality,
  },
});
```

---

## 📝 Checklist de Implementação

Para cada integração:

1. ✅ Importar `createNotification` de `./db-notifications`
2. ✅ Importar `ENV` de `./_core/env` (para userId)
3. ✅ Adicionar try/catch para não quebrar fluxo principal
4. ✅ Incluir metadata relevante para contexto
5. ✅ Usar emoji apropriado no título
6. ✅ Testar criação da notificação
7. ✅ Verificar na página `/notificacoes`

---

## 🎯 Tipos de Notificação Disponíveis

```typescript
type NotificationType =
  | "enrichment_complete"
  | "enrichment_started"
  | "enrichment_error"
  | "lead_high_quality"
  | "quality_alert"
  | "circuit_breaker"
  | "project_created"
  | "project_hibernated"
  | "project_reactivated"
  | "pesquisa_created"
  | "validation_batch_complete"
  | "export_complete"
  | "report_generated"
  | "system";
```

---

## 🔍 Como Testar

1. **Acessar a página de notificações:**
   ```
   http://localhost:3000/notificacoes
   ```

2. **Verificar contador de não lidas:**
   - Menu lateral > Sistema > Notificações (badge com número)

3. **Testar filtros:**
   - Filtrar por tipo
   - Filtrar por status (lidas/não lidas)
   - Limpar filtros

4. **Testar ações:**
   - Marcar como lida (ícone de check)
   - Deletar notificação (ícone de lixeira)
   - Marcar todas como lidas
   - Limpar todas as lidas

---

## 📚 Referências

- **Backend:** `/server/db-notifications.ts`
- **Router:** `/server/routers/notificationsRouter.ts`
- **Frontend:** `/client/src/pages/Notificacoes.tsx`
- **Filtros:** `/client/src/components/NotificationFilters.tsx`
- **Schema:** `/drizzle/schema.ts` (linha 481-493)
