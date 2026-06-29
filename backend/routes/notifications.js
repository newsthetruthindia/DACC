const router = require('express').Router();
const { Notification } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { sendGroupAlert } = require('../lib/telegram');

const getTargets = (user) => {
  const targets = ['ALL'];
  const planMap = { SILVER: ['SILVER'], GOLD: ['SILVER', 'GOLD'], PLATINUM: ['SILVER', 'GOLD', 'PLATINUM'] };
  targets.push(...(planMap[user.plan] || []));
  if (['PANEL', 'SUPER_ADMIN'].includes(user.role)) targets.push('PANEL');
  return [...new Set(targets)];
};

// ── GET /notifications ────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const targets = getTargets(req.user);
    const filter = { target: { $in: targets } };
    if (unread === 'true') filter.readBy = { $ne: req.user._id };

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .populate('fromId', 'fname lname')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const data = notifications.map(n => ({
      ...n.toObject(),
      isRead: n.readBy.some(id => id.toString() === req.user._id.toString())
    }));

    res.json({ success: true, data: { notifications: data, total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /notifications/unread-count ──────────────────────────
router.get('/unread-count', protect, async (req, res) => {
  try {
    const targets = getTargets(req.user);
    const count = await Notification.countDocuments({
      target: { $in: targets },
      readBy: { $ne: req.user._id }
    });
    res.json({ success: true, data: { count } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /notifications ───────────────────────────────────────
router.post('/', protect, restrictTo('PANEL', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { title, body, target = 'ALL' } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, error: 'Title and body required' });
    const notif = await Notification.create({ fromId: req.user._id, target, title, body, readBy: [req.user._id] });
    const populated = await notif.populate('fromId', 'fname lname');

    sendGroupAlert(`📣 <b>Club Announcement</b> [Target: ${target}]\n\n<b>${title}</b>\n\n${body}\n\n— <i>${req.user.fname} (Committee)</i>`).catch(console.error);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /notifications/read-all ──────────────────────────────
router.post('/read-all', protect, async (req, res) => {
  try {
    const targets = getTargets(req.user);
    await Notification.updateMany(
      { target: { $in: targets }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /notifications/:id/read ──────────────────────────────
router.post('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user._id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /notifications/:id ─────────────────────────────────
router.delete('/:id', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
