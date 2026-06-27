const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── User ──────────────────────────────────────────────────────
const UserSchema = new Schema({
  fname:        { type: String, required: true, trim: true },
  lname:        { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  avatarUrl:    { type: String, default: null },
  city:         { type: String, default: '' },
  plan:         { type: String, enum: ['SILVER', 'GOLD', 'PLATINUM'], default: 'SILVER' },
  role:         { type: String, enum: ['MEMBER', 'PANEL', 'SUPER_ADMIN'], default: 'MEMBER' },
  status:       { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'], default: 'PENDING' },
  joinedAt:     { type: Date, default: Date.now },
}, { timestamps: true });

// ── ClubTerm ──────────────────────────────────────────────────
const ClubTermSchema = new Schema({
  label:     { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  isActive:  { type: Boolean, default: false },
}, { timestamps: true });

// ── PanelMember ───────────────────────────────────────────────
const PanelMemberSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  termId:    { type: Schema.Types.ObjectId, ref: 'ClubTerm', required: true },
  panelRole: { type: String, required: true },
  isActive:  { type: Boolean, default: true },
  removedAt: { type: Date, default: null },
}, { timestamps: true });

// ── Payment ───────────────────────────────────────────────────
const PaymentSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  termId:        { type: Schema.Types.ObjectId, ref: 'ClubTerm', default: null },
  forMonth:      { type: String, required: true },  // "2025-06"
  amount:        { type: Number, required: true },
  plan:          { type: String, enum: ['SILVER', 'GOLD', 'PLATINUM'] },
  upiRef:        { type: String, default: null },
  screenshotUrl: { type: String, default: null },
  status:        { type: String, enum: ['PENDING', 'CONFIRMED', 'FAILED'], default: 'PENDING' },
  confirmedBy:   { type: Schema.Types.ObjectId, ref: 'User', default: null },
  confirmedAt:   { type: Date, default: null },
}, { timestamps: true });
PaymentSchema.index({ userId: 1, forMonth: 1 }, { unique: true });

// ── Notification ──────────────────────────────────────────────
const NotificationSchema = new Schema({
  fromId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: String, enum: ['ALL', 'SILVER', 'GOLD', 'PLATINUM', 'PANEL'], default: 'ALL' },
  title:  { type: String, required: true },
  body:   { type: String, required: true },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// ── Message ───────────────────────────────────────────────────
const ReplySchema = new Schema({
  fromId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body:   { type: String, required: true },
}, { timestamps: true });

const MessageSchema = new Schema({
  fromId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  body:    { type: String, required: true },
  status:  { type: String, enum: ['OPEN', 'REPLIED', 'CLOSED'], default: 'OPEN' },
  replies: [ReplySchema],
}, { timestamps: true });

// ── OtpCode ───────────────────────────────────────────────────
const OtpSchema = new Schema({
  email:     { type: String, required: true },
  code:      { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used:      { type: Boolean, default: false },
}, { timestamps: true });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = {
  User:         mongoose.model('User', UserSchema),
  ClubTerm:     mongoose.model('ClubTerm', ClubTermSchema),
  PanelMember:  mongoose.model('PanelMember', PanelMemberSchema),
  Payment:      mongoose.model('Payment', PaymentSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  Message:      mongoose.model('Message', MessageSchema),
  OtpCode:      mongoose.model('OtpCode', OtpSchema),
};
