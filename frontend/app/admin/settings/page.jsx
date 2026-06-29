'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardBody, Btn, Loading, toast } from '@/components/ui';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const [form, setForm]       = useState({ upiId: '', bankName: '', accountName: '', accountNo: '', ifsc: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.getSettings().then(r => {
      if (r.data) setForm(r.data);
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(form);
      toast('Bank & UPI Settings updated successfully ✓');
    } catch (err) {
      toast(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, placeholder) => (
    <div className="mb-4">
      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1.5">{label}</label>
      <input
        value={form[key] || ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-zinc-700 rounded-xl text-sm outline-none focus:border-orange-500 bg-[#1a1a22] text-white transition-colors placeholder:text-zinc-500"
      />
    </div>
  );

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">🏦 Bank & UPI Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">Configure Club bank account details & UPI QR payment destination</p>
      </div>

      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <span className="font-bold text-white text-base">Club Payment Details</span>
          </CardHeader>
          <CardBody className="p-4 sm:p-6">
            <form onSubmit={save}>
              {field('Club UPI ID / VPA', 'upiId', 'e.g. agnichakra@okaxis')}
              {field('Bank Name', 'bankName', 'e.g. HDFC Bank')}
              {field('Account Holder Name', 'accountName', 'e.g. Agnichakra Club')}
              {field('Account Number', 'accountNo', 'e.g. 50200012345678')}
              {field('IFSC Code', 'ifsc', 'e.g. HDFC0001234')}

              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
                <Btn type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto">
                  {saving ? 'Saving...' : 'Save Settings →'}
                </Btn>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}
