import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

// Stress test configuration - Push system to limits
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Stay at 200 users
    { duration: '2m', target: 300 },  // Ramp up to 300 users
    { duration: '5m', target: 300 },  // Stay at 300 users
    { duration: '10m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<1000'], // 99% of requests should be below 1s
    http_req_failed: ['rate<0.05'],    // Error rate should be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/`],
    ['GET', `${BASE_URL}/api/health`],
    ['GET', `${BASE_URL}/api/live`],
    ['GET', `${BASE_URL}/api/ready`],
    ['GET', `${BASE_URL}/api/metrics`],
  ]);

  responses.forEach((res) => {
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 1s': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);
  });

  sleep(1);
}
