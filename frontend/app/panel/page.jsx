'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardBody, Loading, Empty } from '@/components/ui';
import { PLANS } from '@/lib/api';

export default function PanelPage() {
  const [panel, setPanel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/api').then(({ api }) =>
      api.panel().then(r => setPanel(r.data || [])).finally(() => setLoading(false))
    );
  }, []);

  if (loading) return <AppLayout><Loading /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1916] tracking-tight">Core Panel 2025–26</h1>
        <p className="text-sm text-[#9a9890] mt-1">The elected panel manages the club for this term</p>
      </div>

      {panel.length === 0
        ? <Card><Empty icon="👥" title="Panel not yet assigned" sub="Admin will assign panel members soon" /></Card>
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {panel.map(p => {
              const u = p.userId;
              const pl = PLANS[u?.plan] || PLANS.SILVER;
              return (
                <Card key={p._id}>
                  <CardBody className="text-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3"
                      style={{ background: pl.bg, color: pl.color }}>
                      {(u?.fname?.[0]||'')+(u?.lname?.[0]||'')}
                    </div>
                    <div className="font-bold text-sm text-[#1a1916]">{u?.fname} {u?.lname}</div>
                    <div className="text-xs font-bold text-[#c8410a] mt-0.5">{p.panelRole}</div>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: pl.bg, color: pl.color }}>{pl.label}</span>
                  </CardBody>
                </Card>
              );
            })}
          </div>
      }

      <Card>
        <CardBody>
          <div className="font-bold text-sm text-[#1a1916] mb-2">ℹ About the Core Panel</div>
          <p className="text-sm text-[#4a4840] leading-relaxed">
            The core panel consists of 5–7 elected Platinum members who manage Agnichakra Club each term.
            They handle events, communications, finances, and member welfare. The panel is elected every July and serves until June of the following year.
            Only Platinum members are eligible to serve on the panel.
          </p>
        </CardBody>
      </Card>
    </AppLayout>
  );
}
