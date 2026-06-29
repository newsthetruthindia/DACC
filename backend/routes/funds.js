const router = require('express').Router();
const { FundTransaction, Payment, User } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { currentMonth, PLANS } = require('../lib/plans');

// ── GET /funds/roster (Public member dues roster for all members) ──
router.get('/roster', protect, async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    const members = await User.find({ status: { $in: ['ACTIVE', 'PENDING'] } })
      .select('fname lname plan memberId avatarUrl selfieUrl status role')
      .sort({ fname: 1 });

    const payments = await Payment.find({ forMonth: month, status: 'CONFIRMED' });
    const paidSet = new Set(payments.map(p => p.userId.toString()));

    const data = members.map(m => ({
      ...m.toObject(),
      paidThisMonth: paidSet.has(m._id.toString())
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /funds (All members can view transparent ledger) ─────────
router.get('/', protect, async (req, res) => {
  try {
    const confirmedPayments = await Payment.find({ status: 'CONFIRMED' }).populate('userId', 'fname lname memberId');
    const memberDuesTotal = confirmedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    const txs = await FundTransaction.find().sort({ date: -1 }).populate('addedBy', 'fname lname role');

    const extraIncomeTotal = txs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expensesTotal    = txs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

    const totalCollected = memberDuesTotal + extraIncomeTotal;
    const balance = totalCollected - expensesTotal;

    const duesEntries = confirmedPayments.slice(0, 100).map(p => ({
      _id: 'due_' + p._id,
      title: `Monthly Dues: ${p.userId ? `${p.userId.fname} ${p.userId.lname} (${p.userId.memberId||'Member'})` : 'Member'} - ${p.forMonth}`,
      type: 'INCOME',
      category: 'Season Dues',
      amount: p.amount,
      date: p.confirmedAt || p.createdAt,
      addedBy: p.userId
    }));

    const allEntries = [...txs, ...duesEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        summary: { memberDuesTotal, extraIncomeTotal, totalCollected, expensesTotal, balance },
        transactions: allEntries.slice(0, 150)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /funds/offline-pay (Accountant / Admin log offline dues) ──
router.post('/offline-pay', protect, restrictTo('SUPER_ADMIN', 'PANEL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { userId, amount, month } = req.body;
    const targetMonth = month || currentMonth();
    if (!userId || !amount) {
      return res.status(400).json({ success: false, error: 'Member and amount required' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'Member not found' });

    let pay = await Payment.findOne({ userId, forMonth: targetMonth });
    if (pay) {
      pay.status = 'CONFIRMED';
      pay.amount = Number(amount);
      pay.confirmedBy = req.user._id;
      pay.confirmedAt = new Date();
      await pay.save();
    } else {
      pay = await Payment.create({
        userId,
        forMonth: targetMonth,
        amount: Number(amount),
        plan: user.plan || 'SILVER',
        status: 'CONFIRMED',
        confirmedBy: req.user._id,
        confirmedAt: new Date()
      });
    }

    if (user.status === 'PENDING') {
      user.status = 'ACTIVE';
      await user.save();
    }

    res.json({ success: true, message: `Offline dues recorded for ${user.fname} ${user.lname}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /funds (Accountant & Admin log expense / income) ────────
router.post('/', protect, restrictTo('SUPER_ADMIN', 'PANEL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { title, type, category, amount, date } = req.body;
    if (!title || !type || !amount) {
      return res.status(400).json({ success: false, error: 'Title, type, and amount are required' });
    }
    const tx = await FundTransaction.create({
      title,
      type,
      category: category || (type === 'INCOME' ? 'Donation / Extra Income' : 'General Expense'),
      amount: Number(amount),
      date: date || new Date(),
      addedBy: req.user._id
    });
    await tx.populate('addedBy', 'fname lname role');
    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /funds/:id (Super Admin delete transaction) ───────────
router.delete('/:id', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const tx = await FundTransaction.findByIdAndDelete(req.params.id);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
