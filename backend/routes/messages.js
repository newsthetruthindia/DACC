const router = require('express').Router();
const { Message, User } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { sendMessageReply } = require('../lib/email');

// ── POST /messages ────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) return res.status(400).json({ success: false, error: 'Subject and body required' });
    const msg = await Message.create({ fromId: req.user._id, subject, body });
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /messages/my ──────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const messages = await Message.find({ fromId: req.user._id })
      .populate('replies.fromId', 'fname lname role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /messages (Panel/Admin) ───────────────────────────────
router.get('/', protect, restrictTo('PANEL', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total    = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .populate('fromId', 'fname lname email phone plan')
      .populate('replies.fromId', 'fname lname')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: { messages, total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /messages/:id ─────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id)
      .populate('fromId', 'fname lname email phone plan')
      .populate('replies.fromId', 'fname lname role');
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });
    // Members can only view their own
    if (req.user.role === 'MEMBER' && msg.fromId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: 'Access denied' });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /messages/:id/reply ──────────────────────────────────
router.post('/:id/reply', protect, restrictTo('PANEL', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, error: 'Reply body required' });

    const msg = await Message.findById(req.params.id).populate('fromId', 'fname email');
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });

    msg.replies.push({ fromId: req.user._id, body });
    msg.status = 'REPLIED';
    await msg.save();

    // Email the member
    sendMessageReply(msg.fromId.email, msg.fromId.fname, msg.subject, body).catch(console.error);

    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PATCH /messages/:id/status ────────────────────────────────
router.patch('/:id/status', protect, restrictTo('PANEL', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const msg = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
