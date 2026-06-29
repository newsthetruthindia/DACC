const { execSync } = require('child_process');

const VPS_IP = '117.252.16.132';
const VPS_USER = 'root';
const CRON_CMD = '0 3 * * * cd /root/agnichakra/backend && /usr/bin/node cron_runner.js >> /var/log/agnichakra_cron.log 2>&1';

console.log(`[VPS Cron Setup] Setting up daily backup & 1st/16th automated reminder cron job on ${VPS_IP}...`);

try {
  // Check if crontab entry already exists or add it
  const sshCmd = `ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "(crontab -l 2>/dev/null | grep -v 'cron_runner.js'; echo '${CRON_CMD}') | crontab -"`;
  execSync(sshCmd, { stdio: 'inherit' });
  console.log(`[VPS Cron Setup] Successfully installed crontab entry on VPS!`);
  
  // Also run a test run of the cron right now to verify backup creation
  console.log(`[VPS Cron Setup] Running initial verification backup test on VPS...`);
  execSync(`ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "cd /root/agnichakra/backend && node cron_runner.js"`, { stdio: 'inherit' });
  console.log(`[VPS Cron Setup] Initial verification complete!`);
} catch (err) {
  console.error(`[VPS Cron Setup] Failed:`, err.message);
}
