'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Textarea, Loading, Empty, toast } from '@/components/ui';
import { api, fmtTime } from '@/lib/api';

const TARGETS = [
  { key:'ALL',      label:'All Members',    desc:'Every member receives this' },
  { key:'SILVER',   label:'Silver',         desc:'Only Silver members' },
  { key:'GOLD',     label:'Gold & Above',   desc:'Gold + Platinum members' },
  { key:'PLATINUM', label:'Platinum Only',  desc:'Platinum members only' },
  { key:'PANEL',    label:'Panel Only',     desc:'Core panel members only' },
];

export default function SendNotifPage() {
  const [title, setTitle]   = useState('');
  const [body, setBody]     = useState('');
  const [target, setTarget] = useState('ALL');
  const [sent, setSent]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.notifications().then(r => setSent(r.data.notifications||[])).finally(()=>setLoading(false));
  }, []);

  const send = async () => {
    if (!title||!body) { toast('Fill title and message','error'); return; }
    setSending(true);
    try {
      await api.sendNotif({ title, body, target });
      setTitle(''); setBody(''); setTarget('ALL');
      toast('Notification sent to members ✓');
      api.notifications().then(r => setSent(r.data.notifications||[]));
    } catch (err) { toast(err.message,'error'); } finally { setSending(false); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Send Notification</h1>
        <p className="text-sm text-[#9a9890] mt-1">Broadcast announcements to members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <Card>
            <CardHeader><span className="font-bold text-sm text-[#1a1916]">📣 New Announcement</span></CardHeader>
            <CardBody className="space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-2">Send To</div>
                <div className="space-y-2">
                  {TARGETS.map(t => (
                    <div key={t.key} onClick={() => setTarget(t.key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${target===t.key ? 'border-[#c8410a] bg-[#fff8f5]' : 'border-[#e2e0d8] hover:border-[#9a9890]'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${target===t.key ? 'border-[#c8410a]' : 'border-[#9a9890]'}`}>
                        {target===t.key && <div className="w-2 h-2 rounded-full bg-[#c8410a]" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1a1916]">{t.label}</div>
                        <div className="text-xs text-[#9a9890]">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Input label="Title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Monthly Meeting — June 2025" />
              <Textarea label="Message" value={body} onChange={e=>setBody(e.target.value)} rows={5}
                placeholder="Write your announcement to members…" />
              <Btn onClick={send} disabled={sending} className="w-full justify-center">
                {sending ? 'Sending…' : '📣 Send Notification'}
              </Btn>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader><span className="font-bold text-sm text-[#1a1916]">Sent Notifications</span></CardHeader>
          {sent.length === 0
            ? <Empty icon="📭" title="Nothing sent yet" />
            : sent.map(n => (
              <div key={n._id} className="px-5 py-4 border-b border-[#e2e0d8] last:border-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#1a1916]">{n.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f4f0] text-[#9a9890] flex-shrink-0">{n.target}</span>
                </div>
                <p className="text-xs text-[#4a4840] line-clamp-2">{n.body}</p>
                <div className="text-[10px] text-[#9a9890] mt-1.5">
                  {fmtTime(n.createdAt)} · Read by {n.readBy?.length||0} members
                </div>
              </div>
            ))
          }
        </Card>
      </div>
    </AppLayout>
  );
}
