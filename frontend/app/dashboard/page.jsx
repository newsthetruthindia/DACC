'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, StatCard, Btn, Badge, Loading, Empty, UpiModal } from '@/components/ui';
import { api, getUser, PLANS, fmtTime, fmtMonth, currentMonth, resolveImgUrl } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser]         = useState(null);
  const [payments, setPayments] = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [panel, setPanel]       = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [upi, setUpi]           = useState(null);

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

  if (loading || !user) return <AppLayout><Loading /></AppLayout>;

  const plan = PLANS[user.plan] || PLANS.SILVER;
  const thisPay = payments.find(p => p.forMonth === month);
  const isPaid  = thisPay?.status === 'CONFIRMED';
  const isPanel = ['PANEL','SUPER_ADMIN'].includes(user.role);

  return (
    <AppLayout>
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8 p-5 sm:p-6 lg:p-8 rounded-2xl bg-[#131318] border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
            Welcome Back · {plan.label} Plan
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
            Hello, {user.fname} {user.lname} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Status: <span className="text-emerald-400 font-semibold">{user.status}</span> · City: {user.city || 'Not specified'}
          </p>
        </div>
        <div className="w-full md:w-auto">
          {!isPaid && (
            <Btn variant="primary" size="lg" className="w-full md:w-auto" onClick={async () => {
              const r = await api.upiLink(month);
              setUpi({ link: r.data.link, amount: r.data.amount, memberName: `${user.fname} ${user.lname}` });
            }}>
              💳 Pay Monthly Dues →
            </Btn>
          )}
        </div>
      </div>

      {/* Admin Summary KPIs */}
      {isPanel && summary && (
        <div className="mb-8">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Committee Overview ({month})</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon="👥" label="Total Members" value={summary.total} sub="Registered in portal" />
            <StatCard icon="✅" label="Paid This Month" value={summary.confirmed} color="#10b981"
              sub={`${summary.total > 0 ? Math.round(summary.confirmed/summary.total*100) : 0}% collected`} />
            <StatCard icon="⏳" label="Pending Dues" value={summary.pending} color="#f59e0b" sub="Awaiting contribution" />
            <StatCard icon="💰" label="Total Revenue" value={`₹${summary.totalRevenue}`} color="#f97316" sub={fmtMonth(month)} />
          </div>
        </div>
      )}

      {/* Member Stats Grid */}
      <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">My Membership Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-8">
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">💳</span>
              <Badge label={isPaid ? 'PAID' : 'DUE'} />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">This Month ({month})</div>
            <div className={`text-2xl font-extrabold ${isPaid ? 'text-emerald-400' : 'text-orange-400'}`}>
              {isPaid ? 'Dues Paid' : 'Payment Due'}
            </div>
            <div className="text-sm text-zinc-400 mt-1">Amount: <span className="text-white font-semibold">₹{plan.price}</span></div>
            {!isPaid && (
              <Btn size="sm" variant="primary" className="mt-4 w-full" onClick={async () => {
                const r = await api.upiLink(month);
                setUpi({ link: r.data.link, amount: r.data.amount, memberName: `${user.fname} ${user.lname}` });
              }}>Pay Now via UPI</Btn>
            )}
            {thisPay?.status === 'PENDING' && (
              <p className="text-xs text-amber-400 mt-3 font-medium">⏳ Transaction verifying by Committee</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">📋</span>
              <Badge label={user.plan} />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Current Plan</div>
            <div className="text-2xl font-extrabold text-white">{plan.label} Plan</div>
            <div className="text-sm text-zinc-400 mt-1">Monthly Rate: <span className="text-white font-semibold">₹{plan.price}/mo</span></div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl p-2.5 rounded-xl bg-zinc-800 border border-zinc-700">📅</span>
              <span className="text-xs font-semibold text-zinc-400">History</span>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Months Completed</div>
            <div className="text-2xl font-extrabold text-white">
              {payments.filter(p => p.status === 'CONFIRMED').length} Months
            </div>
            <div className="text-sm text-zinc-400 mt-1">Confirmed payments to date</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <Card>
          <CardHeader>
            <span className="font-bold text-white text-base">📣 Recent Announcements</span>
            <a href="/notifications" className="text-xs font-semibold text-orange-400 hover:underline flex-shrink-0">View All →</a>
          </CardHeader>
          {notifs.length === 0
            ? <Empty icon="📭" title="No announcements posted yet" />
            : <div className="divide-y divide-zinc-800">
                {notifs.map(n => (
                  <div key={n._id} className={`p-4 sm:p-5 transition-colors hover:bg-zinc-900/50 ${!n.isRead ? 'bg-orange-500/5 border-l-2 border-orange-500' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>}
                      <span className="font-bold text-base text-white">{n.title}</span>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-2 mt-1 leading-relaxed">{n.body}</p>
                    <p className="text-xs text-zinc-500 mt-2 font-medium">{fmtTime(n.createdAt)}</p>
                  </div>
                ))}
              </div>
          }
        </Card>

        {/* Committee Roster */}
        <Card>
          <CardHeader>
            <span className="font-bold text-white text-base">👥 Core Committee 2025–26</span>
            <a href="/panel" className="text-xs font-semibold text-orange-400 hover:underline flex-shrink-0">View All →</a>
          </CardHeader>
          <CardBody className="p-4 sm:p-6">
            {panel.length === 0
              ? <Empty icon="👥" title="Committee not assigned yet" />
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {panel.slice(0, 4).map(p => {
                    const u = p.userId;
                    const pc = PLANS[u?.plan]?.color || '#f97316';
                    return (
                      <div key={p._id} className="flex items-center gap-3 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 border overflow-hidden"
                          style={{ background: `${pc}22`, borderColor: pc }}>
                          {u?.selfieUrl || u?.avatarUrl ? (
                            <img src={resolveImgUrl(u?.selfieUrl || u?.avatarUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{(u?.fname?.[0]||'') + (u?.lname?.[0]||'')}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate">{u?.fname} {u?.lname}</div>
                          <div className="text-xs text-orange-400 font-medium mt-0.5 truncate">{p.panelRole}</div>
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
          memberName={upi.memberName} onClose={() => setUpi(null)} onMarkPaid={async () => {
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
