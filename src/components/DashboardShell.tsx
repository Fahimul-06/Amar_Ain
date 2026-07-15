import { type ReactNode, useState } from 'react';
import { Scale, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Avatar } from './ui';

export type NavItem = { label: string; icon: ReactNode; key: string };

export function DashboardShell({
  title,
  subtitle,
  nav,
  active,
  onNavigate,
  onSignOut,
  onHome,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  active: string;
  onNavigate: (key: string) => void;
  onSignOut: () => void;
  onHome: () => void;
  children: ReactNode;
}) {
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <button onClick={onHome} className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-gold">
          <Scale size={20} strokeWidth={2.5} className="text-ink-950" />
        </div>
        <div className="text-left">
          <div className="font-display text-base font-extrabold text-ink-900">Amar Ain</div>
          <div className="-mt-0.5 text-[11px] text-ink-500">{title}</div>
        </div>
      </button>
      <div className="flex items-center gap-3 border-y border-ink-100 px-5 py-3">
        <Avatar name={profile?.full_name || 'User'} url={profile?.avatar_url} size={36} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink-900">{profile?.full_name || 'User'}</div>
          <div className="text-xs capitalize text-ink-500">{profile?.role}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              onNavigate(item.key);
              setMobileOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active === item.key ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-100'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-ink-100 p-3">
        <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-100 bg-white lg:block">{Sidebar}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-card animate-fade-in">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-ink-900">{nav.find((n) => n.key === active)?.label || title}</h1>
              {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({ icon, label, value, tone = 'neutral' }: { icon: ReactNode; label: string; value: string | number; tone?: 'neutral' | 'green' | 'gold' | 'blue' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-ink-100 text-ink-700',
    green: 'bg-emerald-50 text-emerald-600',
    gold: 'bg-gold-50 text-gold-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</div>
        <div className="font-display text-2xl font-bold text-ink-900">{value}</div>
      </div>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-ink-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
            active === t.key ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600 hover:text-ink-900'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
