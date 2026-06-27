'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth, PLANS } from '@/lib/api';

const PLAN_LIST = [
  { key:'SILVER',   features:['Member access','Event invites','Newsletter'] },
  { key:'GOLD',     features:['All Silver benefits','Priority seating','Voting rights'] },
  { key:'PLATINUM', features:['All Gold benefits','Panel eligibility','4 Guest passes/year'] },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]     = useState(1);
  const [plan, setPlan]     = useState('SILVER');
  const [form, setForm]     = useState({ fname:'', lname:'', email:'', phone:'', password:'', confirm:'', city:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [upiData, setUpiData] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const goToPlan = (e) => {
    e.preventDefault(); setError('');
    if (!form.fname || !form.lname || !form.email || !form.phone || !form.password)
      return setError('All fields are required');
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

  const field = (label, key, type='text', placeholder='') => (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#9a9890] mb-1.5">{label}</label>
      <input value={form[key]} onChange={set(key)} type={type} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e2e0d8] rounded-xl text-sm outline-none focus:border-[#c8410a] transition-colors" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔥</div>
          <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Join Agnichakra Club</h1>
          <p className="text-[#9a9890] text-sm mt-1">Step {step} of 3</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1,2,3].map((s,i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s ? 'bg-[#1a1916] text-white' : 'bg-[#e2e0d8] text-[#9a9890]'}`}>{s}</div>
              {i < 2 && <div className={`h-0.5 flex-1 ${step > s ? 'bg-[#1a1916]' : 'bg-[#e2e0d8]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e0d8] shadow-sm p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}

          {/* STEP 1 — Personal Details */}
          {step === 1 && (
            <form onSubmit={goToPlan} className="space-y-4">
              <h2 className="font-bold text-[#1a1916] mb-2">Personal Details</h2>
              <div className="grid grid-cols-2 gap-3">
                {field('First Name','fname','text','Arjun')}
                {field('Last Name','lname','text','Sen')}
              </div>
              {field('Email Address','email','email','you@email.com')}
              {field('Phone Number','phone','tel','9876543210')}
              {field('City / Area','city','text','Kolkata')}
              <div className="grid grid-cols-2 gap-3">
                {field('Password','password','password','Min 6 chars')}
                {field('Confirm Password','confirm','password','Re-enter')}
              </div>
              <button type="submit" className="w-full py-3 bg-[#1a1916] text-white rounded-xl font-bold text-sm hover:bg-[#2a2925] transition-colors mt-2">
                Continue to Plan →
              </button>
              <p className="text-center text-sm text-[#9a9890]">
                Already a member? <Link href="/login" className="text-[#c8410a] font-semibold">Login</Link>
              </p>
            </form>
          )}

          {/* STEP 2 — Choose Plan */}
          {step === 2 && (
            <div>
              <h2 className="font-bold text-[#1a1916] mb-1">Choose Your Plan</h2>
              <p className="text-sm text-[#9a9890] mb-5">You can upgrade anytime from your dashboard.</p>
              <div className="space-y-3 mb-5">
                {PLAN_LIST.map(p => {
                  const pl = PLANS[p.key];
                  return (
                    <div key={p.key} onClick={() => setPlan(p.key)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${plan===p.key ? 'border-[#c8410a] bg-[#fff8f5]' : 'border-[#e2e0d8] hover:border-[#9a9890]'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${plan===p.key ? 'border-[#c8410a]' : 'border-[#9a9890]'}`}>
                            {plan===p.key && <div className="w-2 h-2 rounded-full bg-[#c8410a]" />}
                          </div>
                          <span className="font-bold text-[#1a1916]">{pl.label}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ background: pl.bg, color: pl.color }}>{p.key}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-extrabold font-mono text-[#c8410a]">₹{pl.price}</span>
                          <span className="text-xs text-[#9a9890]">/mo</span>
                        </div>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {p.features.map(f => (
                          <li key={f} className="text-xs text-[#4a4840] flex items-center gap-1.5">
                            <span className="text-green-600 font-bold">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800">
                💳 After registration, pay via UPI to activate membership. Panel confirms your payment.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 py-3 border border-[#e2e0d8] text-[#4a4840] rounded-xl font-semibold text-sm hover:border-[#1a1916] transition-colors">
                  ← Back
                </button>
                <button onClick={handleRegister} disabled={loading}
                  className="flex-1 py-3 bg-[#c8410a] text-white rounded-xl font-bold text-sm hover:bg-[#a83408] transition-colors disabled:opacity-50">
                  {loading ? 'Registering…' : `Register as ${PLANS[plan].label} →`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Pay */}
          {step === 3 && upiData && (
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="font-extrabold text-[#1a1916] text-lg mb-1">Registration Successful!</h2>
              <p className="text-sm text-[#9a9890] mb-6">Pay ₹{upiData.amount} to activate your {PLANS[plan].label} membership.</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[{n:'Google Pay',i:'🟢'},{n:'PhonePe',i:'🟣'},{n:'Paytm',i:'🔵'},{n:'BHIM UPI',i:'🇮🇳'}].map(app => (
                  <a key={app.n} href={upiData.upiLink}
                    className="border-2 border-[#e2e0d8] rounded-xl p-4 text-center hover:border-[#c8410a] transition-all block">
                    <div className="text-3xl mb-1.5">{app.i}</div>
                    <div className="text-xs font-bold text-[#1a1916]">{app.n}</div>
                  </a>
                ))}
              </div>
              <div className="bg-[#f5f4f0] border border-[#e2e0d8] rounded-lg p-3 font-mono text-[11px] text-[#4a4840] break-all mb-5 text-left">
                {upiData.upiLink}
              </div>
              <p className="text-xs text-[#9a9890] mb-5">After paying, submit your UTR number from your dashboard. Panel will confirm within 24 hours.</p>
              <button onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-[#1a1916] text-white rounded-xl font-bold text-sm hover:bg-[#2a2925] transition-colors">
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
