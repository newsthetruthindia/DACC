const { Client } = require('ssh2');
const conn = new Client();

const commands = `
echo "=== PM2 STATUS ==="
pm2 list
echo "=== CADDY STATUS ==="
systemctl status caddy --no-pager || true
echo "=== CADDY LOGS ==="
journalctl -u caddy --no-pager -n 20 || true
echo "=== CURL LOCALHOST:4000 ==="
curl -s http://localhost:4000/health || echo "CURL LOCAL FAILED"
echo "=== CURL HTTPS NIP.IO ==="
curl -s -k https://117.252.16.132.nip.io/health || echo "CURL NIP.IO FAILED"
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
