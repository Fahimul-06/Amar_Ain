import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  FileText,
  Calendar,
  Wallet,
  AlertTriangle,
  Star,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { supabase, type Profile, type Lawyer, type Booking, type Payment, type Dispute, type Review, type LegalContent, type Withdrawal, type LawyerCategory } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { DashboardShell, StatCard, TabBar, type NavItem } from '../components/DashboardShell';
import { Avatar, Badge, Modal, EmptyState, Spinner, formatBDT, formatDate, formatDateTime } from '../components/ui';

type LawyerRow = Lawyer & { profiles?: Profile; lawyer_categories?: LawyerCategory | null };
type DisputeRow = Dispute & { bookings?: Booking };

const NAV: NavItem[] = [
  { label: 'Overview', key: 'overview', icon: <LayoutDashboard size={18} /> },
  { label: 'Users', key: 'users', icon: <Users size={18} /> },
  { label: 'Lawyer Verification', key: 'verification', icon: <BadgeCheck size={18} /> },
  { label: 'Legal Content', key: 'content', icon: <FileText size={18} /> },
  { label: 'Bookings', key: 'bookings', icon: <Calendar size={18} /> },
  { label: 'Payments', key: 'payments', icon: <Wallet size={18} /> },
  { label: 'Disputes', key: 'disputes', icon: <AlertTriangle size={18} /> },
  { label: 'Reviews', key: 'reviews', icon: <Star size={18} /> },
  { label: 'Withdrawals', key: 'withdrawals', icon: <Wallet size={18} /> },
  { label: 'Reports', key: 'reports', icon: <BarChart3 size={18} /> },
];

export function AdminDashboard({ navigate, initialTab }: { navigate: (to: string) => void; initialTab?: string }) {
  const { session, signOut } = useAuth();
  const [active, setActive] = useState(initialTab || 'overview');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [lawyers, setLawyers] = useState<LawyerRow[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [reviews, setReviews] = useState<(Review & { lawyers?: Lawyer; profiles?: Profile })[]>([]);
  const [content, setContent] = useState<LegalContent[]>([]);
  const [withdrawals, setWithdrawals] = useState<(Withdrawal & { lawyers?: Lawyer })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [{ data: prs }, { data: lws }, { data: bks }, { data: pays }, { data: dsps }, { data: rvs }, { data: cnt }, { data: wdrls }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('lawyers').select('*, profiles!inner(*), lawyer_categories(*)').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('disputes').select('*, bookings(*)').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, lawyers(*), profiles!client_id(*)').order('created_at', { ascending: false }),
      supabase.from('legal_content').select('*').order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('*, lawyers(*)').order('created_at', { ascending: false }),
    ]);
    setProfiles((prs as Profile[]) || []);
    setLawyers((lws as LawyerRow[]) || []);
    setBookings((bks as Booking[]) || []);
    setPayments((pays as Payment[]) || []);
    setDisputes((dsps as DisputeRow[]) || []);
    setReviews((rvs as any) || []);
    setContent((cnt as LegalContent[]) || []);
    setWithdrawals((wdrls as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (!session) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size={28} /></div>;

  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.platform_commission), 0);
  const pendingVerifications = lawyers.filter((l) => l.status === 'pending');
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'under_review');

  return (
    <DashboardShell
      title="Admin"
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
                <h2 className="font-display text-2xl font-bold text-ink-900">Admin Overview</h2>
                <p className="mt-1 text-ink-500">Platform health and key metrics.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Users size={22} />} label="Total Users" value={profiles.length} tone="blue" />
                <StatCard icon={<BadgeCheck size={22} />} label="Verified Lawyers" value={lawyers.filter((l) => l.status === 'verified').length} tone="green" />
                <StatCard icon={<Wallet size={22} />} label="Commission Revenue" value={formatBDT(totalRevenue)} tone="gold" />
                <StatCard icon={<AlertTriangle size={22} />} label="Open Disputes" value={openDisputes.length} tone="neutral" />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display font-bold text-ink-900">Pending verifications</h3>
                    <button onClick={() => setActive('verification')} className="text-sm font-semibold text-ink-600 hover:text-ink-900">Review</button>
                  </div>
                  {pendingVerifications.length === 0 ? (
                    <EmptyState icon={<CheckCircle2 size={20} />} title="All caught up" />
                  ) : (
                    <div className="space-y-3">
                      {pendingVerifications.slice(0, 4).map((l) => (
                        <div key={l.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                          <Avatar name={l.profiles?.full_name || 'L'} size={36} />
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-ink-900">{l.profiles?.full_name}</div>
                            <div className="text-xs text-ink-500">{l.bar_id || 'No Bar ID'}</div>
                          </div>
                          <Badge tone="gold">Pending</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display font-bold text-ink-900">Open disputes</h3>
                    <button onClick={() => setActive('disputes')} className="text-sm font-semibold text-ink-600 hover:text-ink-900">Review</button>
                  </div>
                  {openDisputes.length === 0 ? (
                    <EmptyState icon={<CheckCircle2 size={20} />} title="No open disputes" />
                  ) : (
                    <div className="space-y-3">
                      {openDisputes.slice(0, 4).map((d) => (
                        <div key={d.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50 text-gold-600"><AlertTriangle size={18} /></div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-ink-900">{d.reason}</div>
                            <div className="text-xs text-ink-500">{formatDate(d.created_at)}</div>
                          </div>
                          <Badge tone="gold">{d.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {active === 'users' && <UsersTab profiles={profiles} onRefresh={loadAll} />}
          {active === 'verification' && <VerificationTab lawyers={lawyers} onRefresh={loadAll} />}
          {active === 'content' && <ContentTab content={content} onRefresh={loadAll} />}
          {active === 'bookings' && <AdminBookingsTab bookings={bookings} />}
          {active === 'payments' && <AdminPaymentsTab payments={payments} />}
          {active === 'disputes' && <DisputesTab disputes={disputes} onRefresh={loadAll} />}
          {active === 'reviews' && <AdminReviewsTab reviews={reviews} onRefresh={loadAll} />}
          {active === 'withdrawals' && <AdminWithdrawalsTab withdrawals={withdrawals} onRefresh={loadAll} />}
          {active === 'reports' && <ReportsTab profiles={profiles} lawyers={lawyers} bookings={bookings} payments={payments} disputes={disputes} />}
        </>
      )}
    </DashboardShell>
  );
}

function UsersTab({ profiles, onRefresh }: { profiles: Profile[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = profiles.filter((p) => {
    if (filter !== 'all' && p.role !== filter) return false;
    if (search && !p.full_name?.toLowerCase().includes(search.toLowerCase()) && !p.phone?.includes(search)) return false;
    return true;
  });

  const updateRole = async (id: string, role: Profile['role']) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..." className="input flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input sm:w-40">
          <option value="all">All roles</option>
          <option value="client">Clients</option>
          <option value="lawyer">Lawyers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Location</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-500">No users found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.full_name || 'U'} url={p.avatar_url} size={32} />
                      <span className="font-medium text-ink-900">{p.full_name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{p.phone || '—'}</td>
                  <td className="px-5 py-3 text-ink-700">{p.location || '—'}</td>
                  <td className="px-5 py-3">
                    <select value={p.role} onChange={(e) => updateRole(p.id, e.target.value as any)} className="input py-1 text-xs">
                      <option value="client">Client</option>
                      <option value="lawyer">Lawyer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3"><Badge tone={p.is_active ? 'green' : 'red'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VerificationTab({ lawyers, onRefresh }: { lawyers: LawyerRow[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState('pending');
  const filtered = filter === 'all' ? lawyers : lawyers.filter((l) => l.status === filter);

  const updateStatus = async (id: string, status: Lawyer['status']) => {
    await supabase.from('lawyers').update({ status, bar_council_verified: status === 'verified' }).eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <TabBar tabs={[{ key: 'pending', label: 'Pending' }, { key: 'verified', label: 'Verified' }, { key: 'suspended', label: 'Suspended' }, { key: 'all', label: 'All' }]} active={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <EmptyState icon={<BadgeCheck size={22} />} title="No lawyers in this category" />
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <div key={l.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Avatar name={l.profiles?.full_name || 'L'} url={l.profiles?.avatar_url} size={48} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-ink-900">{l.profiles?.full_name}</h3>
                  <Badge tone={l.status === 'verified' ? 'green' : l.status === 'pending' ? 'gold' : 'red'}>{l.status}</Badge>
                </div>
                <p className="text-sm text-ink-500">{l.lawyer_categories?.name} · {l.experience_years} yrs · Bar ID: {l.bar_id || '—'}</p>
                {l.verification_doc_url && <a href={l.verification_doc_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"><Eye size={12} /> View document</a>}
              </div>
              <div className="flex gap-2">
                {l.status !== 'verified' && <button onClick={() => updateStatus(l.id, 'verified')} className="btn-gold px-3 py-1.5 text-xs"><CheckCircle2 size={14} /> Verify</button>}
                {l.status !== 'suspended' && <button onClick={() => updateStatus(l.id, 'suspended')} className="btn-ghost px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><XCircle size={14} /> Suspend</button>}
                {l.status === 'suspended' && <button onClick={() => updateStatus(l.id, 'verified')} className="btn-outline px-3 py-1.5 text-xs">Reactivate</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentTab({ content, onRefresh }: { content: LegalContent[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<LegalContent | null>(null);
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [submitting, setSubmitting] = useState(false);
  const { session } = useAuth();

  const openNew = () => { setEdit(null); setTitle(''); setTitleBn(''); setBody(''); setCategory(''); setStatus('published'); setOpen(true); };
  const openEdit = (c: LegalContent) => { setEdit(c); setTitle(c.title); setTitleBn(c.title_bn || ''); setBody(c.body); setCategory(c.category || ''); setStatus(c.status); setOpen(true); };

  const save = async () => {
    setSubmitting(true);
    if (edit) {
      await supabase.from('legal_content').update({ title, title_bn: titleBn, body, category, status }).eq('id', edit.id);
    } else {
      await supabase.from('legal_content').insert({ title, title_bn: titleBn, body, category, status, author_id: session?.user.id });
    }
    setOpen(false);
    setSubmitting(false);
    onRefresh();
  };

  const remove = async (id: string) => {
    await supabase.from('legal_content').delete().eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{content.length} article{content.length !== 1 ? 's' : ''}</p>
        <button onClick={openNew} className="btn-primary">New article</button>
      </div>
      {content.length === 0 ? (
        <EmptyState icon={<FileText size={22} />} title="No legal content yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {content.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-ink-900">{c.title}</h3>
                  {c.title_bn && <p className="text-sm text-ink-500">{c.title_bn}</p>}
                </div>
                <Badge tone={c.status === 'published' ? 'green' : c.status === 'draft' ? 'gold' : 'neutral'}>{c.status}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ink-600">{c.body}</p>
              <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
                <button onClick={() => openEdit(c)} className="btn-ghost px-3 py-1.5 text-xs">Edit</button>
                <button onClick={() => remove(c.id)} className="btn-ghost px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={edit ? 'Edit article' : 'New article'} size="lg">
        <div className="space-y-4">
          <div><label className="label">Title (English)</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="input" /></div>
          <div><label className="label">Title (Bangla)</label><input value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className="input" /></div>
          <div><label className="label">Category</label><input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Family Law" className="input" /></div>
          <div><label className="label">Body</label><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="input resize-none" /></div>
          <div><label className="label">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button onClick={save} disabled={submitting || !title || !body} className="btn-primary w-full">{submitting ? <Spinner size={18} /> : 'Save article'}</button>
        </div>
      </Modal>
    </div>
  );
}

function AdminBookingsTab({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Fee</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-500">No bookings.</td></tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 text-ink-700">{formatDateTime(b.scheduled_at)}</td>
                  <td className="px-5 py-3 capitalize text-ink-700">{b.type.replace('_', ' ')}</td>
                  <td className="px-5 py-3 font-bold text-ink-900">{formatBDT(Number(b.fee))}</td>
                  <td className="px-5 py-3"><Badge tone={b.status === 'completed' ? 'green' : b.status === 'confirmed' ? 'blue' : b.status === 'cancelled' ? 'red' : b.status === 'disputed' ? 'gold' : 'neutral'}>{b.status}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPaymentsTab({ payments }: { payments: Payment[] }) {
  const totalGmv = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalCommission = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.platform_commission), 0);
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Wallet size={22} />} label="Total GMV" value={formatBDT(totalGmv)} tone="green" />
        <StatCard icon={<TrendingUp size={22} />} label="Commission" value={formatBDT(totalCommission)} tone="gold" />
        <StatCard icon={<Calendar size={22} />} label="Transactions" value={payments.length} tone="blue" />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Method</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Commission</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-500">No payments.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 text-ink-700">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3 capitalize text-ink-700">{p.method}</td>
                  <td className="px-5 py-3 font-bold text-ink-900">{formatBDT(Number(p.amount))}</td>
                  <td className="px-5 py-3 text-emerald-600">{formatBDT(Number(p.platform_commission))}</td>
                  <td className="px-5 py-3"><Badge tone={p.status === 'paid' ? 'green' : p.status === 'pending' ? 'gold' : 'red'}>{p.status}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DisputesTab({ disputes, onRefresh }: { disputes: DisputeRow[]; onRefresh: () => void }) {
  const [open, setOpen] = useState<DisputeRow | null>(null);
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { session } = useAuth();

  const resolve = async (status: 'resolved' | 'rejected') => {
    if (!open) return;
    setSubmitting(true);
    await supabase.from('disputes').update({
      status,
      resolution,
      resolved_by: session?.user.id,
    }).eq('id', open.id);
    setOpen(null);
    setResolution('');
    setSubmitting(false);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {disputes.length === 0 ? (
        <EmptyState icon={<AlertTriangle size={22} />} title="No disputes" description="All clear — no disputes have been raised." />
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600"><AlertTriangle size={22} /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-ink-900">{d.reason}</h3>
                  <Badge tone={d.status === 'open' ? 'gold' : d.status === 'resolved' ? 'green' : d.status === 'rejected' ? 'red' : 'blue'}>{d.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-ink-500">{formatDate(d.created_at)}</p>
                {d.description && <p className="mt-1 text-sm text-ink-600">{d.description}</p>}
              </div>
              {(d.status === 'open' || d.status === 'under_review') && (
                <button onClick={() => setOpen(d)} className="btn-primary px-4 py-2 text-xs">Review</button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title="Resolve dispute" size="md">
        {open && (
          <div className="space-y-4">
            <div className="rounded-xl bg-ink-50 p-3">
              <div className="text-sm font-semibold text-ink-900">{open.reason}</div>
              {open.description && <p className="mt-1 text-sm text-ink-600">{open.description}</p>}
            </div>
            <div><label className="label">Resolution notes</label><textarea value={resolution} onChange={(e) => setResolution(e.target.value)} rows={4} className="input resize-none" placeholder="Describe the resolution..." /></div>
            <div className="flex gap-2">
              <button onClick={() => resolve('resolved')} disabled={submitting} className="btn-gold flex-1"><CheckCircle2 size={16} /> Mark resolved</button>
              <button onClick={() => resolve('rejected')} disabled={submitting} className="btn-outline flex-1 text-red-600"><XCircle size={16} /> Reject</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AdminReviewsTab({ reviews, onRefresh }: { reviews: (Review & { lawyers?: Lawyer; profiles?: Profile })[]; onRefresh: () => void }) {
  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('reviews').update({ is_published: !current }).eq('id', id);
    onRefresh();
  };
  const remove = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id);
    onRefresh();
  };
  return (
    <div className="space-y-5 animate-fade-up">
      {reviews.length === 0 ? (
        <EmptyState icon={<Star size={22} />} title="No reviews" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={r.profiles?.full_name || 'C'} url={r.profiles?.avatar_url} size={40} />
                  <div>
                    <div className="font-semibold text-ink-900">{r.profiles?.full_name || 'Client'}</div>
                    <div className="text-xs text-ink-500">on {r.lawyers?.profiles?.full_name || 'Lawyer'} · {formatDate(r.created_at)}</div>
                  </div>
                </div>
                <Badge tone={r.is_published ? 'green' : 'neutral'}>{r.is_published ? 'Published' : 'Hidden'}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={i <= r.rating ? '#d4a73b' : '#e9edf3'}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
              <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
                <button onClick={() => togglePublish(r.id, r.is_published)} className="btn-ghost px-3 py-1.5 text-xs">{r.is_published ? 'Hide' : 'Publish'}</button>
                <button onClick={() => remove(r.id)} className="btn-ghost px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminWithdrawalsTab({ withdrawals, onRefresh }: { withdrawals: (Withdrawal & { lawyers?: Lawyer })[]; onRefresh: () => void }) {
  const updateStatus = async (id: string, status: Withdrawal['status']) => {
    await supabase.from('withdrawals').update({ status, processed_at: new Date().toISOString() }).eq('id', id);
    onRefresh();
  };
  return (
    <div className="space-y-5 animate-fade-up">
      {withdrawals.length === 0 ? (
        <EmptyState icon={<Wallet size={22} />} title="No withdrawal requests" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Lawyer</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Method</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 text-ink-700">{formatDate(w.created_at)}</td>
                  <td className="px-5 py-3 text-ink-700">{w.lawyers?.profiles?.full_name || '—'}</td>
                  <td className="px-5 py-3 font-bold text-ink-900">{formatBDT(Number(w.amount))}</td>
                  <td className="px-5 py-3 capitalize text-ink-700">{w.method}</td>
                  <td className="px-5 py-3"><Badge tone={w.status === 'paid' ? 'green' : w.status === 'pending' ? 'gold' : w.status === 'rejected' ? 'red' : 'blue'}>{w.status}</Badge></td>
                  <td className="px-5 py-3">
                    {w.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(w.id, 'paid')} className="btn-gold px-2 py-1 text-xs">Approve</button>
                        <button onClick={() => updateStatus(w.id, 'rejected')} className="btn-ghost px-2 py-1 text-xs text-red-600">Reject</button>
                      </div>
                    )}
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

function ReportsTab({ profiles, lawyers, bookings, payments, disputes }: { profiles: Profile[]; lawyers: LawyerRow[]; bookings: Booking[]; payments: Payment[]; disputes: Dispute[] }) {
  const paid = payments.filter((p) => p.status === 'paid');
  const totalGmv = paid.reduce((s, p) => s + Number(p.amount), 0);
  const commission = paid.reduce((s, p) => s + Number(p.platform_commission), 0);
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const completionRate = bookings.length > 0 ? Math.round((completed / bookings.length) * 100) : 0;
  const clients = profiles.filter((p) => p.role === 'client').length;
  const lawyerCount = profiles.filter((p) => p.role === 'lawyer').length;
  const verifiedLawyers = lawyers.filter((l) => l.status === 'verified').length;
  const avgRating = lawyers.length > 0 ? (lawyers.reduce((s, l) => s + l.rating, 0) / lawyers.length).toFixed(2) : '0';

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users size={22} />} label="Clients" value={clients} tone="blue" />
        <StatCard icon={<BadgeCheck size={22} />} label="Verified Lawyers" value={`${verifiedLawyers}/${lawyerCount}`} tone="green" />
        <StatCard icon={<TrendingUp size={22} />} label="Avg. Rating" value={avgRating} tone="gold" />
        <StatCard icon={<Calendar size={22} />} label="Completion Rate" value={`${completionRate}%`} tone="neutral" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-display font-bold text-ink-900">Revenue</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3"><span className="text-sm text-ink-600">Gross merchandise value</span><span className="font-display text-lg font-bold text-ink-900">{formatBDT(totalGmv)}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3"><span className="text-sm text-ink-600">Platform commission</span><span className="font-display text-lg font-bold text-emerald-600">{formatBDT(commission)}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3"><span className="text-sm text-ink-600">Lawyer payouts</span><span className="font-display text-lg font-bold text-ink-900">{formatBDT(totalGmv - commission)}</span></div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 font-display font-bold text-ink-900">Operations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3"><span className="text-sm text-ink-600">Total bookings</span><span className="font-display text-lg font-bold text-ink-900">{bookings.length}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3"><span className="text-sm text-ink-600">Completed consultations</span><span className="font-display text-lg font-bold text-ink-900">{completed}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3"><span className="text-sm text-ink-600">Open disputes</span><span className="font-display text-lg font-bold text-gold-600">{disputes.filter((d) => d.status === 'open' || d.status === 'under_review').length}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
