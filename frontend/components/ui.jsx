'use client';
import { useState } from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-gradient-to-b from-[#14141f]/95 to-[#0e0e15]/95 border border-white/[0.08] rounded-3xl shadow-[0_10px_35px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden transition-all duration-300 group ${className}`}>
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 group-hover:opacity-25 transition-opacity duration-500 z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      {/* Radial Ramp Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-500 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(249,115,22,0.12), transparent 70%)'
        }}
      />
      {/* Subtle Top Inner Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />
      
      {children}
    </div>
  );
}
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 sm:px-6 sm:py-5 border-b border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-white/[0.03] via-transparent to-transparent ${className}`}>
      {children}
    </div>
  );
}
export function CardBody({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 relative z-10 ${className}`}>{children}</div>;
}

// ── Stat Card (Premium KPI Widget) ─────────────────────────────
export function StatCard({ icon, label, value, sub, color = '#f97316' }) {
  return (
    <Card className="hover:border-white/20 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] hover:-translate-y-1">
      {/* Corner Ambient Glow */}
      <div 
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-35"
        style={{ background: color }}
      />
      <CardBody className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.1] to-white/[0.02] border border-white/[0.1] flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-full shadow-sm">
            Club KPI
          </span>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">{label}</div>
        <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 truncate drop-shadow-md" style={{ color }}>
          {value}
        </div>
        {sub && (
          <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 bg-white/[0.02] px-2.5 py-1 rounded-lg border border-white/[0.04] w-fit">
            <span>✨</span> {sub}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── Badge ─────────────────────────────────────────────────────
const badgeMap = {
  ACTIVE:     'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  PENDING:    'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  SUSPENDED:  'bg-red-500/15 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
  CONFIRMED:  'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  FAILED:     'bg-red-500/15 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
  OPEN:       'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  REPLIED:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  CLOSED:     'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60',
  PAID:       'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  DUE:        'bg-red-500/15 text-red-300 border border-red-500/30 animate-pulse',
  SILVER:     'bg-gradient-to-r from-zinc-700/40 to-zinc-800/40 text-zinc-200 border border-zinc-500/40 shadow-sm',
  GOLD:       'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  PLATINUM:   'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 text-purple-200 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  MEMBER:     'bg-zinc-800/80 text-zinc-300 border border-zinc-700',
  PANEL:      'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
  SUPER_ADMIN:'bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 text-white border border-orange-400 shadow-[0_0_18px_rgba(234,88,12,0.35)]',
};
export function Badge({ label }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase whitespace-nowrap backdrop-blur-md transition-all ${badgeMap[label] || 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
      {label}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const vars = {
    primary: 'primary-btn rounded-2xl',
    dark:    'bg-[#181824] text-white hover:bg-[#222232] border border-white/[0.1] rounded-2xl shadow-lg hover:shadow-xl hover:border-white/[0.2] transition-all',
    ghost:   'bg-transparent border border-white/[0.1] text-zinc-300 hover:bg-white/[0.06] hover:text-white rounded-2xl transition-all',
    red:     'bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 rounded-2xl shadow-lg transition-all',
    green:   'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-2xl shadow-lg transition-all',
  };
  const sizes = { sm:'px-3.5 py-2 text-xs', md:'px-5 py-3 text-sm', lg:'px-7 py-3.5 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2.5 font-bold transition-all duration-200 active:scale-[0.98] whitespace-nowrap ${vars[variant] || vars.primary} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed active:scale-100' : ''} ${className}`}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 ml-1">{label}</label>}
      <input className="w-full px-4 py-3.5 border border-white/[0.1] rounded-2xl text-sm text-white bg-[#13131e]/90 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-zinc-500 shadow-inner font-medium" {...props} />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 ml-1">{label}</label>}
      <textarea className="w-full px-4 py-3.5 border border-white/[0.1] rounded-2xl text-sm text-white bg-[#13131e]/90 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none placeholder:text-zinc-500 shadow-inner font-medium" rows={4} {...props} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 ml-1">{label}</label>}
      <select className="w-full px-4 py-3.5 border border-white/[0.1] rounded-2xl text-sm text-white bg-[#13131e]/90 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium shadow-inner" {...props}>
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
    <div className={`w-${size} h-${size} rounded-2xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 shadow-lg relative overflow-hidden`}
      style={{ background: `linear-gradient(135deg, ${c}44 0%, #13131e 100%)`, color: c, border: `1px solid ${c}66` }}>
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />
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
    <div className={`fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 px-6 py-4 rounded-2xl text-sm font-bold shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center gap-3.5 animate-fade-in border ${
      isErr ? 'bg-red-950/90 text-red-200 border-red-500/50' : 'bg-[#151522]/95 text-white border-orange-500/50'
    }`}>
      <span className="text-xl flex-shrink-0">{isErr ? '❌' : '⚡'}</span>
      <span className="flex-1 break-words">{msg.m}</span>
    </div>
  );
}
export const toast = (m, type) => _setToast?.(m, type);

// ── Empty State ───────────────────────────────────────────────
export function Empty({ icon = '✨', title, sub }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/[0.08] flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl">
        {icon}
      </div>
      <div className="text-white font-extrabold text-lg mb-1.5">{title}</div>
      {sub && <div className="text-zinc-400 text-sm max-w-sm mx-auto">{sub}</div>}
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────
export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-orange-500 border-r-amber-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <span className="text-xl">🔥</span>
      </div>
      <div className="text-zinc-400 font-bold text-sm tracking-wide bg-white/[0.03] px-4 py-1.5 rounded-full border border-white/[0.06]">
        Synchronizing Agnichakra Portal…
      </div>
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-[#161622] to-[#0e0e16] border border-white/[0.12] rounded-[32px] w-full max-w-md shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[95vh] overflow-y-auto relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-red-600" />
        <div className="p-6 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="text-[11px] font-extrabold text-orange-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span>⚡</span> Instant Membership Recharge
          </div>
          <div className="text-2xl font-black text-white">Pay Club Dues</div>
          <div className="text-sm text-zinc-400 mt-1.5 flex items-center justify-between">
            <span>{memberName}</span>
            <span className="text-orange-400 font-extrabold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              ₹{amount} <span className="text-zinc-500 text-xs">/ {month}</span>
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Select UPI Payment App</div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {apps.map(app => (
              <a key={app.name} href={link} onClick={onMarkPaid}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center hover:border-orange-500/60 hover:bg-orange-500/10 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all block no-underline group">
                <div className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">{app.icon}</div>
                <div className="text-xs font-bold text-white truncate">{app.name}</div>
              </a>
            ))}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Direct UPI QR Link</div>
          <div className="bg-black/60 border border-white/[0.08] rounded-2xl p-3.5 font-mono text-xs text-zinc-300 break-all mb-6 select-all max-h-24 overflow-y-auto shadow-inner">
            {link}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Btn variant="ghost" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">Cancel</Btn>
            <Btn variant="primary" onClick={onMarkPaid} className="w-full sm:w-auto order-1 sm:order-2 shadow-orange-500/30">
              ✓ Confirm Payment
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
