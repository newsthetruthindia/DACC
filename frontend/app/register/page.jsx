'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth, PLANS } from '@/lib/api';
import { Btn } from '@/components/ui';

const PLAN_LIST = [
  { key:'SILVER',   features:['Member access','Event invites','Newsletter'] },
  { key:'GOLD',     features:['All Silver benefits','Priority seating','Voting rights'] },
  { key:'PLATINUM', features:['All Gold benefits','Panel eligibility','4 Guest passes/year'] },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]     = useState(1);
  const [plan, setPlan]     = useState('SILVER');
  const [form, setForm]     = useState({ fname:'', lname:'', email:'', phone:'', password:'', confirm:'', city:'', aadhaar:'', selfieUrl:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [upiData, setUpiData] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSelfieChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Selfie photo must be under 5 MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, selfieUrl: reader.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const goToPlan = (e) => {
    e.preventDefault(); setError('');
    if (!form.fname || !form.lname || !form.email || !form.phone || !form.password || !form.aadhaar)
      return setError('All fields are mandatory');
    if (!/^\d{12}$/.test(form.aadhaar.trim()))
      return setError('Aadhaar number must be exactly 12 digits');
    if (!form.selfieUrl)
      return setError('Please upload your profile selfie photo');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setStep(2);
  };

  const handleRegister = async () => {
    setError(''); setLoading(true);
    try {
      const res = await api.register({ ...form, plan });
      setUpiData(res.data);
      saveAuth(res.data.token, { ...form, plan, role:'MEMBER', status:'PENDING', id: res.data.userId });
      setStep(3);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const field = (label, key, type='text', placeholder='', maxLen) => (
    <div>
      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">{label}</label>
      <input value={form[key]} onChange={set(key)} type={type} placeholder={placeholder} maxLength={maxLen}
        className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500 transition-all placeholder:text-zinc-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-6 text-zinc-100">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg mb-3">
            🔥
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Join Agnichakra Club</h1>
          <p className="text-zinc-400 text-sm mt-1">Step {step} of 3 · Official Portal Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1,2,3].map((s,i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s ? 'bg-orange-500 text-white shadow' : 'bg-zinc-800 text-zinc-500'}`}>{s}</div>
              {i < 2 && <div className={`h-1 flex-1 rounded-full ${step > s ? 'bg-orange-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#131318] rounded-2xl border border-zinc-800 shadow-2xl p-6 sm:p-8">
          {error && <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2"><span>❌</span><span>{error}</span></div>}

          {/* STEP 1 — Personal & Identity Details */}
          {step === 1 && (
            <form onSubmit={goToPlan} className="space-y-4">
              <h2 className="font-bold text-white text-base mb-3">Identity & Contact Details</h2>
              
              {/* Selfie Upload Section */}
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                  {form.selfieUrl ? (
                    <img src={form.selfieUrl} alt="Selfie Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-bold text-white mb-1">Member Selfie Photo <span className="text-orange-400">*</span></label>
                  <p className="text-xs text-zinc-400 mb-2.5">Upload a clear front-facing selfie or capture from mobile camera.</p>
                  <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-600 cursor-pointer inline-flex items-center gap-1.5 transition-all">
                    <span>{form.selfieUrl ? '🔄 Change Photo' : '➕ Upload / Take Selfie'}</span>
                    <input type="file" accept="image/*" capture="user" onChange={handleSelfieChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {field('First Name *','fname','text','Arjun')}
                {field('Last Name *','lname','text','Sen')}
              </div>
              
              {/* Aadhaar Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Aadhaar Card Number (Mandatory) *</label>
                <input value={form.aadhaar} onChange={set('aadhaar')} type="text" placeholder="12-digit Aadhaar Number" maxLength={12}
                  className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white font-mono tracking-widest outline-none focus:border-orange-500 placeholder:text-zinc-500 placeholder:tracking-normal placeholder:font-sans" />
              </div>

              {field('Email Address *','email','email','you@email.com')}
              <div className="grid grid-cols-2 gap-3">
                {field('Phone Number *','phone','tel','9876543210', 10)}
                {field('City / Area *','city','text','Kolkata')}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {field('Password *','password','password','Min 6 chars')}
                {field('Confirm Password *','confirm','password','Re-enter')}
              </div>
              
              <button type="submit" className="w-full py-3.5 primary-btn rounded-xl font-bold text-sm shadow-lg mt-4">
                Continue to Plan →
              </button>
              <p className="text-center text-sm text-zinc-400 mt-3">
                Already a registered member? <Link href="/login" className="text-orange-400 font-semibold hover:underline">Login</Link>
              </p>
            </form>
          )}

          {/* STEP 2 — Choose Plan */}
          {step === 2 && (
            <div>
              <h2 className="font-bold text-white text-base mb-1">Select Membership Plan</h2>
              <p className="text-zinc-400 text-xs mb-5">Choose your division for the club season.</p>
              <div className="space-y-3 mb-6">
                {PLAN_LIST.map(p => {
                  const info = PLANS[p.key];
                  const active = plan === p.key;
                  return (
                    <div key={p.key} onClick={() => setPlan(p.key)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        active ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{info.label} Plan</span>
                          {active && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SELECTED</span>}
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {p.features.map((f,i) => <li key={i} className="text-xs text-zinc-400">✓ {f}</li>)}
                        </ul>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-white">₹{info.price}</div>
                        <div className="text-[10px] text-zinc-400 font-medium">per month</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-sm transition-all">← Back</button>
                <button onClick={handleRegister} disabled={loading} className="flex-1 py-3.5 primary-btn rounded-xl font-bold text-sm shadow-lg disabled:opacity-50">
                  {loading ? 'Registering...' : 'Register & Pay Season Dues →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Payment */}
          {step === 3 && upiData && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                ✓
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Registration Complete!</h2>
              <p className="text-zinc-400 text-sm mb-6">Unique ID generated. Pay your first contribution to unlock active status.</p>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
                <div className="text-xs text-zinc-400">Contribution Amount</div>
                <div className="text-2xl font-extrabold text-orange-400 mt-1">₹{upiData.amount}</div>
                <div className="text-xs text-zinc-500 mt-2 font-mono break-all select-all">{upiData.upiLink}</div>
              </div>

              <div className="space-y-3">
                <a href={upiData.upiLink} className="w-full py-3.5 primary-btn rounded-xl font-bold text-sm block shadow-lg no-underline text-center">
                  💳 Pay Now via UPI App
                </a>
                <button onClick={() => router.push('/dashboard')} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-sm transition-all">
                  Proceed to Dashboard →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
