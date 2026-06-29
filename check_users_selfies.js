const { Client } = require('ssh2');
const conn = new Client();

const commands = `
cd /root/DACC/backend && node -e '
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models").User;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({}, "fname lname email selfieUrl avatarUrl");
  console.log("=== USERS IN DB ===");
  users.forEach(u => {
    const sLen = u.selfieUrl ? u.selfieUrl.length : 0;
    const sPrefix = u.selfieUrl ? u.selfieUrl.slice(0, 30) : "null";
    console.log(\`User: \${u.fname} \${u.lname} (\${u.email}) | selfieLen: \${sLen} | prefix: \${sPrefix}\`);
  });
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
'
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
