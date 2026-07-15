import { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Scale, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function AdminLoginPage({ navigate }: { navigate: (to: string) => void }) {
  const { session, profile, loading: authLoading, signInAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session && profile?.role === 'admin') navigate('/dashboard/admin');
  }, [authLoading, session, profile, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your administrator email and password.');
      return;
    }
    setSubmitting(true);
    const result = await signInAdmin(email.trim(), password, remember);
    setSubmitting(false);
    if (result.error) setError(result.error);
    else navigate('/dashboard/admin');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(212,175,55,.35),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(16,185,129,.18),transparent_32%)]" />
      <div className="absolute right-4 top-4 z-20"><LanguageSwitcher /></div>
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden flex-col justify-between border-r border-white/10 p-12 text-white lg:flex">
          <button onClick={() => navigate('/')} className="flex w-fit items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-gold text-ink-950"><Scale size={25} strokeWidth={2.5} /></span>
            <span><strong className="block font-display text-xl">Amar Ain</strong><span className="text-xs text-white/55">Administration Console</span></span>
          </button>
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1.5 text-xs font-semibold text-gold-300"><ShieldCheck size={14} /> Restricted administrative access</div>
            <h1 className="font-display text-5xl font-extrabold leading-tight">Operate the legal platform with confidence.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60">Review lawyer applications, manage users and content, oversee bookings and payments, resolve disputes, and monitor platform activity from one secured workspace.</p>
          </div>
          <p className="text-xs text-white/35">All administrator sign-ins and privileged actions are auditable.</p>
        </section>

        <section className="flex items-center justify-center px-5 py-16 sm:px-10">
          <div className="w-full max-w-md">
            <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-3 text-white lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl gradient-gold text-ink-950"><Scale size={22} /></span>
              <span className="font-display text-lg font-bold">Amar Ain Admin</span>
            </button>
            <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-gold-400"><LockKeyhole size={23} /></div>
                <h2 className="font-display text-2xl font-extrabold text-ink-950">Administrator login</h2>
                <p className="mt-1.5 text-sm text-ink-500">Use an authorized admin account to continue.</p>
              </div>

              {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="label" htmlFor="admin-email">Admin email</label>
                  <div className="relative"><Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="input pl-11" /></div>
                </div>
                <div>
                  <label className="label" htmlFor="admin-password">Password</label>
                  <div className="relative"><LockKeyhole size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="input px-11" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-ink-300 accent-ink-900" />Keep me signed in on this device</label>
                <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">{submitting ? 'Verifying access…' : 'Sign in to dashboard'} <ArrowRight size={18} /></button>
              </form>
              <div className="mt-6 border-t border-ink-100 pt-5 text-center text-xs leading-5 text-ink-400">Unauthorized access is prohibited. Contact the super administrator if your account is locked or disabled.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
