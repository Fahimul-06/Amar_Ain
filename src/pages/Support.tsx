import { useState } from 'react';
import {
  Search,
  ChevronDown,
  LifeBuoy,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  ArrowRight,
  HelpCircle,
  Lock,
  UserCheck,
  FileWarning,
  Ban,
  RefreshCw,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui';

/* ============================================================
   HELP CENTER
   ============================================================ */
const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I find a lawyer on Amar Ain?',
        a: 'Go to "Find Lawyers" from the navigation bar. You can filter by legal category (e.g. Family, Criminal, Corporate), city, language, rating, and consultation fee. Click on any lawyer\'s card to view their full profile and book a consultation.',
      },
      {
        q: 'Do I need an account to browse lawyers?',
        a: 'No — you can browse verified lawyers and read their profiles without an account. However, to book a consultation, chat with a lawyer, or upload documents, you\'ll need to create a free account.',
      },
      {
        q: 'How do I register?',
        a: 'Click "Sign up" in the top right. You can register with your email and password, or with your phone number via OTP. Choose whether you\'re joining as a client or a lawyer.',
      },
    ],
  },
  {
    category: 'Bookings & Consultations',
    items: [
      {
        q: 'What types of consultations are available?',
        a: 'We support five consultation types: text chat, phone call, video call, in-person meeting, and document drafting. Each lawyer sets their own fees and availability for each type.',
      },
      {
        q: 'How do I book a consultation?',
        a: 'Open a lawyer\'s profile, choose your preferred service type, select a date and time, enter your topic, and proceed to payment. You\'ll receive a confirmation and can track the booking from your dashboard.',
      },
      {
        q: 'Can I cancel or reschedule a booking?',
        a: 'Yes — you can cancel an upcoming booking from your client dashboard under the "Bookings" tab. To reschedule, cancel the existing booking and create a new one. Please check the lawyer\'s cancellation policy.',
      },
      {
        q: 'What if the lawyer doesn\'t show up?',
        a: 'If a lawyer fails to attend a scheduled consultation, you can raise a dispute from your bookings page. Our admin team will review it and process a refund if appropriate.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods are supported?',
        a: 'We support bKash, Nagad, and SSLCommerz (which includes card payments). All transactions are processed securely.',
      },
      {
        q: 'Is my payment held securely?',
        a: 'Yes. Your payment is held in escrow until the consultation is marked as completed. This protects both clients and lawyers.',
      },
      {
        q: 'How do refunds work?',
        a: 'If a consultation is cancelled or a dispute is resolved in your favor, the refund is processed back to your original payment method within 5-7 business days.',
      },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      {
        q: 'How do I reset my password?',
        a: 'On the login page, click "Forgot password" and enter your email. You\'ll receive a reset link via email.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. We use bank-grade encryption for all data in transit and at rest. Your chat messages with lawyers are private and protected. We never share your personal information without consent.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact our support team via the Contact page and request account deletion. We\'ll verify your identity and process the request within 7 business days.',
      },
    ],
  },
];

export function HelpCenterPage({ navigate }: { navigate: (to: string) => void }) {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const allFaqs = FAQS.flatMap((c) => c.items.map((item, i) => ({ ...item, id: `${c.category}-${i}` })));
  const filtered = search
    ? allFaqs.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="bg-ink-50">
      {/* Hero */}
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold">
            <LifeBuoy size={28} className="text-ink-950" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Help Center</h1>
          <p className="mt-3 text-ink-500">Find answers to common questions about using Amar Ain.</p>
          <div className="mx-auto mt-6 max-w-xl">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help..."
                className="input pl-11 py-3 text-base"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {filtered ? (
          <div>
            <h2 className="mb-4 font-display text-lg font-bold text-ink-900">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </h2>
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-ink-500">No results found. Try a different search or <button onClick={() => navigate('/contact')} className="font-semibold text-ink-900 underline">contact us</button>.</p>
              ) : (
                filtered.map((f) => (
                  <div key={f.id} className="card overflow-hidden">
                    <button
                      onClick={() => setOpenId(openId === f.id ? null : f.id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left"
                    >
                      <span className="font-semibold text-ink-900">{f.q}</span>
                      <ChevronDown size={18} className={`shrink-0 text-ink-400 transition-transform ${openId === f.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openId === f.id && (
                      <div className="border-t border-ink-100 px-5 py-4 text-sm leading-relaxed text-ink-600 animate-fade-in">
                        {f.a}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {FAQS.map((cat) => (
              <div key={cat.category}>
                <h2 className="mb-4 font-display text-xl font-bold text-ink-900">{cat.category}</h2>
                <div className="space-y-2">
                  {cat.items.map((item, i) => {
                    const id = `${cat.category}-${i}`;
                    return (
                      <div key={id} className="card overflow-hidden">
                        <button
                          onClick={() => setOpenId(openId === id ? null : id)}
                          className="flex w-full items-center justify-between px-5 py-4 text-left"
                        >
                          <span className="font-semibold text-ink-900">{item.q}</span>
                          <ChevronDown size={18} className={`shrink-0 text-ink-400 transition-transform ${openId === id ? 'rotate-180' : ''}`} />
                        </button>
                        {openId === id && (
                          <div className="border-t border-ink-100 px-5 py-4 text-sm leading-relaxed text-ink-600 animate-fade-in">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <button onClick={() => navigate('/safety')} className="card flex flex-col items-start gap-2 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck size={20} /></div>
            <h3 className="font-display font-bold text-ink-900">Safety</h3>
            <p className="text-sm text-ink-500">Learn how we keep you safe on the platform.</p>
          </button>
          <button onClick={() => navigate('/disputes')} className="card flex flex-col items-start gap-2 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 text-gold-600"><AlertTriangle size={20} /></div>
            <h3 className="font-display font-bold text-ink-900">Disputes</h3>
            <p className="text-sm text-ink-500">How to raise and resolve disputes.</p>
          </button>
          <button onClick={() => navigate('/contact')} className="card flex flex-col items-start gap-2 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Mail size={20} /></div>
            <h3 className="font-display font-bold text-ink-900">Contact Us</h3>
            <p className="text-sm text-ink-500">Get in touch with our support team.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SAFETY
   ============================================================ */
export function SafetyPage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div className="bg-ink-50">
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={28} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Your Safety, Our Priority</h1>
          <p className="mt-3 text-ink-500">How we protect you at every step — from lawyer verification to secure payments and private messaging.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Pillars */}
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            { icon: UserCheck, title: 'Verified Lawyers', desc: 'Every lawyer is checked against Bangladesh Bar Council records before being listed. We verify their Bar ID, credentials, and professional standing.', tone: 'bg-emerald-50 text-emerald-600' },
            { icon: Lock, title: 'Secure Payments', desc: 'All payments are processed through encrypted channels via bKash, Nagad, and SSLCommerz. Funds are held in escrow until your consultation is completed.', tone: 'bg-gold-50 text-gold-600' },
            { icon: MessageSquare, title: 'Private Messaging', desc: 'Your chats with lawyers are private and encrypted. We never share your conversation content with third parties.', tone: 'bg-blue-50 text-blue-600' },
            { icon: FileWarning, title: 'Document Protection', desc: 'Your uploaded case documents are stored securely and only accessible to you and your assigned lawyer.', tone: 'bg-red-50 text-red-600' },
          ].map((p) => (
            <div key={p.title} className="card p-6">
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${p.tone}`}><p.icon size={22} /></div>
              <h3 className="font-display text-lg font-bold text-ink-900">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Safety tips */}
        <div className="mt-10 card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink-900">Safety tips for clients</h2>
          <ul className="mt-4 space-y-3">
            {[
              'Always verify the lawyer\'s Bar Council ID shown on their profile before booking.',
              'Keep all communication and payments on the Amar Ain platform — do not move to external channels.',
              'Never share your password, OTP, or banking PIN with anyone, including Amar Ain staff.',
              'Upload only relevant case documents. Do not share unrelated personal or financial information.',
              'If a lawyer asks for direct payment outside the platform, report them immediately.',
              'Read reviews and ratings before booking to make an informed choice.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Reporting */}
        <div className="mt-6 rounded-2xl gradient-ink p-6 text-white sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold-300"><Ban size={24} /></div>
            <div>
              <h2 className="font-display text-xl font-bold">Report a problem</h2>
              <p className="mt-1.5 text-sm text-ink-300">If you encounter fraud, harassment, or any unsafe behavior, report it to us immediately. Our team reviews every report within 24 hours.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => navigate('/contact')} className="btn-gold px-5 py-2.5"><Mail size={16} /> Report now</button>
                <button onClick={() => navigate('/disputes')} className="btn-outline border-white/20 bg-white/5 text-white hover:bg-white/10 px-5 py-2.5"><AlertTriangle size={16} /> Open a dispute</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DISPUTES
   ============================================================ */
export function DisputesPage({ navigate }: { navigate: (to: string) => void }) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const openForm = async () => {
    if (!session) {
      navigate('/login');
      return;
    }
    setOpen(true);
    setSubmitted(false);
    setLoadingBookings(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, lawyers(*, profiles!inner(*))')
      .eq('client_id', session.user.id)
      .order('created_at', { ascending: false });
    setBookings((data as any[]) || []);
    setLoadingBookings(false);
  };

  const submit = async () => {
    if (!session || !bookingId || !reason) return;
    setSubmitting(true);
    const { error } = await supabase.from('disputes').insert({
      booking_id: bookingId,
      raised_by: session.user.id,
      reason,
      description,
      status: 'open',
    });
    if (!error) {
      await supabase.from('bookings').update({ status: 'disputed' }).eq('id', bookingId);
      setSubmitted(true);
      setReason('');
      setDescription('');
      setBookingId('');
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-ink-50">
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
            <AlertTriangle size={28} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Dispute Resolution</h1>
          <p className="mt-3 text-ink-500">If something goes wrong with a consultation, we\'re here to help resolve it fairly.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Process */}
        <h2 className="mb-5 font-display text-xl font-bold text-ink-900">How disputes work</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { step: '1', title: 'Raise a dispute', desc: 'Submit the dispute form with details of what happened.', icon: AlertTriangle },
            { step: '2', title: 'We review', desc: 'Our admin team reviews the case within 48 hours.', icon: Scale },
            { step: '3', title: 'Mediation', desc: 'We contact both parties to understand the situation.', icon: MessageSquare },
            { step: '4', title: 'Resolution', desc: 'We resolve with a refund, partial refund, or dismissal.', icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.step} className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-50 text-gold-600"><s.icon size={18} /></div>
                <span className="font-display text-2xl font-extrabold text-gold-200">{s.step}</span>
              </div>
              <h3 className="font-display font-bold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-xs text-ink-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Valid reasons */}
        <div className="mt-8 card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink-900">Valid reasons for a dispute</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              'Lawyer did not attend the scheduled consultation',
              'Lawyer provided significantly different service than booked',
              'Charged for a service that was not delivered',
              'Unprofessional or inappropriate behavior',
              'Document drafting was not completed as agreed',
              'Technical issues on our platform caused a missed session',
            ].map((r) => (
              <div key={r} className="flex items-start gap-2 rounded-xl border border-ink-100 p-3 text-sm text-ink-700">
                <FileWarning size={16} className="mt-0.5 shrink-0 text-gold-600" />
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Refund policy */}
        <div className="mt-6 card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><RefreshCw size={22} /></div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Refund policy</h2>
              <p className="mt-1.5 text-sm text-ink-600">
                If a dispute is resolved in your favor, refunds are processed back to your original payment method within 5-7 business days. For bKash and Nagad, refunds may appear sooner. The platform commission is non-refundable for completed consultations where the service was delivered as agreed.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl gradient-ink p-8 text-center text-white">
          <h2 className="font-display text-xl font-bold">Need to raise a dispute?</h2>
          <p className="max-w-lg text-sm text-ink-300">You can submit a dispute from your dashboard or directly here. Our team will review it promptly.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={openForm} className="btn-gold px-5 py-2.5"><AlertTriangle size={16} /> Raise a dispute</button>
            <button onClick={() => navigate('/contact')} className="btn-outline border-white/20 bg-white/5 text-white hover:bg-white/10 px-5 py-2.5"><Mail size={16} /> Contact support</button>
          </div>
        </div>
      </div>

      {/* Dispute form modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4 animate-fade-in" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/95 px-5 py-4 backdrop-blur">
              <h3 className="font-display text-lg font-bold text-ink-900">Raise a dispute</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100">✕</button>
            </div>
            <div className="p-5">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={28} /></div>
                  <h3 className="font-display text-lg font-bold text-ink-900">Dispute submitted</h3>
                  <p className="text-sm text-ink-500">Our admin team will review your dispute within 48 hours. You can track its status in your dashboard.</p>
                  <button onClick={() => { setOpen(false); navigate('/dashboard/client?tab=bookings'); }} className="btn-primary mt-2">Go to dashboard</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="label">Booking</label>
                    {loadingBookings ? (
                      <div className="flex items-center gap-2 text-sm text-ink-500"><Spinner size={16} /> Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                      <p className="text-sm text-ink-500">No bookings found. You need a booking to raise a dispute.</p>
                    ) : (
                      <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="input">
                        <option value="">Select a booking</option>
                        {bookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.lawyers?.profiles?.full_name || 'Lawyer'} — {new Date(b.scheduled_at).toLocaleDateString('en-GB')}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="label">Reason</label>
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Lawyer did not attend" className="input" />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="input resize-none" placeholder="Describe what happened in detail..." />
                  </div>
                  <button onClick={submit} disabled={submitting || !bookingId || !reason} className="btn-primary w-full">
                    {submitting ? <Spinner size={18} /> : 'Submit dispute'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */
export function ContactPage({ navigate: _navigate }: { navigate: (to: string) => void }) {
  const { session } = useAuth();
  const [name, setName] = useState(session?.user ? '' : '');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate sending — in production this would call an edge function
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    setName(''); setEmail(''); setSubject(''); setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-ink-50">
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Mail size={28} />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-ink-500">We\'re here to help. Reach out with any questions, concerns, or feedback.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* Contact info */}
          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', value: 'support@amarain.com.bd', desc: 'We reply within 24 hours', tone: 'bg-blue-50 text-blue-600' },
              { icon: Phone, title: 'Phone', value: '+880 1700-000000', desc: 'Sun–Thu, 9am–6pm BST', tone: 'bg-emerald-50 text-emerald-600' },
              { icon: MessageSquare, title: 'Live Chat', value: 'Available in dashboard', desc: 'For logged-in users', tone: 'bg-gold-50 text-gold-600' },
              { icon: MapPin, title: 'Office', value: 'Gulshan-2, Dhaka 1212', desc: 'Bangladesh', tone: 'bg-red-50 text-red-600' },
            ].map((c) => (
              <div key={c.title} className="card flex items-start gap-4 p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.tone}`}><c.icon size={22} /></div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500">{c.title}</h3>
                  <p className="font-display font-bold text-ink-900">{c.value}</p>
                  <p className="text-xs text-ink-500">{c.desc}</p>
                </div>
              </div>
            ))}
            <div className="card flex items-center gap-3 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600"><Clock size={22} /></div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-ink-500">Response Time</h3>
                <p className="text-sm font-semibold text-ink-900">Within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink-900">Send us a message</h2>
            <p className="mt-1 text-sm text-ink-500">Fill out the form below and our team will get back to you.</p>

            {submitted ? (
              <div className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-emerald-50 px-6 py-10 text-center animate-fade-up">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={28} /></div>
                <h3 className="font-display text-lg font-bold text-ink-900">Message sent!</h3>
                <p className="text-sm text-ink-600">Thank you for reaching out. We\'ll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Your name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="input" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} required className="input">
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="booking">Booking Issue</option>
                    <option value="payment">Payment Problem</option>
                    <option value="dispute">Dispute / Complaint</option>
                    <option value="lawyer_verification">Lawyer Verification</option>
                    <option value="technical">Technical Issue</option>
                    <option value="feedback">Feedback / Suggestion</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} className="input resize-none" placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                  {submitting ? <Spinner size={18} /> : <>Send message <Send size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Quick help */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <button onClick={() => _navigate('/help')} className="card flex items-center gap-3 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-600"><HelpCircle size={20} /></div>
            <div>
              <h3 className="font-display font-bold text-ink-900">Help Center</h3>
              <p className="text-xs text-ink-500">Browse FAQs and guides</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-ink-400" />
          </button>
          <button onClick={() => _navigate('/safety')} className="card flex items-center gap-3 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck size={20} /></div>
            <div>
              <h3 className="font-display font-bold text-ink-900">Safety</h3>
              <p className="text-xs text-ink-500">Platform safety guidelines</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-ink-400" />
          </button>
          <button onClick={() => _navigate('/disputes')} className="card flex items-center gap-3 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 text-gold-600"><AlertTriangle size={20} /></div>
            <div>
              <h3 className="font-display font-bold text-ink-900">Disputes</h3>
              <p className="text-xs text-ink-500">Raise or track a dispute</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-ink-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
