const router = require('express').Router();
const { FundTransaction, Payment, User } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

// ── GET /funds (All members can view transparent ledger) ─────────
router.get('/', protect, async (req, res) => {
  try {
    // 1. Calculate confirmed member dues collected
    const confirmedPayments = await Payment.find({ status: 'CONFIRMED' }).populate('userId', 'fname lname');
    const memberDuesTotal = confirmedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // 2. Fetch all ledger transactions
    const txs = await FundTransaction.find().sort({ date: -1 }).populate('addedBy', 'fname lname role');

    const extraIncomeTotal = txs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expensesTotal    = txs.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

    const totalCollected = memberDuesTotal + extraIncomeTotal;
    const balance = totalCollected - expensesTotal;

    // Convert member payments to friendly ledger entries for display
    const duesEntries = confirmedPayments.slice(0, 50).map(p => ({
      _id: 'due_' + p._id,
      title: `Membership Contribution (${p.forMonth})`,
      type: 'INCOME',
      category: 'Member Dues',
      amount: p.amount,
      date: p.confirmedAt || p.createdAt,
      addedBy: p.userId
    }));

    // Combine and sort
    const allEntries = [...txs, ...duesEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        summary: {
          memberDuesTotal,
          extraIncomeTotal,
          totalCollected,
          expensesTotal,
          balance
        },
        transactions: allEntries.slice(0, 100)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /funds (Admin & Panel add transaction) ─────────────────
router.post('/', protect, restrictTo('SUPER_ADMIN', 'PANEL'), async (req, res) => {
  try {
    const { title, type, category, amount, date } = req.body;
    if (!title || !type || !amount) {
      return res.status(400).json({ success: false, error: 'Title, type, and amount are required' });
    }
    const tx = await FundTransaction.create({
      title,
      type,
      category: category || (type === 'INCOME' ? 'Donation / Sponsorship' : 'General Expense'),
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

// ── DELETE /funds/:id (Super Admin only delete transaction) ─────
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
