'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Input, Loading, toast } from '@/components/ui';
import { api, PLANS, fmtDate, saveAuth, getUser } from '@/lib/api';

export default function ProfilePage() {
  const [user, setUser]     = useState(null);
  const [form, setForm]     = useState({ fname:'', lname:'', city:'', phone:'' });
  const [oldPass, setOld]   = useState('');
  const [newPass, setNew]   = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myProfile().then(r => {
      setUser(r.data);
      setForm({ fname:r.data.fname, lname:r.data.lname, city:r.data.city||'', phone:r.data.phone });
    }).finally(()=>setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.updateProfile(form);
      const updated = { ...getUser(), ...r.data };
      saveAuth(localStorage.getItem('ac_token'), updated);
      toast('Profile updated ✓');
    } catch (err) { toast(err.message,'error'); } finally { setSaving(false); }
  };

  const changePass = async () => {
    if (!oldPass||!newPass) { toast('Fill both password fields','error'); return; }
    setSaving(true);
    try {
      await api.changePassword({ oldPassword:oldPass, newPassword:newPass });
      setOld(''); setNew('');
      toast('Password changed ✓');
    } catch (err) { toast(err.message,'error'); } finally { setSaving(false); }
  };

  if (loading) return <AppLayout><Loading /></AppLayout>;
  if (!user)   return <AppLayout><Loading /></AppLayout>;

  const plan = PLANS[user.plan] || PLANS.SILVER;
  const initials = `${user.fname?.[0]||''}${user.lname?.[0]||''}`.toUpperCase();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">My Profile</h1>
        <p className="text-sm text-[#9a9890] mt-1">Manage your account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <Card>
          <CardBody className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4"
              style={{ background:plan.bg, color:plan.color }}>
              {initials}
            </div>
            <div className="font-bold text-lg text-[#1a1916]">{user.fname} {user.lname}</div>
            <div className="text-sm text-[#9a9890] mb-3">{user.email}</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background:plan.bg, color:plan.color }}>
              💎 {plan.label} Member
            </div>
            <div className="h-px bg-[#e2e0d8] my-4" />
            <div className="text-left space-y-2 text-sm">
              {[
                ['Role',         user.role],
                ['Status',       user.status],
                ['Phone',        user.phone],
                ['City',         user.city||'—'],
                ['Member since', fmtDate(user.joinedAt)],
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between">
                  <span className="text-[#9a9890]">{k}</span>
                  <span className="font-semibold text-[#1a1916] text-right">{v}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-5">
          {/* Edit profile */}
          <Card>
            <CardHeader><span className="font-bold text-sm text-[#1a1916]">Edit Profile</span></CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={form.fname} onChange={e=>setForm(f=>({...f,fname:e.target.value}))} />
                <Input label="Last Name"  value={form.lname} onChange={e=>setForm(f=>({...f,lname:e.target.value}))} />
              </div>
              <Input label="Phone" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
              <Input label="City"  value={form.city}  onChange={e=>setForm(f=>({...f,city:e.target.value}))} />
              <Btn onClick={save} disabled={saving}>{saving?'Saving…':'Save Changes'}</Btn>
            </CardBody>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader><span className="font-bold text-sm text-[#1a1916]">Change Password</span></CardHeader>
            <CardBody className="space-y-4">
              <Input label="Current Password" type="password" value={oldPass} onChange={e=>setOld(e.target.value)} placeholder="••••••••" />
              <Input label="New Password"     type="password" value={newPass} onChange={e=>setNew(e.target.value)} placeholder="Min 6 characters" />
              <Btn onClick={changePass} disabled={saving} variant="ghost">{saving?'Changing…':'Change Password'}</Btn>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
