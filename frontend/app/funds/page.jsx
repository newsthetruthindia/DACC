'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Badge, Loading, Empty, toast } from '@/components/ui';
import { api, getUser, PLANS, currentMonth, resolveImgUrl } from '@/lib/api';

export default function ClubFundsPage() {
  const [data, setData]       = useState(null);
  const [roster, setRoster]   = useState([]);
  const [activeTab, setTab]   = useState('LEDGER'); // 'LEDGER' or 'ROSTER'
  const [loading, setLoading] = useState(true);
  
  // Modal for logging general income/expense
  const [modalOpen, setModal] = useState(false);
  const [form, setForm]       = useState({ title: '', type: 'EXPENSE', category: 'General', amount: '' });

  // Modal for Accountant recording offline dues
  const [offlineModal, setOfflineModal] = useState(null); // holds member object
  const [offlineAmount, setOfflineAmount] = useState(300);

  const user = getUser();
  const canManage = ['SUPER_ADMIN', 'PANEL', 'ACCOUNTANT'].includes(user?.role);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const month = currentMonth();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getFunds(),
      api.getFundsRoster(month)
    ]).then(([fRes, rRes]) => {
      if (fRes.data) setData(fRes.data);
      if (rRes.data) setRoster(rRes.data);
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

  const handleOfflinePaySubmit = async (e) => {
    e.preventDefault();
    if (!offlineModal) return;
    try {
      await api.logOfflinePay({
        userId: offlineModal._id,
        amount: Number(offlineAmount),
        month: month
      });
      toast(`Offline payment recorded for ${offlineModal.fname}!`);
      setOfflineModal(null);
      load();
    } catch (err) {
      toast(err.message || 'Error recording offline dues', 'error');
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
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">💰 Club Funds & Payment Roster</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">100% transparent financial ledger & member contribution tracking</p>
        </div>
        {canManage && (
          <div className="flex gap-3 w-full sm:w-auto">
            <Btn variant="primary" onClick={() => setModal(true)} className="w-full sm:w-auto">➕ Log Expense / Income</Btn>
          </div>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-8">
        <div className="bg-[#131318] p-5 sm:p-6 rounded-2xl border border-zinc-800 shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
            <span>Total Fund Collected</span>
            <span className="text-emerald-400 text-lg">📈</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2 truncate">₹{sum.totalCollected.toLocaleString()}</div>
          <div className="text-xs text-zinc-400 mt-2 font-medium">Member season dues + Offline receipts</div>
        </div>

        <div className="bg-[#131318] p-5 sm:p-6 rounded-2xl border border-zinc-800 shadow-md">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
            <span>Total Costs & Expenses</span>
            <span className="text-red-400 text-lg">📉</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-400 mt-2 truncate">₹{sum.expensesTotal.toLocaleString()}</div>
          <div className="text-xs text-zinc-400 mt-2 font-medium">Club equipment, events & operations</div>
        </div>

        <div className="bg-[#131318] p-5 sm:p-6 rounded-2xl border border-orange-500/30 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-1 flex items-center justify-between">
            <span>Net Available Balance</span>
            <span className="text-orange-400 text-lg">🏦</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2 truncate">₹{sum.balance.toLocaleString()}</div>
          <div className="text-xs text-zinc-400 mt-2 font-medium">Verified cash balance in club account</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-800 mb-6 gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap no-scrollbar">
        <button
          onClick={() => setTab('LEDGER')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'LEDGER' ? 'border-orange-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}>
          <span>📑</span> Transaction History Ledger
        </button>
        <button
          onClick={() => setTab('ROSTER')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'ROSTER' ? 'border-orange-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}>
          <span>👥</span> Who Paid / Who Due ({month})
          <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs font-mono">{roster.length}</span>
        </button>
      </div>

      {/* TAB 1: LEDGER */}
      {activeTab === 'LEDGER' && (
        <Card className="overflow-hidden animate-fade-in">
          <CardHeader>
            <span className="font-bold text-white text-base">All Club Receipts & Expenses Ledger</span>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800">
                  {['Date','Type','Title & Description','Category','Amount','Logged By', isSuperAdmin ? 'Action' : ''].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">{h}</th>
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
                          <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs font-medium text-zinc-400 whitespace-nowrap">
                            {new Date(t.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isInc ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 font-semibold text-white text-sm sm:text-base min-w-[180px]">{t.title}</td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs whitespace-nowrap"><Badge label={t.category} /></td>
                          <td className={`px-4 py-3 sm:px-6 sm:py-4 font-extrabold text-sm sm:text-base whitespace-nowrap ${isInc ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isInc ? '+' : '-'}₹{t.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm text-zinc-400 font-medium whitespace-nowrap">
                            {t.addedBy ? `${t.addedBy.fname} ${t.addedBy.lname} (${t.addedBy.role||'Accountant'})` : 'System Auto'}
                          </td>
                          {isSuperAdmin && (
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
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
      )}

      {/* TAB 2: MEMBER PAYMENT ROSTER */}
      {activeTab === 'ROSTER' && (
        <Card className="overflow-hidden animate-fade-in">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-1">
              <span className="font-bold text-white text-base">Club Athlete Payment Status Roster ({month})</span>
              <span className="text-xs text-zinc-400">Visible to all active members</span>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800">
                  {['Member Athlete','Unique ID','Division','Current Month Status', canManage ? 'Accountant Entry' : ''].filter(Boolean).map(h => (
                    <th key={h} className="text-left px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {roster.length === 0
                  ? <tr><td colSpan={5}><Empty icon="👥" title="No active members in roster" /></td></tr>
                  : roster.map(m => {
                      const pl = PLANS[m.plan] || PLANS.SILVER;
                      const isPaid = m.paidThisMonth;
                      return (
                        <tr key={m._id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0 border bg-zinc-800 relative shadow"
                                style={{ borderColor: pl.color }}>
                                {m.selfieUrl || m.avatarUrl ? (
                                  <img src={resolveImgUrl(m.selfieUrl || m.avatarUrl)} alt={m.fname} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{(m.fname?.[0]||'')+(m.lname?.[0]||'')}</span>
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm sm:text-base">{m.fname} {m.lname}</div>
                                <div className="text-xs text-zinc-500 font-medium">{m.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 font-mono font-bold text-xs text-orange-400 whitespace-nowrap">
                            {m.memberId || 'AGC-ID'}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap"><Badge label={m.plan} /></td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isPaid ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {isPaid ? '✅ PAID IN FULL' : '🔴 DUES PENDING'}
                            </span>
                          </td>
                          {canManage && (
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                              {!isPaid ? (
                                <button
                                  onClick={() => {
                                    setOfflineModal(m);
                                    setOfflineAmount(PLANS[m.plan]?.price || 300);
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1">
                                  <span>💵 Log Offline Cash</span>
                                </button>
                              ) : (
                                <span className="text-xs text-zinc-500 font-medium italic">Verified ✓</span>
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
      )}

      {/* Modal for logging General Income / Expense */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#131318] border border-zinc-800 rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[95vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5">➕ Log Club Cost or Revenue</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Transaction Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold outline-none focus:border-orange-500">
                  <option value="EXPENSE">🔴 Expense / Cost (Money Out)</option>
                  <option value="INCOME">🟢 Extra Sponsorship / Income (Money In)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Title / Item Description</label>
                <input required placeholder="e.g. Sports Equipment & Ball Purchase" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500 placeholder:text-zinc-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category (Tag)</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold outline-none focus:border-orange-500">
                    <option value="Sports Equipment & Kits">🏏 Sports Equipment & Kits</option>
                    <option value="Turf & Ground Maintenance">⚽ Turf & Ground Maintenance</option>
                    <option value="Tournament Refreshments">🥤 Tournament Refreshments</option>
                    <option value="Medical & First Aid">🩺 Medical & First Aid</option>
                    <option value="Event & Meetup Costs">🏆 Event & Meetup Costs</option>
                    <option value="Club Desk & Operations">🖥️ Club Desk & Operations</option>
                    <option value="Donation / Sponsorship">🤝 Donation / Sponsorship</option>
                    <option value="General">📌 General Expense / Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Amount (₹)</label>
                  <input required type="number" placeholder="5000" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-bold outline-none focus:border-orange-500 placeholder:text-zinc-500" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-zinc-800 mt-6">
                <Btn variant="ghost" onClick={() => setModal(false)} className="w-full sm:w-auto order-2 sm:order-1">Cancel</Btn>
                <Btn variant="primary" type="submit" className="w-full sm:w-auto order-1 sm:order-2">Save Entry →</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Accountant Recording Offline Cash Dues */}
      {offlineModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#131318] border border-zinc-800 rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Accountant Offline Receipt</div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">💵 Record Offline Cash Dues</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mb-5">
              Confirm offline payment received from <span className="text-white font-bold">{offlineModal.fname} {offlineModal.lname}</span> ({offlineModal.memberId}).
            </p>
            <form onSubmit={handleOfflinePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Contribution Month</label>
                <input disabled value={month} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-zinc-900 text-zinc-400 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Offline Cash Amount Received (₹)</label>
                <input required type="number" value={offlineAmount} onChange={e => setOfflineAmount(e.target.value)} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-emerald-400 font-extrabold text-lg outline-none focus:border-emerald-500" />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-zinc-800 mt-6">
                <Btn variant="ghost" onClick={() => setOfflineModal(null)} className="w-full sm:w-auto order-2 sm:order-1">Cancel</Btn>
                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow transition-all order-1 sm:order-2">
                  ✓ Verify & Log Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
