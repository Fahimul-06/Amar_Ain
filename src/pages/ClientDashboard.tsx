import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  FolderKanban,
  FileText,
  MessageSquare,
  Star,
  ArrowRight,
  Plus,
  Upload,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { supabase, type Booking, type Payment, type LegalCase, type CaseDocument, type Message, type Review, type Lawyer, type Profile, type LawyerCategory } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { DashboardShell, StatCard, TabBar, type NavItem } from '../components/DashboardShell';
import { Avatar, Stars, Badge, Modal, EmptyState, Spinner, formatBDT, formatDateTime, formatDate, timeAgo } from '../components/ui';

type BookingRow = Booking & { lawyers?: Lawyer & { lawyer_categories?: LawyerCategory | null }; profiles?: Profile };
type CaseRow = LegalCase & { lawyers?: Lawyer & { lawyer_categories?: LawyerCategory | null } };
type MessageRow = Message;

const NAV: NavItem[] = [
  { label: 'Overview', key: 'overview', icon: <LayoutDashboard size={18} /> },
  { label: 'Bookings', key: 'bookings', icon: <Calendar size={18} /> },
  { label: 'Payments', key: 'payments', icon: <Wallet size={18} /> },
  { label: 'Cases', key: 'cases', icon: <FolderKanban size={18} /> },
  { label: 'Documents', key: 'documents', icon: <FileText size={18} /> },
  { label: 'Messages', key: 'messages', icon: <MessageSquare size={18} /> },
  { label: 'Reviews', key: 'reviews', icon: <Star size={18} /> },
];

export function ClientDashboard({ navigate, initialTab }: { navigate: (to: string) => void; initialTab?: string }) {
  const { session, profile, signOut } = useAuth();
  const [active, setActive] = useState(initialTab || 'overview');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [documents, setDocuments] = useState<(CaseDocument & { cases?: LegalCase })[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [reviews, setReviews] = useState<(Review & { lawyers?: Lawyer })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!session) return;
    const uid = session.user.id;
    const [{ data: bks }, { data: pays }, { data: cs }, { data: msgs }, { data: rvs }] = await Promise.all([
      supabase.from('bookings').select('*, lawyers(*, lawyer_categories(*))').eq('client_id', uid).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('client_id', uid).order('created_at', { ascending: false }),
      supabase.from('cases').select('*, lawyers(*, lawyer_categories(*))').eq('client_id', uid).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').or(`sender_id.eq.${uid},receiver_id.eq.${uid}`).order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, lawyers(*)').eq('client_id', uid).order('created_at', { ascending: false }),
    ]);
    setBookings((bks as BookingRow[]) || []);
    setPayments((pays as Payment[]) || []);
    setCases((cs as CaseRow[]) || []);
    setMessages((msgs as MessageRow[]) || []);
    setReviews((rvs as any) || []);

    // Load documents across all cases
    if (cs && cs.length > 0) {
      const caseIds = cs.map((c: any) => c.id);
      const { data: docs } = await supabase.from('case_documents').select('*').in('case_id', caseIds).order('created_at', { ascending: false });
      const docsWithCase = (docs || []).map((d: any) => ({
        ...d,
        cases: cs.find((c: any) => c.id === d.case_id),
      })) as (CaseDocument & { cases?: LegalCase })[];
      setDocuments(docsWithCase);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const totalSpent = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const openCases = cases.filter((c) => c.status !== 'closed');

  return (
    <DashboardShell
      title="Client"
      nav={NAV}
      active={active}
      onNavigate={setActive}
      onSignOut={() => { signOut(); navigate('/'); }}
      onHome={() => navigate('/')}
    >
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Spinner size={28} /></div>
      ) : (
        <>
          {active === 'overview' && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-900">Assalamu alaikum, {profile?.full_name || 'there'} 👋</h2>
                <p className="mt-1 text-ink-500">Here's a summary of your legal activity.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Calendar size={22} />} label="Upcoming" value={upcomingBookings.length} tone="blue" />
                <StatCard icon={<CheckCircle2 size={22} />} label="Completed" value={completedBookings.length} tone="green" />
                <StatCard icon={<FolderKanban size={22} />} label="Open Cases" value={openCases.length} tone="gold" />
                <StatCard icon={<Wallet size={22} />} label="Total Spent" value={formatBDT(totalSpent)} tone="neutral" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display font-bold text-ink-900">Upcoming consultations</h3>
                    <button onClick={() => setActive('bookings')} className="text-sm font-semibold text-ink-600 hover:text-ink-900">View all</button>
                  </div>
                  {upcomingBookings.length === 0 ? (
                    <EmptyState icon={<Calendar size={20} />} title="No upcoming bookings" description="Find a lawyer to book a consultation." action={<button onClick={() => navigate('/lawyers')} className="btn-gold">Find a lawyer</button>} />
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.slice(0, 3).map((b) => (
                        <div key={b.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                          <Avatar name={b.lawyers?.profiles?.full_name || 'L'} size={40} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-ink-900">{b.lawyers?.profiles?.full_name || 'Lawyer'}</div>
                            <div className="text-xs text-ink-500">{b.lawyers?.lawyer_categories?.name} · {formatDateTime(b.scheduled_at)}</div>
                          </div>
                          <Badge tone="blue">{b.type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display font-bold text-ink-900">Open cases</h3>
                    <button onClick={() => setActive('cases')} className="text-sm font-semibold text-ink-600 hover:text-ink-900">View all</button>
                  </div>
                  {openCases.length === 0 ? (
                    <EmptyState icon={<FolderKanban size={20} />} title="No open cases" />
                  ) : (
                    <div className="space-y-3">
                      {openCases.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 text-gold-600"><FolderKanban size={18} /></div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-ink-900">{c.title}</div>
                            <div className="text-xs text-ink-500">{c.lawyers?.lawyer_categories?.name} · {formatDate(c.created_at)}</div>
                          </div>
                          <Badge tone={c.status === 'in_progress' ? 'green' : 'neutral'}>{c.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="mb-3 font-display font-bold text-ink-900">Need legal help?</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => navigate('/lawyers')} className="btn-primary">Find a lawyer <ArrowRight size={16} /></button>
                  <button onClick={() => navigate('/')} className="btn-outline">Ask AI assistant</button>
                </div>
              </div>
            </div>
          )}

          {active === 'bookings' && <BookingsTab bookings={bookings} navigate={navigate} onRefresh={loadAll} />}
          {active === 'payments' && <PaymentsTab payments={payments} />}
          {active === 'cases' && <CasesTab cases={cases} session={session} onRefresh={loadAll} />}
          {active === 'documents' && <DocumentsTab documents={documents} cases={cases} session={session} onRefresh={loadAll} />}
          {active === 'messages' && <MessagesTab messages={messages} bookings={bookings} session={session} onRefresh={loadAll} />}
          {active === 'reviews' && <ReviewsTab bookings={completedBookings} reviews={reviews} session={session} onRefresh={loadAll} />}
        </>
      )}
    </DashboardShell>
  );
}

function BookingsTab({ bookings, navigate, onRefresh }: { bookings: BookingRow[]; navigate: (to: string) => void; onRefresh: () => void }) {
  const [filter, setFilter] = useState('all');
  const [disputeOpen, setDisputeOpen] = useState<BookingRow | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { session } = useAuth();

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const cancelBooking = async (id: string) => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    onRefresh();
  };

  const raiseDispute = async () => {
    if (!disputeOpen || !session) return;
    setSubmitting(true);
    await supabase.from('disputes').insert({
      booking_id: disputeOpen.id,
      raised_by: session.user.id,
      reason: disputeReason,
      description: disputeDesc,
    });
    await supabase.from('bookings').update({ status: 'disputed' }).eq('id', disputeOpen.id);
    setDisputeOpen(null);
    setDisputeReason('');
    setDisputeDesc('');
    setSubmitting(false);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <TabBar
        tabs={[
          { key: 'all', label: 'All' },
          { key: 'confirmed', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'disputed', label: 'Disputed' },
        ]}
        active={filter}
        onChange={setFilter}
      />
      {filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={22} />} title="No bookings found" description="Book a consultation with a verified lawyer to get started." action={<button onClick={() => navigate('/lawyers')} className="btn-gold">Find a lawyer</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Avatar name={b.lawyers?.profiles?.full_name || 'L'} url={b.lawyers?.profiles?.avatar_url} size={48} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-ink-900">{b.lawyers?.profiles?.full_name || 'Lawyer'}</h3>
                  <Badge tone={
                    b.status === 'completed' ? 'green' :
                    b.status === 'confirmed' ? 'blue' :
                    b.status === 'cancelled' ? 'red' :
                    b.status === 'disputed' ? 'gold' : 'neutral'
                  }>{b.status}</Badge>
                </div>
                <p className="text-sm text-ink-500">{b.lawyers?.lawyer_categories?.name} · {b.type.replace('_', ' ')} · {formatDateTime(b.scheduled_at)}</p>
                {b.topic && <p className="mt-1 text-sm text-ink-600">Topic: {b.topic}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-display text-lg font-bold text-ink-900">{formatBDT(Number(b.fee))}</div>
                <div className="flex gap-2">
                  {b.status === 'confirmed' && (
                    <button onClick={() => cancelBooking(b.id)} className="btn-outline px-3 py-1.5 text-xs">Cancel</button>
                  )}
                  {b.status === 'completed' && (
                    <>
                      <button onClick={() => navigate(`/lawyers/${b.lawyers?.id}`)} className="btn-outline px-3 py-1.5 text-xs">Review</button>
                      <button onClick={() => setDisputeOpen(b)} className="btn-ghost px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><AlertTriangle size={13} /> Dispute</button>
                    </>
                  )}
                  {b.status === 'disputed' && <Badge tone="gold">Dispute open</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!disputeOpen} onClose={() => setDisputeOpen(null)} title="Raise a dispute" size="md">
        <div className="space-y-4">
          <div className="rounded-lg bg-gold-50 px-3 py-2.5 text-sm text-gold-700">
            Disputes are reviewed by our admin team. Please provide clear details.
          </div>
          <div>
            <label className="label">Reason</label>
            <input value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="e.g. Lawyer did not attend" className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={disputeDesc} onChange={(e) => setDisputeDesc(e.target.value)} rows={4} className="input resize-none" placeholder="Describe what happened..." />
          </div>
          <button onClick={raiseDispute} disabled={submitting || !disputeReason} className="btn-primary w-full">
            {submitting ? <Spinner size={18} /> : 'Submit dispute'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function PaymentsTab({ payments }: { payments: Payment[] }) {
  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Wallet size={22} />} label="Total Paid" value={formatBDT(totalPaid)} tone="green" />
        <StatCard icon={<CheckCircle2 size={22} />} label="Successful" value={payments.filter((p) => p.status === 'paid').length} tone="blue" />
        <StatCard icon={<Clock size={22} />} label="Pending" value={payments.filter((p) => p.status === 'pending').length} tone="gold" />
      </div>
      {payments.length === 0 ? (
        <EmptyState icon={<Wallet size={22} />} title="No payments yet" description="Your payment history will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Method</th>
                <th className="px-5 py-3 font-semibold">Txn ID</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 text-ink-700">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3 capitalize text-ink-700">{p.method}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-500">{p.transaction_id?.slice(0, 14) || '—'}</td>
                  <td className="px-5 py-3 font-bold text-ink-900">{formatBDT(Number(p.amount))}</td>
                  <td className="px-5 py-3">
                    <Badge tone={p.status === 'paid' ? 'green' : p.status === 'pending' ? 'gold' : 'red'}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CasesTab({ cases, session, onRefresh }: { cases: CaseRow[]; session: any; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [lawyerId, setLawyerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const createCase = async () => {
    if (!session || !lawyerId) return;
    setSubmitting(true);
    await supabase.from('cases').insert({
      client_id: session.user.id,
      lawyer_id: lawyerId,
      title,
      description: desc,
      status: 'open',
    });
    setOpen(false);
    setTitle('');
    setDesc('');
    setLawyerId('');
    setSubmitting(false);
    onRefresh();
  };

  const lawyerOptions = cases.map((c) => c.lawyers).filter((v, i, a) => v && a.findIndex((x) => x?.id === v?.id) === i);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{cases.length} case{cases.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> New case</button>
      </div>
      {cases.length === 0 ? (
        <EmptyState icon={<FolderKanban size={22} />} title="No cases yet" description="Create a case to track your legal matters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-ink-900">{c.title}</h3>
                  <p className="text-xs text-ink-500">{c.lawyers?.lawyer_categories?.name} · {formatDate(c.created_at)}</p>
                </div>
                <Badge tone={c.status === 'in_progress' ? 'green' : c.status === 'closed' ? 'neutral' : c.status === 'on_hold' ? 'gold' : 'blue'}>{c.status.replace('_', ' ')}</Badge>
              </div>
              {c.description && <p className="mt-2 text-sm text-ink-600">{c.description}</p>}
              {c.case_number && <p className="mt-2 text-xs text-ink-500">Case #: {c.case_number}</p>}
              <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
                <Avatar name={c.lawyers?.profiles?.full_name || 'L'} size={24} />
                <span className="text-xs text-ink-600">{c.lawyers?.profiles?.full_name || 'Lawyer'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create a new case">
        <div className="space-y-4">
          <div>
            <label className="label">Case title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Property dispute for Dhanmondi plot" className="input" />
          </div>
          <div>
            <label className="label">Lawyer</label>
            <select value={lawyerId} onChange={(e) => setLawyerId(e.target.value)} className="input">
              <option value="">Select a lawyer</option>
              {lawyerOptions.map((l) => (
                <option key={l!.id} value={l!.id}>{l!.profiles?.full_name}</option>
              ))}
            </select>
            {lawyerOptions.length === 0 && <p className="mt-1 text-xs text-ink-400">Book a consultation first to add a lawyer.</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="input resize-none" placeholder="Describe your case..." />
          </div>
          <button onClick={createCase} disabled={submitting || !title || !lawyerId} className="btn-primary w-full">
            {submitting ? <Spinner size={18} /> : 'Create case'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function DocumentsTab({ documents, cases, session, onRefresh }: { documents: (CaseDocument & { cases?: LegalCase })[]; cases: CaseRow[]; session: any; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const upload = async () => {
    if (!session || !caseId) return;
    setSubmitting(true);
    await supabase.from('case_documents').insert({
      case_id: caseId,
      uploaded_by: session.user.id,
      file_name: fileName,
      file_url: fileUrl,
      description: desc,
    });
    setOpen(false);
    setCaseId('');
    setFileName('');
    setFileUrl('');
    setDesc('');
    setSubmitting(false);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setOpen(true)} className="btn-primary"><Upload size={16} /> Upload document</button>
      </div>
      {documents.length === 0 ? (
        <EmptyState icon={<FileText size={22} />} title="No documents uploaded" description="Upload case-related documents to share with your lawyer." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((d) => (
            <div key={d.id} className="card flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100 text-ink-600"><FileText size={20} /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink-900">{d.file_name}</div>
                <div className="text-xs text-ink-500">{d.cases?.title} · {formatDate(d.created_at)}</div>
                {d.description && <p className="mt-1 text-xs text-ink-500">{d.description}</p>}
              </div>
              {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">View</a>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Upload a document">
        <div className="space-y-4">
          <div>
            <label className="label">Case</label>
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className="input">
              <option value="">Select a case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">File name</label>
            <input value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g. Nikahnama.pdf" className="input" />
          </div>
          <div>
            <label className="label">File URL (demo)</label>
            <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." className="input" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="input resize-none" />
          </div>
          <button onClick={upload} disabled={submitting || !caseId || !fileName} className="btn-primary w-full">
            {submitting ? <Spinner size={18} /> : 'Upload document'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MessagesTab({ messages, bookings, session, onRefresh }: { messages: MessageRow[]; bookings: BookingRow[]; session: any; onRefresh: () => void }) {
  const [activeBooking, setActiveBooking] = useState<BookingRow | null>(bookings[0] || null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!activeBooking && bookings.length > 0) setActiveBooking(bookings[0]);
  }, [bookings, activeBooking]);

  const lawyerUserId = activeBooking?.lawyers?.user_id;
  const conversation = messages.filter(
    (m) => activeBooking && m.booking_id === activeBooking.id
  );

  const send = async () => {
    if (!text.trim() || !activeBooking || !lawyerUserId || !session) return;
    setSending(true);
    await supabase.from('messages').insert({
      booking_id: activeBooking.id,
      sender_id: session.user.id,
      receiver_id: lawyerUserId,
      body: text,
    });
    setText('');
    setSending(false);
    onRefresh();
  };

  return (
    <div className="animate-fade-up">
      <div className="grid h-[70vh] gap-0 overflow-hidden rounded-2xl border border-ink-100 bg-white md:grid-cols-[260px_1fr]">
        {/* Conversations list */}
        <div className="border-r border-ink-100">
          <div className="border-b border-ink-100 px-4 py-3">
            <h3 className="font-display font-bold text-ink-900">Conversations</h3>
          </div>
          <div className="overflow-y-auto">
            {bookings.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-500">No conversations yet.</p>
            ) : (
              bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBooking(b)}
                  className={`flex w-full items-center gap-3 border-b border-ink-100 px-4 py-3 text-left transition hover:bg-ink-50 ${activeBooking?.id === b.id ? 'bg-gold-50' : ''}`}
                >
                  <Avatar name={b.lawyers?.profiles?.full_name || 'L'} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink-900">{b.lawyers?.profiles?.full_name || 'Lawyer'}</div>
                    <div className="text-xs text-ink-500">{b.lawyers?.lawyer_categories?.name}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col">
          {activeBooking ? (
            <>
              <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
                <Avatar name={activeBooking.lawyers?.profiles?.full_name || 'L'} size={36} />
                <div>
                  <div className="text-sm font-semibold text-ink-900">{activeBooking.lawyers?.profiles?.full_name || 'Lawyer'}</div>
                  <div className="text-xs text-ink-500">{activeBooking.lawyers?.lawyer_categories?.name}</div>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50/50 p-4">
                {conversation.length === 0 ? (
                  <p className="text-center text-sm text-ink-400 mt-8">No messages yet. Say hello!</p>
                ) : (
                  conversation.map((m) => {
                    const mine = m.sender_id === session?.user.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'bg-ink-900 text-white' : 'bg-white border border-ink-100 text-ink-800'}`}>
                          {m.body}
                          <div className={`mt-0.5 text-[10px] ${mine ? 'text-white/60' : 'text-ink-400'}`}>{timeAgo(m.created_at)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-ink-100 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message..."
                  className="input flex-1"
                />
                <button onClick={send} disabled={sending || !text.trim()} className="btn-primary">
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyState icon={<MessageSquare size={22} />} title="No conversations" description="Book a consultation to start chatting with a lawyer." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewsTab({ bookings, reviews, session, onRefresh }: { bookings: BookingRow[]; reviews: (Review & { lawyers?: Lawyer })[]; session: any; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reviewedBookingIds = new Set(reviews.map((r) => r.booking_id));
  const unreviewed = bookings.filter((b) => !reviewedBookingIds.has(b.id));

  const submitReview = async () => {
    if (!booking || !session) return;
    setSubmitting(true);
    await supabase.from('reviews').insert({
      booking_id: booking.id,
      client_id: session.user.id,
      lawyer_id: booking.lawyer_id,
      rating,
      comment,
      is_published: true,
    });
    setOpen(false);
    setBooking(null);
    setRating(5);
    setComment('');
    setSubmitting(false);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        {unreviewed.length > 0 && (
          <button onClick={() => { setBooking(unreviewed[0]); setOpen(true); }} className="btn-primary"><Star size={16} /> Review a consultation</button>
        )}
      </div>
      {reviews.length === 0 ? (
        <EmptyState icon={<Star size={22} />} title="No reviews yet" description="Rate your lawyers after completed consultations." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={r.lawyers?.profiles?.full_name || 'L'} size={40} />
                  <div>
                    <div className="font-semibold text-ink-900">{r.lawyers?.profiles?.full_name || 'Lawyer'}</div>
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className="text-xs text-ink-400">{formatDate(r.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {r.comment && <p className="mt-3 text-sm text-ink-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Rate your consultation">
        {booking && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
              <Avatar name={booking.lawyers?.profiles?.full_name || 'L'} size={36} />
              <div>
                <div className="text-sm font-semibold text-ink-900">{booking.lawyers?.profiles?.full_name || 'Lawyer'}</div>
                <div className="text-xs text-ink-500">{booking.lawyers?.lawyer_categories?.name} · {formatDate(booking.scheduled_at)}</div>
              </div>
            </div>
            <div>
              <label className="label">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setRating(i)} className="p-1">
                    <svg width={32} height={32} viewBox="0 0 24 24" fill={i <= rating ? '#d4a73b' : '#e9edf3'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Comment (optional)</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="input resize-none" placeholder="Share your experience..." />
            </div>
            <button onClick={submitReview} disabled={submitting} className="btn-primary w-full">
              {submitting ? <Spinner size={18} /> : 'Submit review'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
