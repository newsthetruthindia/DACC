'use client';
import { useState, useEffect } from 'react';

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return <div className={`glass-card rounded-2xl ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 py-4 border-b border-white/10 flex items-center justify-between ${className}`}>{children}</div>;
}
export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

// ── Stat Card (Athletic Scoreboard Style) ──────────────────────
export function StatCard({ icon, label, value, sub, color = '#ff5500' }) {
  return (
    <Card className="group">
      <CardBody className="relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-6xl opacity-5 group-hover:scale-110 transition-transform select-none">
          {icon}
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">{icon}</span>
          <span className="text-[10px] font-sports uppercase tracking-widest text-zinc-400 font-bold px-2 py-0.5 rounded bg-white/5">CLUB KPI</span>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1 mt-3">{label}</div>
        <div className="text-3xl font-extrabold font-sports tracking-tight text-scoreboard" style={{ color }}>{value}</div>
        {sub && <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">⚡ {sub}</div>}
      </CardBody>
    </Card>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const badgeMap = {
  ACTIVE:     'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
  PENDING:    'bg-amber-950/80 text-amber-400 border border-amber-500/30',
  SUSPENDED:  'bg-red-950/80 text-red-400 border border-red-500/30',
  CONFIRMED:  'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
  FAILED:     'bg-red-950/80 text-red-400 border border-red-500/30',
  OPEN:       'bg-blue-950/80 text-blue-400 border border-blue-500/30',
  REPLIED:    'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
  CLOSED:     'bg-zinc-800 text-zinc-400 border border-zinc-700',
  PAID:       'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-sports',
  DUE:        'bg-red-950/80 text-red-400 border border-red-500/30 font-sports animate-pulse',
  SILVER:     'bg-zinc-800 text-zinc-300 border border-zinc-600 font-sports',
  GOLD:       'bg-amber-950/80 text-amber-400 border border-amber-500/40 font-sports shadow-[0_0_12px_rgba(245,158,11,0.25)]',
  PLATINUM:   'bg-purple-950/80 text-purple-300 border border-purple-500/40 font-sports shadow-[0_0_12px_rgba(168,85,247,0.25)]',
  MEMBER:     'bg-zinc-800 text-zinc-300 border border-zinc-700',
  PANEL:      'bg-orange-950/80 text-orange-400 border border-orange-500/40 font-sports',
  SUPER_ADMIN:'bg-gradient-to-r from-orange-600 to-red-600 text-white font-sports font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]',
};
export function Badge({ label }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${badgeMap[label] || 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
      {label}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const vars = {
    primary: 'fire-btn rounded-xl',
    dark:    'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10 rounded-xl shadow-md transition-all',
    ghost:   'bg-transparent border border-white/15 text-zinc-300 hover:bg-white/10 hover:text-white rounded-xl transition-all',
    red:     'bg-red-950/60 text-red-400 border border-red-500/30 hover:bg-red-900/80 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    green:   'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/80 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]',
  };
  const sizes = { sm:'px-3 py-1.5 text-xs', md:'px-4 py-2 text-sm', lg:'px-6 py-3 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-bold transition-all ${vars[variant] || vars.primary} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400">{label}</label>}
      <input className="px-3.5 py-2.5 border border-white/15 rounded-xl text-sm text-white bg-[#121218] outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all placeholder:text-zinc-600 shadow-inner" {...props} />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400">{label}</label>}
      <textarea className="px-3.5 py-2.5 border border-white/15 rounded-xl text-sm text-white bg-[#121218] outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all resize-none placeholder:text-zinc-600 shadow-inner" rows={4} {...props} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400">{label}</label>}
      <select className="px-3.5 py-2.5 border border-white/15 rounded-xl text-sm text-white bg-[#121218] outline-none focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500] transition-all font-semibold" {...props}>
        {children}
      </select>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ fname, lname, plan, size = 10 }) {
  const colors = { SILVER:'#a1a1aa', GOLD:'#f59e0b', PLATINUM:'#a855f7' };
  const c = colors[plan] || '#ff5500';
  return (
    <div className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-white text-xs font-extrabold font-sports flex-shrink-0 shadow-md`}
      style={{ background: `linear-gradient(135deg, ${c}33 0%, #121218 100%)`, color: c, border: `1.5px solid ${c}66` }}>
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
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-3 animate-fade-in border ${
      isErr ? 'bg-red-950/95 text-red-200 border-red-500/50' : 'bg-[#181820]/95 text-white border-[#ff5500]/50 shadow-[0_0_25px_rgba(255,85,0,0.25)]'
    }`}>
      <span className="text-lg">{isErr ? '🚨' : '⚡'}</span>
      <span>{msg.m}</span>
    </div>
  );
}
export const toast = (m, type) => _setToast?.(m, type);

// ── Empty State ───────────────────────────────────────────────
export function Empty({ icon = '🏆', title, sub }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4 opacity-80 animate-bounce">{icon}</div>
      <div className="text-white font-sports font-bold text-base mb-1 tracking-wide">{title}</div>
      {sub && <div className="text-zinc-500 text-xs">{sub}</div>}
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────
export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-3 border-[#ff5500] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,85,0,0.5)]"></div>
      <div className="text-zinc-400 font-sports font-bold text-xs uppercase tracking-widest animate-pulse">Loading Arena Data…</div>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#14141c] border border-white/15 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-[#1f1a24] to-[#14141c]">
          <div className="flex items-center gap-2 text-[#ff5500] font-sports font-extrabold text-xs uppercase tracking-widest mb-1">
            ⚡ CLUB ATHLETIC CONTRIBUTION
          </div>
          <div className="text-xl font-extrabold text-white">Pay Membership Dues</div>
          <div className="text-sm text-zinc-400 mt-0.5">{memberName} · <span className="text-[#ff5500] font-bold font-sports">₹{amount}</span> for {month}</div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {apps.map(app => (
              <a key={app.name} href={link} onClick={onMarkPaid}
                className="bg-[#1c1c26] border border-white/10 rounded-xl p-4 text-center hover:border-[#ff5500] hover:bg-[#25202e] transition-all block no-underline group shadow-md">
                <div className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">{app.icon}</div>
                <div className="text-xs font-bold font-sports text-white uppercase tracking-wider">{app.name}</div>
              </a>
            ))}
          </div>
          <div className="text-[10px] font-sports font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">Direct UPI QR Link</div>
          <div className="bg-[#0b0b0f] border border-white/10 rounded-xl p-3 font-mono text-[11px] text-zinc-300 break-all mb-6 shadow-inner select-all">
            {link}
          </div>
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={onMarkPaid}>⚡ Confirm Payment</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
