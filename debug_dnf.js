const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('dnf install -y nodejs git curl', (err, stream) => {
    stream.on('close', c => { console.log('code:', c); conn.end(); })
          .on('data', d => process.stdout.write(d))
          .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
