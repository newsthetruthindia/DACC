'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, Loading, Empty } from '@/components/ui';
import { api, fmtTime } from '@/lib/api';

const TARGET_LABELS = { ALL:'All Members', SILVER:'Standard Members', GOLD:'Standard Members', PLATINUM:'Standard Members', PANEL:'Committee Only' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notifications().then(r => {
      setNotifs(r.data.notifications || []);
      api.markAllRead().catch(() => {});
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Official Club Feed
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">🔔 Club Announcements</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">Important updates, event notices, and governance broadcasts from the Core Committee.</p>
        </div>
      </div>

      <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
        {notifs.length === 0
          ? <div className="p-12"><Empty icon="📭" title="No Announcements Posted Yet" sub="Official club notices will appear here as soon as they are published." /></div>
          : <div className="divide-y divide-zinc-800/80">
              {notifs.map(n => {
                const sender = n.fromId;
                return (
                  <div key={n._id} className="p-6 transition-all hover:bg-zinc-900/60 group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        {(sender?.fname?.[0]||'A') + (sender?.lname?.[0]||'C')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                          <h3 className="font-extrabold text-lg text-white group-hover:text-orange-400 transition-colors">{n.title}</h3>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                            📣 {TARGET_LABELS[n.target] || n.target}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-medium bg-[#161620] p-4 rounded-2xl border border-zinc-800/80 mt-2">{n.body}</p>
                        <div className="flex items-center justify-between gap-2 mt-3 text-xs text-zinc-400 font-semibold">
                          <span className="flex items-center gap-1.5 text-orange-400/80">
                            <span>🕒</span> {fmtTime(n.createdAt)}
                          </span>
                          {sender && <span className="text-zinc-400">Broadcast by <strong className="text-white">{sender.fname} {sender.lname}</strong></span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </Card>
    </AppLayout>
  );
}
