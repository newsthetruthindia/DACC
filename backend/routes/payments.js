const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const { Payment, User, ClubTerm } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { PLANS, buildUpiLink, currentMonth } = require('../lib/plans');
const { sendPaymentConfirmed, sendPaymentReminder } = require('../lib/email');
const { notifyPaymentConfirmed } = require('../lib/telegram');

// Multer config for payment screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/payments/'),
  filename:    (req, file, cb) => cb(null, `pay_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── GET /payments/my ──────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ forMonth: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /payments/upi-link ────────────────────────────────────
router.get('/upi-link', protect, async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    const plan  = req.user.plan;
    const link  = buildUpiLink(plan, month);
    res.json({ success: true, data: { link, amount: PLANS[plan].price, month, plan } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /payments/submit ─────────────────────────────────────
// Member submits UTR + optional screenshot after paying via UPI
router.post('/submit', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const { forMonth, upiRef } = req.body;
    const month = forMonth || currentMonth();
    const plan  = req.user.plan;

    const updateFields = {
      userId: req.user._id,
      forMonth: month,
      amount: PLANS[plan].price,
      plan,
      status: 'PENDING',
    };
    if (upiRef !== undefined) updateFields.upiRef = upiRef || null;
    if (req.file) updateFields.screenshotUrl = `/uploads/payments/${req.file.filename}`;

    const payment = await Payment.findOneAndUpdate(
      { userId: req.user._id, forMonth: month },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { paymentId: payment._id, status: 'PENDING' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /payments/confirm ────────────────────────────────────
router.post('/confirm', protect, restrictTo('PANEL', 'SUPER_ADMIN', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'CONFIRMED', confirmedBy: req.user._id, confirmedAt: new Date() },
      { new: true }
    ).populate('userId', 'fname lname email plan memberId telegramChatId');

    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    // Send confirmation email & telegram alert
    const u = payment.userId;
    sendPaymentConfirmed(u.email, u.fname, payment.forMonth, payment.amount).catch(console.error);
    notifyPaymentConfirmed(u, payment.amount, payment.forMonth, false).catch(console.error);

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /payments/pending ─────────────────────────────────────
router.get('/pending', protect, restrictTo('PANEL', 'SUPER_ADMIN', 'ACCOUNTANT'), async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'PENDING' })
      .populate('userId', 'fname lname email phone plan')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /payments/dues-summary ────────────────────────────────
router.get('/dues-summary', protect, restrictTo('PANEL', 'SUPER_ADMIN', 'ACCOUNTANT'), async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    const allMembers = await User.find({ status: 'ACTIVE' });
    const confirmed  = await Payment.find({ forMonth: month, status: 'CONFIRMED' });
    const pending    = await Payment.find({ forMonth: month, status: 'PENDING' });

    const confirmedIds = new Set(confirmed.map(p => p.userId.toString()));
    const pendingIds   = new Set(pending.map(p => p.userId.toString()));

    const breakdown = { SILVER: {}, GOLD: {}, PLATINUM: {} };
    for (const tier of ['SILVER', 'GOLD', 'PLATINUM']) {
      const tier_members = allMembers.filter(m => m.plan === tier);
      breakdown[tier] = {
        total:     tier_members.length,
        confirmed: tier_members.filter(m => confirmedIds.has(m._id.toString())).length,
        pending:   tier_members.filter(m => pendingIds.has(m._id.toString())).length,
        amount:    PLANS[tier].price,
      };
      breakdown[tier].notSubmitted = breakdown[tier].total - breakdown[tier].confirmed - breakdown[tier].pending;
    }

    const totalRevenue = confirmed.reduce((s, p) => s + p.amount, 0);

    res.json({
      success: true,
      data: {
        month,
        total:        allMembers.length,
        confirmed:    confirmed.length,
        pending:      pending.length,
        notSubmitted: allMembers.length - confirmed.length - pending.length,
        totalRevenue,
        breakdown,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /payments/send-reminders ─────────────────────────────
// Admin triggers email reminders to all members who haven't paid
router.post('/send-reminders', protect, restrictTo('SUPER_ADMIN', 'PANEL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const month = req.body.month || currentMonth();
    const confirmed = await Payment.find({ forMonth: month, status: 'CONFIRMED' });
    const paidIds   = new Set(confirmed.map(p => p.userId.toString()));
    const unpaid    = await User.find({ status: 'ACTIVE', _id: { $nin: [...paidIds] } });

    let sent = 0;
    for (const u of unpaid) {
      const link = buildUpiLink(u.plan, month);
      await sendPaymentReminder(u.email, u.fname, month, PLANS[u.plan].price, link).catch(() => {});
      sent++;
    }

    res.json({ success: true, data: { sent, month } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
