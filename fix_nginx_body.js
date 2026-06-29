const { Client } = require('ssh2');
const conn = new Client();

const commands = `
echo ">>> Setting Nginx client_max_body_size to 50M..."
echo "client_max_body_size 50M;" > /etc/nginx/conf.d/client_max_body_size.conf
nginx -t && systemctl reload nginx
echo ">>> Nginx reloaded successfully!"
`;

conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
