'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, StatCard, Badge, Btn, UpiModal, Loading, Empty } from '@/components/ui';
import { api, PLANS, fmtMonth, fmtTime, currentMonth, getUser } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser]         = useState(null);
  const [payments, setPayments] = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [panel, setPanel]       = useState([]);
  const [summary, setSummary]   = useState(null);
  const [upi, setUpi]           = useState(null);
  const [loading, setLoading]   = useState(true);

  const month = currentMonth();

  useEffect(() => {
    const u = getUser();
    setUser(u);
    Promise.all([
      api.myProfile(),
      api.notifications('?limit=4'),
      api.panel(),
    ]).then(([me, n, p]) => {
      setUser(me.data);
      setPayments(me.data.payments || []);
      setNotifs(n.data.notifications || []);
      setPanel(p.data || []);
    }).finally(() => setLoading(false));

    const u2 = getUser();
    if (['PANEL','SUPER_ADMIN'].includes(u2?.role)) {
      api.duesSummary(month).then(r => setSummary(r.data)).catch(() => {});
    }
  }, []);

  if (loading) return <AppLayout><Loading /></AppLayout>;
  if (!user)   return <AppLayout><Loading /></AppLayout>;

  const plan = PLANS[user.plan] || PLANS.SILVER;
  const thisPay = payments.find(p => p.forMonth === month);
  const isPaid  = thisPay?.status === 'CONFIRMED';
  const isPanel = ['PANEL','SUPER_ADMIN'].includes(user.role);
  const isAdmin = user.role === 'SUPER_ADMIN';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">{greeting}, {user.fname} 👋</h1>
        <p className="text-sm text-[#9a9890] mt-1">{plan.label} Member · Term 2025–26</p>
      </div>

      {/* Admin stats */}
      {isPanel && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="👥" label="Total Members" value={summary.total} />
          <StatCard icon="✅" label="Paid This Month" value={summary.confirmed} color="#1a6b3c"
            sub={<div><div className="text-xs text-[#9a9890]">{summary.total > 0 ? Math.round(summary.confirmed/summary.total*100) : 0}% collected</div><div className="h-1.5 bg-[#e2e0d8] rounded mt-1"><div className="h-full bg-[#1a6b3c] rounded" style={{width:`${summary.total > 0 ? Math.round(summary.confirmed/summary.total*100) : 0}%`}} /></div></div>} />
          <StatCard icon="⏳" label="Pending" value={summary.pending} color="#c8410a" />
          <StatCard icon="💰" label="Revenue" value={`₹${summary.totalRevenue}`} color="#1a4a7a" sub={fmtMonth(month)} />
        </div>
      )}

      {/* Member stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <div className="text-2xl mb-2">💳</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1">This Month</div>
            <div className={`text-3xl font-extrabold font-mono tracking-tight ${isPaid ? 'text-green-600' : 'text-[#c8410a]'}`}>
              {isPaid ? 'PAID' : 'DUE'}
            </div>
            <div className="text-xs text-[#9a9890] mt-1">₹{plan.price} · {fmtMonth(month)}</div>
            {!isPaid && (
              <Btn size="sm" variant="dark" className="mt-3" onClick={async () => {
                const r = await api.upiLink(month);
                setUpi({ link: r.data.link, amount: r.data.amount, memberName: `${user.fname} ${user.lname}` });
              }}>Pay Now →</Btn>
            )}
            {thisPay?.status === 'PENDING' && (
              <p className="text-xs text-amber-600 mt-2 font-medium">⏳ Payment submitted — awaiting confirmation</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-2xl mb-2">📋</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1">My Plan</div>
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: plan.color }}>{plan.label}</div>
            <div className="text-xs text-[#9a9890] mt-1">₹{plan.price}/month</div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: plan.bg, color: plan.color }}>{user.status}</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-2xl mb-2">📅</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1">Months Paid</div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-[#1a4a7a]">
              {payments.filter(p => p.status === 'CONFIRMED').length}
            </div>
            <div className="text-xs text-[#9a9890] mt-1">Total confirmed payments</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <span className="font-bold text-[#1a1916] text-sm">📣 Recent Announcements</span>
            <a href="/notifications" className="text-xs text-[#c8410a] font-semibold hover:underline">See All</a>
          </CardHeader>
          {notifs.length === 0
            ? <Empty icon="📭" title="No announcements yet" />
            : notifs.map(n => (
              <div key={n._id} className={`px-5 py-3 border-b border-[#e2e0d8] last:border-0 ${!n.isRead ? 'bg-[#fff8f5]' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#c8410a] flex-shrink-0" />}
                  <span className="font-semibold text-sm text-[#1a1916]">{n.title}</span>
                </div>
                <p className="text-xs text-[#4a4840] line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-[#9a9890] mt-1">{fmtTime(n.createdAt)}</p>
              </div>
            ))
          }
        </Card>

        {/* Core Panel */}
        <Card>
          <CardHeader>
            <span className="font-bold text-[#1a1916] text-sm">👥 Core Panel 2025–26</span>
            <a href="/panel" className="text-xs text-[#c8410a] font-semibold hover:underline">View All</a>
          </CardHeader>
          <CardBody>
            {panel.length === 0
              ? <Empty icon="👥" title="Panel not yet assigned" />
              : <div className="grid grid-cols-2 gap-3">
                  {panel.slice(0, 4).map(p => {
                    const u = p.userId;
                    const pc = PLANS[u?.plan]?.color || '#888';
                    return (
                      <div key={p._id} className="flex items-center gap-2.5 p-3 bg-[#f5f4f0] rounded-xl">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: pc+'22', color: pc }}>
                          {(u?.fname?.[0]||'') + (u?.lname?.[0]||'')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1a1916] truncate">{u?.fname} {u?.lname}</div>
                          <div className="text-[10px] text-[#c8410a] font-semibold">{p.panelRole}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </CardBody>
        </Card>
      </div>

      {upi && (
        <UpiModal open={!!upi} link={upi.link} amount={upi.amount} month={fmtMonth(month)}
          memberName={upi.memberName}
          onClose={() => setUpi(null)}
          onMarkPaid={async () => {
            const fd = new FormData();
            fd.append('forMonth', month);
            await api.submitPayment(fd);
            setUpi(null);
            window.location.reload();
          }} />
      )}
    </AppLayout>
  );
}
