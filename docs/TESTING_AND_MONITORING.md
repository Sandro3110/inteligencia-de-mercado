# Testing and Monitoring

Este documento descreve a configuração de testes e monitoramento do projeto Intelmarket.

## 📋 Índice

- [Testes](#testes)
- [Monitoramento](#monitoramento)
- [Health Checks](#health-checks)
- [Logging](#logging)

## 🧪 Testes

### Configuração

O projeto utiliza **Jest** e **React Testing Library** para testes frontend.

**Arquivos de configuração:**
- `jest.config.js` - Configuração principal do Jest
- `jest.setup.js` - Setup e mocks globais

### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

### Estrutura de Testes

```
src/components/__tests__/
├── Button.test.tsx       # 19 testes
├── Badge.test.tsx        # 22 testes
├── Input.test.tsx        # 31 testes
└── Card.test.tsx         # 35 testes
```

### Cobertura de Testes

**Metas de Cobertura:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

**Status Atual:**
- ✅ 107 testes passando
- ✅ 4 suites de componentes completas
- ✅ 100% de sucesso nos testes

### Escrevendo Testes

**Exemplo de teste de componente:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../components/ui/button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📊 Monitoramento

### Sentry

O projeto está configurado com **Sentry** para monitoramento de erros e performance.

**Arquivos de configuração:**
- `sentry.client.config.ts` - Configuração para o cliente (browser)
- `sentry.server.config.ts` - Configuração para o servidor
- `sentry.edge.config.ts` - Configuração para Edge Runtime
- `instrumentation.ts` - Inicialização do Sentry

### Configuração do Sentry

**Variáveis de ambiente necessárias:**

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Error Boundary

O componente `ErrorBoundary` captura erros React e os envia automaticamente para o Sentry.

**Uso:**

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Captura Manual de Erros

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Código que pode falhar
} catch (error) {
  Sentry.captureException(error, {
    contexts: {
      custom: {
        userId: user.id,
        action: 'data_fetch',
      },
    },
  });
}
```

### Performance Monitoring

O Sentry está configurado para monitorar performance:

- **Production:** 10% das transações são amostradas
- **Development:** 100% das transações são amostradas

## 🏥 Health Checks

O projeto possui três endpoints de health check:

### 1. Liveness Check

**Endpoint:** `GET /api/live`

Verifica se a aplicação está viva e rodando.

**Resposta:**
```json
{
  "status": "alive",
  "timestamp": "2024-11-24T19:00:00.000Z",
  "uptime": 3600
}
```

### 2. Readiness Check

**Endpoint:** `GET /api/ready`

Verifica se a aplicação está pronta para receber tráfego (database conectado).

**Resposta (sucesso):**
```json
{
  "status": "ready",
  "timestamp": "2024-11-24T19:00:00.000Z"
}
```

**Resposta (falha):**
```json
{
  "status": "not ready",
  "timestamp": "2024-11-24T19:00:00.000Z",
  "error": "Database connection failed"
}
```

### 3. Health Check

**Endpoint:** `GET /api/health`

Verifica o status completo da aplicação e suas dependências.

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-24T19:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "memory": "healthy"
  },
  "responseTime": "15ms",
  "memory": {
    "rss": 150,
    "heapTotal": 100,
    "heapUsed": 75,
    "external": 10
  }
}
```

### Uso em Docker/Kubernetes

**Docker Compose:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Kubernetes:**
```yaml
livenessProbe:
  httpGet:
    path: /api/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```

## 📝 Logging

### Logger Estruturado

O projeto possui um logger estruturado que integra com Sentry.

**Localização:** `lib/logger.ts`

### Uso do Logger

```typescript
import { log } from '@/lib/logger';

// Debug (apenas em desenvolvimento)
log.debug('Debug message', { userId: '123' });

// Info
log.info('User logged in', { userId: '123', email: 'user@example.com' });

// Warning (enviado para Sentry)
log.warn('Slow query detected', { query: 'SELECT *', duration: '2000ms' });

// Error (enviado para Sentry)
log.error('Failed to fetch data', error, { userId: '123' });
```

### Child Logger

Crie loggers com contexto adicional:

```typescript
import { logger } from '@/lib/logger';

const userLogger = logger.child({ userId: '123', email: 'user@example.com' });

userLogger.info('Action performed'); // Inclui userId e email automaticamente
```

### Middleware de Logging

Para APIs, use o middleware de logging:

```typescript
import { withLogging, withPerformanceMonitoring } from '@/lib/middleware/logging';

export const GET = withLogging(
  withPerformanceMonitoring(async (req) => {
    // Sua lógica aqui
    return NextResponse.json({ data: 'response' });
  }, 1000) // Threshold de 1000ms para slow requests
);
```

### Formato de Log

Todos os logs são estruturados em JSON:

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-11-24T19:00:00.000Z",
  "context": {
    "userId": "123",
    "email": "user@example.com"
  }
}
```

## 🔧 Próximos Passos

### Testes

- [ ] Adicionar testes E2E com Playwright
- [ ] Aumentar cobertura de testes para 80%+
- [ ] Adicionar testes de integração para APIs
- [ ] Configurar CI/CD para executar testes automaticamente

### Monitoramento

- [ ] Configurar alertas no Sentry
- [ ] Adicionar dashboards de performance
- [ ] Implementar distributed tracing
- [ ] Configurar alertas para health checks

### Logging

- [ ] Integrar com serviço de log aggregation (ex: Datadog, CloudWatch)
- [ ] Adicionar logs de auditoria
- [ ] Implementar log rotation
- [ ] Adicionar métricas customizadas

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Testing](https://nextjs.org/docs/testing)
