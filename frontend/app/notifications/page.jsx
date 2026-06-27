'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, Loading, Empty } from '@/components/ui';
import { api, fmtTime } from '@/lib/api';

const TARGET_LABELS = { ALL:'All Members', SILVER:'Silver', GOLD:'Gold & above', PLATINUM:'Platinum only', PANEL:'Panel only' };

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
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Notifications</h1>
        <p className="text-sm text-[#9a9890] mt-1">Announcements from the core panel</p>
      </div>
      <Card>
        {notifs.length === 0
          ? <Empty icon="📭" title="No notifications yet" sub="Panel announcements will appear here" />
          : notifs.map(n => {
              const sender = n.fromId;
              return (
                <div key={n._id} className="px-5 py-4 border-b border-[#e2e0d8] last:border-0 hover:bg-[#fafaf7]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#c8410a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {(sender?.fname?.[0]||'') + (sender?.lname?.[0]||'')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-sm text-[#1a1916]">{n.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#f5f4f0] text-[#9a9890]">
                          📣 {TARGET_LABELS[n.target] || n.target}
                        </span>
                      </div>
                      <p className="text-sm text-[#4a4840] leading-relaxed">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-[#9a9890]">{fmtTime(n.createdAt)}</span>
                        {sender && <span className="text-[10px] text-[#9a9890]">· by {sender.fname} {sender.lname}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        }
      </Card>
    </AppLayout>
  );
}
