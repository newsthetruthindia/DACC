'use client';
import { useState, useEffect } from 'react';

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return <div className={`bg-white border border-[#e2e0d8] rounded-2xl shadow-sm ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 py-4 border-b border-[#e2e0d8] flex items-center justify-between ${className}`}>{children}</div>;
}
export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = '#1a1916' }) {
  return (
    <Card>
      <CardBody>
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1">{label}</div>
        <div className="text-3xl font-extrabold font-mono tracking-tight" style={{ color }}>{value}</div>
        {sub && <div className="text-xs text-[#9a9890] mt-1">{sub}</div>}
      </CardBody>
    </Card>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const badgeMap = {
  ACTIVE:     'bg-green-50 text-green-700 border border-green-200',
  PENDING:    'bg-yellow-50 text-yellow-700 border border-yellow-200',
  SUSPENDED:  'bg-red-50 text-red-700 border border-red-200',
  CONFIRMED:  'bg-green-50 text-green-700 border border-green-200',
  FAILED:     'bg-red-50 text-red-700 border border-red-200',
  OPEN:       'bg-blue-50 text-blue-700 border border-blue-200',
  REPLIED:    'bg-green-50 text-green-700 border border-green-200',
  CLOSED:     'bg-gray-100 text-gray-500 border border-gray-200',
  PAID:       'bg-green-50 text-green-700 border border-green-200',
  DUE:        'bg-red-50 text-red-700 border border-red-200',
  SILVER:     'bg-gray-100 text-gray-600 border border-gray-200',
  GOLD:       'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PLATINUM:   'bg-purple-50 text-purple-700 border border-purple-200',
  MEMBER:     'bg-gray-100 text-gray-600 border border-gray-200',
  PANEL:      'bg-orange-50 text-orange-700 border border-orange-200',
  SUPER_ADMIN:'bg-gray-900 text-white',
};
export function Badge({ label }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${badgeMap[label] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'dark', size = 'md', disabled, className = '', type = 'button' }) {
  const vars = {
    dark:    'bg-[#1a1916] text-white hover:bg-[#2a2925]',
    ghost:   'bg-transparent border border-[#e2e0d8] text-[#4a4840] hover:border-[#1a1916]',
    red:     'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
    green:   'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100',
    accent:  'bg-[#c8410a] text-white hover:bg-[#a83408]',
  };
  const sizes = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all ${vars[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890]">{label}</label>}
      <input className="px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm text-[#1a1916] bg-white outline-none focus:border-[#c8410a] transition-colors placeholder:text-[#c0bdb4]" {...props} />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890]">{label}</label>}
      <textarea className="px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm text-[#1a1916] bg-white outline-none focus:border-[#c8410a] transition-colors resize-none placeholder:text-[#c0bdb4]" rows={4} {...props} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890]">{label}</label>}
      <select className="px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm text-[#1a1916] bg-white outline-none focus:border-[#c8410a] transition-colors" {...props}>
        {children}
      </select>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ fname, lname, plan, size = 8 }) {
  const colors = { SILVER:'#888', GOLD:'#b8860b', PLATINUM:'#5b3db8' };
  const c = colors[plan] || '#888';
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
      style={{ background: c + '33', color: c, border: `1.5px solid ${c}44` }}>
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
    setTimeout(() => setMsg(null), 3000);
  };
  if (!msg) return null;
  const colors = { success:'bg-[#1a1916] text-white', error:'bg-red-600 text-white' };
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl ${colors[msg.type]}`}>
      {msg.m}
    </div>
  );
}
export const toast = (m, type) => _setToast?.(m, type);

// ── Empty State ───────────────────────────────────────────────
export function Empty({ icon = '📭', title, sub }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-[#4a4840] font-semibold text-sm mb-1">{title}</div>
      {sub && <div className="text-[#9a9890] text-xs">{sub}</div>}
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────
export function Loading() {
  return <div className="text-center py-16 text-[#9a9890] text-sm">Loading…</div>;
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-[#e2e0d8]">
          <div className="text-lg font-extrabold text-[#1a1916] mb-1">Pay Membership Dues</div>
          <div className="text-sm text-[#9a9890]">{memberName} · ₹{amount} for {month}</div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {apps.map(app => (
              <a key={app.name} href={link} onClick={onMarkPaid}
                className="border-2 border-[#e2e0d8] rounded-xl p-4 text-center hover:border-[#c8410a] transition-all block no-underline">
                <div className="text-3xl mb-1.5">{app.icon}</div>
                <div className="text-xs font-bold text-[#1a1916]">{app.name}</div>
              </a>
            ))}
          </div>
          <div className="text-[10px] text-[#9a9890] mb-1.5 uppercase tracking-wide font-semibold">UPI Link</div>
          <div className="bg-[#f5f4f0] border border-[#e2e0d8] rounded-lg p-3 font-mono text-[11px] text-[#4a4840] break-all mb-5">{link}</div>
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={onClose}>Close</Btn>
            <Btn variant="green" onClick={onMarkPaid}>✓ Mark as Paid</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
