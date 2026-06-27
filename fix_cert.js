const { Client } = require('ssh2');
const conn = new Client();

const commands = `
echo ">>> Requesting combined SSL certificate for both nip.io and sslip.io..."
certbot --nginx -d 117.252.16.132.nip.io -d 117.252.16.132.sslip.io --non-interactive --agree-tos -m admin@agnichakra.in --redirect --expand || true
systemctl reload nginx
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
