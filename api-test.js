import http from 'k6/http';
import { check, sleep } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', function () {
  return papaparse.parse(open('./users.csv'), { header: true })
    .data.filter(u => u.user && u.user.trim() !== '');
});

export const options = {
  vus: 5,
  duration: '10s',
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

  if (!loginOk) {
    console.error(`Fallo Login: Status ${loginRes.status} - Body: ${loginRes.body} - User: ${user.user}`);
  }

  sleep(1);
}
