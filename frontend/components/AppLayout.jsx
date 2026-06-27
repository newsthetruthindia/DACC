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

  const navItem = (href, icon, label, badge) => (
    <Link href={href} onClick={() => setMobOpen(false)}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        pathname === href ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
      }`}>
      <span className="w-5 text-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
    </Link>
  );

  const planColors = { SILVER:'#888', GOLD:'#b8860b', PLATINUM:'#5b3db8' };
  const initials = `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase();

  const sidebar = (
    <aside className={`w-[220px] bg-[#1a1916] flex flex-col h-full ${mobOpen ? 'flex' : 'hidden'} lg:flex`}>
      <div className="px-4 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-white font-bold text-[15px] leading-tight">Agnichakra Club</div>
            <div className="text-white/35 text-[10px] mt-0.5">Member Portal</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: planColors[user.plan] || '#888' }}>{initials}</div>
          <div className="min-w-0">
            <div className="text-white text-[13px] font-semibold truncate">{user.fname} {user.lname}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-wide mt-0.5">{user.plan} Member</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-0.5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 px-2 py-1.5 mt-1">Main</p>
        {navItem('/dashboard',     '⊞', 'Dashboard')}
        {navItem('/funds',         '📊', 'Funds & Expenses')}
        {navItem('/notifications', '🔔', 'Notifications', unread)}
        {navItem('/messages',      '✉', 'Write to Panel')}
        {navItem('/subscription',  '💳', 'Subscription')}
        {navItem('/panel',         '👥', 'Core Panel')}
        {navItem('/profile',       '👤', 'My Profile')}

        {isPanel && <>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 px-2 py-1.5 mt-3">Panel</p>
          {navItem('/panel/inbox',    '📥', 'Member Inbox')}
          {navItem('/panel/notify',   '📣', 'Send Notification')}
          {navItem('/panel/payments', '💰', 'Payments')}
        </>}

        {isAdmin && <>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 px-2 py-1.5 mt-3">Admin</p>
          {navItem('/admin/members',  '🗂', 'All Members')}
          {navItem('/admin/panel',    '⚙', 'Manage Panel')}
          {navItem('/admin/terms',    '📅', 'Club Terms')}
          {navItem('/admin/settings', '🏦', 'Bank & UPI Settings')}
        </>}
      </nav>

      <div className="px-4 py-3 border-t border-white/8">
        <button onClick={() => { clearAuth(); router.push('/login'); }}
          className="text-white/35 hover:text-white text-xs flex items-center gap-2 transition-colors">
          ↩ Logout
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
    <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f4f0] min-h-full">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
          🔒
        </div>
        <h2 className="text-xl font-extrabold text-[#1a1916] mb-2">Membership Recharge Required</h2>
        <p className="text-sm text-[#9a9890] mb-6 leading-relaxed">
          Your Agnichakra Club monthly contribution is overdue by over 30 days. To restore full dashboard privileges, please recharge your membership contribution.
        </p>
        <div className="bg-[#f5f4f0] p-4 rounded-xl mb-6 flex justify-between items-center border border-[#e2e0d8]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9a9890]">Monthly Contribution</span>
          <span className="text-lg font-extrabold text-[#c8410a]">₹{pl.price} / mo</span>
        </div>
        <button
          onClick={() => {
            const link = `upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_CLUB_UPI||'agnichakra@okaxis')}&pn=${encodeURIComponent('Agnichakra Club')}&am=${pl.price}&cu=INR&tn=${encodeURIComponent(`Agnichakra Club ${pl.label} ${month}`)}`;
            setUpiModal({ link, amount: pl.price, memberName: `${user.fname} ${user.lname}` });
          }}
          className="w-full py-3.5 bg-[#c8410a] hover:bg-[#a63508] text-white font-extrabold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
          💳 Recharge Now via UPI →
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f4f0]">
      {/* Mobile overlay */}
      {mobOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobOpen(false)} />}

      {/* Sidebar — fixed on mobile */}
      <div className={`${mobOpen ? 'fixed inset-y-0 left-0 z-40' : 'hidden'} lg:relative lg:flex lg:flex-shrink-0`}>
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-[#e2e0d8] flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-lg" onClick={() => setMobOpen(v => !v)}>☰</button>
            <span className="font-bold text-[#1a1916] text-[15px]">Agnichakra Club Portal</span>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <Link href="/notifications" className="flex items-center gap-1.5 text-sm text-[#c8410a] font-semibold">
                🔔 <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content or Overdue Lockout */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
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
