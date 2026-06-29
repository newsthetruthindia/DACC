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
  const pl = PLANS[user.plan] || PLANS.SILVER;

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
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 font-medium">Verify your season contributions, submit Bank UTR numbers, and download receipts.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#13131a] p-3.5 sm:p-4 rounded-2xl border border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Current Tier</div>
            <div className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>{pl.label} Plan</span>
              <span className="text-xs text-orange-400 font-mono">(₹{pl.price}/mo)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Action Box */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">🗓️ Active Season Dues Ledger</span>
            </CardHeader>
            <div className="divide-y divide-zinc-800/80">
              {monthsList.map(mStr => {
                const pay = payments.find(p => p.forMonth === mStr);
                const status = pay?.status || 'DUE'; // 'CONFIRMED', 'PENDING', 'DUE'
                const isCur = mStr === curMonth;

                return (
                  <div key={mStr} className={`p-4 sm:p-6 transition-colors ${isCur ? 'bg-orange-500/5' : 'hover:bg-zinc-900/30'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-white">{mStr} Contribution</span>
                          {isCur && <span className="text-[10px] bg-orange-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>}
                          <Badge label={status === 'CONFIRMED' ? 'PAID' : status} />
                        </div>
                        <div className="text-xs text-zinc-400 font-medium mt-1">
                          Amount: <strong className="text-white">₹{pl.price}</strong> · Destination: <span className="font-mono text-zinc-300">Agnichakra Club Account</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        {status === 'CONFIRMED' ? (
                          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
                            <span>✓ Receipt Verified</span>
                          </div>
                        ) : status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold">
                            <span>⏳ Committee Verifying</span>
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              const r = await api.upiLink(mStr);
                              setUpiModal({ link: r.data.link, amount: r.data.amount, memberName: `${user.fname} ${user.lname}`, month: mStr });
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5">
                            <span>💳 Pay ₹{pl.price} UPI →</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* If Paid outside portal or UTR required */}
                    {status !== 'CONFIRMED' && (
                      <div className="mt-4 pt-4 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161620] p-3.5 rounded-xl border">
                        <div className="text-xs text-zinc-300 font-medium">
                          Already paid via app? Enter 12-digit Bank Reference / UTR number:
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          <input
                            value={utrs[mStr] || ''}
                            onChange={e => setUtrs({ ...utrs, [mStr]: e.target.value })}
                            placeholder="12-digit UTR ref"
                            maxLength={16}
                            className="w-full sm:w-40 px-3 py-2 bg-[#1a1a24] border border-zinc-700 rounded-lg text-xs text-white font-mono outline-none focus:border-orange-500"
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

        {/* Payment History Roster */}
        <div className="lg:col-span-5">
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
                      <span className="font-bold text-sm sm:text-base text-white">{p.forMonth} Contribution</span>
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
          memberName={upiModal.memberName} onClose={() => setUpiModal(null)} onMarkPaid={() => {
            setUpiModal(null);
            toast('Payment dispatched! Committee verification pending.');
            load();
          }} />
      )}
    </AppLayout>
  );
}
