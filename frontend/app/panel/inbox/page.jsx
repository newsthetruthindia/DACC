'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, Btn, Textarea, Loading, Empty, toast } from '@/components/ui';
import { api, fmtTime, getUser, PLANS } from '@/lib/api';

export default function PanelInboxPage() {
  const [msgs, setMsgs]     = useState([]);
  const [active, setActive] = useState(null);
  const [reply, setReply]   = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter]   = useState('OPEN');
  const user = getUser();

  const load = () => api.allMessages(`?status=${filter}`).then(r => setMsgs(r.data.messages||[])).finally(()=>setLoading(false));

  useEffect(() => { load(); }, [filter]);

  const loadThread = (id) => api.getMessage(id).then(r => setActive(r.data)).catch(()=>{});

  const sendReply = async () => {
    if (!reply || !active) return;
    setSending(true);
    try {
      await api.replyMessage(active._id, reply);
      setReply('');
      toast('Reply sent ✓');
      loadThread(active._id);
      load();
    } catch (err) { toast(err.message, 'error'); } finally { setSending(false); }
  };

  const closeThread = async () => {
    await api.closeMessage(active._id);
    toast('Thread closed');
    setActive(null);
    load();
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Member Inbox</h1>
        <p className="text-sm text-[#9a9890] mt-1">Messages from members to the core panel</p>
      </div>

      <div className="flex gap-2 mb-4">
        {['OPEN','REPLIED','CLOSED'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setActive(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter===f ? 'bg-[#1a1916] text-white' : 'bg-white border border-[#e2e0d8] text-[#4a4840] hover:border-[#1a1916]'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          {msgs.length === 0
            ? <Empty icon="📥" title={`No ${filter.toLowerCase()} messages`} />
            : msgs.map(m => {
                const sender = m.fromId;
                const pl = PLANS[sender?.plan] || PLANS.SILVER;
                return (
                  <div key={m._id} onClick={() => loadThread(m._id)}
                    className={`px-5 py-4 border-b border-[#e2e0d8] last:border-0 cursor-pointer hover:bg-[#fafaf7] transition-colors ${active?._id===m._id ? 'bg-[#fff8f5]' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: pl.bg, color: pl.color }}>
                        {(sender?.fname?.[0]||'')+(sender?.lname?.[0]||'')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-[#1a1916] truncate">{m.subject}</span>
                          {m.replies?.length === 0 && <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">NEW</span>}
                        </div>
                        <div className="text-xs text-[#4a4840] truncate">{m.body}</div>
                        <div className="text-[10px] text-[#9a9890] mt-1">
                          {sender?.fname} {sender?.lname} · {pl.label} · {fmtTime(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          }
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <span className="font-bold text-sm text-[#1a1916]">{active ? `Thread: ${active.subject}` : 'Select a message'}</span>
            {active && active.status !== 'CLOSED' && (
              <Btn size="sm" variant="ghost" onClick={closeThread}>Close Thread</Btn>
            )}
          </CardHeader>
          {!active
            ? <Empty icon="💬" title="Select a message" sub="Click a message to view and reply" />
            : <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight:380 }}>
                  {[{ fromId:active.fromId, body:active.body, createdAt:active.createdAt }, ...active.replies].map((post,i) => {
                    const isPanel = post.fromId?._id !== active.fromId?._id || i > 0;
                    const s = post.fromId;
                    return (
                      <div key={i} className={`flex flex-col ${isPanel && i>0 ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          i===0 ? 'bg-[#f5f4f0] border border-[#e2e0d8] text-[#1a1916] rounded-bl-sm'
                                : 'bg-[#1a1916] text-white rounded-br-sm'}`}>
                          {post.body}
                        </div>
                        <div className="text-[10px] text-[#9a9890] mt-1 px-1">
                          {i===0 ? `${active.fromId?.fname} (Member)` : `${s?.fname||'Panel'} (Panel)`} · {fmtTime(post.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {active.status !== 'CLOSED' && (
                  <div className="p-4 border-t border-[#e2e0d8] flex gap-2">
                    <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={2} placeholder={`Reply to ${active.fromId?.fname}…`}
                      className="flex-1 px-3 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a] resize-none" />
                    <Btn onClick={sendReply} disabled={sending||!reply}>Reply →</Btn>
                  </div>
                )}
              </>
          }
        </Card>
      </div>
    </AppLayout>
  );
}
