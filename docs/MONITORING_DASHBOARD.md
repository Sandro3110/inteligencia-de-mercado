# Monitoring Dashboard Guide

Este documento descreve como configurar e usar o sistema de monitoramento do Intelmarket.

## 📊 Visão Geral

O sistema de monitoramento inclui:

- **Sentry** - Error tracking e performance monitoring
- **Custom Metrics** - Métricas de negócio e sistema
- **Alerts** - Alertas automáticos baseados em thresholds
- **Health Checks** - Status da aplicação e dependências
- **Structured Logging** - Logs JSON com contexto

## 🎯 Métricas Disponíveis

### Business Metrics

Métricas relacionadas ao negócio e uso da aplicação.

**Exemplos:**
- `user.registered` - Novos usuários registrados
- `user.logged_in` - Logins de usuários
- `project.created` - Projetos criados
- `research.completed` - Pesquisas completadas
- `data.exported` - Exportações de dados

**Uso:**
```typescript
import { BusinessMetrics } from '@/lib/monitoring/metrics';

// Track user registration
BusinessMetrics.userRegistered(userId);

// Track project creation
BusinessMetrics.projectCreated(projectId, userId);

// Track research completion
BusinessMetrics.researchCompleted(researchId, duration);
```

### Performance Metrics

Métricas de performance da aplicação.

**Exemplos:**
- `api.response_time` - Tempo de resposta das APIs
- `db.query_time` - Tempo de execução de queries
- `page.load_time` - Tempo de carregamento de páginas

**Uso:**
```typescript
import { PerformanceMetrics } from '@/lib/monitoring/metrics';

// Track API response time
PerformanceMetrics.apiResponseTime(endpoint, duration, status);

// Track database query time
PerformanceMetrics.queryTime(query, duration);

// Track page load time
PerformanceMetrics.pageLoadTime(page, duration);
```

### System Metrics

Métricas do sistema e infraestrutura.

**Exemplos:**
- `system.memory_usage` - Uso de memória
- `system.cpu_usage` - Uso de CPU
- `system.active_connections` - Conexões ativas

**Uso:**
```typescript
import { SystemMetrics } from '@/lib/monitoring/metrics';

// Track memory usage
SystemMetrics.memoryUsage(usage);

// Track CPU usage
SystemMetrics.cpuUsage(usage);

// Track active connections
SystemMetrics.activeConnections(count);
```

### User Metrics

Métricas relacionadas aos usuários.

**Exemplos:**
- `user.active` - Usuários ativos
- `user.action` - Ações dos usuários
- `user.session_duration` - Duração das sessões

**Uso:**
```typescript
import { UserMetrics } from '@/lib/monitoring/metrics';

// Track active users
UserMetrics.activeUsers(count);

// Track user action
UserMetrics.userAction(action, userId);

// Track session duration
UserMetrics.sessionDuration(userId, duration);
```

## 🚨 Alertas

### Configuração de Thresholds

Os thresholds de alerta estão definidos em `lib/monitoring/alerts.ts`:

```typescript
export const ALERT_THRESHOLDS = {
  // Performance
  SLOW_API_RESPONSE: 2000, // ms
  VERY_SLOW_API_RESPONSE: 5000, // ms
  
  // Memory
  HIGH_MEMORY_USAGE: 0.8, // 80%
  CRITICAL_MEMORY_USAGE: 0.9, // 90%
  
  // Error rate
  HIGH_ERROR_RATE: 0.05, // 5%
  CRITICAL_ERROR_RATE: 0.1, // 10%
  
  // Database
  SLOW_QUERY: 1000, // ms
  VERY_SLOW_QUERY: 3000, // ms
};
```

### Tipos de Alertas

**Severidade:**
- `INFO` - Informativo
- `WARNING` - Atenção necessária
- `ERROR` - Erro que precisa correção
- `CRITICAL` - Problema crítico que requer ação imediata

**Alertas Automáticos:**
- API response time (slow/very slow)
- Memory usage (high/critical)
- Database query time (slow/very slow)
- Error rate (high/critical)
- Database connection failure
- Authentication failure spike
- Rate limit exceeded

### Uso de Alertas

```typescript
import { sendAlert, AlertSeverity } from '@/lib/monitoring/alerts';

// Send custom alert
sendAlert(
  'Custom alert message',
  AlertSeverity.WARNING,
  {
    customField: 'value',
    userId: '123',
  }
);

// Alerts are automatically sent by monitoring functions
import { checkApiPerformance } from '@/lib/monitoring/alerts';

checkApiPerformance(endpoint, duration, context);
```

## 📈 Visualização de Métricas

### Endpoint de Métricas

**URL:** `GET /api/metrics`

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "total": 150,
    "byCategory": {
      "business": 50,
      "performance": 70,
      "system": 20,
      "user": 10
    },
    "byType": {
      "counter": 60,
      "gauge": 30,
      "histogram": 40,
      "timer": 20
    },
    "recent": [
      {
        "name": "api.response_time",
        "value": 150,
        "type": "histogram",
        "category": "performance",
        "timestamp": 1700000000000
      }
    ]
  },
  "timestamp": "2024-11-24T19:00:00.000Z"
}
```

### Sentry Dashboard

**Acesso:** https://sentry.io/organizations/[org]/projects/[project]/

**Principais Dashboards:**
1. **Issues** - Erros e exceções
2. **Performance** - Tempo de resposta e transações
3. **Releases** - Tracking de deploys
4. **Alerts** - Regras de alerta configuradas

**Configuração de Dashboards Customizados:**

1. Acesse Sentry → Dashboards → Create Dashboard
2. Adicione widgets:
   - **Error Rate** - Taxa de erros ao longo do tempo
   - **Response Time** - P50, P75, P95, P99
   - **User Impact** - Usuários afetados por erros
   - **Transaction Volume** - Volume de requisições
   - **Custom Metrics** - Métricas de negócio

## 🔍 Debugging com Monitoring

### Encontrar Erros Específicos

**No Sentry:**
1. Issues → Filtrar por tag/contexto
2. Ver stack trace completo
3. Ver breadcrumbs (ações antes do erro)
4. Ver contexto adicional (user, request, etc.)

### Analisar Performance

**No Sentry:**
1. Performance → Transactions
2. Filtrar por endpoint/operação
3. Ver distribuição de tempos (P50, P75, P95, P99)
4. Identificar queries lentas
5. Ver spans individuais

### Correlacionar Eventos

Use o Request ID para correlacionar:
- Logs estruturados
- Métricas
- Erros no Sentry
- Traces de performance

**Exemplo:**
```typescript
// Logs incluem requestId automaticamente
logger.info('Processing request', { requestId });

// Sentry inclui requestId em contexto
Sentry.setContext('request', { requestId });
```

## 📊 Métricas Recomendadas para Monitorar

### SLIs (Service Level Indicators)

**Availability:**
- Uptime percentage
- Health check success rate

**Latency:**
- API response time (P50, P95, P99)
- Database query time
- Page load time

**Error Rate:**
- 5xx errors / total requests
- Failed transactions / total transactions

**Throughput:**
- Requests per second
- Transactions per minute

### Business KPIs

- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention rate
- Feature adoption rate
- Conversion rate

## 🎯 Alertas Recomendados

### Critical Alerts (PagerDuty/SMS)

- Service down (health check failing)
- Critical error rate (>10%)
- Database connection failure
- Memory usage >90%

### Warning Alerts (Email/Slack)

- High error rate (>5%)
- Slow API responses (>2s)
- High memory usage (>80%)
- Authentication failure spike

### Info Alerts (Slack)

- New deploy
- Configuration change
- Scheduled maintenance

## 🔧 Integração com Ferramentas

### Sentry

**Configuração:**
```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
```

### Datadog (Opcional)

Para integração com Datadog:

1. Instalar: `npm install dd-trace`
2. Configurar tracer
3. Enviar métricas customizadas

### CloudWatch (AWS)

Para integração com CloudWatch:

1. Configurar AWS SDK
2. Usar CloudWatch Logs
3. Criar métricas customizadas

## 📚 Best Practices

### Logging

- Use structured logging (JSON)
- Inclua contexto relevante
- Use níveis apropriados (debug, info, warn, error)
- Não logue informações sensíveis

### Métricas

- Nomeie métricas de forma consistente
- Use tags para adicionar dimensões
- Não crie métricas com cardinalidade muito alta
- Agregue métricas quando possível

### Alertas

- Configure alertas baseados em SLIs
- Evite alert fatigue (muitos alertas)
- Teste alertas regularmente
- Documente runbooks para cada alerta

### Performance

- Monitore P95/P99, não apenas média
- Identifique e otimize queries lentas
- Use caching quando apropriado
- Monitore uso de recursos

## 🚀 Próximos Passos

1. **Configurar Dashboards** - Criar dashboards no Sentry
2. **Definir SLOs** - Estabelecer Service Level Objectives
3. **Configurar Alertas** - Criar regras de alerta no Sentry
4. **Integrar com Slack** - Notificações em tempo real
5. **Criar Runbooks** - Documentar procedimentos de resposta
6. **Implementar APM** - Application Performance Monitoring completo

## 📞 Suporte

Para questões sobre monitoramento:
- Documentação: `docs/TESTING_AND_MONITORING.md`
- Sentry Docs: https://docs.sentry.io/
- Equipe de DevOps: devops@intelmarket.com
