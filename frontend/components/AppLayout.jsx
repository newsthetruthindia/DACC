'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser, clearAuth, api, saveAuth, PLANS, currentMonth } from '@/lib/api';
import { UpiModal, toast } from '@/components/ui';

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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
          active 
            ? 'bg-orange-500/15 text-white font-semibold border-l-4 border-orange-500 shadow-sm' 
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border-l-4 border-transparent'
        }`}>
        <span className="text-lg flex-shrink-0">{icon}</span>
        <span className="flex-1 truncate">{label}</span>
        {badge > 0 && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">{badge}</span>}
      </Link>
    );
  };

  const planColors = { SILVER:'#a1a1aa', GOLD:'#f59e0b', PLATINUM:'#a855f7' };
  const initials = `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase();

  const sidebar = (
    <aside className={`w-[260px] bg-[#121216] border-r border-zinc-800 flex flex-col h-full shadow-2xl lg:shadow-none transition-all`}>
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-700/80 p-1 flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
            <img src="/logo.png" alt="DACC Agnichakra Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-extrabold text-base leading-tight truncate tracking-tight">DACC Agnichakra</div>
            <div className="text-[10px] text-orange-400 font-mono font-bold tracking-wider mt-0.5">ESTD 1962</div>
          </div>
        </div>
        <button onClick={() => setMobOpen(false)} className="lg:hidden text-zinc-400 hover:text-white text-xl p-1">✕</button>
      </div>

      {/* User Profile Pill */}
      <div className="p-3 mx-3.5 my-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 border"
            style={{ backgroundColor: planColors[user.plan] || '#555', borderColor: planColors[user.plan] || '#777' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-bold text-sm truncate">{user.fname} {user.lname}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">{user.memberId || 'MEMBER'}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3.5 py-2 space-y-1 overflow-y-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-3 py-2">Main Navigation</p>
        {navItem('/dashboard',     '📊', 'Dashboard')}
        {navItem('/funds',         '💰', 'Funds & Expenses')}
        {navItem('/notifications', '🔔', 'Announcements', unread)}
        {navItem('/messages',      '💬', 'Write to Panel')}
        {navItem('/subscription',  '💳', 'My Subscription')}
        {navItem('/panel',         '👥', 'Core Committee')}
        {navItem('/profile',       '👤', 'My Profile')}

        {isPanel && <>
          <p className="text-xs font-bold uppercase tracking-wider text-orange-400 px-3 py-2 mt-4">Committee</p>
          {navItem('/panel/inbox',    '📥', 'Member Inbox')}
          {navItem('/panel/notify',   '📣', 'Broadcast Alert')}
          {navItem('/panel/payments', '✅', 'Verify Dues')}
        </>}

        {isAdmin && <>
          <p className="text-xs font-bold uppercase tracking-wider text-red-400 px-3 py-2 mt-4">Admin Controls</p>
          {navItem('/admin/members',  '🗂️', 'Manage Members')}
          {navItem('/admin/panel',    '🛡️', 'Manage Panel')}
          {navItem('/admin/terms',    '📅', 'Club Terms')}
          {navItem('/admin/settings', '🏦', 'Bank Settings')}
        </>}
      </nav>

      <div className="p-3.5 border-t border-zinc-800 space-y-2">
        <a href="https://www.facebook.com/agnichakraclub" target="_blank" rel="noopener noreferrer"
          className="w-full px-3 py-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/30 text-[#4E9AF1] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm">
          <span>👍</span> Official Facebook Page ↗
        </a>
        <button onClick={() => { clearAuth(); router.push('/login'); }}
          className="w-full px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-medium text-xs flex items-center justify-center gap-2 transition-all">
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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#0a0a0d] min-h-full">
      <div className="max-w-md w-full bg-[#131318] rounded-2xl border border-zinc-800 shadow-2xl p-6 sm:p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
          🔒
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Membership Recharge Required</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Your Agnichakra Club monthly contribution is overdue by over 30 days. To maintain active club privileges and unlock portal features, please complete your contribution.
        </p>
        <div className="bg-zinc-900/80 p-4 rounded-xl mb-6 flex justify-between items-center border border-zinc-800">
          <span className="text-sm font-medium text-zinc-400">Monthly Contribution</span>
          <span className="text-lg font-bold text-orange-400">₹{pl.price} / mo</span>
        </div>
        <button
          onClick={() => {
            const link = `upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_CLUB_UPI||'agnichakra@okaxis')}&pn=${encodeURIComponent('Agnichakra Club')}&am=${pl.price}&cu=INR&tn=${encodeURIComponent(`Agnichakra Club ${pl.label} ${month}`)}`;
            setUpiModal({ link, amount: pl.price, memberName: `${user.fname} ${user.lname}` });
          }}
          className="w-full py-3.5 primary-btn rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2">
          💳 Recharge Now via UPI →
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0d] text-zinc-100">
      {/* Mobile overlay */}
      {mobOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden animate-fade-in" onClick={() => setMobOpen(false)} />}

      {/* Sidebar — fixed on mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:relative lg:flex lg:flex-shrink-0 transition-transform duration-300 transform ${mobOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#121216] border-b border-zinc-800 flex items-center justify-between px-3.5 sm:px-6 flex-shrink-0 z-20 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden text-2xl text-zinc-400 hover:text-white p-1 flex-shrink-0 focus:outline-none" onClick={() => setMobOpen(v => !v)}>☰</button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="font-bold text-white text-base sm:text-lg truncate">Agnichakra Portal</span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Season
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span>📅 {month}</span>
            </div>
            {unread > 0 && (
              <Link href="/notifications" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold text-xs hover:bg-orange-500/20 transition-all">
                🔔 <span className="bg-orange-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">{unread}</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8">
          {isOverdue ? overdueLockoutScreen : children}
        </main>
      </div>

      {upiModal && (
        <UpiModal open={!!upiModal} link={upiModal.link} amount={upiModal.amount} month={month}
          memberName={upiModal.memberName} onClose={() => setUpiModal(null)} onMarkPaid={handleMarkPaid} />
      )}
    </div>
  );
}
