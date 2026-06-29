'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Loading, Empty, UpiModal, toast, Badge } from '@/components/ui';
import { api, PLANS, fmtMonth, fmtTime, currentMonth } from '@/lib/api';

export default function SubscriptionPage() {
  const [user, setUser]     = useState(null);
  const [pays, setPays]     = useState([]);
  const [upi, setUpi]       = useState(null);
  const [utrInput, setUtr]  = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSub]  = useState({});

  const month = currentMonth();

  const load = () => api.myProfile().then(r => {
    setUser(r.data);
    setPays(r.data.payments || []);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openPay = async (m) => {
    const r = await api.upiLink(m);
    setUpi({ ...r.data, month: m, memberName: `${user.fname} ${user.lname}` });
  };

  const submitUtr = async (m) => {
    const utr = utrInput[m];
    if (!utr) { toast('Enter 12-digit UTR reference number', 'error'); return; }
    setSub(s => ({...s, [m]:true}));
    try {
      const fd = new FormData();
      fd.append('forMonth', m);
      fd.append('upiRef', utr);
      await api.submitPayment(fd);
      toast('Payment submitted! Committee will confirm soon ✓');
      load();
    } catch (err) { toast(err.message, 'error'); } finally { setSub(s => ({...s,[m]:false})); }
  };

  if (loading || !user) return <AppLayout><Loading /></AppLayout>;

  const plan = PLANS[user.plan] || PLANS.SILVER;

  // Last 6 months
  const months = Array.from({length:6}, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth()-i);
    return d.toISOString().slice(0,7);
  });

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Season Membership Ledger
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">💳 My Subscription & Dues</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">Manage your active sports division, track monthly dues, and submit instant UPI payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Plan card */}
        <div className="lg:col-span-5">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl h-full">
            <CardBody className="p-8">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2 shadow-lg bg-zinc-800"
                  style={{ borderColor: plan.color || '#f97316' }}>🏆</div>
                <div>
                  <div className="text-2xl font-black text-white">{plan.label} Division</div>
                  <div className="text-sm font-bold text-orange-400">₹{plan.price}/month · Active Contribution</div>
                </div>
              </div>
              <div className="h-px bg-zinc-800 my-6" />
              <div className="space-y-3">
                {[
                  ['Account Status',     <Badge label={user.status} />],
                  ['Registered On',      new Date(user.joinedAt || Date.now()).toLocaleDateString('en-IN',{month:'long',year:'numeric'})],
                  ['Confirmed Receipts', `${pays.filter(p=>p.status==='CONFIRMED').length} Months Paid`],
                ].map(([k,v], idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1.5 border-b border-zinc-800/50 last:border-0">
                    <span className="text-zinc-400 font-medium">{k}</span>
                    <span className="font-extrabold text-white">{v}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* How to pay */}
        <div className="lg:col-span-7">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl h-full">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">⚡ Quick UPI Payment Guide</span>
            </CardHeader>
            <CardBody className="space-y-4 p-8 text-sm text-zinc-300 font-medium">
              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-sm flex items-center justify-center font-black flex-shrink-0">1</span>
                <span>Click <strong className="text-white font-bold">Pay via UPI</strong> next to any unpaid month to trigger GPay, PhonePe, or Paytm.</span>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-sm flex items-center justify-center font-black flex-shrink-0">2</span>
                <span>Complete the transaction securely on your mobile payment app.</span>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-sm flex items-center justify-center font-black flex-shrink-0">3</span>
                <span>Copy the <strong className="text-white font-bold">12-digit UTR / Reference Number</strong> from your UPI app receipt.</span>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-sm flex items-center justify-center font-black flex-shrink-0">4</span>
                <span>Paste the UTR number in the input box below and hit <strong className="text-emerald-400 font-bold">Submit</strong> for instant committee verification!</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Payment history by month */}
      <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
          <span className="font-extrabold text-base text-white">🗓️ Monthly Contribution Record (Last 6 Months)</span>
        </CardHeader>
        <div className="divide-y divide-zinc-800/80">
          {months.map(m => {
            const pay = pays.find(p => p.forMonth === m);
            const status = pay?.status;
            return (
              <div key={m} className="p-6 hover:bg-zinc-900/40 transition-colors">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-extrabold text-lg text-white">{fmtMonth(m)}</div>
                    <div className="text-xs text-orange-400 font-bold mt-0.5">Contribution: ₹{plan.price}</div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    {status === 'CONFIRMED' && (
                      <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                        <span>✓</span> CONFIRMED RECEIPT {pay.upiRef ? `· UTR: ${pay.upiRef}` : ''}
                      </span>
                    )}
                    {status === 'PENDING' && (
                      <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
                        <span>⏳</span> SUBMITTED — Verification Pending
                      </span>
                    )}
                    {(!status || status === 'FAILED') && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={() => openPay(m)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5">
                          <span>💳</span> Pay via UPI
                        </button>
                        <div className="flex items-center gap-2">
                          <input value={utrInput[m]||''} onChange={e=>setUtr(u=>({...u,[m]:e.target.value}))}
                            placeholder="Enter 12-digit UTR" className="w-40 px-3 py-2 border border-zinc-700 rounded-xl text-xs bg-[#1a1a24] text-white font-mono outline-none focus:border-orange-500 shadow-inner" />
                          <button onClick={() => submitUtr(m)} disabled={submitting[m]}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-50">
                            Submit UTR
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {upi && (
        <UpiModal open={!!upi} link={upi.link} amount={upi.amount} month={fmtMonth(upi.month)}
          memberName={upi.memberName} onClose={() => setUpi(null)}
          onMarkPaid={() => { setUpi(null); toast('Now enter your UTR reference number and click Submit UTR'); }} />
      )}
    </AppLayout>
  );
}
