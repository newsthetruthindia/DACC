const { Client } = require('ssh2');
const conn = new Client();

const commands = `
set -e
echo ">>> Disabling failed Caddy service..."
systemctl stop caddy || true
systemctl disable caddy || true

echo ">>> Creating Nginx reverse proxy config for agnichakra..."
cat << 'EOF' > /etc/nginx/conf.d/agnichakra.conf
server {
    listen 80;
    server_name 117.252.16.132.nip.io 117.252.16.132.sslip.io;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

nginx -t && systemctl reload nginx

echo ">>> Installing certbot and requesting Let's Encrypt SSL certificate..."
dnf install -y certbot python3-certbot-nginx > /dev/null 2>&1 || true
certbot --nginx -d 117.252.16.132.nip.io --non-interactive --agree-tos -m admin@agnichakra.in --redirect || echo "CERTBOT NIP.IO FAILED, TRYING SSLIP.IO"

certbot --nginx -d 117.252.16.132.sslip.io --non-interactive --agree-tos -m admin@agnichakra.in --redirect || echo "CERTBOT SSLIP.IO FAILED"

systemctl reload nginx
echo "=== TESTING HTTPS ENDPOINTS ==="
curl -s -k https://117.252.16.132.nip.io/health || echo "NIP.IO HTTPS FAILED"
curl -s -k https://117.252.16.132.sslip.io/health || echo "SSLIP.IO HTTPS FAILED"
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
