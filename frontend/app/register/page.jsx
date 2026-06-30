'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth, PLANS, compressImage, resolveImgUrl } from '@/lib/api';
import { Btn } from '@/components/ui';

const PLAN_LIST = [
  { key:'REGULAR', features:['Full Portal & Community Access','Event Invites & Club Voting Rights','Standard ₹100/Month Dues','Optional One-Time Club Donation Supported'] },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]     = useState(1);
  const [plan, setPlan]     = useState('REGULAR');
  const [form, setForm]     = useState({ fname:'', lname:'', email:'', phone:'', password:'', confirm:'', city:'', aadhaar:'', selfieUrl:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [upiData, setUpiData] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSelfieChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 0.8);
      setForm(f => ({ ...f, selfieUrl: compressed }));
      setError('');
    } catch (err) {
      setError('Failed to read and compress photo');
    }
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
    <div className="w-full">
      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">{label}</label>
      <input value={form[key]} onChange={set(key)} type={type} placeholder={placeholder} maxLength={maxLen}
        className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500 transition-all placeholder:text-zinc-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-3 sm:p-6 text-zinc-100 my-auto py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <img src="/logo.png" alt="DACC Agnichakra Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">DACC Agnichakra Club</h1>
          <p className="text-zinc-400 text-xs mt-1">ESTD - 1962 · REG NO - S/2L/33113</p>
          <p className="text-zinc-500 text-xs mt-1">Step {step} of 3 · Official Portal Registration</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {[1,2,3].map((s,i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s ? 'bg-orange-500 text-white shadow' : 'bg-zinc-800 text-zinc-500'}`}>{s}</div>
              {i < 2 && <div className={`h-1 flex-1 rounded-full ${step > s ? 'bg-orange-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#131318] rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-2xl p-4 sm:p-8">
          {error && <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2 break-words"><span>❌</span><span className="flex-1">{error}</span></div>}

          {/* STEP 1 — Personal & Identity Details */}
          {step === 1 && (
            <form onSubmit={goToPlan} className="space-y-4">
              <h2 className="font-bold text-white text-base mb-3">Identity & Contact Details</h2>
              
              {/* Selfie Upload Section */}
              <div className="p-3.5 sm:p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                  {form.selfieUrl ? (
                    <img src={resolveImgUrl(form.selfieUrl)} alt="Selfie Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <label className="block text-xs font-bold text-white mb-1">Member Selfie Photo <span className="text-orange-400">*</span></label>
                  <p className="text-xs text-zinc-400 mb-2.5">Upload a clear front-facing selfie or capture from mobile camera.</p>
                  <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-600 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto">
                    <span>{form.selfieUrl ? '🔄 Change Photo' : '➕ Upload / Take Selfie'}</span>
                    <input type="file" accept="image/*" capture="user" onChange={handleSelfieChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('Phone Number *','phone','tel','9876543210', 10)}
                {field('City / Area *','city','text','Kolkata')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('Password *','password','password','Min 6 chars')}
                {field('Confirm Password *','confirm','password','Re-enter')}
              </div>
              
              <button type="submit" className="w-full py-3.5 primary-btn rounded-xl font-bold text-sm shadow-lg mt-6">
                Continue to Plan →
              </button>
              <p className="text-center text-xs sm:text-sm text-zinc-400 mt-4">
                Already a registered member? <Link href="/login" className="text-orange-400 font-semibold hover:underline">Login</Link>
              </p>
            </form>
          )}

          {/* STEP 2 — Choose Plan */}
          {step === 2 && (
            <div>
              <h2 className="font-bold text-white text-base mb-1">Confirm Standard Membership</h2>
              <p className="text-zinc-400 text-xs mb-5">All club members enjoy equal privileges at a flat ₹100/month contribution.</p>
              <div className="space-y-3 mb-6">
                {PLAN_LIST.map(p => {
                  const info = PLANS[p.key] || PLANS.REGULAR;
                  const active = plan === p.key;
                  return (
                    <div key={p.key} onClick={() => setPlan(p.key)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        active ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{info.label}</span>
                          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE PLAN</span>
                        </div>
                        <ul className="mt-1.5 space-y-1 sm:space-y-0.5">
                          {p.features.map((f,i) => <li key={i} className="text-xs text-zinc-300 sm:text-zinc-400">✓ {f}</li>)}
                        </ul>
                      </div>
                      <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-0 border-zinc-800/80 flex sm:block justify-between items-baseline">
                        <div className="text-xs text-zinc-400 sm:hidden">Price:</div>
                        <div>
                          <span className="text-2xl font-black text-white">₹100</span>
                          <span className="text-[10px] text-zinc-400 font-medium ml-1 sm:ml-0 sm:block">per month</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 mb-6 text-xs text-orange-200">
                💡 <strong className="text-white">Note:</strong> You can also contribute a one-time voluntary club donation of any amount anytime from your dashboard after registration.
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setStep(1)} className="w-full sm:w-auto px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-sm transition-all order-2 sm:order-1">← Back</button>
                <button onClick={handleRegister} disabled={loading} className="w-full sm:flex-1 py-3.5 primary-btn rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 order-1 sm:order-2">
                  {loading ? 'Registering...' : 'Register & Pay Initial ₹100 Dues →'}
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
