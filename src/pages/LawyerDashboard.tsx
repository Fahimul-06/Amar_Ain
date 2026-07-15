import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  User,
  Calendar,
  FolderKanban,
  Wallet,
  Clock,
  FileText,
  BadgeCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Upload,
  Banknote,
  Star,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { supabase, type Lawyer, type LawyerCategory, type LawyerService, type Booking, type Payment, type LegalCase, type Withdrawal, type Profile } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { DashboardShell, StatCard, TabBar, type NavItem } from '../components/DashboardShell';
import { Avatar, Badge, Modal, EmptyState, Spinner, formatBDT, formatDateTime, formatDate } from '../components/ui';

type BookingRow = Booking & { profiles?: Profile };
type CaseRow = LegalCase & { profiles?: Profile };

const NAV: NavItem[] = [
  { label: 'Overview', key: 'overview', icon: <LayoutDashboard size={18} /> },
  { label: 'Profile', key: 'profile', icon: <User size={18} /> },
  { label: 'Verification', key: 'verification', icon: <BadgeCheck size={18} /> },
  { label: 'Services', key: 'services', icon: <FileText size={18} /> },
  { label: 'Availability', key: 'availability', icon: <Clock size={18} /> },
  { label: 'Bookings', key: 'bookings', icon: <Calendar size={18} /> },
  { label: 'Cases', key: 'cases', icon: <FolderKanban size={18} /> },
  { label: 'Earnings', key: 'earnings', icon: <Wallet size={18} /> },
  { label: 'Withdrawals', key: 'withdrawals', icon: <Banknote size={18} /> },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SERVICE_TYPES = [
  { type: 'text', label: 'Text Chat' },
  { type: 'phone', label: 'Phone Call' },
  { type: 'audio', label: 'Audio Call' },
  { type: 'video', label: 'Video Call' },
  { type: 'in_person', label: 'In-Person' },
  { type: 'document_drafting', label: 'Document Drafting' },
] as const;

export function LawyerDashboard({ navigate, initialTab }: { navigate: (to: string) => void; initialTab?: string }) {
  const { session, profile, signOut } = useAuth();
  const [active, setActive] = useState(initialTab || 'overview');
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [categories, setCategories] = useState<LawyerCategory[]>([]);
  const [services, setServices] = useState<LawyerService[]>([]);
  const [availability, setAvailability] = useState<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!session) return;
    const { data: l } = await supabase.from('lawyers').select('*').eq('user_id', session.user.id).maybeSingle();
    setLawyer(l as Lawyer | null);
    if (!l) {
      setLoading(false);
      return;
    }
    const [{ data: cats }, { data: svcs }, { data: avail }, { data: bks }, { data: pays }, { data: cs }, { data: wdrls }] = await Promise.all([
      supabase.from('lawyer_categories').select('*').order('name'),
      supabase.from('lawyer_services').select('*').eq('lawyer_id', l.id).order('created_at', { ascending: false }),
      supabase.from('lawyer_availability').select('*').eq('lawyer_id', l.id).order('day_of_week'),
      supabase.from('bookings').select('*, profiles!client_id(*)').eq('lawyer_id', l.id).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('lawyer_id', l.id).order('created_at', { ascending: false }),
      supabase.from('cases').select('*, profiles!client_id(*)').eq('lawyer_id', l.id).order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('*').eq('lawyer_id', l.id).order('created_at', { ascending: false }),
    ]);
    setCategories((cats as LawyerCategory[]) || []);
    setServices((svcs as LawyerService[]) || []);
    setAvailability((avail as any) || []);
    setBookings((bks as BookingRow[]) || []);
    setPayments((pays as Payment[]) || []);
    setCases((cs as CaseRow[]) || []);
    setWithdrawals((wdrls as Withdrawal[]) || []);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!session) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size={28} /></div>;

  const totalEarnings = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.lawyer_payout), 0);
  const pendingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  return (
    <DashboardShell
      title="Lawyer"
      nav={NAV}
      active={active}
      onNavigate={setActive}
      onSignOut={() => { signOut(); navigate('/'); }}
      onHome={() => navigate('/')}
    >
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Spinner size={28} /></div>
      ) : !lawyer ? (
        active === 'profile' ? (
          <CreateProfileTab categories={categories} onCreated={loadAll} />
        ) : (
          <EmptyState
            icon={<User size={22} />}
            title="No lawyer profile yet"
            description="Create your lawyer profile to start receiving bookings."
            action={<button onClick={() => setActive('profile')} className="btn-gold">Create profile</button>}
          />
        )
      ) : (
        <>
          {active === 'overview' && (
            <div className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-900">Welcome, {profile?.full_name?.split(' ')[0] || 'Advocate'} ⚖️</h2>
                  <p className="mt-1 text-ink-500">Status: <Badge tone={lawyer.status === 'verified' ? 'green' : lawyer.status === 'pending' ? 'gold' : 'red'}>{lawyer.status}</Badge></p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Calendar size={22} />} label="Pending" value={pendingBookings.length} tone="blue" />
                <StatCard icon={<CheckCircle2 size={22} />} label="Completed" value={completedBookings.length} tone="green" />
                <StatCard icon={<Wallet size={22} />} label="Total Earnings" value={formatBDT(totalEarnings)} tone="gold" />
                <StatCard icon={<Star size={22} />} label="Rating" value={`${lawyer.rating.toFixed(1)} (${lawyer.rating_count})`} tone="neutral" />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card p-5">
                  <h3 className="mb-4 font-display font-bold text-ink-900">Pending bookings</h3>
                  {pendingBookings.length === 0 ? (
                    <EmptyState icon={<Calendar size={20} />} title="No pending bookings" />
                  ) : (
                    <div className="space-y-3">
                      {pendingBookings.slice(0, 4).map((b) => (
                        <div key={b.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                          <Avatar name={b.profiles?.full_name || 'C'} size={36} />
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-ink-900">{b.profiles?.full_name || 'Client'}</div>
                            <div className="text-xs text-ink-500">{b.type.replace('_', ' ')} · {formatDateTime(b.scheduled_at)}</div>
                          </div>
                          <Badge tone="blue">{formatBDT(Number(b.fee))}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="card p-5">
                  <h3 className="mb-4 font-display font-bold text-ink-900">Earnings overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                      <span className="text-sm text-ink-600">Available balance</span>
                      <span className="font-display text-lg font-bold text-ink-900">{formatBDT(Number(lawyer.available_balance))}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3">
                      <span className="text-sm text-ink-600">Total earnings</span>
                      <span className="font-display text-lg font-bold text-ink-900">{formatBDT(Number(lawyer.total_earnings))}</span>
                    </div>
                    <button onClick={() => setActive('withdrawals')} className="btn-gold w-full"><Banknote size={16} /> Request withdrawal</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 'profile' && <ProfileTab lawyer={lawyer} categories={categories} onRefresh={loadAll} />}
          {active === 'verification' && <VerificationTab lawyer={lawyer} onRefresh={loadAll} />}
          {active === 'services' && <ServicesTab lawyer={lawyer} services={services} onRefresh={loadAll} />}
          {active === 'availability' && <AvailabilityTab lawyer={lawyer} availability={availability} onRefresh={loadAll} />}
          {active === 'bookings' && <LawyerBookingsTab bookings={bookings} onRefresh={loadAll} />}
          {active === 'cases' && <LawyerCasesTab cases={cases} onRefresh={loadAll} />}
          {active === 'earnings' && <EarningsTab payments={payments} lawyer={lawyer} />}
          {active === 'withdrawals' && <WithdrawalsTab lawyer={lawyer} withdrawals={withdrawals} onRefresh={loadAll} />}
        </>
      )}
    </DashboardShell>
  );
}

function CreateProfileTab({ categories, onCreated }: { categories: LawyerCategory[]; onCreated: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [categoryId, setCategoryId] = useState('');
  const [barId, setBarId] = useState('');
  const [experience, setExperience] = useState(0);
  const [fee, setFee] = useState(500);
  const [languages, setLanguages] = useState<string[]>(['Bangla']);
  const [office, setOffice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLang = (l: string) => setLanguages((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));

  const create = async () => {
    setSaving(true);
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required.');
      setSaving(false);
      return;
    }
    if (!barId.trim()) {
      setError('Bar Council ID is required.');
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, location, bio })
      .eq('id', profile?.id);
    if (profileError) { setError(profileError.message); setSaving(false); return; }

    const { error: lawyerError } = await supabase.from('lawyers').insert({
      category_id: categoryId || null,
      bar_id: barId,
      experience_years: experience,
      consultation_fee: fee,
      languages,
      office_address: office,
      status: 'pending',
    });
    if (lawyerError) { setError(lawyerError.message); setSaving(false); return; }

    await refreshProfile();
    setSaving(false);
    onCreated();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="card p-6">
        <h3 className="mb-1 font-display text-lg font-bold text-ink-900">Create your lawyer profile</h3>
        <p className="mb-4 text-sm text-ink-500">Fill in your details to set up your lawyer profile. You can edit these later.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name *</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" /></div>
          <div><label className="label">Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" /></div>
          <div><label className="label">Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dhaka" className="input" /></div>
          <div><label className="label">Office address</label><input value={office} onChange={(e) => setOffice(e.target.value)} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input resize-none" /></div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="mb-4 font-display font-bold text-ink-900">Professional details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Practice area</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Bar Council ID *</label><input value={barId} onChange={(e) => setBarId(e.target.value)} className="input" /></div>
          <div><label className="label">Experience (years)</label><input type="number" value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="input" /></div>
          <div><label className="label">Consultation fee (BDT)</label><input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} className="input" /></div>
          <div className="sm:col-span-2">
            <label className="label">Languages</label>
            <div className="flex flex-wrap gap-2">
              {['Bangla', 'English', 'Hindi', 'Arabic'].map((l) => (
                <button key={l} onClick={() => toggleLang(l)} className={`chip ${languages.includes(l) ? 'chip-active' : ''}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={create} disabled={saving} className="btn-primary">
          {saving ? <Spinner size={18} /> : 'Create profile'}
        </button>
      </div>
    </div>
  );
}

function ProfileTab({ lawyer, categories, onRefresh }: { lawyer: Lawyer; categories: LawyerCategory[]; onRefresh: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [categoryId, setCategoryId] = useState(lawyer.category_id || '');
  const [barId, setBarId] = useState(lawyer.bar_id || '');
  const [experience, setExperience] = useState(lawyer.experience_years);
  const [fee, setFee] = useState(Number(lawyer.consultation_fee));
  const [languages, setLanguages] = useState<string[]>(lawyer.languages || []);
  const [office, setOffice] = useState(lawyer.office_address || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLang = (l: string) => setLanguages((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));

  const save = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone, location, bio }).eq('id', profile?.id);
    await supabase.from('lawyers').update({
      category_id: categoryId || null,
      bar_id: barId,
      experience_years: experience,
      consultation_fee: fee,
      languages,
      office_address: office,
    }).eq('id', lawyer.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="card p-6">
        <h3 className="mb-4 font-display font-bold text-ink-900">Basic information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" /></div>
          <div><label className="label">Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" /></div>
          <div><label className="label">Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dhaka" className="input" /></div>
          <div><label className="label">Office address</label><input value={office} onChange={(e) => setOffice(e.target.value)} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input resize-none" /></div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="mb-4 font-display font-bold text-ink-900">Professional details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Practice area</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Bar Council ID</label><input value={barId} onChange={(e) => setBarId(e.target.value)} className="input" /></div>
          <div><label className="label">Experience (years)</label><input type="number" value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="input" /></div>
          <div><label className="label">Consultation fee (BDT)</label><input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} className="input" /></div>
          <div className="sm:col-span-2">
            <label className="label">Languages</label>
            <div className="flex flex-wrap gap-2">
              {['Bangla', 'English', 'Hindi', 'Arabic'].map((l) => (
                <button key={l} onClick={() => toggleLang(l)} className={`chip ${languages.includes(l) ? 'chip-active' : ''}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="btn-primary">{saving ? <Spinner size={18} /> : 'Save changes'}</button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 size={16} /> Saved</span>}
      </div>
    </div>
  );
}

function VerificationTab({ lawyer, onRefresh }: { lawyer: Lawyer; onRefresh: () => void }) {
  const [docUrl, setDocUrl] = useState(lawyer.verification_doc_url || '');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    await supabase.from('lawyers').update({ verification_doc_url: docUrl }).eq('id', lawyer.id);
    setSubmitting(false);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${lawyer.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : lawyer.status === 'pending' ? 'bg-gold-50 text-gold-600' : 'bg-red-50 text-red-600'}`}>
            <BadgeCheck size={24} />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink-900">Verification status: <span className="capitalize">{lawyer.status}</span></h3>
            <p className="text-sm text-ink-500">{lawyer.status === 'verified' ? 'Your account is verified. You appear in search results.' : lawyer.status === 'pending' ? 'Your verification is under review.' : 'Please submit your documents for verification.'}</p>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="mb-4 font-display font-bold text-ink-900">Verification document</h3>
        <p className="mb-3 text-sm text-ink-500">Upload a link to your Bar Council registration certificate or practicing license.</p>
        <div className="space-y-3">
          <div><label className="label">Document URL</label><input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://..." className="input" /></div>
          <button onClick={submit} disabled={submitting || !docUrl} className="btn-primary"><Upload size={16} /> {submitting ? 'Submitting...' : 'Submit for verification'}</button>
        </div>
      </div>
    </div>
  );
}

function ServicesTab({ lawyer, services, onRefresh }: { lawyer: Lawyer; services: LawyerService[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<LawyerService['type']>('text');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [fee, setFee] = useState(Number(lawyer.consultation_fee));
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const add = async () => {
    setSubmitting(true);
    await supabase.from('lawyer_services').insert({
      lawyer_id: lawyer.id,
      type,
      title: title || SERVICE_TYPES.find((s) => s.type === type)?.label || '',
      description: desc,
      fee,
      duration_minutes: duration,
      is_active: true,
    });
    setOpen(false);
    setTitle(''); setDesc('');
    setSubmitting(false);
    onRefresh();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from('lawyer_services').update({ is_active: !active }).eq('id', id);
    onRefresh();
  };

  const remove = async (id: string) => {
    await supabase.from('lawyer_services').delete().eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{services.length} service{services.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Add service</button>
      </div>
      {services.length === 0 ? (
        <EmptyState icon={<FileText size={22} />} title="No services yet" description="Add consultation services with fees and durations." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-ink-900">{s.title}</h3>
                    <Badge tone={s.is_active ? 'green' : 'neutral'}>{s.is_active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-xs capitalize text-ink-500">{s.type.replace('_', ' ')} · {s.duration_minutes} min</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-ink-900">{formatBDT(Number(s.fee))}</div>
                </div>
              </div>
              {s.description && <p className="mt-2 text-sm text-ink-600">{s.description}</p>}
              <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
                <button onClick={() => toggle(s.id, s.is_active)} className="btn-ghost px-3 py-1.5 text-xs">{s.is_active ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => remove(s.id)} className="btn-ghost px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a service">
        <div className="space-y-4">
          <div>
            <label className="label">Service type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="input">
              {SERVICE_TYPES.map((s) => <option key={s.type} value={s.type}>{s.label}</option>)}
            </select>
          </div>
          <div><label className="label">Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 30-min video consultation" className="input" /></div>
          <div><label className="label">Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="input resize-none" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Fee (BDT)</label><input type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} className="input" /></div>
            <div><label className="label">Duration (min)</label><input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input" /></div>
          </div>
          <button onClick={add} disabled={submitting} className="btn-primary w-full">{submitting ? <Spinner size={18} /> : 'Add service'}</button>
        </div>
      </Modal>
    </div>
  );
}

function AvailabilityTab({ lawyer, availability, onRefresh }: { lawyer: Lawyer; availability: any[]; onRefresh: () => void }) {
  const [slots, setSlots] = useState<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }[]>(
    DAYS.map((_, i) => {
      const existing = availability.find((a) => a.day_of_week === i);
      return { day_of_week: i, start_time: existing?.start_time || '09:00', end_time: existing?.end_time || '17:00', is_available: existing?.is_available ?? false };
    })
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from('lawyer_availability').delete().eq('lawyer_id', lawyer.id);
    const active = slots.filter((s) => s.is_available);
    if (active.length > 0) {
      await supabase.from('lawyer_availability').insert(active.map((s) => ({ lawyer_id: lawyer.id, ...s })));
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="card p-6">
        <h3 className="mb-4 font-display font-bold text-ink-900">Weekly availability</h3>
        <div className="space-y-2">
          {DAYS.map((d, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
              <label className="flex flex-1 items-center gap-3">
                <input type="checkbox" checked={slots[i].is_available} onChange={(e) => setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, is_available: e.target.checked } : s))} className="h-4 w-4 accent-gold-500" />
                <span className="font-medium text-ink-900">{d}</span>
              </label>
              {slots[i].is_available && (
                <div className="flex items-center gap-2">
                  <input type="time" value={slots[i].start_time} onChange={(e) => setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, start_time: e.target.value } : s))} className="input w-28 py-1.5" />
                  <span className="text-ink-400">to</span>
                  <input type="time" value={slots[i].end_time} onChange={(e) => setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, end_time: e.target.value } : s))} className="input w-28 py-1.5" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? <Spinner size={18} /> : 'Save availability'}</button>
          {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 size={16} /> Saved</span>}
        </div>
      </div>
    </div>
  );
}

function LawyerBookingsTab({ bookings, onRefresh }: { bookings: BookingRow[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const updateStatus = async (id: string, status: Booking['status']) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <TabBar tabs={[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'confirmed', label: 'Confirmed' }, { key: 'completed', label: 'Completed' }, { key: 'cancelled', label: 'Cancelled' }]} active={filter} onChange={setFilter} />
      {filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={22} />} title="No bookings" />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Avatar name={b.profiles?.full_name || 'C'} url={b.profiles?.avatar_url} size={48} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-ink-900">{b.profiles?.full_name || 'Client'}</h3>
                  <Badge tone={b.status === 'completed' ? 'green' : b.status === 'confirmed' ? 'blue' : b.status === 'cancelled' ? 'red' : 'neutral'}>{b.status}</Badge>
                </div>
                <p className="text-sm text-ink-500">{b.type.replace('_', ' ')} · {formatDateTime(b.scheduled_at)}</p>
                {b.topic && <p className="mt-1 text-sm text-ink-600">Topic: {b.topic}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-display text-lg font-bold text-ink-900">{formatBDT(Number(b.fee))}</div>
                <div className="flex gap-2">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(b.id, 'confirmed')} className="btn-gold px-3 py-1.5 text-xs">Accept</button>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} className="btn-ghost px-3 py-1.5 text-xs text-red-600">Decline</button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'completed')} className="btn-primary px-3 py-1.5 text-xs">Mark completed</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LawyerCasesTab({ cases, onRefresh }: { cases: CaseRow[]; onRefresh: () => void }) {
  const updateStatus = async (id: string, status: LegalCase['status']) => {
    await supabase.from('cases').update({ status }).eq('id', id);
    onRefresh();
  };
  return (
    <div className="space-y-5 animate-fade-up">
      {cases.length === 0 ? (
        <EmptyState icon={<FolderKanban size={22} />} title="No cases assigned" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-ink-900">{c.title}</h3>
                  <p className="text-xs text-ink-500">Client: {c.profiles?.full_name} · {formatDate(c.created_at)}</p>
                </div>
                <Badge tone={c.status === 'in_progress' ? 'green' : c.status === 'closed' ? 'neutral' : c.status === 'on_hold' ? 'gold' : 'blue'}>{c.status.replace('_', ' ')}</Badge>
              </div>
              {c.description && <p className="mt-2 text-sm text-ink-600">{c.description}</p>}
              <select value={c.status} onChange={(e) => updateStatus(c.id, e.target.value as any)} className="input mt-3 py-1.5 text-xs">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EarningsTab({ payments, lawyer }: { payments: Payment[]; lawyer: Lawyer }) {
  const paid = payments.filter((p) => p.status === 'paid');
  const total = paid.reduce((s, p) => s + Number(p.lawyer_payout), 0);
  const commission = paid.reduce((s, p) => s + Number(p.platform_commission), 0);
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Wallet size={22} />} label="Net earnings" value={formatBDT(total)} tone="green" />
        <StatCard icon={<TrendingUp size={22} />} label="Platform commission" value={formatBDT(commission)} tone="gold" />
        <StatCard icon={<Banknote size={22} />} label="Available" value={formatBDT(Number(lawyer.available_balance))} tone="blue" />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Method</th>
              <th className="px-5 py-3 font-semibold">Gross</th>
              <th className="px-5 py-3 font-semibold">Commission</th>
              <th className="px-5 py-3 font-semibold">Your payout</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {paid.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-500">No earnings yet.</td></tr>
            ) : (
              paid.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 text-ink-700">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3 capitalize text-ink-700">{p.method}</td>
                  <td className="px-5 py-3 text-ink-700">{formatBDT(Number(p.amount))}</td>
                  <td className="px-5 py-3 text-red-600">-{formatBDT(Number(p.platform_commission))}</td>
                  <td className="px-5 py-3 font-bold text-ink-900">{formatBDT(Number(p.lawyer_payout))}</td>
                  <td className="px-5 py-3"><Badge tone="green">{p.status}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WithdrawalsTab({ lawyer, withdrawals, onRefresh }: { lawyer: Lawyer; withdrawals: Withdrawal[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<Withdrawal['method']>('bkash');
  const [account, setAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const request = async () => {
    setSubmitting(true);
    await supabase.from('withdrawals').insert({
      lawyer_id: lawyer.id,
      amount,
      method,
      account,
      status: 'pending',
    });
    setOpen(false);
    setAmount(0); setAccount('');
    setSubmitting(false);
    onRefresh();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <StatCard icon={<Banknote size={22} />} label="Available balance" value={formatBDT(Number(lawyer.available_balance))} tone="green" />
        <button onClick={() => setOpen(true)} className="btn-gold"><Plus size={16} /> Request withdrawal</button>
      </div>
      {withdrawals.length === 0 ? (
        <EmptyState icon={<Banknote size={22} />} title="No withdrawal requests" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Method</th>
                <th className="px-5 py-3 font-semibold">Account</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 text-ink-700">{formatDate(w.created_at)}</td>
                  <td className="px-5 py-3 font-bold text-ink-900">{formatBDT(Number(w.amount))}</td>
                  <td className="px-5 py-3 capitalize text-ink-700">{w.method}</td>
                  <td className="px-5 py-3 text-ink-700">{w.account || '—'}</td>
                  <td className="px-5 py-3"><Badge tone={w.status === 'paid' ? 'green' : w.status === 'pending' ? 'gold' : w.status === 'rejected' ? 'red' : 'blue'}>{w.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Request withdrawal">
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 p-3 text-sm text-ink-600">Available: <span className="font-bold text-ink-900">{formatBDT(Number(lawyer.available_balance))}</span></div>
          <div><label className="label">Amount (BDT)</label><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="input" /></div>
          <div><label className="label">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="input">
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          <div><label className="label">Account number</label><input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="01XXXXXXXXX" className="input" /></div>
          <button onClick={request} disabled={submitting || amount <= 0} className="btn-primary w-full">{submitting ? <Spinner size={18} /> : 'Submit request'}</button>
        </div>
      </Modal>
    </div>
  );
}
