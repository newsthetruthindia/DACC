const { Client } = require('ssh2');
const conn = new Client();

const commands = `
echo "=== LOCAL POST LOGIN ==="
curl -s -X POST http://localhost:4000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"rony@agnichakra.in","password":"demo123"}' || echo "LOCAL LOGIN FAILED"
echo "\n=== HTTPS POST LOGIN ==="
curl -s -k -X POST https://117.252.16.132.nip.io/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"rony@agnichakra.in","password":"demo123"}' || echo "HTTPS LOGIN FAILED"
echo "\n=== CHECK NGINX ERROR LOG ==="
tail -n 10 /var/log/nginx/error.log || true
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
