'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Loading, toast, Badge } from '@/components/ui';
import { api, PLANS, fmtDate, saveAuth, getUser } from '@/lib/api';

export default function ProfilePage() {
  const [user, setUser]     = useState(null);
  const [form, setForm]     = useState({ fname:'', lname:'', city:'', phone:'', aadhaar:'', selfieUrl:'' });
  const [oldPass, setOld]   = useState('');
  const [newPass, setNew]   = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myProfile().then(r => {
      setUser(r.data);
      setForm({ fname:r.data.fname, lname:r.data.lname, city:r.data.city||'', phone:r.data.phone, aadhaar:r.data.aadhaar||'', selfieUrl:r.data.selfieUrl||'', telegramChatId:r.data.telegramChatId||'', telegramUsername:r.data.telegramUsername||'' });
    }).finally(()=>setLoading(false));
  }, []);

  const handleSelfieChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Selfie image must be under 5 MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, selfieUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.updateProfile(form);
      const updated = { ...getUser(), ...r.data };
      saveAuth(localStorage.getItem('ac_token'), updated);
      setUser(updated);
      toast('Profile details updated successfully ✓');
    } catch (err) { toast(err.message,'error'); } finally { setSaving(false); }
  };

  const changePass = async () => {
    if (!oldPass||!newPass) { toast('Fill both password fields','error'); return; }
    setSaving(true);
    try {
      await api.changePassword({ oldPassword:oldPass, newPassword:newPass });
      setOld(''); setNew('');
      toast('Password changed successfully ✓');
    } catch (err) { toast(err.message,'error'); } finally { setSaving(false); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;
  if (!user)   return <AppLayout><Loading /></AppLayout>;

  const plan = PLANS[user.plan] || PLANS.SILVER;
  const initials = `${user.fname?.[0]||''}${user.lname?.[0]||''}`.toUpperCase();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white">👤 Member Identity & Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">Official Club Athlete Identification & Account Settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardBody className="text-center p-6">
            <div className="w-28 h-28 rounded-2xl mx-auto mb-4 overflow-hidden border-2 border-orange-500/50 shadow-xl bg-zinc-800 flex items-center justify-center relative">
              {form.selfieUrl || user.selfieUrl || user.avatarUrl ? (
                <img src={form.selfieUrl || user.selfieUrl || user.avatarUrl} alt="Member Selfie" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">{initials}</span>
              )}
            </div>
            <div className="font-extrabold text-xl text-white">{user.fname} {user.lname}</div>
            <div className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 py-1 px-3 rounded-full inline-block mt-2 mb-3">
              🆔 ID: {user.memberId || 'AGC-GENERATING'}
            </div>
            <div className="text-sm text-zinc-400 mb-4">{user.email}</div>
            
            <div className="flex justify-center gap-2 mb-5">
              <Badge label={user.plan} />
              <Badge label={user.status} />
            </div>

            <div className="h-px bg-zinc-800 my-5" />
            
            <div className="text-left space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-medium">Aadhaar Number</span>
                <span className="font-mono font-bold text-white tracking-wider">{user.aadhaar ? `•••• •••• ${user.aadhaar.slice(-4)}` : 'Not Linked'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-medium">Telegram Alert ID</span>
                <span className="font-mono font-bold text-emerald-400">{user.telegramChatId || 'Not Connected'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-medium">Committee Role</span>
                <span className="font-semibold text-white">{user.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-medium">Phone Contact</span>
                <span className="font-semibold text-white">{user.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-medium">City / Area</span>
                <span className="font-semibold text-white">{user.city || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-medium">Member Since</span>
                <span className="font-semibold text-white">{fmtDate(user.joinedAt)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile */}
          <Card>
            <CardHeader><span className="font-bold text-base text-white">✏️ Update Identity Details</span></CardHeader>
            <CardBody className="space-y-4">
              
              {/* Selfie Update */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-sm font-bold text-white">Update Member Selfie Photo</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Upload a clean front-facing selfie photo for ID verification.</div>
                </div>
                <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-600 cursor-pointer transition-all inline-flex items-center gap-2">
                  <span>📷 Upload New Selfie</span>
                  <input type="file" accept="image/*" capture="user" onChange={handleSelfieChange} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={form.fname} onChange={e=>setForm(f=>({...f,fname:e.target.value}))} />
                <Input label="Last Name"  value={form.lname} onChange={e=>setForm(f=>({...f,lname:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone Number" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
                <Input label="Aadhaar Card Number (12 Digits)" value={form.aadhaar} onChange={e=>setForm(f=>({...f,aadhaar:e.target.value}))} maxLength={12} placeholder="12-digit Aadhaar" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="City / Location"  value={form.city}  onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
                <Input label="Telegram Chat ID / Phone" value={form.telegramChatId} onChange={e=>setForm(f=>({...f,telegramChatId:e.target.value}))} placeholder="e.g. 123456789 or @handle" />
              </div>
              
              <div className="pt-2">
                <Btn onClick={save} disabled={saving}>{saving?'Saving Details…':'Save Profile Changes →'}</Btn>
              </div>
            </CardBody>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader><span className="font-bold text-base text-white">🔐 Security & Password</span></CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Current Password" type="password" value={oldPass} onChange={e=>setOld(e.target.value)} placeholder="••••••••" />
                <Input label="New Password"     type="password" value={newPass} onChange={e=>setNew(e.target.value)} placeholder="Min 6 characters" />
              </div>
              <div className="pt-2">
                <Btn onClick={changePass} disabled={saving} variant="ghost">{saving?'Changing…':'Update Password'}</Btn>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
