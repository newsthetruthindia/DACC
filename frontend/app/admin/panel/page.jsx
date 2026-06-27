'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Loading, Empty, toast } from '@/components/ui';
import { api, PLANS } from '@/lib/api';

const PANEL_ROLES = ['President','Vice President','Secretary','Joint Secretary','Treasurer','Cultural Secretary','Sports Secretary'];

export default function AdminPanelPage() {
  const [panel, setPanel]     = useState([]);
  const [members, setMembers] = useState([]);
  const [selUser, setSelUser] = useState('');
  const [selRole, setSelRole] = useState('President');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);

  const load = () => Promise.all([
    api.panel(),
    api.allMembers('?plan=PLATINUM&status=ACTIVE'),
  ]).then(([p,m]) => {
    setPanel(p.data||[]);
    const panelIds = new Set((p.data||[]).map(x=>x.userId?._id||x.userId));
    setMembers((m.data.members||[]).filter(u=>!panelIds.has(u._id)));
  }).finally(()=>setLoading(false));

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!selUser) { toast('Select a member','error'); return; }
    setAdding(true);
    try {
      await api.addPanel({ userId: selUser, panelRole: selRole });
      toast('Added to panel ✓');
      setSelUser('');
      load();
    } catch (err) { toast(err.message,'error'); } finally { setAdding(false); }
  };

  const remove = async (uid, name) => {
    if (!confirm(`Remove ${name} from panel?`)) return;
    await api.removePanel(uid);
    toast(`${name} removed from panel`);
    load();
  };

  const resetAll = async () => {
    if (!confirm('Reset the entire panel? This removes all panel members.')) return;
    await api.resetPanel();
    toast('Panel reset ✓');
    load();
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Manage Core Panel</h1>
        <p className="text-sm text-[#9a9890] mt-1">Assign panel members for Term 2025–26 (max 7)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Current panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <span className="font-bold text-sm text-[#1a1916]">Current Panel ({panel.length}/7)</span>
              {panel.length > 0 && <Btn size="sm" variant="red" onClick={resetAll}>Reset All</Btn>}
            </CardHeader>
            {panel.length === 0
              ? <Empty icon="👥" title="No panel members yet" sub="Add Platinum members below" />
              : panel.map(p => {
                  const u = p.userId;
                  const pl = PLANS[u?.plan] || PLANS.PLATINUM;
                  return (
                    <div key={p._id} className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e2e0d8] last:border-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background:pl.bg, color:pl.color }}>
                        {(u?.fname?.[0]||'')+(u?.lname?.[0]||'')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#1a1916]">{u?.fname} {u?.lname}</div>
                        <div className="text-xs text-[#c8410a] font-semibold">{p.panelRole}</div>
                      </div>
                      <Btn size="sm" variant="red" onClick={()=>remove(u?._id, u?.fname)}>Remove</Btn>
                    </div>
                  );
                })
            }
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <div className="font-bold mb-1">⚠ Year-End Reset</div>
            Every July 1, use <strong>Reset All</strong> to clear the panel before assigning new members for the new term.
            Only Platinum members are eligible for panel positions.
          </div>
        </div>

        {/* Add to panel */}
        <Card>
          <CardHeader><span className="font-bold text-sm text-[#1a1916]">Add to Panel</span></CardHeader>
          <CardBody className="space-y-4">
            {panel.length >= 7 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-semibold">
                Panel is full (7/7). Remove a member first.
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">Platinum Member</label>
              <select value={selUser} onChange={e=>setSelUser(e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm bg-white outline-none focus:border-[#c8410a]">
                <option value="">— Select member —</option>
                {members.map(m=>(
                  <option key={m._id} value={m._id}>{m.fname} {m.lname} · {m.phone}</option>
                ))}
              </select>
              {members.length === 0 && (
                <p className="text-xs text-[#9a9890] mt-1.5">No eligible Platinum members available. All Platinum members may already be on the panel.</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">Panel Role</label>
              <select value={selRole} onChange={e=>setSelRole(e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm bg-white outline-none focus:border-[#c8410a]">
                {PANEL_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Btn onClick={add} disabled={adding||panel.length>=7||!selUser} className="w-full justify-center">
              {adding ? 'Adding…' : 'Add to Panel →'}
            </Btn>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
