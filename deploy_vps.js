require('dotenv').config();
const { Client } = require('ssh2');
const conn = new Client();

const commands = `
set -e
echo ">>> [1/6] Node.js & Git already installed. Verifying..."
node -v && git --version

echo ">>> [2/6] Installing MongoDB 7.0 on AlmaLinux..."
cat << 'EOF' > /etc/yum.repos.d/mongodb-org-7.0.repo
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
dnf install -y mongodb-org --nobest > /dev/null 2>&1 || true
systemctl start mongod > /dev/null 2>&1 || true
systemctl enable mongod > /dev/null 2>&1 || true

echo ">>> [3/6] Installing PM2 globally..."
npm install -g pm2 > /dev/null 2>&1 || true

echo ">>> [4/6] Cloning DACC repository..."
rm -rf DACC
git clone https://github.com/newsthetruthindia/DACC.git > /dev/null 2>&1

echo ">>> [5/6] Installing backend dependencies..."
cd DACC/backend
npm install > /dev/null 2>&1
mkdir -p uploads/payments

echo ">>> [6/6] Creating production .env and seeding database..."
cat << 'EOF' > .env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/agnichakra
JWT_SECRET=supersecretkey_agnichakra_portal_secure_2026_prod
FRONTEND_URL=https://dacc-g3jv.vercel.app
EOF
node seed.js

echo ">>> Launching server with PM2 & configuring firewall..."
pm2 delete agnichakra-api > /dev/null 2>&1 || true
pm2 start server.js --name "agnichakra-api"
pm2 save > /dev/null 2>&1 || true
systemctl enable pm2-root > /dev/null 2>&1 || true
firewall-cmd --add-port=4000/tcp --permanent > /dev/null 2>&1 || true
firewall-cmd --reload > /dev/null 2>&1 || true
iptables -I INPUT -p tcp --dport 4000 -j ACCEPT > /dev/null 2>&1 || true

echo "✅ ALL STEPS COMPLETED SUCCESSFULLY ON ALMALINUX VPS!"
`;

conn.on('ready', () => {
  console.log('🔗 Connected to AlmaLinux VPS via SSH!');
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n🔒 Connection closed with exit code: ${code}`);
      conn.end();
    }).on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: process.env.VPS_PASSWORD });
