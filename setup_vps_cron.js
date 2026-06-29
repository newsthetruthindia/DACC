const { Client } = require('ssh2');
const conn = new Client();

const CRON_CMD = '0 3 * * * cd /root/DACC/backend && /usr/bin/node cron_runner.js >> /var/log/agnichakra_cron.log 2>&1';

const commands = `
echo "[VPS Cron Setup] Installing crontab..."
(crontab -l 2>/dev/null | grep -v 'cron_runner.js'; echo '${CRON_CMD}') | crontab -
crontab -l | grep cron_runner.js
echo "[VPS Cron Setup] Running verification backup test on VPS..."
cd /root/DACC/backend
node cron_runner.js
ls -lh backups/
`;

console.log('[VPS Cron Setup] Connecting to VPS via SSH2...');
conn.on('ready', () => {
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('[VPS Cron Setup] Completed with code ' + code);
      conn.end();
    })
    .on('data', d => process.stdout.write(d))
    .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '117.252.16.132', port: 22, username: 'root', password: '$9T%Lk057bzu' });
