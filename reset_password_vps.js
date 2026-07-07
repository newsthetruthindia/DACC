const { Client } = require('ssh2');
const conn = new Client();

const commands = `
cat << 'EOF' > /root/DACC/backend/reset_password.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const superAdmin = await User.findOne({ email: 'santrarony9@gmail.com' });
  if (!superAdmin) {
    console.error('Super Admin not found.');
    process.exit(1);
  }
  superAdmin.passwordHash = await bcrypt.hash('admin123', 12);
  await superAdmin.save();
  console.log('Password reset successfully to: admin123');
  process.exit(0);
});
EOF
cd /root/DACC/backend
node reset_password.js
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
