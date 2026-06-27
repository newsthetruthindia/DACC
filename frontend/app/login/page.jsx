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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setError(''); setLoading(true);
    try { await api.sendOtp(email); setOtpSent(true); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.verifyOtp({ email, code: otp });
      saveAuth(res.data.token, res.data.user);
      router.push('/dashboard');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const field = (label, props) => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">{label}</label>
      <input className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a] transition-colors" {...props} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔥</div>
          <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Agnichakra Club</h1>
          <p className="text-[#9a9890] text-sm mt-1">Member Portal — Login</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e0d8] shadow-sm p-8">
          <div className="flex bg-[#f5f4f0] rounded-xl p-1 mb-6">
            {['password','otp'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setOtpSent(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab===t?'bg-white text-[#1a1916] shadow-sm':'text-[#9a9890]'}`}>
                {t === 'password' ? 'Password' : 'Email OTP'}
              </button>
            ))}
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

          {tab === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {field('Email', { value:email, onChange:e=>setEmail(e.target.value), type:'email', placeholder:'you@email.com', required:true })}
              {field('Password', { value:pass, onChange:e=>setPass(e.target.value), type:'password', placeholder:'••••••••', required:true })}
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#1a1916] text-white rounded-xl font-bold text-sm hover:bg-[#2a2925] transition-colors disabled:opacity-50">
                {loading ? 'Logging in…' : 'Login →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">Email</label>
                <div className="flex gap-2">
                  <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@email.com"
                    className="flex-1 px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a]" />
                  <button type="button" onClick={handleSendOtp} disabled={loading||otpSent}
                    className="px-4 bg-[#c8410a] text-white rounded-xl text-sm font-bold disabled:opacity-50 whitespace-nowrap">
                    {otpSent ? 'Sent ✓' : 'Send OTP'}
                  </button>
                </div>
              </div>
              {otpSent && field('6-digit OTP', { value:otp, onChange:e=>setOtp(e.target.value), type:'text', placeholder:'482910', maxLength:6, className:'w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-xl font-mono text-center tracking-widest outline-none focus:border-[#c8410a]' })}
              <button type="submit" disabled={!otpSent||loading} className="w-full py-3 bg-[#1a1916] text-white rounded-xl font-bold text-sm hover:bg-[#2a2925] disabled:opacity-50">
                {loading ? 'Verifying…' : 'Verify & Login →'}
              </button>
            </form>
          )}
          <p className="text-center text-sm text-[#9a9890] mt-5">
            Not a member? <Link href="/register" className="text-[#c8410a] font-semibold">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
