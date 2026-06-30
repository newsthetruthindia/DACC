require('dotenv').config();
const { Client } = require('ssh2');
const conn = new Client();

const commands = `
cd /root/DACC
git reset --hard
git pull origin main
cd backend
npm install
pm2 restart agnichakra-api
sleep 2
pm2 list
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: process.env.VPS_PASSWORD });
