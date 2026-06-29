'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, StatCard, Btn, Badge, Loading, Empty, UpiModal } from '@/components/ui';
import { api, getUser, PLANS, fmtTime, fmtMonth, currentMonth } from '@/lib/api';

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
      {/* Welcome Banner */}
      <div className="mb-8 relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-[#181320] via-[#121218] to-[#1a121c] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#ff5500]/15 via-red-500/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#ff5500] font-sports font-extrabold text-xs uppercase tracking-widest mb-1.5">
              <span>⚡ WELCOME TO THE ARENA</span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-400">SEASON 2025–26</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black font-sports tracking-tight text-white uppercase">
              ATHLETE {user.fname} {user.lname}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2 font-medium">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-bold font-sports text-amber-400">{plan.label} DIVISION</span>
              <span>·</span>
              <span>Active Status: <span className="text-emerald-400 font-bold uppercase">{user.status}</span></span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isPaid && (
              <Btn variant="primary" size="lg" onClick={async () => {
                const r = await api.upiLink(month);
                setUpi({ link: r.data.link, amount: r.data.amount, memberName: `${user.fname} ${user.lname}` });
              }}>
                ⚡ PAY SEASON DUES →
              </Btn>
            )}
          </div>
        </div>
      </div>

      {/* Admin / Panel KPI Scoreboard */}
      {isPanel && summary && (
        <div className="mb-8">
          <div className="text-xs font-sports font-extrabold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
            <span>⚙️ COMMITTEE LIVE SCOREBOARD ({month})</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="🏆" label="Total Rostered" value={summary.total} sub="Active club athletes" />
            <StatCard icon="⚡" label="Paid Season Dues" value={summary.confirmed} color="#10b981"
              sub={`${summary.total > 0 ? Math.round(summary.confirmed/summary.total*100) : 0}% collected`} />
            <StatCard icon="⏳" label="Pending Dues" value={summary.pending} color="#f59e0b" sub="Action required" />
            <StatCard icon="💰" label="Season Revenue" value={`₹${summary.totalRevenue}`} color="#ff5500" sub={fmtMonth(month)} />
          </div>
        </div>
      )}

      {/* Athlete Locker Room Stats */}
      <div className="text-xs font-sports font-extrabold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
        <span>🏃 MY ATHLETE STATS</span>
        <div className="h-px flex-1 bg-white/10"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <Card className="group border-white/10 hover:border-[#ff5500]/40 transition-all">
          <CardBody className="relative overflow-hidden p-6">
            <div className="absolute right-2 bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">💳</div>
            <div className="text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400 mb-1">CURRENT SEASON ({month})</div>
            <div className={`text-3xl font-black font-sports tracking-tight mt-2 ${isPaid ? 'text-emerald-400 text-scoreboard' : 'text-red-500 animate-pulse'}`}>
              {isPaid ? '⚡ PAID IN FULL' : '🔴 DUES PENDING'}
            </div>
            <div className="text-xs text-zinc-400 mt-2 font-semibold">Contribution: <span className="text-white font-bold">₹{plan.price}</span></div>
            {!isPaid && (
              <Btn size="sm" variant="primary" className="mt-4 w-full" onClick={async () => {
                const r = await api.upiLink(month);
                setUpi({ link: r.data.link, amount: r.data.amount, memberName: `${user.fname} ${user.lname}` });
              }}>⚡ PAY NOW VIA UPI</Btn>
            )}
            {thisPay?.status === 'PENDING' && (
              <p className="text-xs text-amber-400 mt-3 font-bold flex items-center gap-1">⏳ UTR Submitted — Committee Verifying</p>
            )}
          </CardBody>
        </Card>

        <Card className="group border-white/10 hover:border-amber-500/40 transition-all">
          <CardBody className="relative overflow-hidden p-6">
            <div className="absolute right-2 bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">🏅</div>
            <div className="text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400 mb-1">MEMBERSHIP TIER</div>
            <div className="text-3xl font-black font-sports tracking-tight mt-2 text-amber-400 text-scoreboard">{plan.label} DIVISION</div>
            <div className="text-xs text-zinc-400 mt-2 font-semibold">Monthly Rate: <span className="text-white font-bold">₹{plan.price}/mo</span></div>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-sports font-bold text-amber-300 uppercase">⚡ ACTIVE PRIVILEGES</span>
            </div>
          </CardBody>
        </Card>

        <Card className="group border-white/10 hover:border-purple-500/40 transition-all">
          <CardBody className="relative overflow-hidden p-6">
            <div className="absolute right-2 bottom-2 text-6xl opacity-5 group-hover:scale-110 transition-transform">📈</div>
            <div className="text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400 mb-1">STREAK & HISTORY</div>
            <div className="text-3xl font-black font-sports tracking-tight mt-2 text-purple-400 text-scoreboard">
              {payments.filter(p => p.status === 'CONFIRMED').length} SEASONS
            </div>
            <div className="text-xs text-zinc-400 mt-2 font-semibold">Total confirmed club cycles</div>
            <div className="mt-4">
              <a href="/subscription" className="text-xs font-sports font-bold text-[#ff5500] hover:underline">VIEW FULL LEDGER →</a>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card className="border-white/10 shadow-xl">
          <CardHeader className="bg-white/[0.02]">
            <span className="font-extrabold font-sports text-white text-sm tracking-wider flex items-center gap-2">
              <span>📣 CLUB BROADCASTS & NEWS</span>
            </span>
            <a href="/notifications" className="text-xs font-sports font-bold text-[#ff5500] hover:underline">ALL ALERTS →</a>
          </CardHeader>
          {notifs.length === 0
            ? <Empty icon="📭" title="No club announcements posted yet" />
            : <div className="divide-y divide-white/5">
                {notifs.map(n => (
                  <div key={n._id} className={`p-5 transition-colors hover:bg-white/[0.03] ${!n.isRead ? 'bg-orange-500/[0.05] border-l-2 border-[#ff5500]' : ''}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-ping flex-shrink-0" />}
                      <span className="font-bold font-sports text-sm text-white tracking-wide">{n.title}</span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] font-sports font-semibold text-zinc-500 mt-2 uppercase tracking-wider">{fmtTime(n.createdAt)}</p>
                  </div>
                ))}
              </div>
          }
        </Card>

        {/* Core Committee Roster */}
        <Card className="border-white/10 shadow-xl">
          <CardHeader className="bg-white/[0.02]">
            <span className="font-extrabold font-sports text-white text-sm tracking-wider flex items-center gap-2">
              <span>👥 CORE COMMITTEE 2025–26</span>
            </span>
            <a href="/panel" className="text-xs font-sports font-bold text-[#ff5500] hover:underline">FULL COMMITTEE →</a>
          </CardHeader>
          <CardBody>
            {panel.length === 0
              ? <Empty icon="👥" title="Committee roster not yet finalized" />
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {panel.slice(0, 4).map(p => {
                    const u = p.userId;
                    const pc = PLANS[u?.plan]?.color || '#ff5500';
                    return (
                      <div key={p._id} className="flex items-center gap-3 p-3.5 bg-[#14141c] border border-white/10 rounded-xl hover:border-[#ff5500]/40 transition-all group shadow-sm">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold font-sports text-white flex-shrink-0 shadow border"
                          style={{ background: `linear-gradient(135deg, ${pc}44 0%, #121218 100%)`, borderColor: pc }}>
                          {(u?.fname?.[0]||'') + (u?.lname?.[0]||'')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate group-hover:text-[#ff5500] transition-colors">{u?.fname} {u?.lname}</div>
                          <div className="text-[10px] font-sports font-bold text-amber-400 uppercase tracking-widest mt-0.5">{p.panelRole}</div>
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
