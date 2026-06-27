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
  const [modalMode, setModalMode] = useState(null); // 'ADD' or 'EDIT'
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
    toast(`${name} approved ✓`);
    load();
  };

  const suspend = async (id, cur, name) => {
    const status = cur === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    await api.suspendMember(id, status);
    toast(`${name} ${status.toLowerCase()} ✓`);
    load();
  };

  const deleteMem = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    await api.deleteMember(id);
    toast(`${name} deleted permanently`);
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
        toast('New member created successfully ✓');
      } else {
        await api.updateMember(activeMember._id, form);
        toast('Member updated successfully ✓');
      }
      setModalMode(null);
      load();
    } catch (err) {
      toast(err.message || 'Error occurred');
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
    toast('Submitted for confirmation');
    load();
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">All Members</h1>
          <p className="text-sm text-[#9a9890] mt-1">{total} members registered</p>
        </div>
        {isSuperAdmin && <Btn variant="primary" onClick={openAdd}>➕ Add Member</Btn>}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, phone…"
          className="flex-1 min-w-[200px] px-3.5 py-2 border border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a] bg-white" />
        <select value={filterStatus} onChange={e=>setFS(e.target.value)}
          className="px-3.5 py-2 border border-[#e2e0d8] rounded-xl text-sm bg-white outline-none focus:border-[#c8410a]">
          <option value="">All Status</option>
          {['ACTIVE','PENDING','SUSPENDED','INACTIVE'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPlan} onChange={e=>setFP(e.target.value)}
          className="px-3.5 py-2 border border-[#e2e0d8] rounded-xl text-sm bg-white outline-none focus:border-[#c8410a]">
          <option value="">All Plans</option>
          {['SILVER','GOLD','PLATINUM'].map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <Card className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f5f4f0]">
              {['Member','Plan','Role','Status','This Month','Actions'].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#9a9890] border-b border-[#e2e0d8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.length === 0
              ? <tr><td colSpan={6}><Empty icon="🔍" title="No members found" /></td></tr>
              : members.map(m => {
                  const pl = PLANS[m.plan] || PLANS.SILVER;
                  return (
                    <tr key={m._id} className="border-b border-[#e2e0d8] last:border-0 hover:bg-[#fafaf7]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background:pl.bg, color:pl.color }}>
                            {(m.fname?.[0]||'')+(m.lname?.[0]||'')}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1a1916]">{m.fname} {m.lname}</div>
                            <div className="text-[11px] text-[#9a9890]">{m.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge label={m.plan} /></td>
                      <td className="px-4 py-3"><Badge label={m.role} /></td>
                      <td className="px-4 py-3"><Badge label={m.status} /></td>
                      <td className="px-4 py-3">
                        <Badge label={m.paidThisMonth ? 'PAID' : 'DUE'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <Btn size="sm" variant="ghost" onClick={()=>openEdit(m)}>✏️ Edit</Btn>
                          {m.status === 'PENDING' && (
                            <Btn size="sm" variant="dark" onClick={()=>approve(m._id, m.fname)}>Approve</Btn>
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
      </Card>

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#1a1916] mb-4">
              {modalMode === 'ADD' ? '➕ Add New Member' : '✏️ Edit Member Details'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">First Name</label>
                  <input required value={form.fname} onChange={e=>setForm({...form, fname: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Last Name</label>
                  <input required value={form.lname} onChange={e=>setForm({...form, lname: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Phone</label>
                <input required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">City</label>
                <input value={form.city} onChange={e=>setForm({...form, city: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Membership Plan</label>
                  <select value={form.plan} onChange={e=>setForm({...form, plan: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                    <option value="SILVER">Silver (₹300)</option>
                    <option value="GOLD">Gold (₹500)</option>
                    <option value="PLATINUM">Platinum (₹1000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Role</label>
                  <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                    <option value="MEMBER">Member</option>
                    <option value="PANEL">Panel</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              {modalMode === 'EDIT' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              )}
              {modalMode === 'ADD' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#9a9890] mb-1">Initial Password</label>
                  <input value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Default: demo123" className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:border-[#c8410a]" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Btn variant="ghost" onClick={()=>setModalMode(null)}>Cancel</Btn>
                <Btn variant="primary" type="submit">{modalMode === 'ADD' ? 'Create Member' : 'Save Changes'}</Btn>
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
