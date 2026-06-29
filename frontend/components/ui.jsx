'use client';
import { useState } from 'react';

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return <div className={`bg-[#131318] border border-zinc-800 rounded-2xl shadow-lg ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`px-4 py-3.5 sm:px-6 sm:py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-900/40 ${className}`}>{children}</div>;
}
export function CardBody({ children, className = '' }) {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
}

// ── Stat Card (Clean & Clear) ──────────────────────────────────
export function StatCard({ icon, label, value, sub, color = '#f97316' }) {
  return (
    <Card className="hover:border-zinc-700 transition-all">
      <CardBody className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60">{icon}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-md">Club KPI</span>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">{label}</div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 truncate" style={{ color }}>{value}</div>
        {sub && <div className="text-xs text-zinc-400 font-medium">{sub}</div>}
      </CardBody>
    </Card>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const badgeMap = {
  ACTIVE:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  PENDING:    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  SUSPENDED:  'bg-red-500/15 text-red-400 border border-red-500/30',
  CONFIRMED:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  FAILED:     'bg-red-500/15 text-red-400 border border-red-500/30',
  OPEN:       'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  REPLIED:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  CLOSED:     'bg-zinc-800 text-zinc-400 border border-zinc-700',
  PAID:       'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  DUE:        'bg-red-500/15 text-red-400 border border-red-500/30',
  SILVER:     'bg-zinc-800 text-zinc-300 border border-zinc-600',
  GOLD:       'bg-amber-500/15 text-amber-400 border border-amber-500/40',
  PLATINUM:   'bg-purple-500/15 text-purple-300 border border-purple-500/40',
  MEMBER:     'bg-zinc-800 text-zinc-300 border border-zinc-700',
  PANEL:      'bg-orange-500/15 text-orange-400 border border-orange-500/40',
  SUPER_ADMIN:'bg-gradient-to-r from-orange-600 to-red-600 text-white border border-orange-500',
};
export function Badge({ label }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeMap[label] || 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
      {label}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const vars = {
    primary: 'primary-btn rounded-xl',
    dark:    'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-all',
    ghost:   'bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-all',
    red:     'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 rounded-xl transition-all',
    green:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-xl transition-all',
  };
  const sizes = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2.5 text-sm', lg:'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all whitespace-nowrap ${vars[variant] || vars.primary} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-zinc-300">{label}</label>}
      <input className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm text-white bg-[#1a1a22] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-500" {...props} />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-zinc-300">{label}</label>}
      <textarea className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm text-white bg-[#1a1a22] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none placeholder:text-zinc-500" rows={4} {...props} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-zinc-300">{label}</label>}
      <select className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm text-white bg-[#1a1a22] outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium" {...props}>
        {children}
      </select>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ fname, lname, plan, size = 10 }) {
  const colors = { SILVER:'#a1a1aa', GOLD:'#f59e0b', PLATINUM:'#a855f7' };
  const c = colors[plan] || '#f97316';
  return (
    <div className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow`}
      style={{ background: `linear-gradient(135deg, ${c}33 0%, #1a1a22 100%)`, color: c, border: `1px solid ${c}55` }}>
      {(fname?.[0] || '') + (lname?.[0] || '')}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
let _setToast;
export function ToastProvider() {
  const [msg, setMsg] = useState(null);
  _setToast = (m, type = 'success') => {
    setMsg({ m, type });
    setTimeout(() => setMsg(null), 3500);
  };
  if (!msg) return null;
  const isErr = msg.type === 'error';
  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 px-5 py-3.5 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-3 animate-fade-in border ${
      isErr ? 'bg-red-950 text-red-200 border-red-500/50' : 'bg-zinc-900 text-white border-orange-500/50'
    }`}>
      <span className="text-lg flex-shrink-0">{isErr ? '❌' : '✅'}</span>
      <span className="flex-1 break-words">{msg.m}</span>
    </div>
  );
}
export const toast = (m, type) => _setToast?.(m, type);

// ── Empty State ───────────────────────────────────────────────
export function Empty({ icon = '📋', title, sub }) {
  return (
    <div className="text-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="text-4xl mb-3 opacity-80">{icon}</div>
      <div className="text-white font-semibold text-base mb-1">{title}</div>
      {sub && <div className="text-zinc-400 text-sm">{sub}</div>}
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────
export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-zinc-400 font-medium text-sm">Loading details…</div>
    </div>
  );
}

// ── UPI Modal ─────────────────────────────────────────────────
export function UpiModal({ open, onClose, link, amount, month, memberName, onMarkPaid }) {
  if (!open) return null;
  const apps = [
    { name:'Google Pay',  icon:'🟢', scheme:'gpay://upi/pay' },
    { name:'PhonePe',     icon:'🟣', scheme:'phonepe://pay' },
    { name:'Paytm',       icon:'🔵', scheme:'paytm://pay' },
    { name:'BHIM UPI',    icon:'🇮🇳', scheme:'upi://pay' },
  ];
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#131318] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-900/60">
          <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Membership Contribution</div>
          <div className="text-xl font-bold text-white">Pay Club Dues</div>
          <div className="text-sm text-zinc-400 mt-1">{memberName} · <span className="text-orange-400 font-bold">₹{amount}</span> for {month}</div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
            {apps.map(app => (
              <a key={app.name} href={link} onClick={onMarkPaid}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 sm:p-4 text-center hover:border-orange-500 hover:bg-zinc-800 transition-all block no-underline">
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-1.5">{app.icon}</div>
                <div className="text-xs font-semibold text-white truncate">{app.name}</div>
              </a>
            ))}
          </div>
          <div className="text-xs font-semibold text-zinc-400 mb-1.5">Direct UPI QR Link</div>
          <div className="bg-black/40 border border-zinc-800 rounded-xl p-3 font-mono text-[11px] sm:text-xs text-zinc-300 break-all mb-6 select-all max-h-24 overflow-y-auto">
            {link}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <Btn variant="ghost" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">Cancel</Btn>
            <Btn variant="primary" onClick={onMarkPaid} className="w-full sm:w-auto order-1 sm:order-2">✓ Confirm Payment</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
