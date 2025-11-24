import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be below 1%
    errors: ['rate<0.1'],              // Custom error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in <500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test health check
  res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response is valid': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(1);

  // Test metrics endpoint
  res = http.get(`${BASE_URL}/api/metrics`);
  check(res, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'load-tests/results/summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `${indent}Test Summary:\n`;
  summary += `${indent}  Scenarios: ${data.metrics.scenarios ? Object.keys(data.metrics.scenarios).length : 0}\n`;
  summary += `${indent}  Checks: ${data.metrics.checks ? data.metrics.checks.passes : 0} passed, ${data.metrics.checks ? data.metrics.checks.fails : 0} failed\n`;
  summary += `${indent}  Requests: ${data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0}\n`;
  
  return summary;
}
