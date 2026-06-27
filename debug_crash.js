const { Client } = require('ssh2');
const conn = new Client();

const commands = `
echo "=== WHAT IS USING PORT 80/443? ==="
netstat -tlpn | grep -E ':80|:443' || ss -tlpn | grep -E ':80|:443' || echo "Nothing found"
echo "=== PM2 CRASH LOGS ==="
pm2 logs agnichakra-api --lines 30 --nostream
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
