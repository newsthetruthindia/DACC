'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Loading, toast } from '@/components/ui';
import { api, fmtDate } from '@/lib/api';

export default function AdminTermsPage() {
  const [terms, setTerms]   = useState([]);
  const [label, setLabel]   = useState('');
  const [start, setStart]   = useState('');
  const [end, setEnd]       = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = () => api.terms().then(r=>setTerms(r.data||[])).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!label||!start||!end) { toast('Fill all fields','error'); return; }
    setCreating(true);
    try {
      await api.createTerm({ label, startDate:start, endDate:end });
      toast('Term created ✓'); setLabel(''); setStart(''); setEnd(''); load();
    } catch (err) { toast(err.message,'error'); } finally { setCreating(false); }
  };

  const activate = async (id, lbl) => {
    await api.activateTerm(id);
    toast(`Term ${lbl} activated ✓`);
    load();
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Club Terms</h1>
        <p className="text-sm text-[#9a9890] mt-1">Manage annual club terms. Only one term is active at a time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><span className="font-bold text-sm text-[#1a1916]">All Terms</span></CardHeader>
          {terms.length === 0
            ? <div className="p-8 text-center text-sm text-[#9a9890]">No terms created yet</div>
            : terms.map(t => (
              <div key={t._id} className="flex items-center gap-4 px-5 py-4 border-b border-[#e2e0d8] last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm text-[#1a1916]">{t.label}</span>
                    {t.isActive && <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>}
                  </div>
                  <div className="text-xs text-[#9a9890]">{fmtDate(t.startDate)} → {fmtDate(t.endDate)}</div>
                </div>
                {!t.isActive && <Btn size="sm" variant="ghost" onClick={()=>activate(t._id,t.label)}>Activate</Btn>}
              </div>
            ))
          }
        </Card>

        <Card>
          <CardHeader><span className="font-bold text-sm text-[#1a1916]">Create New Term</span></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">Term Label</label>
              <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. 2026-27"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">Start Date</label>
                <input type="date" value={start} onChange={e=>setStart(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">End Date</label>
                <input type="date" value={end} onChange={e=>setEnd(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a]" />
              </div>
            </div>
            <Btn onClick={create} disabled={creating} className="w-full justify-center">
              {creating ? 'Creating…' : 'Create Term →'}
            </Btn>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
