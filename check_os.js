const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('uname -a; cat /etc/os-release', (err, stream) => {
    stream.on('close', () => conn.end()).on('data', d => process.stdout.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
