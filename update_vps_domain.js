const { Client } = require('ssh2');
const conn = new Client();

const commands = `
set -e
echo ">>> Updating .env on VPS..."
cd /root/DACC/backend
if grep -q "FROM_EMAIL" .env; then
  sed -i 's/^FROM_EMAIL=.*/FROM_EMAIL=noreply@agnichakra.live/' .env
else
  echo "FROM_EMAIL=noreply@agnichakra.live" >> .env
fi

if grep -q "FRONTEND_URL" .env; then
  sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://agnichakra.live|' .env
else
  echo "FRONTEND_URL=https://agnichakra.live" >> .env
fi

echo ">>> Restarting backend..."
pm2 restart agnichakra-api > /dev/null 2>&1 || true

echo "✅ ALL DONE"
`;

conn.on('ready', () => {
  console.log('🔗 Connected to VPS!');
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
