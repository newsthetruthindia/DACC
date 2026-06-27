'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, Btn, Badge, Loading, Empty, UpiModal, toast } from '@/components/ui';
import { api, PLANS, fmtTime, currentMonth } from '@/lib/api';

export default function AdminMembersPage() {
  const [members, setMembers] = useState([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [filterStatus, setFS] = useState('');
  const [filterPlan, setFP]   = useState('');
  const [upi, setUpi]         = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">All Members</h1>
        <p className="text-sm text-[#9a9890] mt-1">{total} members registered</p>
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
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </Card>

      {upi && (
        <UpiModal open={!!upi} link={upi.link} amount={upi.amount} month={month}
          memberName={upi.memberName} onClose={()=>setUpi(null)} onMarkPaid={markPaid} />
      )}
    </AppLayout>
  );
}
