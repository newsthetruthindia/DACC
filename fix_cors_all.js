const { Client } = require('ssh2');
const conn = new Client();

const commands = `
node -e '
const fs = require("fs");
let code = fs.readFileSync("/root/DACC/backend/server.js", "utf8");
code = code.replace(/app\.use\(cors\(.*?\)\);/g, "app.use(cors({ origin: true, credentials: true }));");
fs.writeFileSync("/root/DACC/backend/server.js", code);
'
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
