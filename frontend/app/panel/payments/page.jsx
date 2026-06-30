'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, Btn, Loading, Empty, toast, Badge } from '@/components/ui';
import { api, PLANS, fmtTime, currentMonth, resolveImgUrl } from '@/lib/api';

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
      toast(`${name}'s payment confirmed & Telegram receipt dispatched! ✓`);
      load();
    } catch (err) { toast(err.message,'error'); } finally { setConfirm(c=>({...c,[id]:false})); }
  };

  const sendReminders = async () => {
    setSending(true);
    try {
      const r = await api.sendReminders(month);
      toast(`Reminders blasted to ${r.data.sent} athletes via Email & Telegram! ✓`);
    } catch (err) { toast(err.message,'error'); } finally { setSending(false); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Financial Audit Desk
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">✅ Verify Athlete Dues & Receipts</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">Verify pending UTR submissions and trigger instant digital payment receipts.</p>
        </div>
        <button onClick={sendReminders} disabled={sending}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-40">
          <span>{sending ? 'Blasting Reminders…' : '🔔 Blast Dues Reminders (Email + Telegram)'}</span>
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label:'Total Athletes',   val:summary.total,        color:'#ffffff', icon:'👥' },
            { label:'Verified Paid',    val:summary.confirmed,    color:'#10b981', icon:'✅' },
            { label:'Pending Verification', val:summary.pending,  color:'#f59e0b', icon:'⏳' },
            { label:'Unpaid / Overdue', val:summary.notSubmitted, color:'#ef4444', icon:'🔴' },
          ].map(s => (
            <div key={s.label} className="bg-[#13131a] border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">{s.label}</div>
                <div className="text-3xl font-black font-mono" style={{color:s.color}}>{s.val}</div>
              </div>
              <div className="text-3xl p-3 rounded-2xl bg-zinc-900 border border-zinc-800/80">{s.icon}</div>
            </div>
          ))}
        </div>
      )}

      <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
          <span className="font-extrabold text-base text-white">Pending UTR Verifications ({pending.length})</span>
        </CardHeader>
        <div className="divide-y divide-zinc-800/80">
          {pending.length === 0
            ? <div className="p-12"><Empty icon="✅" title="All Caught Up!" sub="No pending payments currently waiting for verification" /></div>
            : pending.map(p => {
                const u = p.userId;
                const pl = PLANS[u?.plan] || PLANS.SILVER;
                return (
                  <div key={p._id} className="p-6 hover:bg-zinc-900/40 transition-colors">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center text-sm font-bold text-white flex-shrink-0 border bg-zinc-800 shadow"
                          style={{ borderColor: pl.color || '#f97316' }}>
                          {u?.selfieUrl || u?.avatarUrl ? (
                            <img src={resolveImgUrl(u?.selfieUrl || u?.avatarUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{(u?.fname?.[0]||'')+(u?.lname?.[0]||'')}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-base text-white truncate">{u?.fname} {u?.lname}</div>
                          <div className="text-xs text-zinc-300 font-medium mt-0.5">
                            Amount: <strong className="text-orange-400">₹{p.amount}</strong> · Month: <strong className="text-white">{p.forMonth}</strong>
                          </div>
                          {p.upiRef && (
                            <div className="text-xs text-emerald-400 font-mono font-bold mt-1 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 inline-block">
                              UTR: {p.upiRef}
                            </div>
                          )}
                          <div className="text-[10px] text-zinc-500 mt-1">Submitted {fmtTime(p.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {p.screenshotUrl && (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1','')}${p.screenshotUrl}`}
                            target="_blank" rel="noreferrer"
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold border border-zinc-700 transition-all flex items-center gap-1.5">
                            <span>📎</span> View Receipt
                          </a>
                        )}
                        <button onClick={() => confirm(p._id, `${u?.fname} ${u?.lname}`)} disabled={confirming[p._id]}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all disabled:opacity-40 flex items-center gap-1.5">
                          <span>{confirming[p._id] ? 'Verifying…' : '✓ Confirm & Send Receipt'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </Card>
    </AppLayout>
  );
}
