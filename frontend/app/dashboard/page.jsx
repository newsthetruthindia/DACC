'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, StatCard, Btn, Badge, Loading, Empty, UpiModal } from '@/components/ui';
import { api, getUser, PLANS, fmtTime, fmtMonth, currentMonth, resolveImgUrl } from '@/lib/api';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
};

export default function DashboardPage() {
  const [user, setUser]         = useState(null);
  const [payments, setPayments] = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [panel, setPanel]       = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [upi, setUpi]           = useState(null);
  const [donAmt, setDonAmt]     = useState('501');

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
      {/* Premium Hero Welcome Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#171724] via-[#1d1624] to-[#14141f] border border-white/[0.1] shadow-[0_15px_40px_rgba(0,0,0,0.7)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 group">
        {/* Ambient Decorative Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-600/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:opacity-100 transition-opacity" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-black tracking-wider uppercase shadow-sm">
            <span>✨</span> Welcome Back · Official Club Member
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
            Hello, {user.fname} {user.lname} 👋
          </h1>
          <div className="flex items-center flex-wrap gap-3 text-xs sm:text-sm text-zinc-300 font-medium pt-1">
            <span className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1 rounded-xl border border-white/[0.06]">
              Status: <span className="text-emerald-400 font-bold">{user.status}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1 rounded-xl border border-white/[0.06]">
              📍 City: <span className="text-white font-bold">{user.city || 'Not specified'}</span>
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto relative z-10 flex-shrink-0">
          {!isPaid ? (
            <Btn variant="primary" size="lg" className="w-full md:w-auto shadow-orange-500/30 font-black text-base animate-pulse" onClick={async () => {
              const r = await api.upiLink(month);
              setUpi({ link: r.data.link, amount: r.data.amount, memberName: `${user.fname} ${user.lname}` });
            }}>
              💳 Pay Monthly Dues (₹{plan.price}) →
            </Btn>
          ) : (
            <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-extrabold text-sm shadow-lg">
              <span className="text-lg">✅</span> Season Dues Verified & Active
            </div>
          )}
        </div>
      </div>

      {/* Committee Overview KPIs */}
      {isPanel && summary && (
        <div className="mb-9 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Committee Operations Overview ({month})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="👥" label="Total Members" value={summary.total} sub="Registered in portal" color="#a855f7" />
            <StatCard icon="✅" label="Paid This Month" value={summary.confirmed} color="#10b981"
              sub={`${summary.total > 0 ? Math.round(summary.confirmed/summary.total*100) : 0}% collected`} />
            <StatCard icon="⏳" label="Pending Dues" value={summary.pending} color="#f59e0b" sub="Awaiting contribution" />
            <StatCard icon="💰" label="Total Revenue" value={`₹${summary.totalRevenue}`} color="#f97316" sub={fmtMonth(month)} />
          </div>
        </div>
      )}

      {/* Member Status Grid */}
      <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span> My Membership Command
      </h2>
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-9">
        <motion.div variants={item} className="h-full">
          <Card className="hover:border-white/20 hover:-translate-y-1 h-full">
            <CardBody className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/[0.1] flex items-center justify-center text-2xl shadow-md">
                    💳
                  </div>
                  <Badge label={isPaid ? 'PAID' : 'DUE'} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Monthly Contribution ({month})</div>
                <div className={`text-2xl font-black tracking-tight mb-2 ${isPaid ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {isPaid ? 'Dues Paid' : 'Payment Due'}
                </div>
                <div className="text-sm text-zinc-400 font-medium">Standard Dues: <span className="text-white font-extrabold">₹100</span></div>
              </div>
              {!isPaid && (
                <Btn size="sm" variant="primary" className="mt-5 w-full font-black shadow-orange-500/20" onClick={async () => {
                  const r = await api.upiLink(month);
                  setUpi({ link: r.data.link, amount: r.data.amount || 100, memberName: `${user.fname} ${user.lname}`, forMonth: month });
                }}>Pay ₹100 Now</Btn>
              )}
              {thisPay?.status === 'PENDING' && (
                <div className="mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <span>⏳</span> Verifying by Committee
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <Card className="hover:border-white/20 hover:-translate-y-1 h-full">
            <CardBody className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/[0.1] flex items-center justify-center text-2xl shadow-md">
                    🛡️
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">VERIFIED ATHLETE</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Club Governance Privileges</div>
                <div className="text-2xl font-black text-white tracking-tight mb-2">Equal Member Standing</div>
                <div className="text-sm text-zinc-400 font-medium">1 Payment Policy: <span className="text-orange-400 font-extrabold">All Tiers Unified</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-zinc-400">
                Equal voting rights & full tournament access
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <Card className="hover:border-white/20 hover:-translate-y-1 h-full">
            <CardBody className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.01] border border-white/[0.1] flex items-center justify-center text-2xl shadow-md">
                    🏆
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Good Standing
                  </span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Longevity Record</div>
                <div className="text-2xl font-black text-white tracking-tight mb-2">
                  {payments.filter(p => p.status === 'CONFIRMED' && !p.forMonth?.startsWith('DONATION')).length} Months
                </div>
                <div className="text-sm text-zinc-400 font-medium">Verified dues to date</div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-emerald-400 font-semibold">
                Thank you for supporting DACC!
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={item} className="h-full">
          <Card className="hover:border-white/20 hover:-translate-y-1 bg-gradient-to-br from-orange-500/[0.07] to-transparent border-orange-500/30 h-full">
            <CardBody className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl shadow-md">
                    🙏
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/15 px-2.5 py-1 rounded-full border border-orange-500/30 uppercase tracking-wider">
                    One-Time Gift
                  </span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">Voluntary Club Donation</div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                  Support club events or development with any one-time custom amount.
                </p>
              </div>
              <div className="space-y-2.5 mt-auto">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-bold text-sm">₹</span>
                  <input type="number" value={donAmt} onChange={(e) => setDonAmt(e.target.value)} placeholder="501"
                    className="w-full pl-7 pr-3 py-2 bg-black/40 border border-white/15 focus:border-orange-500 rounded-xl text-sm font-bold text-white outline-none" />
                </div>
                <Btn size="sm" variant="primary" className="w-full font-black shadow-orange-500/30" onClick={async () => {
                  const amt = Number(donAmt) > 0 ? Number(donAmt) : 501;
                  const donMonth = `DONATION-${Date.now().toString().slice(-6)}`;
                  const r = await api.upiLink(donMonth, amt, `One-Time Donation by ${user.fname}`);
                  setUpi({ link: r.data.link, amount: amt, memberName: `${user.fname} ${user.lname}`, forMonth: donMonth });
                }}>Contribute ₹{donAmt || 501} →</Btn>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Announcements & Committee Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <Card className="flex flex-col">
          <CardHeader>
            <span className="font-extrabold text-white text-base flex items-center gap-2">
              <span>📣</span> Recent Club Announcements
            </span>
            <a href="/notifications" className="text-xs font-extrabold text-orange-400 hover:text-orange-300 transition-colors flex-shrink-0">
              View All Archive →
            </a>
          </CardHeader>
          <div className="flex-1">
            {notifs.length === 0
              ? <Empty icon="📭" title="No announcements posted yet" sub="Announcements from the Core Committee will appear here." />
              : <div className="divide-y divide-white/[0.06]">
                  {notifs.map(n => (
                    <div key={n._id} className={`p-5 transition-all hover:bg-white/[0.02] ${!n.isRead ? 'bg-orange-500/5 border-l-4 border-orange-500' : ''}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />}
                        <span className="font-extrabold text-base text-white tracking-tight">{n.title}</span>
                      </div>
                      <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">{n.body}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-zinc-500 font-semibold">
                        <span>{fmtTime(n.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </Card>

        {/* Committee Roster */}
        <Card className="flex flex-col">
          <CardHeader>
            <span className="font-extrabold text-white text-base flex items-center gap-2">
              <span>🛡️</span> Core Committee 2025–26
            </span>
            <a href="/panel" className="text-xs font-extrabold text-orange-400 hover:text-orange-300 transition-colors flex-shrink-0">
              View Full Board →
            </a>
          </CardHeader>
          <CardBody className="p-5 sm:p-6 flex-1">
            {panel.length === 0
              ? <Empty icon="👥" title="Committee not assigned yet" sub="Official committee appointments will be published shortly." />
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {panel.slice(0, 4).map(p => {
                    const u = p.userId;
                    const pc = PLANS[u?.plan]?.color || '#f97316';
                    return (
                      <div key={p._id} className="flex items-center gap-3.5 p-4 bg-[#151522]/80 border border-white/[0.07] hover:border-white/[0.15] rounded-2xl transition-all shadow-sm group">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 border shadow overflow-hidden group-hover:scale-105 transition-transform"
                          style={{ background: `${pc}33`, borderColor: `${pc}88` }}>
                          {u?.selfieUrl || u?.avatarUrl ? (
                            <img src={resolveImgUrl(u?.selfieUrl || u?.avatarUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{(u?.fname?.[0]||'') + (u?.lname?.[0]||'')}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-extrabold text-white truncate group-hover:text-orange-400 transition-colors">{u?.fname} {u?.lname}</div>
                          <div className="text-xs text-orange-400 font-bold mt-0.5 truncate tracking-wide uppercase">{p.panelRole}</div>
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
        <UpiModal open={!!upi} link={upi.link} amount={upi.amount} month={upi.forMonth?.startsWith('DONATION') ? 'Voluntary Club Donation' : fmtMonth(month)}
          memberName={upi.memberName} onClose={() => setUpi(null)} onMarkPaid={async () => {
            const fd = new FormData();
            fd.append('forMonth', upi.forMonth || month);
            if (upi.amount) fd.append('amount', upi.amount);
            await api.submitPayment(fd);
            setUpi(null);
            window.location.reload();
          }} />
      )}
    </AppLayout>
  );
}
