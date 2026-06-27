'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Loading, Empty, UpiModal, toast } from '@/components/ui';
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
    if (!utr) { toast('Enter UTR number', 'error'); return; }
    setSub(s => ({...s, [m]:true}));
    try {
      const fd = new FormData();
      fd.append('forMonth', m);
      fd.append('upiRef', utr);
      await api.submitPayment(fd);
      toast('Payment submitted! Panel will confirm soon ✓');
      load();
    } catch (err) { toast(err.message, 'error'); } finally { setSub(s => ({...s,[m]:false})); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;
  if (!user)   return <AppLayout><Loading /></AppLayout>;

  const plan = PLANS[user.plan] || PLANS.SILVER;

  // Last 6 months
  const months = Array.from({length:6}, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth()-i);
    return d.toISOString().slice(0,7);
  });

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">My Subscription</h1>
        <p className="text-sm text-[#9a9890] mt-1">Track dues, payments, and manage your plan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Plan card */}
        <Card>
          <CardBody>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: plan.bg }}>💎</div>
              <div>
                <div className="text-xl font-extrabold text-[#1a1916]">{plan.label} Plan</div>
                <div className="text-sm text-[#9a9890]">₹{plan.price}/month · Active</div>
              </div>
            </div>
            <div className="h-px bg-[#e2e0d8] mb-4" />
            <div className="space-y-2">
              {[
                ['Status',       user.status],
                ['Member since', new Date(user.joinedAt).toLocaleDateString('en-IN',{month:'long',year:'numeric'})],
                ['Payments confirmed', pays.filter(p=>p.status==='CONFIRMED').length],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-[#9a9890]">{k}</span>
                  <span className="font-semibold text-[#1a1916]">{v}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* How to pay */}
        <Card>
          <CardHeader><span className="font-bold text-sm text-[#1a1916]">📋 How to Pay</span></CardHeader>
          <CardBody className="space-y-3 text-sm text-[#4a4840]">
            <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#1a1916] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span><span>Click <strong>Pay via UPI</strong> below to open your UPI app</span></div>
            <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#1a1916] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span><span>Complete payment on GPay / PhonePe / Paytm</span></div>
            <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#1a1916] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</span><span>Copy the UTR number from your UPI app</span></div>
            <div className="flex gap-3"><span className="w-6 h-6 rounded-full bg-[#1a1916] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">4</span><span>Enter UTR number below and submit — panel confirms within 24 hrs</span></div>
          </CardBody>
        </Card>
      </div>

      {/* Payment history by month */}
      <Card>
        <CardHeader><span className="font-bold text-sm text-[#1a1916]">Payment History (Last 6 Months)</span></CardHeader>
        <div>
          {months.map(m => {
            const pay = pays.find(p => p.forMonth === m);
            const status = pay?.status;
            return (
              <div key={m} className="px-5 py-4 border-b border-[#e2e0d8] last:border-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-semibold text-sm text-[#1a1916]">{fmtMonth(m)}</div>
                    <div className="text-xs text-[#9a9890]">₹{plan.price}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {status === 'CONFIRMED' && (
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">✓ CONFIRMED{pay.upiRef ? ` · UTR: ${pay.upiRef}` : ''}</span>
                    )}
                    {status === 'PENDING' && (
                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">⏳ SUBMITTED — awaiting confirmation</span>
                    )}
                    {(!status || status === 'FAILED') && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Btn size="sm" onClick={() => openPay(m)}>💳 Pay via UPI</Btn>
                        <div className="flex items-center gap-1.5">
                          <input value={utrInput[m]||''} onChange={e=>setUtr(u=>({...u,[m]:e.target.value}))}
                            placeholder="UTR number" className="w-36 px-2.5 py-1.5 border border-[#e2e0d8] rounded-lg text-xs outline-none focus:border-[#c8410a]" />
                          <Btn size="sm" variant="green" onClick={() => submitUtr(m)} disabled={submitting[m]}>Submit</Btn>
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
          onMarkPaid={() => { setUpi(null); toast('Now enter your UTR number and submit'); }} />
      )}
    </AppLayout>
  );
}
