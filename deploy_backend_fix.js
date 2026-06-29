const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const serverJsContent = fs.readFileSync('backend/server.js', 'utf8').replace(/\\/g, '\\\\').replace(/\"/g, '\\"').replace(/\$/g, '\\$');

const commands = `
cat << 'EOF' > /root/DACC/backend/server.js
${fs.readFileSync('backend/server.js', 'utf8')}
EOF
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
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
