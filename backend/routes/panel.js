const router = require('express').Router();
const { PanelMember, User, ClubTerm } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { PANEL_ROLES } = require('../lib/plans');
const { sendGroupAlert } = require('../lib/telegram');

// ── GET /panel ────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const panel = await PanelMember.find({ isActive: true })
      .populate('userId', 'fname lname email phone plan avatarUrl')
      .populate('termId', 'label');
    res.json({ success: true, data: panel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /panel/members ───────────────────────────────────────
router.post('/members', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const { userId, panelRole } = req.body;
    if (!userId || !panelRole) return res.status(400).json({ success: false, error: 'userId and panelRole required' });
    if (!PANEL_ROLES.includes(panelRole)) return res.status(400).json({ success: false, error: 'Invalid panel role' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.status !== 'ACTIVE') return res.status(400).json({ success: false, error: 'Member must be active' });

    const count = await PanelMember.countDocuments({ isActive: true });
    if (count >= 15) return res.status(400).json({ success: false, error: 'Panel is full (max 15)' });

    const existing = await PanelMember.findOne({ userId, isActive: true });
    if (existing) return res.status(409).json({ success: false, error: 'Member already on panel' });

    const activeTerm = await ClubTerm.findOne({ isActive: true });
    const panel = await PanelMember.create({ userId, termId: activeTerm?._id, panelRole });

    user.role = 'PANEL';
    await user.save();

    await panel.populate('userId', 'fname lname email plan');
    sendGroupAlert(`👑 <b>New Core Committee Appointed</b>\n\n<b>${user.fname} ${user.lname}</b> has been elected as <b>${panelRole}</b> for the 1-Year Active Term!\n\n<i>Agnichakra Club Governance</i>`).catch(console.error);

    res.status(201).json({ success: true, data: panel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /panel/members/:userId ─────────────────────────────
router.delete('/members/:userId', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const panel = await PanelMember.findOneAndUpdate(
      { userId: req.params.userId, isActive: true },
      { isActive: false, removedAt: new Date() },
      { new: true }
    );
    if (!panel) return res.status(404).json({ success: false, error: 'Panel member not found' });

    await User.findByIdAndUpdate(req.params.userId, { role: 'MEMBER' });
    res.json({ success: true, message: 'Removed from panel' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /panel/reset ─────────────────────────────────────────
router.post('/reset', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const active = await PanelMember.find({ isActive: true });
    for (const p of active) {
      await User.findByIdAndUpdate(p.userId, { role: 'MEMBER' });
      p.isActive = false;
      p.removedAt = new Date();
      await p.save();
    }
    sendGroupAlert(`⚡ <b>Core Committee Dissolved</b>\n\nThe previous 1-Year Core Panel has been officially dissolved by Super Admin. Preparations for the new 1-Year Term appointments are now underway!\n\n<i>Agnichakra Club Governance</i>`).catch(console.error);
    res.json({ success: true, message: `Panel reset. ${active.length} members removed.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
