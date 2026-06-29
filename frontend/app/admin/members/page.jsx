'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, Btn, Badge, Loading, Empty, UpiModal, toast } from '@/components/ui';
import { api, PLANS, currentMonth, getUser } from '@/lib/api';

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [filterStatus, setFS] = useState('');
  const [filterPlan, setFP]   = useState('');
  const [upi, setUpi]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [form, setForm] = useState({ fname: '', lname: '', email: '', phone: '', plan: 'SILVER', role: 'MEMBER', status: 'ACTIVE', city: '', password: '' });

  const currentUser = getUser();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const month = currentMonth();

  const load = () => {
    const q = new URLSearchParams();
    if (search)       q.set('search', search);
    if (filterStatus) q.set('status', filterStatus);
    if (filterPlan)   q.set('plan',   filterPlan);
    api.allMembers('?' + q.toString()).then(r => {
      setMembers(r.data.members||[]);
      setTotal(r.data.total||0);
    }).finally(()=>setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus, filterPlan]);

  const approve = async (id, name) => {
    await api.approveMember(id);
    toast(`${name} approved successfully ✓`);
    load();
  };

  const suspend = async (id, cur, name) => {
    const status = cur === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await api.suspendMember(id, status);
    toast(`${name} status changed to ${status}`);
    load();
  };

  const deleteMem = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently remove ${name}?`)) return;
    await api.deleteMember(id);
    toast(`${name} removed permanently`);
    load();
  };

  const openAdd = () => {
    setForm({ fname: '', lname: '', email: '', phone: '', plan: 'SILVER', role: 'MEMBER', status: 'ACTIVE', city: '', password: 'demo123' });
    setActiveMember(null);
    setModalMode('ADD');
  };

  const openEdit = (m) => {
    setActiveMember(m);
    setForm({ fname: m.fname, lname: m.lname, email: m.email, phone: m.phone, plan: m.plan, role: m.role, status: m.status, city: m.city || '' });
    setModalMode('EDIT');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'ADD') {
        await api.createMember(form);
        toast('New member added successfully ✓');
      } else {
        await api.updateMember(activeMember._id, form);
        toast('Member updated successfully ✓');
      }
      setModalMode(null);
      load();
    } catch (err) {
      toast(err.message || 'Error occurred', 'error');
    }
  };

  const openUpi = async (m) => {
    const u = m;
    const pl = PLANS[u.plan] || PLANS.SILVER;
    const link = `upi://pay?pa=${encodeURIComponent(process.env.NEXT_PUBLIC_CLUB_UPI||'agnichakra@okaxis')}&pn=${encodeURIComponent('Agnichakra Club')}&am=${pl.price}&cu=INR&tn=${encodeURIComponent(`Agnichakra Club ${pl.label} ${month}`)}`;
    setUpi({ link, amount: pl.price, memberName:`${u.fname} ${u.lname}`, memberId:u._id });
  };

  const markPaid = async () => {
    if (!upi) return;
    const fd = new FormData();
    fd.append('forMonth', month);
    await api.submitPayment(fd).catch(()=>{});
    setUpi(null);
    toast('Contribution marked for verification');
    load();
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">🗂️ Manage Club Members</h1>
          <p className="text-sm text-zinc-400 mt-1">{total} total registered members in portal database</p>
        </div>
        {isSuperAdmin && <Btn variant="primary" onClick={openAdd}>➕ Add New Member</Btn>}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search by name, email, or phone…"
          className="flex-1 min-w-[240px] px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500 placeholder:text-zinc-500" />
        <select value={filterStatus} onChange={e=>setFS(e.target.value)}
          className="px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold outline-none focus:border-orange-500">
          <option value="">All Statuses</option>
          {['ACTIVE','PENDING','SUSPENDED','INACTIVE'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPlan} onChange={e=>setFP(e.target.value)}
          className="px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold outline-none focus:border-orange-500">
          <option value="">All Plans</option>
          {['SILVER','GOLD','PLATINUM'].map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <span className="font-bold text-white text-base">Registered Members Roster</span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-900/80 text-zinc-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800">
                {['Member Details','Plan','Role','Status','This Month','Actions'].map(h=>(
                  <th key={h} className="text-left px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {members.length === 0
                ? <tr><td colSpan={6}><Empty icon="🔍" title="No matching members found" /></td></tr>
                : members.map(m => {
                    const pl = PLANS[m.plan] || PLANS.SILVER;
                    return (
                      <tr key={m._id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 border"
                              style={{ background:`${pl.color}22`, borderColor:pl.color }}>
                              {(m.fname?.[0]||'')+(m.lname?.[0]||'')}
                            </div>
                            <div>
                              <div className="font-bold text-white text-base">{m.fname} {m.lname}</div>
                              <div className="text-xs text-zinc-400 mt-0.5">{m.phone} · {m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Badge label={m.plan} /></td>
                        <td className="px-6 py-4"><Badge label={m.role} /></td>
                        <td className="px-6 py-4"><Badge label={m.status} /></td>
                        <td className="px-6 py-4">
                          <Badge label={m.paidThisMonth ? 'PAID' : 'DUE'} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap items-center">
                            <Btn size="sm" variant="ghost" onClick={()=>openEdit(m)}>✏️ Edit</Btn>
                            {m.status === 'PENDING' && (
                              <Btn size="sm" variant="primary" onClick={()=>approve(m._id, m.fname)}>Approve</Btn>
                            )}
                            {!m.paidThisMonth && m.status==='ACTIVE' && (
                              <Btn size="sm" variant="ghost" onClick={()=>openUpi(m)}>💳 UPI Link</Btn>
                            )}
                            <Btn size="sm" variant={m.status==='SUSPENDED'?'green':'red'}
                              onClick={()=>suspend(m._id, m.status, m.fname)}>
                              {m.status==='SUSPENDED'?'Restore':'Suspend'}
                            </Btn>
                            {isSuperAdmin && <Btn size="sm" variant="red" onClick={()=>deleteMem(m._id, m.fname)}>🗑️ Delete</Btn>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#131318] border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-5">
              {modalMode === 'ADD' ? '➕ Add New Member' : '✏️ Edit Member Details'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">First Name</label>
                  <input required value={form.fname} onChange={e=>setForm({...form, fname: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Last Name</label>
                  <input required value={form.lname} onChange={e=>setForm({...form, lname: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number</label>
                <input required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">City / Location</label>
                <input value={form.city} onChange={e=>setForm({...form, city: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Plan</label>
                  <select value={form.plan} onChange={e=>setForm({...form, plan: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold">
                    <option value="SILVER">Silver (₹300)</option>
                    <option value="GOLD">Gold (₹500)</option>
                    <option value="PLATINUM">Platinum (₹1000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Role</label>
                  <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold">
                    <option value="MEMBER">Member</option>
                    <option value="PANEL">Panel</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              {modalMode === 'EDIT' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Account Status</label>
                  <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-semibold">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              )}
              {modalMode === 'ADD' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Initial Password</label>
                  <input value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Default: demo123" className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <Btn variant="ghost" onClick={()=>setModalMode(null)}>Cancel</Btn>
                <Btn variant="primary" type="submit">{modalMode === 'ADD' ? 'Add Member' : 'Save Changes'}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {upi && (
        <UpiModal open={!!upi} link={upi.link} amount={upi.amount} month={month}
          memberName={upi.memberName} onClose={()=>setUpi(null)} onMarkPaid={markPaid} />
      )}
    </AppLayout>
  );
}
