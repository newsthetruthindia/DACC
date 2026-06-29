'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Loading, Empty, toast, Badge } from '@/components/ui';
import { api, PLANS } from '@/lib/api';

const PANEL_ROLES = ['President','Vice President','Secretary','Joint Secretary','Treasurer','Cultural Secretary','Sports Secretary','Captain','Vice Captain','Media Head','Executive Member'];

export default function AdminPanelPage() {
  const [panel, setPanel]     = useState([]);
  const [members, setMembers] = useState([]);
  const [selUser, setSelUser] = useState('');
  const [selRole, setSelRole] = useState('President');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);

  const load = () => Promise.all([
    api.panel(),
    api.allMembers('?status=ACTIVE&limit=500'),
  ]).then(([p,m]) => {
    setPanel(p.data||[]);
    const panelIds = new Set((p.data||[]).map(x=>x.userId?._id||x.userId));
    setMembers((m.data.members||[]).filter(u=>!panelIds.has(u._id)));
  }).finally(()=>setLoading(false));

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!selUser) { toast('Select an active member','error'); return; }
    setAdding(true);
    try {
      await api.addPanel({ userId: selUser, panelRole: selRole });
      toast('Elected & added to Core Panel ✓');
      setSelUser('');
      load();
    } catch (err) { toast(err.message||'Error electing member','error'); } finally { setAdding(false); }
  };

  const remove = async (uid, name) => {
    if (!confirm(`Remove ${name} from their Core Committee position?`)) return;
    try {
      await api.removePanel(uid);
      toast(`${name} removed from committee`);
      load();
    } catch (err) { toast(err.message,'error'); }
  };

  const resetAll = async () => {
    if (!confirm('⚡ Permanently dissolve the entire Core Panel? All members will return to regular active status so you can curate the new 1-Year Term leaders.')) return;
    try {
      await api.resetPanel();
      toast('Current panel dissolved. Ready for new 1-Year term elections! ✓');
      load();
    } catch (err) { toast(err.message,'error'); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      {/* Header Banner */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Super Admin Governance Control
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">⚙️ Elect & Manage Core Committee</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">Manually appoint executive committee members for the active 1-Year duration.</p>
        </div>
        {panel.length > 0 && (
          <button onClick={resetAll}
            className="px-5 py-3 bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-xl hover:shadow-red-500/20 transition-all flex items-center gap-2 border border-red-500/50">
            <span>⚡ Dissolve Panel & Start New 1-Year Term</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current panel */}
        <div className="space-y-6">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex justify-between items-center w-full">
                <span className="font-extrabold text-base text-white">Active Appointees ({panel.length}/15)</span>
                {panel.length > 0 && <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Live Term</span>}
              </div>
            </CardHeader>
            <div className="divide-y divide-zinc-800/80">
              {panel.length === 0
                ? <div className="p-8"><Empty icon="🏛️" title="No Committee Elected Yet" sub="Select an active athlete from the form on the right to elect them." /></div>
                : panel.map(p => {
                    const u = p.userId;
                    const pl = PLANS[u?.plan] || PLANS.SILVER;
                    const initials = `${u?.fname?.[0]||''}${u?.lname?.[0]||''}`.toUpperCase();
                    return (
                      <div key={p._id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-zinc-900/40 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border flex items-center justify-center bg-zinc-800 flex-shrink-0 relative shadow"
                            style={{ borderColor: pl.color || '#f97316' }}>
                            {u?.selfieUrl || u?.avatarUrl ? (
                              <img src={u?.selfieUrl || u?.avatarUrl} alt={u?.fname} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-white">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-base text-white truncate">{u?.fname} {u?.lname}</div>
                            <div className="text-xs text-orange-400 font-extrabold">{p.panelRole}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{u?.memberId} · <Badge label={u?.plan} /></div>
                          </div>
                        </div>
                        <button onClick={()=>remove(u?._id, `${u?.fname} ${u?.lname}`)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-xs font-bold border border-red-500/20 transition-all flex-shrink-0">
                          Remove
                        </button>
                      </div>
                    );
                  })
              }
            </div>
          </Card>

          <div className="bg-[#161620] border border-orange-500/30 rounded-2xl p-5 shadow-lg">
            <div className="font-extrabold text-sm text-orange-400 mb-1 flex items-center gap-2">
              <span>🗓️</span> 1-Year Manual Duration Governance
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              As Super Admin, you retain complete authority to manually appoint leaders from any membership tier (Silver, Gold, or Platinum). At the conclusion of your 1-year duration, click <strong className="text-white">Dissolve Panel</strong> to return all committee members to regular status and elect new leaders for the coming year.
            </p>
          </div>
        </div>

        {/* Add to panel form */}
        <Card className="bg-[#13131a] border-zinc-800 shadow-xl h-fit">
          <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
            <span className="font-extrabold text-base text-white">➕ Elect Athlete to Core Committee</span>
          </CardHeader>
          <CardBody className="space-y-5 p-6">
            {panel.length >= 15 && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 font-bold">
                Committee limit reached (15/15). Remove an active appointee first.
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Select Active Athlete</label>
              <select value={selUser} onChange={e=>setSelUser(e.target.value)}
                className="w-full px-4 py-3.5 border border-zinc-700 rounded-xl text-sm bg-[#1a1a24] text-white font-semibold outline-none focus:border-orange-500 shadow-inner">
                <option value="">— Select active member ({members.length} available) —</option>
                {members.map(m=>(
                  <option key={m._id} value={m._id}>{m.fname} {m.lname} ({m.memberId}) · [{m.plan}]</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Assign Committee Role</label>
              <select value={selRole} onChange={e=>setSelRole(e.target.value)}
                className="w-full px-4 py-3.5 border border-zinc-700 rounded-xl text-sm bg-[#1a1a24] text-orange-400 font-extrabold outline-none focus:border-orange-500 shadow-inner">
                {PANEL_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="pt-2">
              <button onClick={add} disabled={adding||panel.length>=15||!selUser}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {adding ? 'Electing & Appointing…' : '👑 Appoint to Core Committee →'}
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
