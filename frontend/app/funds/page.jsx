'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Badge, Loading, Empty, toast } from '@/components/ui';
import { api, getUser } from '@/lib/api';

export default function ClubFundsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModal] = useState(false);
  const [form, setForm]       = useState({ title: '', type: 'EXPENSE', category: 'General', amount: '' });

  const user = getUser();
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'PANEL';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const load = () => {
    api.getFunds().then(r => {
      if (r.data) setData(r.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createFundTx(form);
      toast('Transaction logged successfully ⚡');
      setModal(false);
      setForm({ title: '', type: 'EXPENSE', category: 'General', amount: '' });
      load();
    } catch (err) {
      toast(err.message || 'Error adding transaction', 'error');
    }
  };

  const deleteTx = async (id, title) => {
    if (!confirm(`Permanently delete transaction "${title}"?`)) return;
    try {
      await api.deleteFundTx(id);
      toast('Transaction deleted');
      load();
    } catch (err) {
      toast(err.message || 'Error deleting', 'error');
    }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;
  const sum = data?.summary || { totalCollected: 0, expensesTotal: 0, balance: 0 };
  const txs = data?.transactions || [];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#ff5500] font-sports font-extrabold text-xs uppercase tracking-widest mb-1">
            ⚡ CLUB FINANCIAL LEDGER
          </div>
          <h1 className="text-3xl font-black font-sports text-white tracking-tight">📊 ARENA FUNDS & EXPENSES</h1>
          <p className="text-sm text-zinc-400 mt-1">Transparent public balance sheet open to all Agnichakra athletes</p>
        </div>
        {canManage && (
          <Btn variant="primary" onClick={() => setModal(true)}>➕ Log Expense / Income</Btn>
        )}
      </div>

      {/* Summary Scoreboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="text-xs font-sports font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
            <span>Total Fund Collected</span>
            <span className="text-emerald-400 font-extrabold text-base">🟢</span>
          </div>
          <div className="text-3xl font-black font-sports text-emerald-400 tracking-tight mt-2">₹{sum.totalCollected.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5 font-medium">⚡ Member contributions & sponsorships</div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="text-xs font-sports font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
            <span>Total Arena Expenses</span>
            <span className="text-red-400 font-extrabold text-base">🔴</span>
          </div>
          <div className="text-3xl font-black font-sports text-red-400 tracking-tight mt-2">₹{sum.expensesTotal.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1.5 font-medium">⚡ Events, gear & club operations</div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-orange-500/30 shadow-[0_0_30px_rgba(255,85,0,0.1)]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="text-xs font-sports font-bold uppercase tracking-wider text-orange-400 mb-1 flex items-center justify-between">
            <span>Available Club Reserve</span>
            <span className="text-amber-400 font-extrabold text-base">🏆</span>
          </div>
          <div className="text-3xl font-black font-sports text-amber-300 tracking-tight mt-2 text-scoreboard">₹{sum.balance.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5 font-semibold">⚡ Net active liquidity reserve</div>
        </div>
      </div>

      <Card className="overflow-hidden border-white/10 shadow-2xl">
        <CardHeader title="⚡ TRANSACTION HISTORY LEDGER" className="bg-white/[0.02] font-sports font-extrabold tracking-wider text-sm text-zinc-200" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#121218] text-zinc-400 font-sports font-bold text-[11px] uppercase tracking-widest border-b border-white/10">
                {['Date','Type','Title & Description','Category','Amount','Logged By', isSuperAdmin ? 'Action' : ''].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {txs.length === 0
                ? <tr><td colSpan={7}><Empty icon="🏆" title="No ledger entries recorded yet" /></td></tr>
                : txs.map(t => {
                    const isInc = t.type === 'INCOME';
                    return (
                      <tr key={t._id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-4 text-xs font-sports font-semibold text-zinc-400">
                          {new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold font-sports tracking-wider uppercase border ${
                            isInc ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'bg-red-950/80 text-red-400 border-red-500/30'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-white tracking-wide">{t.title}</td>
                        <td className="px-5 py-4 text-xs"><Badge label={t.category} /></td>
                        <td className={`px-5 py-4 font-black font-sports text-base tracking-wide ${isInc ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isInc ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-zinc-400">
                          {t.addedBy ? `${t.addedBy.fname} ${t.addedBy.lname}` : 'System Auto'}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-5 py-4">
                            {!t._id.toString().startsWith('due_') && (
                              <Btn size="sm" variant="red" onClick={() => deleteTx(t._id, t.title)}>🗑️</Btn>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#14141c] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2 text-[#ff5500] font-sports font-extrabold text-xs uppercase tracking-widest mb-1">
              ⚡ NEW FINANCIAL ENTRY
            </div>
            <h2 className="text-xl font-extrabold font-sports text-white mb-5">➕ LOG CLUB TRANSACTION</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Transaction Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3.5 py-3 border border-white/15 rounded-xl text-sm bg-[#1a1a24] text-white font-bold outline-none focus:border-[#ff5500]">
                  <option value="EXPENSE">🔴 Expense (Money Out)</option>
                  <option value="INCOME">🟢 Extra Income / Sponsorship (Money In)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Title / Description</label>
                <input required placeholder="e.g. Annual Tournament Trophy Purchase" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3.5 py-3 border border-white/15 rounded-xl text-sm bg-[#1a1a24] text-white outline-none focus:border-[#ff5500] placeholder:text-zinc-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Category</label>
                  <input placeholder="e.g. Sports Gear, Events" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3.5 py-3 border border-white/15 rounded-xl text-sm bg-[#1a1a24] text-white outline-none focus:border-[#ff5500] placeholder:text-zinc-600" />
                </div>
                <div>
                  <label className="block text-[11px] font-sports font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Amount (₹)</label>
                  <input required type="number" placeholder="5000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3.5 py-3 border border-white/15 rounded-xl text-sm bg-[#1a1a24] text-white outline-none focus:border-[#ff5500] font-bold font-sports placeholder:text-zinc-600" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
                <Btn variant="primary" type="submit">⚡ Save Entry →</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
