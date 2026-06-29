const https = require('https');

const getBotToken = () => process.env.TELEGRAM_BOT_TOKEN || '';
const getGroupId  = () => process.env.TELEGRAM_GROUP_ID || '';

/**
 * Send message via Telegram Bot API using raw https (no external dependency needed)
 */
function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  return new Promise((resolve) => {
    const token = getBotToken();
    if (!token || !chatId) {
      resolve(false);
      return;
    }

    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: parseMode
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.ok);
        } catch (e) {
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Telegram API Error]:', err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Send broadcast alert to the official Club Group / Supergroup
 */
async function sendGroupAlert(text) {
  const groupId = getGroupId();
  if (!groupId) return false;
  return await sendTelegramMessage(groupId, text);
}

/**
 * Notify member of payment confirmation + update live group ticker
 */
async function notifyPaymentConfirmed(user, amount, month, isOffline = false) {
  const methodStr = isOffline ? 'Offline Cash Receipt' : 'UPI Verified Receipt';
  
  // 1. Send private Telegram receipt if user linked their Telegram
  if (user.telegramChatId) {
    const userMsg = `🎉 <b>Payment Verified!</b>\n\nDear <b>${user.fname} ${user.lname}</b> (${user.memberId||'Member'}),\nYour contribution of <b>₹${amount}</b> for <b>${month}</b> has been confirmed via ${methodStr}.\n\nThank you for supporting Agnichakra Club! 🔥`;
    await sendTelegramMessage(user.telegramChatId, userMsg);
  }

  // 2. Post public ticker to Club Supergroup
  const groupMsg = `💰 <b>Live Fund Ticker</b>\n\n✅ <b>${user.fname} ${user.lname}</b> (${user.memberId||'AGC-Member'}) contributed <b>₹${amount}</b> for ${month} (${methodStr}).\n\n<i>Transparent Accounting Portal</i>`;
  await sendGroupAlert(groupMsg);
}

module.exports = {
  sendTelegramMessage,
  sendGroupAlert,
  notifyPaymentConfirmed
};
