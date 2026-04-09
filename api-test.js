import http from 'k6/http';
import { check, sleep } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', function () {
  return papaparse.parse(open('./users.csv'), { header: true }).data;
});

export const options = {
  vus: 5,
  duration: '10s',
};

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];

  const payload = JSON.stringify({
    username: user.user,
    password: user.passwd,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // POST - Login
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
  // Si el login fue exitoso, usar el token en una petición autenticada
  if (loginOk) {
    const token = JSON.parse(loginRes.body).token;

    const authParams = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    // GET autenticado con el token
    const productsRes = http.get('https://fakestoreapi.com/products', authParams);

    check(productsRes, {
      'get products status 2xx': (r) => r.status >= 200 && r.status < 300,
      'products list not empty': (r) => {
        try {
          return JSON.parse(r.body).length > 0;
        } catch (_) {
          return false;
        }
      },
    });
  }

  sleep(1);
}
