# Load Testing Guide

Este diretório contém scripts de load testing usando k6.

## 📋 Pré-requisitos

### Instalar k6

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

## 🚀 Executando Testes

### Basic Load Test

Testa a aplicação com carga gradual até 100 usuários.

```bash
k6 run load-tests/basic-load-test.js
```

**Com variáveis de ambiente:**
```bash
BASE_URL=https://staging.intelmarket.com.br k6 run load-tests/basic-load-test.js
```

### Stress Test

Testa os limites da aplicação com até 300 usuários.

```bash
k6 run load-tests/stress-test.js
```

### Spike Test

Testa a recuperação da aplicação após picos súbitos de tráfego.

```bash
k6 run load-tests/spike-test.js
```

### Soak Test

Testa a estabilidade da aplicação por período prolongado.

```bash
k6 run load-tests/soak-test.js
```

## 📊 Interpretando Resultados

### Métricas Principais

- **http_req_duration:** Tempo de resposta das requisições
  - p(95) < 500ms: Excelente
  - p(95) < 1000ms: Bom
  - p(95) > 2000ms: Precisa otimização

- **http_req_failed:** Taxa de erro
  - < 1%: Excelente
  - < 5%: Aceitável
  - > 10%: Crítico

- **http_reqs:** Requisições por segundo (RPS)
  - Indica throughput da aplicação

- **vus:** Virtual Users (usuários simultâneos)
  - Indica carga atual

### Exemplo de Output

```
     ✓ homepage status is 200
     ✓ homepage loads in <500ms
     ✓ health check status is 200

     checks.........................: 100.00% ✓ 3000      ✗ 0
     data_received..................: 15 MB   250 kB/s
     data_sent......................: 300 kB  5.0 kB/s
     http_req_blocked...............: avg=1.2ms    min=0s      med=1ms     max=50ms    p(90)=2ms     p(95)=3ms
     http_req_duration..............: avg=150ms    min=50ms    med=140ms   max=500ms   p(90)=200ms   p(95)=250ms
     http_req_failed................: 0.00%   ✓ 0         ✗ 1000
     http_reqs......................: 1000    16.666667/s
     vus............................: 100     min=10      max=100
```

## 🎯 Thresholds

Os testes estão configurados com os seguintes thresholds:

### Basic Load Test
- `http_req_duration: p(95) < 500ms`
- `http_req_failed: rate < 0.01` (< 1% de erros)

### Stress Test
- `http_req_duration: p(99) < 1000ms`
- `http_req_failed: rate < 0.05` (< 5% de erros)

## 📈 Monitoramento Durante Testes

### Sentry

Monitore erros em tempo real no Sentry durante os testes:
https://sentry.io/organizations/[org]/projects/[project]/

### Logs

Acompanhe logs da aplicação:
```bash
docker logs -f intelmarket-staging
```

### Métricas

Acesse o endpoint de métricas:
```bash
curl http://localhost:3000/api/metrics
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
BASE_URL=https://staging.intelmarket.com.br \
K6_OUT=json=results.json \
k6 run load-tests/basic-load-test.js
```

### Output para InfluxDB

```bash
k6 run --out influxdb=http://localhost:8086/k6 load-tests/basic-load-test.js
```

### Output para Grafana Cloud

```bash
K6_CLOUD_TOKEN=your_token k6 cloud load-tests/basic-load-test.js
```

## 📝 Criando Novos Testes

### Template Básico

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get('http://localhost:3000');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

## 🚨 Alertas

Configure alertas baseados nos resultados:

1. **Slack:** Notificações em tempo real
2. **Email:** Relatórios pós-teste
3. **PagerDuty:** Incidentes críticos

## 📚 Recursos

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [Best Practices](https://k6.io/docs/testing-guides/running-large-tests/)

---

**Última atualização:** 24 de Novembro de 2024
