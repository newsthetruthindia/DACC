const router = require('express').Router();
const { ClubTerm } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const terms = await ClubTerm.find().sort({ startDate: -1 });
    res.json({ success: true, data: terms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const { label, startDate, endDate } = req.body;
    const term = await ClubTerm.create({ label, startDate, endDate });
    res.status(201).json({ success: true, data: term });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/activate', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    await ClubTerm.updateMany({}, { isActive: false });
    const term = await ClubTerm.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json({ success: true, data: term });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
