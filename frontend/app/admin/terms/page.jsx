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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">📅 Club Terms</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">Manage annual club terms. Only one term is active at a time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><span className="font-bold text-base text-white">All Terms</span></CardHeader>
          <div className="divide-y divide-zinc-800">
            {terms.length === 0
              ? <div className="p-8 text-center text-sm text-zinc-400">No terms created yet</div>
              : terms.map(t => (
                <div key={t._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-900/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base text-white">{t.label}</span>
                      {t.isActive && <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">ACTIVE</span>}
                    </div>
                    <div className="text-xs text-zinc-400 font-medium">{fmtDate(t.startDate)} → {fmtDate(t.endDate)}</div>
                  </div>
                  {!t.isActive && <Btn size="sm" variant="ghost" onClick={()=>activate(t._id,t.label)} className="w-full sm:w-auto">Activate</Btn>}
                </div>
              ))
            }
          </div>
        </Card>

        <Card h-fit>
          <CardHeader><span className="font-bold text-base text-white">Create New Term</span></CardHeader>
          <CardBody className="space-y-4 p-4 sm:p-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Term Label</label>
              <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. 2026-27"
                className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm outline-none focus:border-orange-500 bg-[#1a1a22] text-white placeholder:text-zinc-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Start Date</label>
                <input type="date" value={start} onChange={e=>setStart(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm outline-none focus:border-orange-500 bg-[#1a1a22] text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">End Date</label>
                <input type="date" value={end} onChange={e=>setEnd(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm outline-none focus:border-orange-500 bg-[#1a1a22] text-white" />
              </div>
            </div>
            <div className="pt-2">
              <Btn onClick={create} disabled={creating} className="w-full justify-center py-3.5">
                {creating ? 'Creating…' : 'Create Term →'}
              </Btn>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
