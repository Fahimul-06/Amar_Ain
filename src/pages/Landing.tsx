import { useState } from 'react';
import {
  Scale,
  Search,
  ShieldCheck,
  MessageSquare,
  FileText,
  Video,
  Phone,
  Users,
  Star,
  Clock,
  Wallet,
  Lock,
  ArrowRight,
  Sparkles,
  Gavel,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const SAMPLE_PROMPTS = [
  'How do I file for divorce in Bangladesh?',
  'What are my rights if I am arrested?',
  'How to register land property?',
  'What is the process for filing a consumer complaint?',
];

const AI_RESPONSES: Record<string, string> = {
  divorce:
    'In Bangladesh, divorce under Muslim law requires the husband to pronounce Talaq and send a written notice to the Union Parishad Chairman or Municipality Mayor. The notice must be registered, and a 90-day iddat period applies. For non-Muslims, divorce is governed by personal laws and may require court proceedings. We strongly recommend consulting a family lawyer — you can book one below.',
  arrested:
    'If arrested, you have the right to: (1) be informed of the grounds of arrest, (2) consult a lawyer of your choice, (3) be produced before a magistrate within 24 hours, and (4) remain silent. You can apply for bail through a criminal defense lawyer. Do not sign any confession without legal counsel present.',
  land:
    'Land registration in Bangladesh involves: (1) mutation of the land in your name via the AC Land office, (2) preparation and registration of the deed at the local Sub-Registry Office, (3) payment of registration fees and stamp duty, and (4) verification of the mutation record (Khatian). A land lawyer can verify title and handle the full process.',
  consumer:
    'To file a consumer complaint in Bangladesh: (1) attempt to resolve with the seller/service provider, (2) send a legal notice, (3) file a complaint with the Directorate of National Consumer Rights Protection, or (4) file a case in the Consumer Rights Protection Court. A consumer protection lawyer can guide you.',
};

function aiAnswer(q: string): string {
  const lower = q.toLowerCase();
  if (lower.includes('divorce') || lower.includes('talaq') || lower.includes('marriage')) return AI_RESPONSES.divorce;
  if (lower.includes('arrest') || lower.includes('bail') || lower.includes('fir') || lower.includes('police'))
    return AI_RESPONSES.arrested;
  if (lower.includes('land') || lower.includes('property') || lower.includes('mutation') || lower.includes('registry'))
    return AI_RESPONSES.land;
  if (lower.includes('consumer') || lower.includes('product') || lower.includes('refund') || lower.includes('seller'))
    return AI_RESPONSES.consumer;
  return "I can provide general legal information for Bangladesh. Try asking about divorce, arrest rights, land registration, or consumer complaints. For specific advice, please book a consultation with a verified lawyer — I can help you find the right one.";
}

export function Landing({ navigate }: { navigate: (to: string) => void }) {
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askAi = (q?: string) => {
    const question = q ?? query;
    if (!question.trim()) return;
    setQuery(question);
    setLoading(true);
    setAnswer(null);
    setTimeout(() => {
      setAnswer(aiAnswer(question));
      setLoading(false);
    }, 900);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white hero-pattern">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-200/30 blur-3xl" />
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-ink-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <div className="badge mb-5 border border-gold-200 bg-gold-50 text-gold-700">
                <Sparkles size={13} /> AI Legal Assistant for Bangladesh
              </div>
              <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
                Legal help, <span className="gradient-gold bg-clip-text text-transparent">simplified</span> for every Bangladeshi.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-ink-600">
                Search basic legal information with our AI assistant, find verified lawyers, book consultations, chat securely, and pay with bKash, Nagad, or SSLCommerz — all in one place.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => navigate('/lawyers')} className="btn-primary px-5 py-3">
                  Find a Lawyer <ArrowRight size={18} />
                </button>
                {!session && (
                  <button onClick={() => navigate('/register')} className="btn-outline px-5 py-3">
                    Create free account
                  </button>
                )}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500">
                <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-600" /> Verified lawyers</span>
                <span className="flex items-center gap-1.5"><Lock size={15} className="text-emerald-600" /> Secure chat</span>
                <span className="flex items-center gap-1.5"><Wallet size={15} className="text-emerald-600" /> bKash / Nagad / SSLCommerz</span>
              </div>
            </div>

            {/* AI Assistant card */}
            <div className="card p-6 shadow-card animate-fade-up lg:p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-gold">
                  <Gavel size={20} className="text-ink-950" />
                </div>
                <div>
                  <div className="font-display font-bold text-ink-900">AI Legal Assistant</div>
                  <div className="text-xs text-ink-500">Ask a legal question — get instant info</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askAi()}
                    placeholder="e.g. How do I file for divorce?"
                    className="input pl-10"
                  />
                </div>
                <button onClick={() => askAi()} disabled={loading} className="btn-gold">
                  {loading ? '...' : 'Ask'}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((p) => (
                  <button key={p} onClick={() => askAi(p)} className="chip">
                    {p}
                  </button>
                ))}
              </div>
              {loading && (
                <div className="mt-4 space-y-2">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-5/6 rounded" />
                </div>
              )}
              {answer && !loading && (
                <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-sm leading-relaxed text-ink-700 animate-fade-up">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gold-700">
                    <Sparkles size={12} /> AI Answer
                  </div>
                  {answer}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => navigate('/lawyers')} className="btn-gold px-3 py-1.5 text-xs">
                      Find a lawyer <ArrowRight size={13} />
                    </button>
                    <button onClick={() => navigate('/legal-info')} className="btn-outline px-3 py-1.5 text-xs">
                      Browse legal info
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] text-ink-400">
                    This is general information, not legal advice. For specific guidance, consult a licensed lawyer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-ink-100 bg-ink-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Users, label: 'Verified Lawyers', value: '1,200+' },
            { icon: Scale, label: 'Legal Categories', value: '12' },
            { icon: MessageSquare, label: 'Consultations', value: '45K+' },
            { icon: Star, label: 'Avg. Rating', value: '4.8/5' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-gold-300">
                <s.icon size={22} />
              </div>
              <div>
                <div className="font-display text-xl font-bold">{s.value}</div>
                <div className="text-xs text-ink-300">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="section-title">Everything you need, in one platform</h2>
          <p className="mt-2 text-ink-500">From quick questions to full case management — we've got you covered.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: MessageSquare, title: 'Text Consultation', desc: 'Chat with a lawyer and get quick answers to your legal questions.', color: 'bg-blue-50 text-blue-600' },
            { icon: Phone, title: 'Phone Consultation', desc: 'Talk to a verified lawyer over the phone at your convenience.', color: 'bg-emerald-50 text-emerald-600' },
            { icon: Video, title: 'Video / Audio Call', desc: 'Face-to-face legal advice from anywhere in Bangladesh.', color: 'bg-gold-50 text-gold-600' },
            { icon: Users, title: 'In-Person Meeting', desc: 'Book an in-person meeting at the lawyer’s chamber.', color: 'bg-ink-100 text-ink-700' },
            { icon: FileText, title: 'Document Drafting', desc: 'Request drafting of deeds, affidavits, contracts, and notices.', color: 'bg-red-50 text-red-600' },
            { icon: Lock, title: 'Secure Messaging', desc: 'End-to-end encrypted chat with your lawyer for case updates.', color: 'bg-emerald-50 text-emerald-600' },
          ].map((s) => (
            <div key={s.title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-card">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{s.desc}</p>
              <button
                onClick={() => navigate('/lawyers')}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-900 transition group-hover:text-gold-700"
              >
                Get started <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="section-title">How it works</h2>
            <p className="mt-2 text-ink-500">Four simple steps to get the legal help you need.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { step: '01', title: 'Search & Compare', desc: 'Find verified lawyers by category, location, experience, fee, and rating.' },
              { step: '02', title: 'Book a Consultation', desc: 'Choose text, phone, video, in-person, or document drafting.' },
              { step: '03', title: 'Pay Securely', desc: 'Pay with bKash, Nagad, or SSLCommerz. Funds held safely.' },
              { step: '04', title: 'Chat & Track', desc: 'Message your lawyer, upload documents, and track your case.' },
            ].map((s) => (
              <div key={s.step} className="card relative p-6">
                <div className="font-display text-4xl font-extrabold text-gold-200">{s.step}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="card p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900">Verified & Trusted</h3>
            <p className="mt-2 text-ink-600">
              Every lawyer on Amar Ain is verified against the Bangladesh Bar Council records. We check credentials, experience, and standing before listing.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-700">
              {['Bar Council ID verification', 'Document & credential checks', 'Client ratings & reviews', 'Secure payment processing'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
              <Wallet size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900">Flexible Payments</h3>
            <p className="mt-2 text-ink-600">
              Pay the way you prefer. We support all major Bangladesh payment methods with secure escrow holding.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {['bKash', 'Nagad', 'SSLCommerz', 'Card'].map((m) => (
                <div key={m} className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800">
                  {m}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-ink-500">
              <Clock size={16} /> 24/7 support · Dispute resolution · Refund protection
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-950 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to get the legal help you deserve?
          </h2>
          <p className="mt-3 text-ink-300">Join thousands of Bangladeshis who trust Amar Ain for their legal needs.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('/register')} className="btn-gold px-6 py-3 text-base">
              Get started — it's free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/lawyers')} className="btn-outline border-white/20 bg-white/5 text-white hover:bg-white/10 px-6 py-3 text-base">
              Browse lawyers
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
