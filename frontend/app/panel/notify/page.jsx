'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Textarea, Loading, Empty, toast, Badge } from '@/components/ui';
import { api, fmtTime } from '@/lib/api';

const TARGETS = [
  { key:'ALL',   label:'📢 All Club Members',        desc:'Broadcast immediately to every registered club member' },
  { key:'PANEL', label:'🏛️ Core Committee Only',      desc:'Confidential broadcast to executive committee appointees' },
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
    if (!title||!body) { toast('Fill title and message content','error'); return; }
    setSending(true);
    try {
      await api.sendNotif({ title, body, target });
      setTitle(''); setBody(''); setTarget('ALL');
      toast('Broadcast alert published to Portal & Telegram! ✓');
      api.notifications().then(r => setSent(r.data.notifications||[]));
    } catch (err) { toast(err.message,'error'); } finally { setSending(false); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Executive Megaphone
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">📣 Broadcast Club Alert</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">Publish official notices to portal feeds and trigger instant Telegram community broadcasts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">🚀 Compose Megaphone Broadcast</span>
            </CardHeader>
            <CardBody className="space-y-5 p-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">Select Target Audience</label>
                <div className="space-y-2.5">
                  {TARGETS.map(t => (
                    <div key={t.key} onClick={() => setTarget(t.key)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${target===t.key ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5' : 'border-zinc-800 bg-[#161620] hover:border-zinc-700'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${target===t.key ? 'border-orange-500 bg-orange-500' : 'border-zinc-600'}`}>
                        {target===t.key && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white">{t.label}</div>
                        <div className="text-xs text-zinc-400 font-medium">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Input label="Announcement Title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Annual Monsoon Turf Championship — Registration Open" />
              <Textarea label="Full Broadcast Content" value={body} onChange={e=>setBody(e.target.value)} rows={5}
                placeholder="Write the full announcement details. This will also echo to Telegram…" />
              <button onClick={send} disabled={sending}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black text-sm rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <span>{sending ? 'Broadcasting…' : '📣 Publish & Blast Alert →'}</span>
              </button>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-6">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">Broadcast History ({sent.length})</span>
            </CardHeader>
            <div className="divide-y divide-zinc-800/80 max-h-[600px] overflow-y-auto">
              {sent.length === 0
                ? <div className="p-12"><Empty icon="📭" title="No Broadcasts Published Yet" sub="Published alerts will be logged here" /></div>
                : sent.map(n => (
                  <div key={n._id} className="p-6 hover:bg-zinc-900/40 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="font-extrabold text-base text-white">{n.title}</h3>
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        Target: {n.target}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed font-medium bg-[#161620] p-3.5 rounded-xl border border-zinc-800 mt-2">{n.body}</p>
                    <div className="flex items-center justify-between gap-2 mt-3 text-xs text-zinc-500 font-semibold">
                      <span>🕒 Published {fmtTime(n.createdAt)}</span>
                      <span className="text-emerald-400">Read by {n.readBy?.length||0} athletes</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
