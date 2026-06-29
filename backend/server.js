const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/', limiter);
app.use('/api/v1/auth/', authLimiter);

// Static uploads
fs.mkdirSync('uploads/payments', { recursive: true });
fs.mkdirSync('uploads/selfies', { recursive: true });
app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/v1/auth',          require('./routes/auth'));
app.use('/api/v1/members',       require('./routes/members'));
app.use('/api/v1/payments',      require('./routes/payments'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/messages',      require('./routes/messages'));
app.use('/api/v1/panel',         require('./routes/panel'));
app.use('/api/v1/terms',         require('./routes/terms'));
app.use('/api/v1/settings',      require('./routes/settings'));
app.use('/api/v1/funds',         require('./routes/funds'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', club: 'Agnichakra Club' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ success: false, error: err.message || 'Server error' });
});

// ── MongoDB + Start ───────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Agnichakra API running on port ${PORT}`));
  })
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
