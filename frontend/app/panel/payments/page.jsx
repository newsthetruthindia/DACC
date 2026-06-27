'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, Btn, Loading, Empty, toast } from '@/components/ui';
import { api, PLANS, fmtTime, currentMonth } from '@/lib/api';

export default function PanelPaymentsPage() {
  const [pending, setPending]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [confirming, setConfirm] = useState({});
  const [sending, setSending]   = useState(false);
  const month = currentMonth();

  const load = () => Promise.all([
    api.pendingPayments(),
    api.duesSummary(month),
  ]).then(([p, s]) => {
    setPending(p.data||[]);
    setSummary(s.data);
  }).finally(()=>setLoading(false));

  useEffect(() => { load(); }, []);

  const confirm = async (id, name) => {
    setConfirm(c=>({...c,[id]:true}));
    try {
      await api.confirmPayment(id);
      toast(`${name} payment confirmed ✓`);
      load();
    } catch (err) { toast(err.message,'error'); } finally { setConfirm(c=>({...c,[id]:false})); }
  };

  const sendReminders = async () => {
    setSending(true);
    try {
      const r = await api.sendReminders(month);
      toast(`Reminders sent to ${r.data.sent} members ✓`);
    } catch (err) { toast(err.message,'error'); } finally { setSending(false); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Payments</h1>
          <p className="text-sm text-[#9a9890] mt-1">Confirm member payments and send reminders</p>
        </div>
        <Btn onClick={sendReminders} disabled={sending} variant="ghost">
          {sending ? 'Sending…' : '📨 Send Email Reminders'}
        </Btn>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label:'Total Members', val:summary.total, color:'#1a1916' },
            { label:'Confirmed',     val:summary.confirmed, color:'#1a6b3c' },
            { label:'Submitted',     val:summary.pending,   color:'#b8860b' },
            { label:'Not Paid',      val:summary.notSubmitted, color:'#c8410a' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#e2e0d8] rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1">{s.label}</div>
              <div className="text-3xl font-extrabold font-mono" style={{color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <span className="font-bold text-sm text-[#1a1916]">Pending Confirmations ({pending.length})</span>
        </CardHeader>
        {pending.length === 0
          ? <Empty icon="✅" title="All caught up!" sub="No payments waiting for confirmation" />
          : pending.map(p => {
              const u = p.userId;
              const pl = PLANS[u?.plan] || PLANS.SILVER;
              return (
                <div key={p._id} className="px-5 py-4 border-b border-[#e2e0d8] last:border-0">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background:pl.bg, color:pl.color }}>
                      {(u?.fname?.[0]||'')+(u?.lname?.[0]||'')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#1a1916]">{u?.fname} {u?.lname}</div>
                      <div className="text-xs text-[#9a9890]">
                        {pl.label} · ₹{p.amount} · {p.forMonth}
                        {p.upiRef && <> · UTR: <span className="font-mono font-semibold text-[#1a1916]">{p.upiRef}</span></>}
                      </div>
                      <div className="text-[10px] text-[#9a9890] mt-0.5">Submitted {fmtTime(p.createdAt)}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {p.screenshotUrl && (
                        <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1','')}${p.screenshotUrl}`}
                          target="_blank" rel="noreferrer">
                          <Btn size="sm" variant="ghost">📎 Screenshot</Btn>
                        </a>
                      )}
                      <Btn size="sm" variant="green" onClick={() => confirm(p._id, u?.fname)} disabled={confirming[p._id]}>
                        {confirming[p._id] ? '…' : '✓ Confirm'}
                      </Btn>
                    </div>
                  </div>
                </div>
              );
            })
        }
      </Card>
    </AppLayout>
  );
}
