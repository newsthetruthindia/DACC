const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User, OtpCode } = require('../models');
const { protect, signToken } = require('../middleware/auth');
const { sendOTP, sendWelcome } = require('../lib/email');
const { PLANS, buildUpiLink, currentMonth } = require('../lib/plans');

// ── POST /auth/register ───────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { fname, lname, email, phone, password, city, plan = 'SILVER', aadhaar, selfieUrl } = req.body;
    if (!fname || !lname || !email || !phone || !password || !aadhaar)
      return res.status(400).json({ success: false, error: 'All fields including Aadhaar number are required' });
    if (!/^\d{12}$/.test(aadhaar.trim()))
      return res.status(400).json({ success: false, error: 'Aadhaar number must be exactly 12 digits' });
    if (!PLANS[plan])
      return res.status(400).json({ success: false, error: 'Invalid plan' });
    if (await User.findOne({ $or: [{ email }, { phone }, { aadhaar: aadhaar.trim() }] }))
      return res.status(409).json({ success: false, error: 'Email, phone, or Aadhaar already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ fname, lname, email, phone, passwordHash, city, plan, status: 'PENDING', aadhaar: aadhaar.trim(), selfieUrl: selfieUrl || null });

    const month = currentMonth();
    const upiLink = buildUpiLink(plan, month);

    // Send welcome email (non-blocking)
    sendWelcome(email, fname, PLANS[plan].label).catch(console.error);

    res.status(201).json({
      success: true,
      data: {
        userId: user._id,
        status: 'PENDING',
        plan,
        amount: PLANS[plan].price,
        upiLink,
        token: signToken(user._id),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ success: false, error: 'Invalid credentials' });

    if (!user.memberId) {
      const num = Math.floor(100000 + Math.random() * 900000);
      user.memberId = `AGC-${num}`;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        token: signToken(user._id),
        user: {
          id: user._id, fname: user.fname, lname: user.lname,
          email: user.email, phone: user.phone,
          plan: user.plan, role: user.role, status: user.status,
          avatarUrl: user.avatarUrl, selfieUrl: user.selfieUrl,
          memberId: user.memberId, aadhaar: user.aadhaar, city: user.city,
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /auth/otp/send ───────────────────────────────────────
router.post('/otp/send', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, error: 'Email not registered' });

    // Invalidate old OTPs
    await OtpCode.deleteMany({ email: email.toLowerCase() });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpCode.create({ email: email.toLowerCase(), code, expiresAt });

    await sendOTP(email, code);
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /auth/otp/verify ─────────────────────────────────────
router.post('/otp/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const otp = await OtpCode.findOne({ email: email.toLowerCase(), code, used: false });
    if (!otp || otp.expiresAt < new Date())
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });

    otp.used = true;
    await otp.save();

    const user = await User.findOne({ email: email.toLowerCase() });
    res.json({ success: true, data: { token: signToken(user._id) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /auth/me ──────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// ── POST /auth/change-password ────────────────────────────────
router.post('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(oldPassword, user.passwordHash)))
      return res.status(400).json({ success: false, error: 'Current password is wrong' });
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ success: true, message: 'Password changed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
