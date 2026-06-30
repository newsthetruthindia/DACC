'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Badge, Loading, toast } from '@/components/ui';
import { api, getUser, saveAuth, compressImage, resolveImgUrl } from '@/lib/api';

export default function ProfilePage() {
  const [user, setUser]       = useState(null);
  const [form, setForm]       = useState({ fname: '', lname: '', phone: '', city: '', selfieUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    api.myProfile().then(r => {
      if (r.data) {
        setUser(r.data);
        setForm({
          fname: r.data.fname || '',
          lname: r.data.lname || '',
          phone: r.data.phone || '',
          city: r.data.city || '',
          selfieUrl: r.data.selfieUrl || r.data.avatarUrl || '',
        });
        const token = localStorage.getItem('ac_token');
        if (token) saveAuth(token, r.data);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelfieChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 0.8);
      setForm(f => ({ ...f, selfieUrl: compressed }));
    } catch (err) {
      toast('Failed to read photo', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(form);
      toast('Profile updated successfully ✓');
      load();
    } catch (err) {
      toast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">👤 My Athlete Profile & KYC</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">Manage personal contact details and official club identity photo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Identity Card Preview */}
        <div className="lg:col-span-5">
          <Card className="bg-[#131318] border-zinc-800 overflow-hidden shadow-2xl relative">
            <div className="h-28 bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 relative p-4 flex justify-between items-start">
              <span className="text-xs font-black uppercase tracking-widest bg-black/40 text-white px-3 py-1 rounded-full border border-white/20">Official Club ID</span>
              <span className="text-xl">🔥</span>
            </div>
            
            <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center -mt-14">
              <div className="w-28 h-28 rounded-2xl bg-zinc-800 border-4 border-[#131318] shadow-2xl overflow-hidden flex items-center justify-center relative mb-4">
                {form.selfieUrl ? (
                  <img src={resolveImgUrl(form.selfieUrl)} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>

              <h2 className="text-xl font-black text-white">{user.fname} {user.lname}</h2>
              <div className="text-xs font-mono font-extrabold text-orange-400 mt-0.5 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">{user.memberId || 'AGC-MEMBER'}</div>

              <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-zinc-800/80 text-left">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Membership Policy</div>
                  <div className="mt-1 font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">1 Payment Policy</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Club Role</div>
                  <div className="mt-1"><Badge label={user.role} /></div>
                </div>
                <div className="mt-2">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Account Status</div>
                  <div className="mt-1"><Badge label={user.status} /></div>
                </div>
                <div className="mt-2">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Aadhaar Card</div>
                  <div className="text-xs font-mono text-zinc-300 mt-1 font-bold">{user.aadhaar ? `•••• ${user.aadhaar.slice(-4)}` : 'On File'}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Update Form */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <span className="font-bold text-white text-base">✏️ Edit Personal Information</span>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Selfie Update Section */}
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {form.selfieUrl ? <img src={resolveImgUrl(form.selfieUrl)} alt="Selfie" className="w-full h-full object-cover" /> : <span>📷</span>}
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="text-xs font-bold text-white mb-1">Update Selfie Photo</div>
                    <p className="text-xs text-zinc-400 mb-2">Upload a crisp photo for your official club identity badge.</p>
                    <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-600 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto">
                      <span>{form.selfieUrl ? '🔄 Replace Photo' : '➕ Upload Photo'}</span>
                      <input type="file" accept="image/*" capture="user" onChange={handleSelfieChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">First Name</label>
                    <input required value={form.fname} onChange={e=>setForm({...form, fname: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Last Name</label>
                    <input required value={form.lname} onChange={e=>setForm({...form, lname: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Registered Email (Read-only)</label>
                  <input disabled value={user.email} className="w-full px-4 py-3 border border-zinc-800 rounded-xl text-sm bg-zinc-900/60 text-zinc-400 font-medium cursor-not-allowed" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Phone Number</label>
                    <input required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">City / Location</label>
                    <input value={form.city} onChange={e=>setForm({...form, city: e.target.value})} className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm bg-[#1a1a22] text-white outline-none focus:border-orange-500" />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex justify-end">
                  <Btn type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto">
                    {saving ? 'Saving Changes…' : 'Save Profile Changes →'}
                  </Btn>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
