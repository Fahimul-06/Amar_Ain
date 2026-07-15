import { useEffect, useState } from 'react';
import { Search, FileText, ArrowRight, Scale, ShieldCheck, Wallet, MessageSquare, Users } from 'lucide-react';
import { supabase, type LegalContent } from '../lib/supabase';
import { EmptyState, Spinner, Badge } from '../components/ui';

export function LegalInfoPage({ navigate: _navigate }: { navigate: (to: string) => void }) {
  const [articles, setArticles] = useState<LegalContent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('legal_content').select('*').eq('status', 'published').order('created_at', { ascending: false });
      setArticles((data as LegalContent[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = articles.filter(
    (a) => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-ink-50">
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold text-ink-900">Legal Information</h1>
          <p className="mt-2 max-w-2xl text-ink-500">Browse articles on Bangladesh law — from family matters to property, criminal procedure, and consumer rights.</p>
          <div className="mt-5 relative max-w-xl">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search legal topics..." className="input pl-10" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<FileText size={22} />} title="No articles found" description="Try a different search or check back later." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <div key={a.id} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-card">
                <Badge tone="gold">{a.category || 'General'}</Badge>
                <h3 className="mt-3 font-display text-lg font-bold text-ink-900">{a.title}</h3>
                {a.title_bn && <p className="text-sm text-ink-500">{a.title_bn}</p>}
                <p className="mt-2 line-clamp-3 text-sm text-ink-600">{a.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HowItWorksPage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">How Amar Ain Works</h1>
          <p className="mt-3 max-w-2xl mx-auto text-ink-500">A simple, secure way to get legal help in Bangladesh — from first question to resolved case.</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="card p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Search size={24} /></div>
            <h3 className="font-display text-lg font-bold text-ink-900">1. Ask or search</h3>
            <p className="mt-1.5 text-sm text-ink-600">Use our AI legal assistant for general questions, or browse verified lawyers by category, location, fee, and rating.</p>
          </div>
          <div className="card p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600"><Users size={24} /></div>
            <h3 className="font-display text-lg font-bold text-ink-900">2. Book a consultation</h3>
            <p className="mt-1.5 text-sm text-ink-600">Choose text, phone, video, in-person, or document drafting. Pick a time that works for you.</p>
          </div>
          <div className="card p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet size={24} /></div>
            <h3 className="font-display text-lg font-bold text-ink-900">3. Pay securely</h3>
            <p className="mt-1.5 text-sm text-ink-600">Pay with bKash, Nagad, or SSLCommerz. Your payment is held safely until the consultation is completed.</p>
          </div>
          <div className="card p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100 text-ink-700"><MessageSquare size={24} /></div>
            <h3 className="font-display text-lg font-bold text-ink-900">4. Chat & track</h3>
            <p className="mt-1.5 text-sm text-ink-600">Message your lawyer securely, upload case documents, track progress, and rate your experience.</p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl gradient-ink p-8 text-white sm:p-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Ready to get started?</h2>
              <p className="mt-1 text-ink-300">Create your free account and find the right lawyer today.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/register')} className="btn-gold px-5 py-3">Sign up free <ArrowRight size={18} /></button>
              <button onClick={() => navigate('/lawyers')} className="btn-outline border-white/20 bg-white/5 text-white hover:bg-white/10 px-5 py-3">Browse lawyers</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForLawyersPage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div className="bg-white">
      <div className="border-b border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge tone="gold">For Lawyers</Badge>
              <h1 className="mt-4 font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Grow your practice with Amar Ain</h1>
              <p className="mt-3 text-lg text-ink-600">Join 1,200+ verified lawyers serving clients across Bangladesh. Manage bookings, cases, earnings, and withdrawals — all in one place.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => navigate('/register')} className="btn-gold px-5 py-3">Join as a lawyer <ArrowRight size={18} /></button>
                <button onClick={() => navigate('/how-it-works')} className="btn-outline px-5 py-3">Learn more</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'New clients', value: 'Reach more people' },
                { icon: Wallet, label: 'Easy payouts', value: 'bKash / Nagad / Bank' },
                { icon: ShieldCheck, label: 'Verified badge', value: 'Build trust' },
                { icon: Scale, label: 'Case tools', value: 'Track everything' },
              ].map((f) => (
                <div key={f.label} className="card p-5">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 text-gold-600"><f.icon size={20} /></div>
                  <div className="text-sm font-bold text-ink-900">{f.label}</div>
                  <div className="text-xs text-ink-500">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="section-title text-center">What you get</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Profile & verification', desc: 'Showcase your practice area, experience, fees, and languages. Get Bar Council verified.' },
            { title: 'Booking management', desc: 'Accept or decline consultations. Set availability for each day of the week.' },
            { title: 'Earnings & withdrawals', desc: 'Track payouts, see commission breakdown, and request withdrawals via bKash, Nagad, or bank.' },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="font-display text-lg font-bold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
