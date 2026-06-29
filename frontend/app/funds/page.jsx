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
      toast('Transaction logged successfully ✓');
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
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">💰 Club Funds & Expenses</h1>
          <p className="text-sm text-zinc-400 mt-1">Transparent public financial ledger open to all members</p>
        </div>
        {canManage && (
          <Btn variant="primary" onClick={() => setModal(true)}>➕ Log Expense / Income</Btn>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-[#131318] p-6 rounded-2xl border border-zinc-800 shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
            <span>Total Fund Collected</span>
            <span className="text-emerald-400">📈</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">₹{sum.totalCollected.toLocaleString()}</div>
          <div className="text-xs text-zinc-400 mt-2 font-medium">Member dues + Donations</div>
        </div>

        <div className="bg-[#131318] p-6 rounded-2xl border border-zinc-800 shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
            <span>Total Expenses</span>
            <span className="text-red-400">📉</span>
          </div>
          <div className="text-3xl font-extrabold text-red-400 mt-2">₹{sum.expensesTotal.toLocaleString()}</div>
          <div className="text-xs text-zinc-400 mt-2 font-medium">Events, maintenance & operations</div>
        </div>

        <div className="bg-[#131318] p-6 rounded-2xl border border-orange-500/30 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-1 flex items-center justify-between">
            <span>Available Balance</span>
            <span className="text-orange-400">🏦</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">₹{sum.balance.toLocaleString()}</div>
          <div className="text-xs text-zinc-400 mt-2 font-medium">Net cash reserve in club account</div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <span className="font-bold text-white text-base">📑 Transaction History Ledger</span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800">
                {['Date','Type','Title & Description','Category','Amount','Logged By', isSuperAdmin ? 'Action' : ''].filter(Boolean).map(h => (
                  <th key={h} className="text-left px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {txs.length === 0
                ? <tr><td colSpan={7}><Empty icon="📑" title="No transactions recorded yet" /></td></tr>
                : txs.map(t => {
                    const isInc = t.type === 'INCOME';
                    return (
                      <tr key={t._id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-6 py-4 text-xs font-medium text-zinc-400">
                          {new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isInc ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white text-base">{t.title}</td>
                        <td className="px-6 py-4 text-xs"><Badge label={t.category} /></td>
                        <td className={`px-6 py-4 font-extrabold text-base ${isInc ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isInc ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-400 font-medium">
                          {t.addedBy ? `${t.addedBy.fname} ${t.addedBy.lname}` : 'System Auto'}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-6 py-4">
                            {!t._id.toString().startsWith('due_') && (
                              <Btn size="sm" variant="red" onClick={() => deleteTx(t._id, t.title)}>🗑️ Delete</Btn>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#131318] border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-5">➕ Log Club Transaction</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Transaction Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold outline-none focus:border-orange-500">
                  <option value="EXPENSE">🔴 Expense (Money Out)</option>
                  <option value="INCOME">🟢 Extra Income / Donation (Money In)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Title / Description</label>
                <input required placeholder="e.g. Sports Trophy Purchase" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500 placeholder:text-zinc-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
                  <input placeholder="e.g. Events, Charity" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500 placeholder:text-zinc-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Amount (₹)</label>
                  <input required type="number" placeholder="5000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-bold outline-none focus:border-orange-500 placeholder:text-zinc-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
                <Btn variant="primary" type="submit">Save Entry →</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
