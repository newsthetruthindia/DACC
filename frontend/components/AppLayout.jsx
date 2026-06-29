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
        const token = localStorage.getItem('agnichakra_token');
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
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
          active 
            ? 'bg-gradient-to-r from-[#ff5500]/20 to-transparent text-white font-bold border-l-4 border-[#ff5500] shadow-[0_0_20px_rgba(255,85,0,0.15)]' 
            : 'text-zinc-400 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
        }`}>
        <span className={`text-base transition-transform group-hover:scale-125 ${active ? 'text-[#ff5500]' : 'opacity-70'}`}>{icon}</span>
        <span className="flex-1 font-sports tracking-wide">{label}</span>
        {badge > 0 && <span className="bg-[#ff5500] text-white text-[10px] font-bold font-sports px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,85,0,0.6)]">{badge}</span>}
      </Link>
    );
  };

  const planColors = { SILVER:'#a1a1aa', GOLD:'#f59e0b', PLATINUM:'#a855f7' };
  const initials = `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase();

  const sidebar = (
    <aside className={`w-[240px] bg-[#0c0c10] border-r border-white/10 flex flex-col h-full ${mobOpen ? 'flex' : 'hidden'} lg:flex`}>
      {/* Brand Header */}
      <div className="px-5 py-6 border-b border-white/10 bg-gradient-to-b from-[#16131c] to-[#0c0c10]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5500] to-[#b91c1c] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,85,0,0.4)]">
            🔥
          </div>
          <div>
            <div className="text-white font-extrabold font-sports tracking-wider text-base leading-tight">AGNICHAKRA</div>
            <div className="text-[#ff5500] font-sports font-bold text-[10px] tracking-widest mt-0.5 uppercase">SPORTS CLUB</div>
          </div>
        </div>
      </div>

      {/* Athlete Profile Pill */}
      <div className="p-3 mx-3 my-4 rounded-2xl bg-[#14141c] border border-white/10 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold font-sports text-white flex-shrink-0 shadow-md border"
            style={{ background: `linear-gradient(135deg, ${planColors[user.plan] || '#ff5500'}44 0%, #0c0c10 100%)`, borderColor: planColors[user.plan] || '#ff5500' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-bold truncate">{user.fname} {user.lname}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-sports font-bold uppercase tracking-wider text-zinc-400">{user.plan} ROSTER</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
        <p className="text-[10px] font-sports font-extrabold uppercase tracking-widest text-zinc-500 px-3 py-1.5 mt-1">⚡ CLUB ARENA</p>
        {navItem('/dashboard',     '🏆', 'Dashboard')}
        {navItem('/funds',         '📊', 'Funds & Expenses')}
        {navItem('/notifications', '🔔', 'Alerts & News', unread)}
        {navItem('/messages',      '💬', 'Locker Room Chat')}
        {navItem('/subscription',  '💳', 'Membership Dues')}
        {navItem('/panel',         '👥', 'Core Committee')}
        {navItem('/profile',       '👤', 'Athlete Profile')}

        {isPanel && <>
          <p className="text-[10px] font-sports font-extrabold uppercase tracking-widest text-orange-500/70 px-3 py-1.5 mt-4">⚙️ COMMITTEE</p>
          {navItem('/panel/inbox',    '📥', 'Member Inbox')}
          {navItem('/panel/notify',   '📣', 'Broadcast Alert')}
          {navItem('/panel/payments', '💰', 'Verify Dues')}
        </>}

        {isAdmin && <>
          <p className="text-[10px] font-sports font-extrabold uppercase tracking-widest text-red-500/70 px-3 py-1.5 mt-4">👑 SUPER ADMIN</p>
          {navItem('/admin/members',  '🗂', 'Roster Control')}
          {navItem('/admin/panel',    '🛡️', 'Committee Manage')}
          {navItem('/admin/terms',    '📅', 'Club Seasons')}
          {navItem('/admin/settings', '🏦', 'Bank & UPI Config')}
        </>}
      </nav>

      <div className="p-3 border-t border-white/10 bg-[#08080c]">
        <button onClick={() => { clearAuth(); router.push('/login'); }}
          className="w-full px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent font-sports font-bold text-xs flex items-center justify-center gap-2 transition-all">
          <span>🚪</span> LOGOUT ARENA
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
    <div className="flex-1 flex items-center justify-center p-6 bg-[#070709] min-h-full">
      <div className="max-w-md w-full bg-[#121218] rounded-3xl border-2 border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.25)] p-8 text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
        <div className="w-20 h-20 bg-red-950/80 border border-red-500/40 text-red-500 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse">
          🔒
        </div>
        <div className="text-[11px] font-sports font-extrabold uppercase tracking-widest text-red-400 mb-1">ROSTER SUSPENDED</div>
        <h2 className="text-2xl font-extrabold font-sports text-white mb-2 tracking-wide">SEASON RECHARGE REQUIRED</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Your Agnichakra Sports Club monthly contribution is overdue by over 30 days. To maintain active athlete privileges and unlock locker room stats, please recharge your membership.
        </p>
        <div className="bg-[#0b0b0f] p-4 rounded-2xl mb-6 flex justify-between items-center border border-white/10 shadow-inner">
          <span className="text-xs font-sports font-bold uppercase tracking-wider text-zinc-400">Monthly Contribution</span>
          <span className="text-xl font-black font-sports text-[#ff5500]">₹{pl.price} / mo</span>
        </div>
        <button
          onClick={() => {
            const link = `upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_CLUB_UPI||'agnichakra@okaxis')}&pn=${encodeURIComponent('Agnichakra Club')}&am=${pl.price}&cu=INR&tn=${encodeURIComponent(`Agnichakra Club ${pl.label} ${month}`)}`;
            setUpiModal({ link, amount: pl.price, memberName: `${user.fname} ${user.lname}` });
          }}
          className="w-full py-4 fire-btn rounded-xl text-sm shadow-xl flex items-center justify-center gap-2">
          ⚡ RECHARGE NOW VIA UPI →
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#070709] text-zinc-100 selection:bg-[#ff5500]">
      {/* Mobile overlay */}
      {mobOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobOpen(false)} />}

      {/* Sidebar — fixed on mobile */}
      <div className={`${mobOpen ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} lg:relative lg:flex lg:flex-shrink-0`}>
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#0c0c10]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-xl text-zinc-300 hover:text-white" onClick={() => setMobOpen(v => !v)}>☰</button>
            <div className="flex items-center gap-3">
              <span className="font-extrabold font-sports tracking-wider text-white text-base lg:text-lg">AGNICHAKRA ARENA</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[#ff5500] text-[10px] font-sports font-extrabold tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-ping"></span> LIVE CLUB SPORTS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-sports font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span>🏆 SEASON {month}</span>
            </div>
            {unread > 0 && (
              <Link href="/notifications" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-sports font-bold text-xs hover:bg-red-500/20 transition-all">
                🔔 <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px] animate-pulse">{unread}</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content or Overdue Lockout */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#13111a] via-[#070709] to-[#070709]">
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
