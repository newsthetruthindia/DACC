const { Client } = require('ssh2');
const conn = new Client();

const commands = `
echo "=== CHECKING CORS CONFIG IN SERVER.JS ==="
grep -i -C 5 "cors" /root/DACC/backend/server.js || echo "NO CORS FOUND IN SERVER.JS"
echo "\n=== CHECKING FRONTEND_URL IN .ENV ==="
cat /root/DACC/backend/.env
echo "\n=== TESTING OPTIONS PREFLIGHT WITH CURL ==="
curl -s -k -I -X OPTIONS https://117.252.16.132.nip.io/api/v1/auth/login \
  -H "Origin: https://dacc-g3jv.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" || true
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
