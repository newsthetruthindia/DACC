const { Client } = require('ssh2');
const conn = new Client();

const commands = `
echo "RESEND_API_KEY=re_123456789_dummy_api_key_for_startup" >> /root/DACC/backend/.env
pm2 restart agnichakra-api
sleep 3
pm2 list
curl -s http://localhost:4000/health || echo "STILL FAILING"
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
