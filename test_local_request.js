const https = require('https');

function testEndpoint(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const req = https.request(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {} }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (err) => resolve({ error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log("=== TESTING NIP.IO LOGIN FROM LOCAL WINDOWS ===");
  console.log(await testEndpoint('https://117.252.16.132.nip.io/api/v1/auth/login', 'POST', { email: 'rony@agnichakra.in', password: 'demo123' }));
}

run();
