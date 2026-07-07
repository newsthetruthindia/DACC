'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser, clearAuth, api, saveAuth, PLANS, currentMonth } from '@/lib/api';
import { UpiModal, toast } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]         = useState(null);
  const [unread, setUnread]     = useState(0);
  const [mobOpen, setMobOpen]   = useState(false);
  const [upiModal, setUpiModal] = useState(null);

  const month = currentMonth();

  const refreshProfile = () => {
    api.myProfile().then(r => {
      if (r.data) {
        setUser(r.data);
        const token = localStorage.getItem('ac_token');
        if (token) saveAuth(token, r.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    refreshProfile();
    api.unreadCount().then(r => setUnread(r.data?.count || 0)).catch(() => {});
  }, [pathname]);

  if (!user) return null;

  const isPanel = ['PANEL','SUPER_ADMIN'].includes(user.role);
  const isAdmin = user.role === 'SUPER_ADMIN';
  const isOverdue = user.isOverdue && !isAdmin;

  const navItem = (href, icon, label, badge) => {
    const active = pathname === href;
    return (
      <Link href={href} onClick={() => setMobOpen(false)}
        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all duration-200 group ${
          active 
            ? 'bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent text-white font-extrabold border-l-4 border-orange-500 shadow-[0_4px_20px_rgba(249,115,22,0.15)] translate-x-1' 
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border-l-4 border-transparent hover:translate-x-1'
        }`}>
        <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
        <span className="flex-1 truncate">{label}</span>
        {badge > 0 && (
          <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full flex-shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.4)] animate-pulse">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  const planColors = { SILVER:'#a1a1aa', GOLD:'#f59e0b', PLATINUM:'#a855f7' };
  const initials = `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase();

  const sidebar = (
    <aside className="w-[270px] bg-[#0a0a0f]/95 border-r border-white/[0.07] flex flex-col h-full shadow-2xl lg:shadow-none transition-all backdrop-blur-2xl relative z-40">
      {/* Top Accent Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 flex-shrink-0" />

      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1c1c28] to-[#11111a] border border-white/[0.12] p-1.5 flex items-center justify-center shadow-lg flex-shrink-0 relative group overflow-hidden">
            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src="/logo.png" alt="DACC Agnichakra Logo" className="w-full h-full object-contain drop-shadow" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-black text-base leading-tight tracking-tight truncate">DACC Agnichakra</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-extrabold text-orange-400 tracking-widest uppercase bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                ESTD 1962
              </span>
              <div className="text-[9px] text-zinc-500 mt-0.5 leading-tight">Dharapara, Kolkata 700082</div>
            </div>
          </div>
        </div>
        <button onClick={() => setMobOpen(false)} className="lg:hidden text-zinc-400 hover:text-white text-xl p-1">✕</button>
      </div>

      {/* User VIP Profile Card */}
      <div className="p-3.5 mx-3.5 my-4 rounded-2xl bg-gradient-to-r from-white/[0.05] to-white/[0.01] border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-white/15 transition-all">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-md border"
              style={{ background: `linear-gradient(135deg, ${planColors[user.plan] || '#555'}44 0%, #13131e 100%)`, borderColor: planColors[user.plan] || '#777' }}>
              {initials}
            </div>
            {/* Live Status Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0f] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-extrabold text-sm truncate">{user.fname} {user.lname}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/[0.06]">
                {user.memberId || 'MEMBER'}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400">
                • Official Member
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-2 space-y-1 overflow-y-auto">
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 px-3 py-2">Portal Menu</p>
        {navItem('/dashboard',     '📊', 'Dashboard')}
        {navItem('/funds',         '💰', 'Funds & Expenses')}
        {navItem('/notifications', '🔔', 'Announcements', unread)}
        {navItem('/messages',      '💬', 'Write to Panel')}
        {navItem('/subscription',  '💳', 'My Subscription')}
        {navItem('/panel',         '👥', 'Core Committee')}
        {navItem('/profile',       '👤', 'My Profile')}

        {isPanel && <>
          <p className="text-[11px] font-black uppercase tracking-widest text-orange-400 px-3 py-2 mt-5">Committee Ops</p>
          {navItem('/panel/inbox',    '📥', 'Member Inbox')}
          {navItem('/panel/notify',   '📣', 'Broadcast Alert')}
          {navItem('/panel/payments', '✅', 'Verify Dues')}
        </>}

        {isAdmin && <>
          <p className="text-[11px] font-black uppercase tracking-widest text-red-400 px-3 py-2 mt-5">Super Admin</p>
          {navItem('/admin/members',  '🗂️', 'Manage Members')}
          {navItem('/admin/panel',    '🛡️', 'Manage Panel')}
          {navItem('/admin/terms',    '📅', 'Club Terms')}
          {navItem('/admin/settings', '🏦', 'Bank Settings')}
        </>}
      </nav>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-white/[0.07] space-y-2.5 bg-white/[0.01]">
        <a href="https://www.facebook.com/agnichakraclub" target="_blank" rel="noopener noreferrer"
          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-[#4E9AF1] font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:scale-[1.02]">
          <span>👍</span> Official Facebook Page ↗
        </a>
        <button onClick={() => { clearAuth(); router.push('/login'); }}
          className="w-full px-4 py-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] font-bold text-xs flex items-center justify-center gap-2 transition-all">
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );

  const pl = PLANS[user.plan] || PLANS.SILVER;

  const handleMarkPaid = async () => {
    if (!upiModal) return;
    const fd = new FormData();
    fd.append('forMonth', month);
    await api.submitPayment(fd).catch(()=>{});
    setUpiModal(null);
    toast('Payment submitted! Portal access unlocked.');
    refreshProfile();
  };

  const overdueLockoutScreen = (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#07070a] min-h-full relative overflow-hidden">
      {/* Ambient Red Glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-red-600/15 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#11111a]/95 rounded-[32px] border border-red-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-center animate-fade-in relative z-10 backdrop-blur-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/40 text-red-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
          🔒
        </div>
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Membership Contribution Required</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Your Agnichakra Club contribution is pending for over 30 days. To maintain active club privileges and unlock full portal features, please complete your contribution.
        </p>
        <div className="bg-white/[0.03] p-4.5 rounded-2xl mb-6 flex justify-between items-center border border-white/[0.08] shadow-inner">
          <span className="text-sm font-bold text-zinc-300">Monthly Contribution</span>
          <span className="text-xl font-black text-orange-400">₹{pl.price} <span className="text-xs text-zinc-500 font-medium">/ mo</span></span>
        </div>
        <button
          onClick={() => {
            const link = `upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_CLUB_UPI||'agnichakra@okaxis')}&pn=${encodeURIComponent('Agnichakra Club')}&am=${pl.price}&cu=INR&tn=${encodeURIComponent(`Agnichakra Club ${pl.label} ${month}`)}`;
            setUpiModal({ link, amount: pl.price, memberName: `${user.fname} ${user.lname}` });
          }}
          className="w-full py-4 primary-btn rounded-2xl text-sm font-black shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">
          💳 Recharge Now via UPI →
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#07070a] text-zinc-100">
      {/* Mobile overlay */}
      {mobOpen && <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-30 lg:hidden animate-fade-in" onClick={() => setMobOpen(false)} />}

      {/* Sidebar — fixed on mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:relative lg:flex lg:flex-shrink-0 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform ${mobOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.07] flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden text-2xl text-zinc-400 hover:text-white p-1 flex-shrink-0 focus:outline-none" onClick={() => setMobOpen(v => !v)}>☰</button>
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight truncate">Agnichakra Portal</span>
              <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active Season
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-zinc-300 bg-white/[0.03] px-3.5 py-1.5 rounded-2xl border border-white/[0.08] shadow-inner">
              <span>📅 Season {month}</span>
            </div>
            {unread > 0 && (
              <Link href="/notifications" className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-extrabold text-xs hover:bg-orange-500/25 transition-all shadow-[0_0_15px_rgba(249,115,22,0.25)]">
                🔔 <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow">{unread}</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="min-h-full"
            >
              {isOverdue ? overdueLockoutScreen : children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {upiModal && (
        <UpiModal open={!!upiModal} link={upiModal.link} amount={upiModal.amount} month={month}
          memberName={upiModal.memberName} onClose={() => setUpiModal(null)} onMarkPaid={handleMarkPaid} />
      )}
    </div>
  );
}
