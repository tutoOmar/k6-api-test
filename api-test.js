import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const loginErrors = new Rate('login_errors');
const loginResponseTime = new Trend('login_response_time', true);

const users = new SharedArray('users', function () {
  return papaparse.parse(open('./users.csv'), { header: true })
    .data.filter(u => u.user && u.user.trim() !== '');
});

export const options = {
  scenarios: {
    loginLoadTest: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 150,
      stages: [
        { target: 20, duration: '30s' },
        { target: 20, duration: '90s' },
        { target: 0,  duration: '10s' },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<1500'],
    http_req_failed: ['rate<0.03'],
    login_errors: ['rate<0.03'],
  },
};

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];

  if (!user || !user.user || !user.passwd) {
    console.warn('Fila de CSV inválida detectada, saltando...');
    return;
  }

  const payload = JSON.stringify({
    username: user.user.trim(),
    password: user.passwd.trim(),
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const loginRes = http.post('https://fakestoreapi.com/auth/login', payload, params);

  const loginOk = check(loginRes, {
    'login status 2xx': (r) => r.status >= 200 && r.status < 300,
    'has token': (r) => {
      try {
        return JSON.parse(r.body).token !== undefined;
      } catch (_) {
        return false;
      }
    },
  });

  loginResponseTime.add(loginRes.timings.duration);
  loginErrors.add(!loginOk);

  if (!loginOk) {
    console.error(`Fallo Login: Status ${loginRes.status} - Body: ${loginRes.body} - User: ${user.user}`);
  }
}

export function handleSummary(data) {
  return {
    'reports/summary.html': htmlReport(data),
    'reports/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
