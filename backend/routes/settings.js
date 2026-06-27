const router = require('express').Router();
const mongoose = require('mongoose');
const { protect, restrictTo } = require('../middleware/auth');

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: { type: Object }
});
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

// GET /api/v1/settings
router.get('/', async (req, res) => {
  try {
    let s = await Setting.findOne({ key: 'bank_settings' });
    if (!s) {
      s = await Setting.create({
        key: 'bank_settings',
        value: {
          upiId: process.env.CLUB_UPI || 'agnichakra@okaxis',
          bankName: 'HDFC Bank',
          accountName: 'Agnichakra Club',
          accountNo: '50200012345678',
          ifsc: 'HDFC0001234'
        }
      });
    }
    res.json({ success: true, data: s.value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/settings
router.patch('/', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const s = await Setting.findOneAndUpdate(
      { key: 'bank_settings' },
      { value: req.body },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: s.value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
