'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Textarea, Loading, Empty, toast } from '@/components/ui';
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
      toast('Message sent to panel ✓');
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
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Write to Panel</h1>
        <p className="text-sm text-[#9a9890] mt-1">Send messages, requests, or complaints to the core panel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: compose + history */}
        <div className="space-y-5">
          <Card>
            <CardHeader><span className="font-bold text-sm text-[#1a1916]">📨 New Message</span></CardHeader>
            <CardBody className="space-y-3">
              <Input label="Subject" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Request for event support" />
              <Textarea label="Message" value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your message to the panel…" rows={5} />
              <Btn onClick={send} disabled={sending}>{sending ? 'Sending…' : 'Send Message →'}</Btn>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><span className="font-bold text-sm text-[#1a1916]">My Previous Messages</span></CardHeader>
            {msgs.length === 0
              ? <Empty icon="✉" title="No messages yet" sub="Your messages to the panel will appear here" />
              : msgs.map(m => (
                <div key={m._id} onClick={() => loadThread(m._id)}
                  className={`px-5 py-3.5 border-b border-[#e2e0d8] last:border-0 cursor-pointer hover:bg-[#fafaf7] transition-colors ${active?._id === m._id ? 'bg-[#fff8f5]' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#1a1916] truncate">{m.subject}</div>
                      <div className="text-xs text-[#9a9890] mt-0.5">{fmtTime(m.createdAt)}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      m.status==='REPLIED' ? 'bg-green-50 text-green-700' :
                      m.status==='CLOSED'  ? 'bg-gray-100 text-gray-500' :
                      'bg-amber-50 text-amber-700'}`}>
                      {m.status}
                    </span>
                  </div>
                  {m.replies?.length > 0 && (
                    <div className="text-xs text-green-700 mt-1 font-medium">
                      💬 {m.replies.length} repl{m.replies.length===1?'y':'ies'}
                    </div>
                  )}
                </div>
              ))
            }
          </Card>
        </div>

        {/* Right: thread */}
        <Card className="flex flex-col" style={{ minHeight: 400 }}>
          <CardHeader>
            <span className="font-bold text-sm text-[#1a1916]">
              {active ? `💬 ${active.subject}` : '💬 Thread View'}
            </span>
          </CardHeader>
          {!active
            ? <Empty icon="💬" title="Select a message" sub="Click a message on the left to view the thread" />
            : <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 400 }}>
                  {/* Original message */}
                  {[{ fromId: active.fromId, body: active.body, createdAt: active.createdAt }, ...active.replies].map((post, i) => {
                    const isMe = post.fromId?._id === user?.id || post.fromId === user?.id;
                    return (
                      <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMe ? 'bg-[#1a1916] text-white rounded-br-sm' : 'bg-[#f5f4f0] text-[#1a1916] rounded-bl-sm border border-[#e2e0d8]'}`}>
                          {post.body}
                        </div>
                        <div className={`text-[10px] text-[#9a9890] mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {isMe ? 'You' : `${post.fromId?.fname||''} (Panel)`} · {fmtTime(post.createdAt)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {active.status !== 'CLOSED' && (
                  <div className="p-4 border-t border-[#e2e0d8] flex gap-2">
                    <textarea value={reply} onChange={e=>setReply(e.target.value)} placeholder="Continue the conversation…"
                      className="flex-1 px-3 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a] resize-none" rows={2} />
                    <Btn onClick={sendReply} disabled={sending || !reply}>→</Btn>
                  </div>
                )}
                {active.status === 'CLOSED' && (
                  <div className="px-5 py-3 border-t border-[#e2e0d8] text-xs text-[#9a9890] text-center">This thread has been closed by the panel.</div>
                )}
              </>
          }
        </Card>
      </div>
    </AppLayout>
  );
}
