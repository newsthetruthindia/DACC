const { Client } = require('ssh2');
const conn = new Client();

const commands = `
set -e
echo ">>> Installing Caddy Web Server for automatic HTTPS..."
dnf install -y 'dnf-command(copr)' > /dev/null 2>&1 || true
dnf copr enable -y @caddy/caddy > /dev/null 2>&1 || true
dnf install -y caddy > /dev/null 2>&1

echo ">>> Configuring Caddy reverse proxy for 117.252.16.132.nip.io..."
cat << 'EOF' > /etc/caddy/Caddyfile
117.252.16.132.nip.io {
    reverse_proxy localhost:4000
}
EOF

echo ">>> Opening ports 80 & 443 in firewall..."
firewall-cmd --add-service=http --permanent > /dev/null 2>&1 || true
firewall-cmd --add-service=https --permanent > /dev/null 2>&1 || true
firewall-cmd --reload > /dev/null 2>&1 || true
iptables -I INPUT -p tcp --dport 80 -j ACCEPT > /dev/null 2>&1 || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT > /dev/null 2>&1 || true

echo ">>> Starting Caddy service..."
systemctl restart caddy
systemctl enable caddy

echo "✅ Caddy SSL setup complete!"
`;

conn.on('ready', () => {
  console.log('🔗 Connected to AlmaLinux VPS via SSH!');
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', code => { console.log('exit:', code); conn.end(); })
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
