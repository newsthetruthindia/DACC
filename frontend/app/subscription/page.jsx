'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Badge, Loading, Empty, UpiModal, toast } from '@/components/ui';
import { api, getUser, PLANS, fmtTime, currentMonth } from '@/lib/api';

export default function MySubscriptionPage() {
  const [user, setUser]         = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [upiModal, setUpiModal] = useState(null);
  const [donAmt, setDonAmt]     = useState('501');
  
  // Track UTR inputs per month string
  const [utrs, setUtrs]         = useState({});
  const [submitting, setSubmitting] = useState({});

  const curMonth = currentMonth();

  const load = () => {
    api.myProfile().then(r => {
      if (r.data) {
        setUser(r.data);
        setPayments(r.data.payments || []);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUtrSubmit = async (forMonth) => {
    const utrVal = utrs[forMonth]?.trim();
    if (!utrVal || utrVal.length < 4) {
      toast('Please enter a valid 12-digit UTR or Bank Reference ID', 'error');
      return;
    }
    setSubmitting(s => ({ ...s, [forMonth]: true }));
    try {
      const fd = new FormData();
      fd.append('forMonth', forMonth);
      fd.append('upiRef', utrVal);
      await api.submitPayment(fd);
      toast(`UTR verified & logged for ${forMonth}! ✓`);
      setUtrs(u => ({ ...u, [forMonth]: '' }));
      load();
    } catch (err) {
      toast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(s => ({ ...s, [forMonth]: false }));
    }
  };

  if (loading || !user) return <AppLayout><Loading /></AppLayout>;
  const pl = PLANS[user.plan] || PLANS.REGULAR;

  // Generate list of recent months (e.g., current month and past 3 months)
  const monthsList = [curMonth];
  const date = new Date();
  for (let i = 1; i <= 3; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const mStr = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    if (!monthsList.includes(mStr)) monthsList.push(mStr);
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-5 sm:p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Financial Ledger Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">💳 My Subscription & Dues</h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-medium">Standard ₹1100/mo club dues & one-time voluntary donation portal.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#13131a] p-3.5 sm:p-4 rounded-2xl border border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Club Division</div>
            <div className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>Standard Member</span>
              <span className="text-xs text-orange-400 font-mono">(₹1100/mo)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Action Box */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-[#13131a] border border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">🗓️ Active Season Dues Ledger (₹1100/mo)</span>
            </CardHeader>
            <div className="divide-y divide-zinc-800/80">
              {monthsList.map(mStr => {
                const pay = payments.find(p => p.forMonth === mStr);
                const status = pay?.status || 'DUE'; // 'CONFIRMED', 'PENDING', 'DUE'
                const isCur = mStr === curMonth;

                return (
                  <div key={mStr} className={`p-5 transition-colors ${isCur ? 'bg-orange-500/[0.04]' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-black text-lg text-white">{mStr}</span>
                          {isCur && <span className="px-2 py-0.5 text-[10px] font-black bg-orange-500 text-white rounded-full uppercase">Current Month</span>}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          Fixed Membership Contribution: <strong className="text-white">₹1100</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge label={status === 'CONFIRMED' ? 'PAID' : status} />
                        {status !== 'CONFIRMED' && (
                          <Btn
                            size="sm"
                            variant={status === 'PENDING' ? 'secondary' : 'primary'}
                            onClick={async () => {
                              const r = await api.upiLink(mStr);
                              setUpiModal({ link: r.data.link, amount: r.data.amount || 1100, month: mStr, memberName: `${user.fname} ${user.lname}` });
                            }}>
                            {status === 'PENDING' ? 'Re-Pay / View QR' : 'Pay ₹1100 via UPI →'}
                          </Btn>
                        )}
                      </div>
                    </div>

                    {/* UTR Input Section */}
                    {status !== 'CONFIRMED' && (
                      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-xl">
                        <span className="text-xs text-zinc-400 font-medium">Already paid? Log UTR Reference:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Enter 12-digit UTR Ref"
                            maxLength={12}
                            value={utrs[mStr] || ''}
                            onChange={e => setUtrs(u => ({ ...u, [mStr]: e.target.value }))}
                            className="px-3 py-1.5 bg-[#14141c] border border-zinc-700 rounded-lg text-xs text-white outline-none focus:border-orange-500 font-mono tracking-wider w-44 placeholder:tracking-normal placeholder:font-sans"
                          />
                          <button
                            onClick={() => handleUtrSubmit(mStr)}
                            disabled={submitting[mStr] || !utrs[mStr]}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-lg border border-zinc-600 transition-all disabled:opacity-40 whitespace-nowrap">
                            {submitting[mStr] ? 'Logging…' : 'Submit UTR ↵'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Voluntary Donation & Payment History Roster */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-gradient-to-br from-orange-500/[0.08] to-transparent border-orange-500/30 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-orange-500/20 bg-orange-500/10">
              <span className="font-extrabold text-base text-white flex items-center gap-2">
                <span>🙏</span> Make a One-Time Club Donation
              </span>
            </CardHeader>
            <div className="p-5 space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Want to contribute extra towards club events, social welfare, or sports infrastructure? Support the club with any one-time amount of your choice.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold text-sm">₹</span>
                  <input type="number" value={donAmt} onChange={(e) => setDonAmt(e.target.value)} placeholder="501"
                    className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/15 focus:border-orange-500 rounded-xl text-sm font-bold text-white outline-none" />
                </div>
                <Btn variant="primary" size="sm" className="font-black px-5 shadow-orange-500/30" onClick={async () => {
                  const amt = Number(donAmt) > 0 ? Number(donAmt) : 501;
                  const donMonth = `DONATION-${Date.now().toString().slice(-6)}`;
                  const r = await api.upiLink(donMonth, amt, `One-Time Donation by ${user.fname}`);
                  setUpiModal({ link: r.data.link, amount: amt, month: 'Voluntary Club Donation', memberName: `${user.fname} ${user.lname}`, forMonth: donMonth });
                }}>Contribute Now →</Btn>
              </div>
            </div>
          </Card>
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">📜 Past Transaction History</span>
            </CardHeader>
            <div className="divide-y divide-zinc-800/80 max-h-[500px] overflow-y-auto">
              {payments.length === 0
                ? <div className="p-12"><Empty icon="📜" title="No payment records found" sub="Paid season dues will appear here" /></div>
                : payments.map((p, i) => (
                  <div key={p._id || i} className="p-4 sm:p-5 hover:bg-zinc-900/40 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm sm:text-base text-white">{p.forMonth?.startsWith('DONATION') ? 'Voluntary Club Donation' : `${p.forMonth} Contribution`}</span>
                      <Badge label={p.status === 'CONFIRMED' ? 'PAID' : p.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mt-1">
                      <span>Amount: <strong className="text-orange-400">₹{p.amount}</strong></span>
                      <span>{fmtTime(p.createdAt)}</span>
                    </div>
                    {p.upiRef && (
                      <div className="text-[11px] text-zinc-500 font-mono mt-2 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800 inline-block">
                        UTR / Ref: <span className="text-zinc-300 font-bold">{p.upiRef}</span>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </Card>
        </div>
      </div>

      {upiModal && (
        <UpiModal open={!!upiModal} link={upiModal.link} amount={upiModal.amount} month={upiModal.month}
          memberName={upiModal.memberName} onClose={() => setUpiModal(null)} onMarkPaid={async () => {
            const fd = new FormData();
            fd.append('forMonth', upiModal.forMonth || upiModal.month);
            if (upiModal.amount) fd.append('amount', upiModal.amount);
            await api.submitPayment(fd);
            setUpiModal(null);
            toast('Payment logged & dispatched! Committee verification pending.');
            load();
          }} />
      )}
    </AppLayout>
  );
}
