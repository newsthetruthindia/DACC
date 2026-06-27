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
      toast(err.message || 'Error adding transaction');
    }
  };

  const deleteTx = async (id, title) => {
    if (!confirm(`Permanently delete transaction "${title}"?`)) return;
    try {
      await api.deleteFundTx(id);
      toast('Transaction deleted');
      load();
    } catch (err) {
      toast(err.message || 'Error deleting');
    }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;
  const sum = data?.summary || { totalCollected: 0, expensesTotal: 0, balance: 0 };
  const txs = data?.transactions || [];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">📊 Club Funds & Expenses</h1>
          <p className="text-sm text-[#9a9890] mt-1">Transparent public ledger open to all Agnichakra Club members</p>
        </div>
        {canManage && (
          <Btn variant="primary" onClick={() => setModal(true)}>➕ Log Expense / Income</Btn>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-[#e2e0d8] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9a9890] mb-1">Total Fund Collected</div>
          <div className="text-2xl font-black text-green-700">₹{sum.totalCollected.toLocaleString()}</div>
          <div className="text-[11px] text-[#9a9890] mt-1">Member dues + Donations</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#e2e0d8] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#9a9890] mb-1">Total Expenses</div>
          <div className="text-2xl font-black text-red-600">₹{sum.expensesTotal.toLocaleString()}</div>
          <div className="text-[11px] text-[#9a9890] mt-1">Events, maintenance & operations</div>
        </div>
        <div className="bg-[#1a1916] p-5 rounded-2xl text-white shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-1">Available Fund Balance</div>
          <div className="text-2xl font-black text-[#fef3cd]">₹{sum.balance.toLocaleString()}</div>
          <div className="text-[11px] text-white/50 mt-1">Net cash reserve in club account</div>
        </div>
      </div>

      <Card className="overflow-auto">
        <CardHeader title="Transaction History Ledger" />
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f5f4f0]">
              {['Date','Type','Title & Description','Category','Amount','Logged By', isSuperAdmin ? 'Action' : ''].filter(Boolean).map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#9a9890] border-b border-[#e2e0d8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {txs.length === 0
              ? <tr><td colSpan={7}><Empty icon="📑" title="No ledger entries found" /></td></tr>
              : txs.map(t => {
                  const isInc = t.type === 'INCOME';
                  return (
                    <tr key={t._id} className="border-b border-[#e2e0d8] last:border-0 hover:bg-[#fafaf7]">
                      <td className="px-4 py-3 text-xs text-[#9a9890]">
                        {new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isInc ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1a1916]">{t.title}</td>
                      <td className="px-4 py-3 text-xs text-[#9a9890]"><Badge label={t.category} /></td>
                      <td className={`px-4 py-3 font-bold ${isInc ? 'text-green-700' : 'text-red-600'}`}>
                        {isInc ? '+' : '-'}₹{t.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9a9890]">
                        {t.addedBy ? `${t.addedBy.fname} ${t.addedBy.lname}` : 'System'}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3">
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
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <h2 className="text-lg font-bold text-[#1a1916] mb-4">➕ Log Club Transaction</h2>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Transaction Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white font-bold">
                  <option value="EXPENSE">🔴 Expense (Money Out)</option>
                  <option value="INCOME">🟢 Extra Income / Donation (Money In)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Title / Description</label>
                <input required placeholder="e.g. Annual Sports Trophy Purchase" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Category</label>
                  <input placeholder="e.g. Events, Charity" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Amount (₹)</label>
                  <input required type="number" placeholder="5000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a] font-bold" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
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
