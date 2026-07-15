import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  MapPin,
  Languages,
  Calendar,
  Clock,
  MessageSquare,
  Phone,
  Video,
  Users,
  FileText,
  Wallet,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { supabase, type Lawyer, type LawyerCategory, type Profile, type LawyerService, type Review } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Avatar, Stars, Badge, Modal, formatBDT, formatDate, EmptyState, Spinner } from '../components/ui';

const SERVICE_TYPES = [
  { type: 'text', label: 'Text Chat', icon: MessageSquare },
  { type: 'phone', label: 'Phone Call', icon: Phone },
  { type: 'video', label: 'Video Call', icon: Video },
  { type: 'in_person', label: 'In-Person', icon: Users },
  { type: 'document_drafting', label: 'Document Drafting', icon: FileText },
] as const;

export function LawyerDetailPage({ lawyerId, navigate }: { lawyerId: string; navigate: (to: string) => void }) {
  const { session, profile } = useAuth();
  const [lawyer, setLawyer] = useState<(Lawyer & { lawyer_categories?: LawyerCategory | null; profiles?: Profile | null }) | null>(null);
  const [services, setServices] = useState<LawyerService[]>([]);
  const [reviews, setReviews] = useState<(Review & { profiles?: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState<LawyerService['type']>('text');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'sslcommerz'>('bkash');
  const [payOpen, setPayOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: l }, { data: svcs }, { data: rvws }] = await Promise.all([
        supabase
          .from('lawyers')
          .select('*, lawyer_categories(*), profiles!inner(*)')
          .eq('id', lawyerId)
          .maybeSingle(),
        supabase.from('lawyer_services').select('*').eq('lawyer_id', lawyerId).eq('is_active', true),
        supabase
          .from('reviews')
          .select('*, profiles!client_id(*)')
          .eq('lawyer_id', lawyerId)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      setLawyer(l as any);
      setServices((svcs as LawyerService[]) || []);
      setReviews((rvws as any) || []);
      setLoading(false);
    })();
  }, [lawyerId]);

  const selectedService = services.find((s) => s.type === bookingType);
  const fee = selectedService?.fee ?? Number(lawyer?.consultation_fee ?? 0);

  const startBooking = () => {
    if (!session) {
      navigate('/login');
      return;
    }
    setPayOpen(true);
  };

  const confirmBooking = async () => {
    if (!session || !lawyer) return;
    setBooking(true);
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
    const { data: bookingRow, error: bErr } = await supabase
      .from('bookings')
      .insert({
        client_id: session.user.id,
        lawyer_id: lawyer.id,
        service_id: selectedService?.id ?? null,
        type: bookingType,
        scheduled_at: scheduledAt,
        duration_minutes: selectedService?.duration_minutes ?? 30,
        fee,
        status: 'confirmed',
        topic,
        notes,
      })
      .select('*')
      .single();
    if (bErr) {
      setToast('Booking failed: ' + bErr.message);
      setBooking(false);
      return;
    }
    const commission = Number((fee * 0.1).toFixed(2));
    await supabase.from('payments').insert({
      booking_id: bookingRow.id,
      client_id: session.user.id,
      lawyer_id: lawyer.id,
      amount: fee,
      platform_commission: commission,
      lawyer_payout: Number(fee) - commission,
      method: paymentMethod,
      transaction_id: 'TXN' + Date.now(),
      status: 'paid',
      paid_at: new Date().toISOString(),
    });
    setToast('Booking confirmed! Check your dashboard.');
    setPayOpen(false);
    setBooking(false);
    setTimeout(() => navigate(`/dashboard/${profile?.role || 'client'}`), 1200);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon={<Star size={22} />} title="Lawyer not found" description="This profile may have been removed." action={<button onClick={() => navigate('/lawyers')} className="btn-outline">Back to search</button>} />
      </div>
    );
  }

  return (
    <div className="bg-ink-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/lawyers')} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
          <ArrowLeft size={16} /> Back to lawyers
        </button>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Profile */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar name={lawyer.profiles?.full_name || 'Lawyer'} url={lawyer.profiles?.avatar_url} size={88} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-extrabold text-ink-900">{lawyer.profiles?.full_name}</h1>
                    {lawyer.bar_council_verified && (
                      <Badge tone="green"><BadgeCheck size={13} /> Bar Verified</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-ink-600">{lawyer.lawyer_categories?.name || 'General Practice'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-600">
                    <span className="flex items-center gap-1.5"><Stars rating={lawyer.rating} /> {lawyer.rating.toFixed(1)} ({lawyer.rating_count} reviews)</span>
                    <span className="flex items-center gap-1.5"><MapPin size={15} /> {lawyer.profiles?.location || 'Bangladesh'}</span>
                    <span className="flex items-center gap-1.5"><Clock size={15} /> {lawyer.experience_years} yrs experience</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {lawyer.languages?.map((l) => (
                      <Badge key={l} tone="blue"><Languages size={12} /> {l}</Badge>
                    ))}
                    <Badge tone="gold">Bar ID: {lawyer.bar_id || '—'}</Badge>
                  </div>
                </div>
              </div>
              {lawyer.profiles?.bio && (
                <div className="mt-5 border-t border-ink-100 pt-5">
                  <h3 className="mb-2 font-display font-bold text-ink-900">About</h3>
                  <p className="text-sm leading-relaxed text-ink-600">{lawyer.profiles.bio}</p>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="card p-6">
              <h3 className="mb-4 font-display font-bold text-ink-900">Services & Fees</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {SERVICE_TYPES.map((s) => {
                  const svc = services.find((x) => x.type === s.type);
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.type}
                      onClick={() => setBookingType(s.type)}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                        bookingType === s.type ? 'border-gold-500 bg-gold-50' : 'border-ink-200 bg-white hover:border-ink-300'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bookingType === s.type ? 'bg-gold-500 text-ink-950' : 'bg-ink-100 text-ink-600'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-ink-900">{s.label}</div>
                        <div className="text-xs text-ink-500">{svc ? `${svc.duration_minutes} min` : 'On request'}</div>
                      </div>
                      <div className="text-sm font-bold text-ink-900">{svc ? formatBDT(Number(svc.fee)) : formatBDT(Number(lawyer.consultation_fee))}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h3 className="mb-4 font-display font-bold text-ink-900">Recent Reviews</h3>
              {reviews.length === 0 ? (
                <EmptyState icon={<Star size={20} />} title="No reviews yet" description="Be the first to review after a consultation." />
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-ink-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.profiles?.full_name || 'Client'} url={r.profiles?.avatar_url} size={36} />
                        <div>
                          <div className="text-sm font-semibold text-ink-900">{r.profiles?.full_name || 'Anonymous'}</div>
                          <div className="flex items-center gap-2">
                            <Stars rating={r.rating} size={12} />
                            <span className="text-xs text-ink-400">{formatDate(r.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="card p-6">
              <h3 className="mb-1 font-display text-lg font-bold text-ink-900">Book a consultation</h3>
              <p className="mb-4 text-sm text-ink-500">{SERVICE_TYPES.find((s) => s.type === bookingType)?.label} · {formatBDT(fee)}</p>

              <div className="space-y-4">
                <div>
                  <label className="label">Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="label">Time</label>
                  <select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="input">
                    <option value="">Select time</option>
                    {['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Topic</label>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Brief topic of consultation" className="input" />
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any details for the lawyer" className="input resize-none" />
                </div>

                <div className="rounded-xl bg-ink-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500">Consultation fee</span>
                    <span className="font-bold text-ink-900">{formatBDT(fee)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-ink-500">Platform fee</span>
                    <span className="text-ink-700">{formatBDT(0)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-ink-200 pt-2">
                    <span className="font-semibold text-ink-900">Total</span>
                    <span className="font-display text-lg font-bold text-ink-900">{formatBDT(fee)}</span>
                  </div>
                </div>

                <button onClick={startBooking} disabled={!scheduledDate || !scheduledTime} className="btn-gold w-full py-3">
                  <Wallet size={18} /> Continue to payment
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-ink-400">
                  <ShieldCheck size={13} /> Secure payment · Refund protection
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Payment modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Complete Payment">
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">You're paying</span>
              <span className="font-display text-2xl font-bold text-ink-900">{formatBDT(fee)}</span>
            </div>
            <div className="mt-1 text-xs text-ink-500">for {SERVICE_TYPES.find((s) => s.type === bookingType)?.label} consultation</div>
          </div>
          <div>
            <label className="label">Payment method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['bkash', 'nagad', 'sslcommerz'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${
                    paymentMethod === m ? 'border-gold-500 bg-gold-50 text-ink-900' : 'border-ink-200 bg-white text-ink-600'
                  }`}
                >
                  {m === 'sslcommerz' ? 'SSL' : m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            <CheckCircle2 size={16} /> This is a demo payment — no real charge is made.
          </div>
          <button onClick={confirmBooking} disabled={booking} className="btn-gold w-full py-3">
            {booking ? <Spinner size={18} /> : <>Pay {formatBDT(fee)} & Confirm</>}
          </button>
        </div>
      </Modal>

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-3 text-sm text-white shadow-card animate-fade-up">{toast}</div>}
    </div>
  );
}
