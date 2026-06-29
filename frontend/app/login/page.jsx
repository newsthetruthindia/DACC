'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]         = useState('password');
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [otp, setOtp]         = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      saveAuth(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err) { setError(err.message || 'Login failed'); } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!email) { setError('Enter your registered email address first'); return; }
    setError(''); setLoading(true);
    try { await api.sendOtp(email); setOtpSent(true); } catch (err) { setError(err.message || 'Failed to send OTP'); } finally { setLoading(false); }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.verifyOtp({ email, code: otp });
      saveAuth(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err) { setError(err.message || 'Invalid OTP'); } finally { setLoading(false); }
  };

  const field = (label, props) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">{label}</label>
      <input className="w-full px-4 py-3.5 bg-[#1a1a24] border border-zinc-700 rounded-xl text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-500 shadow-inner font-medium" {...props} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-orange-600/20 to-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-orange-500/20 border border-orange-400/30">🔥</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Agnichakra Club</h1>
          <p className="text-zinc-400 text-sm mt-1 font-semibold">Official Sports Athlete & Portal Login</p>
        </div>

        <div className="bg-[#13131a] rounded-3xl border border-zinc-800 shadow-2xl p-8 backdrop-blur-xl">
          <div className="flex bg-[#1a1a24] rounded-2xl p-1.5 mb-8 border border-zinc-800">
            {['password','otp'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setOtpSent(false); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${tab===t?'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md':'text-zinc-400 hover:text-white'}`}>
                {t === 'password' ? '🔑 Password Login' : '📧 Email OTP Login'}
              </button>
            ))}
          </div>

          {error && <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl px-4 py-3.5 mb-6 flex items-center gap-2 animate-shake"><span>❌</span> {error}</div>}

          {tab === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {field('Email Address', { value:email, onChange:e=>setEmail(e.target.value), type:'email', placeholder:'athlete@club.com', required:true })}
              {field('Password', { value:pass, onChange:e=>setPass(e.target.value), type:'password', placeholder:'••••••••', required:true })}
              <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-black text-sm shadow-xl shadow-orange-500/20 transition-all disabled:opacity-50">
                {loading ? 'Authenticating Athlete…' : '🚀 Enter Club Portal →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Registered Email</label>
                <div className="flex gap-2">
                  <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="athlete@club.com" required disabled={otpSent}
                    className="flex-1 px-4 py-3.5 bg-[#1a1a24] border border-zinc-700 rounded-xl text-sm text-white outline-none focus:border-orange-500 font-medium disabled:opacity-50" />
                  <button type="button" onClick={handleSendOtp} disabled={loading || otpSent}
                    className="px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs rounded-xl border border-zinc-700 transition-all disabled:opacity-40">
                    {otpSent ? '✓ OTP Sent' : 'Get OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">Enter 6-Digit OTP</label>
                  <input value={otp} onChange={e=>setOtp(e.target.value)} type="text" placeholder="123456" maxLength={6} required
                    className="w-full px-4 py-3.5 bg-[#1a1a24] border border-orange-500 rounded-xl text-center text-lg tracking-widest text-white font-mono font-bold outline-none shadow-inner" />
                </div>
              )}

              <button type="submit" disabled={loading || !otpSent} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-black text-sm shadow-xl shadow-orange-500/20 transition-all disabled:opacity-40">
                {loading ? 'Verifying Code…' : '✓ Verify & Login →'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center text-xs text-zinc-400 font-medium">
            New athlete to the club?{' '}
            <Link href="/register" className="text-orange-400 font-extrabold hover:underline">Register Membership →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
