'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardBody, Loading, Empty, Btn, toast, Badge } from '@/components/ui';
import { api, PLANS, getUser, resolveImgUrl } from '@/lib/api';

export default function PanelPage() {
  const [panel, setPanel] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const load = () => {
    setLoading(true);
    api.panel().then(r => setPanel(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetAll = async () => {
    if (!confirm('⚡ Permanently dissolve the current Core Panel? This will reset all committee members back to regular members so you can elect a new 1-Year Panel.')) return;
    try {
      await api.resetPanel();
      toast('Current panel officially dissolved ✓');
      load();
    } catch (err) {
      toast(err.message || 'Error dissolving panel', 'error');
    }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-zinc-900/90 via-[#161620] to-zinc-900/90 p-6 rounded-3xl border border-zinc-800/80 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            Active 1-Year Governance Duration
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">🏛️ Core Committee Panel</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">The elected executive leaders governing Agnichakra Club operations and athlete welfare.</p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-3">
            {panel.length > 0 && (
              <button onClick={resetAll}
                className="px-5 py-2.5 bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2 border border-red-500/50">
                <span>⚡ Dissolve Panel & Start New 1-Year Term</span>
              </button>
            )}
            <a href="/admin/panel" className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2">
              <span>⚙️ Elect / Manage Committee</span>
            </a>
          </div>
        )}
      </div>

      {/* Duration Banner */}
      <div className="mb-8 p-5 rounded-2xl bg-[#13131a] border border-orange-500/30 flex items-center justify-between flex-wrap gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">🗓️</div>
          <div>
            <div className="text-base font-extrabold text-white">Current Committee Duration: 1-Year Fixed Term</div>
            <div className="text-xs text-zinc-400">Manually curated by Super Admin. Dissolves automatically or upon manual trigger at term conclusion.</div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            ● Status: Active & Operational
          </span>
        </div>
      </div>

      {/* Panel Grid */}
      {panel.length === 0
        ? <Card className="border-dashed border-2 border-zinc-800 bg-[#121218]"><Empty icon="🏛️" title="No Committee Members Currently Appointed" sub={isSuperAdmin ? "Click 'Elect / Manage Committee' above to manually set your 1-year panel leaders." : "The Super Admin is finalizing appointments for the upcoming 1-Year term."} /></Card>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {panel.map(p => {
              const u = p.userId;
              const pl = PLANS[u?.plan] || PLANS.SILVER;
              const initials = `${u?.fname?.[0]||''}${u?.lname?.[0]||''}`.toUpperCase();
              return (
                <div key={p._id} className="bg-[#14141c] hover:bg-[#181824] border border-zinc-800/90 hover:border-orange-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col items-center text-center group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
                  
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 border-2 shadow-lg flex items-center justify-center bg-zinc-800 relative"
                    style={{ borderColor: pl.color || '#f97316' }}>
                    {u?.selfieUrl || u?.avatarUrl ? (
                      <img src={resolveImgUrl(u?.selfieUrl || u?.avatarUrl)} alt={u?.fname} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-2xl font-black text-white">{initials}</span>
                    )}
                  </div>

                  <div className="text-xs font-black uppercase tracking-wider text-orange-400 mb-1 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                    {p.panelRole}
                  </div>

                  <div className="font-extrabold text-xl text-white mt-1">{u?.fname} {u?.lname}</div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">{u?.memberId || 'AGC-LEADER'}</div>

                  <div className="mt-4 pt-4 border-t border-zinc-800/80 w-full flex items-center justify-between text-xs text-zinc-300 font-semibold">
                    <span>Division: <Badge label={u?.plan || 'PLATINUM'} /></span>
                    <span className="text-emerald-400">Verified Leader ✓</span>
                  </div>
                </div>
              );
            })}
          </div>
      }

      {/* Modern About Section */}
      <div className="bg-gradient-to-br from-[#14141c] to-[#111118] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <h3 className="font-extrabold text-lg text-white mb-3 flex items-center gap-2">
          <span>📜</span> Club Governance & 1-Year Manual Duration Mandate
        </h3>
        <p className="text-sm text-zinc-200 leading-relaxed font-medium">
          The Core Committee Panel consists of executive leaders appointed manually by the Super Admin to oversee Agnichakra Club operations for a strict <strong className="text-orange-400 font-bold">1-Year Duration</strong>. They are responsible for financial transparency, tournament planning, athlete discipline, and communications. Upon completion of the 1-year term, the current panel dissolves, allowing a fresh executive committee to take leadership for the next season.
        </p>
      </div>
    </AppLayout>
  );
}
