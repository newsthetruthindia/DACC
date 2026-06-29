require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { User, Payment, FundTransaction, Message, ClubTerm, Notification } = require('./models');
const { currentMonth, PLANS, buildUpiLink } = require('./lib/plans');
const { sendPaymentReminder } = require('./lib/email');

const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function runCron() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agnichakra';
  console.log(`[Cron] Connecting to database...`);
  await mongoose.connect(mongoUri);
  console.log(`[Cron] Connected successfully.`);

  const today = new Date();
  const dayOfMonth = today.getDate();
  const dateStr = today.toISOString().split('T')[0];
  const forceReminders = process.argv.includes('--force-reminders') || dayOfMonth === 1 || dayOfMonth === 16;

  // ── 1. AUTOMATED DATABASE BACKUP (Item 10) ──────────────────────
  console.log(`[Cron] Starting full MongoDB backup for ${dateStr}...`);
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      users: await User.find(),
      payments: await Payment.find(),
      fundTransactions: await FundTransaction.find(),
      messages: await Message.find(),
      clubTerms: await ClubTerm.find(),
      notifications: await Notification.find()
    };

    const backupFile = path.join(BACKUP_DIR, `backup_${dateStr}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`[Cron] Backup successful! Saved ${Object.keys(backupData).length - 1} collections to ${backupFile}`);

    // Cleanup backups older than 60 days
    const files = fs.readdirSync(BACKUP_DIR);
    files.forEach(f => {
      const filePath = path.join(BACKUP_DIR, f);
      const stat = fs.statSync(filePath);
      if (Date.now() - stat.mtimeMs > 60 * 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        console.log(`[Cron] Cleaned up old backup: ${f}`);
      }
    });
  } catch (err) {
    console.error(`[Cron] Backup failed:`, err.message);
  }

  // ── 2. 1st & 16th AUTOMATED PAYMENT REMINDERS (Item 1) ──────────
  if (forceReminders) {
    console.log(`[Cron] Day ${dayOfMonth}: Triggering automated payment reminders for unpaid members...`);
    try {
      const month = currentMonth();
      const confirmed = await Payment.find({ forMonth: month, status: 'CONFIRMED' });
      const paidIds = new Set(confirmed.map(p => p.userId.toString()));
      const unpaid = await User.find({ status: 'ACTIVE', _id: { $nin: [...paidIds] } });

      let emailCount = 0;
      for (const u of unpaid) {
        const pl = PLANS[u.plan] || PLANS.SILVER;
        const link = buildUpiLink(u.plan, month);
        await sendPaymentReminder(u.email, u.fname, month, pl.price, link).catch(() => {});
        emailCount++;
      }
      console.log(`[Cron] Sent payment reminder emails to ${emailCount} active members.`);

      // Create in-app system notification if not already posted today
      const notifTitle = `📢 Season Dues Reminder (${month})`;
      const exists = await Notification.findOne({ title: notifTitle, createdAt: { $gte: new Date(today.setHours(0,0,0,0)) } });
      if (!exists && unpaid.length > 0) {
        await Notification.create({
          title: notifTitle,
          body: `Friendly reminder: Season contribution for ${month} is due for ${unpaid.length} members. Please clear via UPI or contact our accountants at the club desk.`,
          type: 'PAYMENT_REMINDER',
          targetRole: 'ALL'
        });
        console.log(`[Cron] Created public payment reminder announcement.`);
      }
    } catch (err) {
      console.error(`[Cron] Automated reminders failed:`, err.message);
    }
  }

  // ── 3. MONTHLY FINANCIAL FREEZE & BROADCAST (Item 4) ────────────
  if (dayOfMonth === 1) {
    console.log(`[Cron] 1st of the month: Generating monthly financial wrap-up broadcast...`);
    try {
      // Calculate previous month string (e.g. if today is 2026-07-01, prev month is 2026-06)
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const prevMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const prevPayments = await Payment.find({ forMonth: prevMonth, status: 'CONFIRMED' });
      const duesTotal = prevPayments.reduce((s, p) => s + (p.amount || 0), 0);

      // Get start/end of prev month for ledger txs
      const startOfPrev = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfPrev = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const txs = await FundTransaction.find({ date: { $gte: startOfPrev, $lte: endOfPrev } });
      const extraInc = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const expTotal = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      const totalRev = duesTotal + extraInc;
      const netSavings = totalRev - expTotal;

      const summaryTitle = `📊 Monthly Financial Wrap-up (${prevMonth})`;
      const summaryBody = `Here is the transparent financial summary for ${prevMonth}:\n• Total Collected: ₹${totalRev.toLocaleString()} (${prevPayments.length} member dues + extra income)\n• Club Costs & Equipment: ₹${expTotal.toLocaleString()}\n• Net Monthly Savings: ₹${netSavings.toLocaleString()}\n\nThank you to all contributing athletes and our committee accountants! Check the Funds tab for full ledger details.`;

      const notifExists = await Notification.findOne({ title: summaryTitle });
      if (!notifExists) {
        await Notification.create({
          title: summaryTitle,
          body: summaryBody,
          type: 'FINANCIAL_SUMMARY',
          targetRole: 'ALL'
        });
        console.log(`[Cron] Posted monthly financial wrap-up announcement!`);
      }
    } catch (err) {
      console.error(`[Cron] Monthly broadcast failed:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log(`[Cron] Task completed.`);
  process.exit(0);
}

runCron();
