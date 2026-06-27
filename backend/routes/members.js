const router = require('express').Router();
const { User, Payment } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { PLANS, currentMonth } = require('../lib/plans');

// ── GET /members/me ───────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ forMonth: -1 }).limit(12);
    const month = currentMonth();
    const paidThisMonth = payments.some(p => p.forMonth === month && p.status === 'CONFIRMED');
    res.json({
      success: true,
      data: { ...req.user.toObject(), payments, paidThisMonth }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /members/me ─────────────────────────────────────────
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['fname', 'lname', 'city', 'phone'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /members (Admin only) ─────────────────────────────────
router.get('/', protect, restrictTo('SUPER_ADMIN', 'PANEL'), async (req, res) => {
  try {
    const { status, plan, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (plan)   filter.plan   = plan;
    if (search) filter.$or = [
      { fname: { $regex: search, $options: 'i' } },
      { lname:  { $regex: search, $options: 'i' } },
      { email:  { $regex: search, $options: 'i' } },
      { phone:  { $regex: search, $options: 'i' } },
    ];

    const total   = await User.countDocuments(filter);
    const members = await User.find(filter)
      .select('-passwordHash')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const month = currentMonth();
    const payments = await Payment.find({ forMonth: month, status: 'CONFIRMED' });
    const paidSet = new Set(payments.map(p => p.userId.toString()));

    const data = members.map(m => ({
      ...m.toObject(),
      paidThisMonth: paidSet.has(m._id.toString())
    }));

    res.json({ success: true, data: { members: data, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /members/:id/approve ────────────────────────────────
router.patch('/:id/approve', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'ACTIVE' }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: 'Member not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /members/:id/plan ───────────────────────────────────
router.patch('/:id/plan', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, error: 'Invalid plan' });
    const user = await User.findByIdAndUpdate(req.params.id, { plan }, { new: true }).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /members/:id/suspend ────────────────────────────────
router.patch('/:id/suspend', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const { status } = req.body; // 'SUSPENDED' or 'ACTIVE'
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-passwordHash');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /members/:id ───────────────────────────────────────
router.delete('/:id', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' });
    res.json({ success: true, message: 'Member deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
