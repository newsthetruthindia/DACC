'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, Btn, Textarea, Loading, Empty, toast, Badge } from '@/components/ui';
import { api, fmtTime, getUser, PLANS, resolveImgUrl } from '@/lib/api';

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
      toast('Reply dispatched to athlete ✓');
      loadThread(active._id);
      load();
    } catch (err) { toast(err.message, 'error'); } finally { setSending(false); }
  };

  const closeThread = async () => {
    await api.closeMessage(active._id);
    toast('Thread marked closed');
    setActive(null);
    load();
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Committee Executive Desk
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">📥 Member Helpdesk Inbox</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">Review and resolve confidential inquiries submitted by club athletes.</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {['OPEN','REPLIED','CLOSED'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setActive(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow ${filter===f ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' : 'bg-[#13131a] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}>
            <span>{f === 'OPEN' ? '🟢 Open Inquiries' : f === 'REPLIED' ? '💬 Replied Threads' : '🔒 Closed Archives'}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">Inquiries ({msgs.length})</span>
            </CardHeader>
            <div className="divide-y divide-zinc-800/80 max-h-[450px] overflow-y-auto">
              {msgs.length === 0
                ? <div className="p-12"><Empty icon="📥" title={`No ${filter.toLowerCase()} inquiries`} sub="Check other tabs above" /></div>
                : msgs.map(m => {
                    const sender = m.fromId;
                    const pl = PLANS[sender?.plan] || PLANS.SILVER;
                    return (
                      <div key={m._id} onClick={() => loadThread(m._id)}
                        className={`p-5 cursor-pointer transition-colors ${active?._id===m._id ? 'bg-orange-500/10 border-l-4 border-orange-500' : 'hover:bg-zinc-900/50'}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-xs font-bold text-white flex-shrink-0 border bg-zinc-800"
                            style={{ borderColor: pl.color || '#f97316' }}>
                            {sender?.selfieUrl || sender?.avatarUrl ? (
                              <img src={resolveImgUrl(sender?.selfieUrl || sender?.avatarUrl)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{(sender?.fname?.[0]||'')+(sender?.lname?.[0]||'')}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-sm text-white truncate">{m.subject}</span>
                              {m.replies?.length === 0 && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-extrabold animate-pulse">NEW</span>}
                            </div>
                            <div className="text-xs text-zinc-300 truncate font-medium">{m.body}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-2">
                              <span>{sender?.fname} {sender?.lname}</span> · <Badge label={sender?.plan || 'SILVER'} /> · <span>{fmtTime(m.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl flex flex-col h-full min-h-[550px]">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <div className="flex justify-between items-center w-full">
                <span className="font-extrabold text-base text-white">{active ? `💬 Thread: ${active.subject}` : 'Select an Inquiry'}</span>
                {active && active.status !== 'CLOSED' && (
                  <button onClick={closeThread} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-xs font-bold border border-red-500/20 transition-all">
                    🔒 Mark Resolved & Close
                  </button>
                )}
              </div>
            </CardHeader>
            {!active
              ? <div className="flex-1 flex items-center justify-center p-12"><Empty icon="💬" title="No Thread Selected" sub="Click any inquiry on the left to inspect details and reply" /></div>
              : <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[450px]">
                    {[{ fromId:active.fromId, body:active.body, createdAt:active.createdAt }, ...active.replies].map((post,i) => {
                      const isPanel = post.fromId?._id !== active.fromId?._id || i > 0;
                      const s = post.fromId;
                      return (
                        <div key={i} className={`flex flex-col ${isPanel && i>0 ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed font-medium shadow-md ${
                            i===0 ? 'bg-[#1e1e2c] text-zinc-100 rounded-bl-none border border-zinc-700'
                                  : 'bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-br-none'}`}>
                            {post.body}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-bold mt-1.5 px-1">
                            {i===0 ? `${active.fromId?.fname} ${active.fromId?.lname} (Athlete)` : `${s?.fname||'Committee'} (Executive Leader)`} · {fmtTime(post.createdAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {active.status !== 'CLOSED' && (
                    <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex flex-col sm:flex-row gap-3">
                      <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={2} placeholder={`Type official committee reply to ${active.fromId?.fname}…`}
                        className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-sm text-white bg-[#1a1a24] outline-none focus:border-orange-500 resize-none font-medium" />
                      <button onClick={sendReply} disabled={sending||!reply}
                        className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm rounded-xl shadow transition-all disabled:opacity-40">
                        Dispatch Reply ↵
                      </button>
                    </div>
                  )}
                </>
            }
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
