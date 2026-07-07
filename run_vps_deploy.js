const { Client } = require('ssh2');
const conn = new Client();

const commands = `
cat << 'EOF' > /root/DACC/backend/list_users.js
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({}, 'email role fname lname');
  console.log(users);
  process.exit(0);
});
EOF
cd /root/DACC/backend
node list_users.js
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
