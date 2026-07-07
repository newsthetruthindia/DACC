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
    <div className="space-y-2">
      <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-300 ml-1">{label}</label>
      <input className="w-full px-4.5 py-4 bg-[#141420]/90 border border-white/[0.1] rounded-2xl text-sm text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all placeholder:text-zinc-500 shadow-inner font-semibold" {...props} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-grid-pattern">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] bg-gradient-to-tr from-orange-600/15 via-red-600/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-amber-500/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 my-auto items-center py-6">
        
        {/* Left Panel: Club Showcase Grid */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-6 animate-fade-in pr-0 lg:pr-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 px-4 py-2 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            <span className="text-orange-400 text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-widest">
              🥇 Premier Sports Club Portal
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Elevate Your Experience at <br />
            <span className="text-gradient-amber">Agnichakra Sports Club</span>
          </h1>
          
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Welcome to the official, secure membership portal. Access your club dashboard, review monthly contributions, verify status, and participate in community sports events.
          </p>

          {/* Stats/Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl pt-2">
            <div className="bg-[#101018]/50 border border-white/[0.06] p-5 rounded-2xl backdrop-blur-md hover:border-orange-500/35 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform w-fit">🏛️</span>
              <h3 className="text-white font-bold text-sm mb-1">Established 1962</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Over six decades of promoting athletic excellence and regional community sports.</p>
            </div>
            
            <div className="bg-[#101018]/50 border border-white/[0.06] p-5 rounded-2xl backdrop-blur-md hover:border-orange-500/35 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform w-fit">👥</span>
              <h3 className="text-white font-bold text-sm mb-1">Club Membership</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Flat monthly contribution of ₹1100. Easy payments and transparent ledger accounts.</p>
            </div>

            <div className="bg-[#101018]/50 border border-white/[0.06] p-5 rounded-2xl backdrop-blur-md hover:border-orange-500/35 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform w-fit">🛡️</span>
              <h3 className="text-white font-bold text-sm mb-1">Secure OTP System</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">No password? Securely access your profile instantly using your registered email OTP.</p>
            </div>

            <div className="bg-[#101018]/50 border border-white/[0.06] p-5 rounded-2xl backdrop-blur-md hover:border-orange-500/35 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform w-fit">🪪</span>
              <h3 className="text-white font-bold text-sm mb-1">Selfie Verification</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">Mandatory Aadhaar card and live selfie uploads ensure secure, verified identity checks.</p>
            </div>
          </div>
        </div>

        {/* Right Panel: Glassmorphic Login Portal Card */}
        <div className="lg:col-span-5 w-full max-w-[460px] mx-auto lg:mx-0">
          <div className="bg-[#101018]/85 rounded-[36px] border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-9 backdrop-blur-3xl relative overflow-hidden">
            {/* Subtle Top Gradient Bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-600" />

            {/* Brand Header inside form card */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#1d1d2b] to-[#12121a] border border-white/[0.15] p-2 flex items-center justify-center mx-auto mb-3.5 shadow-lg relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/logo.png" alt="DACC Agnichakra Logo" className="w-full h-full object-contain drop-shadow" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">DACC Agnichakra</h2>
              <p className="text-orange-400 text-[10px] font-mono font-extrabold tracking-wider uppercase mt-1">
                ESTD 1962 · REG NO S/2L/33113
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-[#161622] rounded-2xl p-1.5 mb-6 border border-white/[0.08] shadow-inner">
              {['password','otp'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); setOtpSent(false); }}
                  className={`flex-1 py-3 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 truncate px-2 ${
                    tab===t 
                      ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 text-white shadow-lg shadow-orange-500/25 scale-[1.02]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}>
                  {t === 'password' ? '🔑 Password' : '📧 Email OTP'}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-bold rounded-2xl px-4.5 py-3.5 mb-5 flex items-center gap-3 shadow break-words">
                <span className="text-base">❌</span> <span className="flex-1">{error}</span>
              </div>
            )}

            {tab === 'password' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {field('Email Address', { value:email, onChange:e=>setEmail(e.target.value), type:'email', placeholder:'athlete@club.com', required:true })}
                {field('Password', { value:pass, onChange:e=>setPass(e.target.value), type:'password', placeholder:'••••••••', required:true })}
                
                <div className="pt-2">
                  <button type="submit" disabled={loading} 
                    className="w-full py-4.5 primary-btn rounded-2xl font-black text-sm shadow-xl shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Authenticating Athlete…
                      </span>
                    ) : '🚀 Enter Club Portal →'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-300 ml-1">Registered Email</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="athlete@club.com" required disabled={otpSent}
                      className="w-full sm:flex-1 px-4.5 py-4 bg-[#141420]/90 border border-white/[0.1] rounded-2xl text-sm text-white outline-none focus:border-orange-500 font-semibold disabled:opacity-50 shadow-inner" />
                    <button type="button" onClick={handleSendOtp} disabled={loading || otpSent}
                      className="w-full sm:w-auto px-5 py-3.5 bg-[#1e1e2d] hover:bg-[#28283a] text-white font-black text-xs rounded-2xl border border-white/[0.12] transition-all disabled:opacity-40 whitespace-nowrap shadow">
                      {otpSent ? '✓ Sent' : 'Get OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="animate-fade-in space-y-2 pt-1">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-300 ml-1">Enter 6-Digit OTP</label>
                    <input value={otp} onChange={e=>setOtp(e.target.value)} type="text" placeholder="123456" maxLength={6} required
                      className="w-full px-4 py-3.5 bg-[#141420]/90 border-2 border-orange-500 rounded-2xl text-center text-xl tracking-[0.4em] text-white font-mono font-black outline-none shadow-inner focus:ring-4 focus:ring-orange-500/20 transition-all" />
                    <p className="text-[10px] text-zinc-400 text-center pt-1">Check inbox or spam folder for verification code.</p>
                  </div>
                )}

                {otpSent && (
                  <div className="pt-2">
                    <button type="submit" disabled={loading} 
                      className="w-full py-4.5 primary-btn rounded-2xl font-black text-sm shadow-xl shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? 'Verifying Code…' : '✓ Verify & Unlock Portal'}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Registration Redirect Link */}
            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center text-xs text-zinc-400">
              Not registered as a member yet?{' '}
              <Link href="/register" className="text-orange-400 hover:text-orange-300 font-extrabold transition-colors hover:underline">
                Join the Club / Register →
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-6 text-[11px] font-semibold text-zinc-600">
            Agnichakra Sports Club · Confidential Member Portal
          </div>
        </div>

      </div>
    </div>
  );
}

