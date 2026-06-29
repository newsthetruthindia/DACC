'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Textarea, Loading, Empty, toast, Badge } from '@/components/ui';
import { api, fmtTime, getUser } from '@/lib/api';

export default function MessagesPage() {
  const [msgs, setMsgs]       = useState([]);
  const [active, setActive]   = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');
  const [reply, setReply]     = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const user = getUser();

  const load = () => api.myMessages().then(r => { setMsgs(r.data || []); }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const loadThread = async (id) => {
    const r = await api.getMessage(id);
    setActive(r.data);
  };

  const send = async () => {
    if (!subject || !body) { toast('Fill subject and message', 'error'); return; }
    setSending(true);
    try {
      await api.sendMessage({ subject, body });
      setSubject(''); setBody('');
      toast('Message dispatched to Core Panel ✓');
      load();
    } catch (err) { toast(err.message, 'error'); } finally { setSending(false); }
  };

  const sendReply = async () => {
    if (!reply || !active) return;
    setSending(true);
    try {
      await api.replyMessage(active._id, reply);
      setReply('');
      loadThread(active._id);
      toast('Reply sent ✓');
    } catch (err) { toast(err.message, 'error'); } finally { setSending(false); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-gradient-to-r from-[#14141c] via-[#1a1a26] to-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-2 uppercase tracking-wider">
            Private Member Helpdesk
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">💬 Write to Core Committee</h1>
          <p className="text-sm text-zinc-300 mt-1 font-medium">Direct confidential messaging line for inquiries, equipment requests, or feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: compose + history */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">📨 Dispatch New Inquiry</span>
            </CardHeader>
            <CardBody className="space-y-4 p-6">
              <Input label="Subject / Topic" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Turf booking or equipment query" />
              <Textarea label="Message Details" value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your full inquiry to the committee leaders…" rows={4} />
              <button onClick={send} disabled={sending}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50">
                {sending ? 'Sending…' : '🚀 Send Message to Panel →'}
              </button>
            </CardBody>
          </Card>

          <Card className="bg-[#13131a] border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">My Conversations ({msgs.length})</span>
            </CardHeader>
            <div className="divide-y divide-zinc-800/80 max-h-[350px] overflow-y-auto">
              {msgs.length === 0
                ? <div className="p-8"><Empty icon="✉️" title="No Previous Threads" sub="Your messages will appear here" /></div>
                : msgs.map(m => (
                  <div key={m._id} onClick={() => loadThread(m._id)}
                    className={`px-6 py-4 cursor-pointer transition-colors ${active?._id === m._id ? 'bg-orange-500/10 border-l-4 border-orange-500' : 'hover:bg-zinc-900/50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">{m.subject}</div>
                        <div className="text-xs text-zinc-400 mt-1">{fmtTime(m.createdAt)}</div>
                      </div>
                      <Badge label={m.status} />
                    </div>
                    {m.replies?.length > 0 && (
                      <div className="text-xs text-emerald-400 mt-2 font-bold flex items-center gap-1">
                        <span>💬</span> {m.replies.length} committee repl{m.replies.length===1?'y':'ies'}
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </Card>
        </div>

        {/* Right: thread view */}
        <div className="lg:col-span-7">
          <Card className="bg-[#13131a] border-zinc-800 shadow-xl flex flex-col h-full min-h-[550px]">
            <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/50">
              <span className="font-extrabold text-base text-white">
                {active ? `💬 Thread: ${active.subject}` : '💬 Conversation Viewer'}
              </span>
            </CardHeader>
            {!active
              ? <div className="flex-1 flex items-center justify-center p-12"><Empty icon="💬" title="Select a Thread" sub="Click any conversation on the left to read committee replies" /></div>
              : <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[450px]">
                    {[{ fromId: active.fromId, body: active.body, createdAt: active.createdAt }, ...active.replies].map((post, i) => {
                      const isMe = post.fromId?._id === user?.id || post.fromId === user?.id;
                      return (
                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed font-medium shadow-md ${
                            isMe ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-br-none' : 'bg-[#1e1e2c] text-zinc-100 rounded-bl-none border border-zinc-700'}`}>
                            {post.body}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-bold mt-1.5 px-1">
                            {isMe ? 'You' : `${post.fromId?.fname||'Committee'} (Executive Leader)`} · {fmtTime(post.createdAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {active.status !== 'CLOSED' && (
                    <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40 flex gap-3">
                      <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Type your reply to the committee…"
                        className="flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-sm text-white bg-[#1a1a24] outline-none focus:border-orange-500 resize-none font-medium" rows={2} />
                      <button onClick={sendReply} disabled={sending || !reply}
                        className="px-6 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm rounded-xl shadow transition-all disabled:opacity-40">
                        Reply ↵
                      </button>
                    </div>
                  )}
                  {active.status === 'CLOSED' && (
                    <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 font-bold text-center">
                      🔒 This thread has been marked closed by the committee.
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
