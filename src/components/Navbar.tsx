import { useState } from 'react';
import { Scale, Menu, X, User, LogOut, LayoutDashboard, LifeBuoy, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Avatar } from './ui';

export function Navbar({ navigate }: { navigate: (to: string) => void; currentPath: string }) {
  const { session, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [supportMenu, setSupportMenu] = useState(false);

  const links = [
    { label: 'Find Lawyers', path: '/lawyers' },
    { label: 'Legal Info', path: '/legal-info' },
    { label: 'How it Works', path: '/how-it-works' },
    { label: 'For Lawyers', path: '/for-lawyers' },
  ];

  const supportLinks = [
    { label: 'Help Center', path: '/help', desc: 'FAQs and guides' },
    { label: 'Safety', path: '/safety', desc: 'Platform safety guidelines' },
    { label: 'Disputes', path: '/disputes', desc: 'Raise and resolve disputes' },
    { label: 'Contact', path: '/contact', desc: 'Get in touch with us' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-gold text-ink-950 shadow-soft">
            <Scale size={20} strokeWidth={2.5} />
          </div>
          <div className="text-left leading-tight">
            <div className="font-display text-lg font-extrabold tracking-tight text-ink-900">Amar Ain</div>
            <div className="-mt-0.5 text-[11px] font-medium text-ink-500">আমার আইন</div>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
            >
              {l.label}
            </button>
          ))}
          <div className="relative">
            <button
              onClick={() => setSupportMenu(!supportMenu)}
              onMouseEnter={() => setSupportMenu(true)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
            >
              <LifeBuoy size={15} /> Support
              <ChevronDown size={14} className={`transition-transform ${supportMenu ? 'rotate-180' : ''}`} />
            </button>
            {supportMenu && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-ink-100 bg-white p-1.5 shadow-card animate-fade-up"
                onMouseEnter={() => setSupportMenu(true)}
                onMouseLeave={() => setSupportMenu(false)}
              >
                {supportLinks.map((s) => (
                  <button
                    key={s.path}
                    onClick={() => { navigate(s.path); setSupportMenu(false); }}
                    className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition hover:bg-ink-50"
                  >
                    <span className="text-sm font-semibold text-ink-900">{s.label}</span>
                    <span className="text-xs text-ink-500">{s.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!session ? (
            <>
              <button onClick={() => navigate('/login')} className="btn-ghost">
                Log in
              </button>
              <button onClick={() => navigate('/register')} className="btn-gold">
                Sign up
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-2.5 py-1.5 text-sm font-medium text-ink-800 hover:border-ink-300"
              >
                <Avatar name={profile?.full_name || 'User'} url={profile?.avatar_url} size={28} />
                <span className="max-w-[120px] truncate">{profile?.full_name || 'Account'}</span>
              </button>
              {userMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-ink-100 bg-white p-1.5 shadow-card animate-fade-up"
                  onMouseLeave={() => setUserMenu(false)}
                >
                  <div className="border-b border-ink-100 px-3 py-2">
                    <div className="text-sm font-semibold text-ink-900">{profile?.full_name}</div>
                    <div className="text-xs capitalize text-ink-500">{profile?.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenu(false);
                      navigate(`/dashboard/${profile?.role || 'client'}`);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setUserMenu(false);
                      signOut();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden animate-fade-up">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.path}
                onClick={() => {
                  navigate(l.path);
                  setMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {l.label}
              </button>
            ))}
            <div className="my-2 h-px bg-ink-100" />
            <div className="px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-400">Support</div>
            {supportLinks.map((s) => (
              <button
                key={s.path}
                onClick={() => {
                  navigate(s.path);
                  setMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {s.label}
              </button>
            ))}
            <div className="my-2 h-px bg-ink-100" />
            {!session ? (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMenuOpen(false);
                  }}
                  className="btn-outline w-full"
                >
                  <User size={16} /> Log in
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    setMenuOpen(false);
                  }}
                  className="btn-gold w-full"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate(`/dashboard/${profile?.role || 'client'}`);
                    setMenuOpen(false);
                  }}
                  className="btn-outline w-full"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                  onClick={() => {
                    signOut();
                    navigate('/');
                    setMenuOpen(false);
                  }}
                  className="btn-danger w-full"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer({ navigate }: { navigate: (to: string) => void }) {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-gold">
                <Scale size={20} strokeWidth={2.5} className="text-ink-950" />
              </div>
              <div>
                <div className="font-display text-lg font-extrabold text-ink-900">Amar Ain</div>
                <div className="-mt-0.5 text-[11px] font-medium text-ink-500">আমার আইন</div>
              </div>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              Bangladesh's modern legal platform — connecting citizens with verified lawyers across the country.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-500">Platform</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li><button onClick={() => navigate('/lawyers')} className="hover:text-ink-900">Find Lawyers</button></li>
              <li><button onClick={() => navigate('/legal-info')} className="hover:text-ink-900">Legal Info</button></li>
              <li><button onClick={() => navigate('/for-lawyers')} className="hover:text-ink-900">For Lawyers</button></li>
              <li><button onClick={() => navigate('/how-it-works')} className="hover:text-ink-900">How it Works</button></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-500">Support</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li><button onClick={() => navigate('/help')} className="hover:text-ink-900">Help Center</button></li>
              <li><button onClick={() => navigate('/safety')} className="hover:text-ink-900">Safety</button></li>
              <li><button onClick={() => navigate('/disputes')} className="hover:text-ink-900">Disputes</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-ink-900">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-500">Legal</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li><button onClick={() => navigate('/privacy')} className="hover:text-ink-900">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-ink-900">Terms of Service</button></li>
              <li><button onClick={() => navigate('/compliance')} className="hover:text-ink-900">Bar Council Compliance</button></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-500 sm:flex-row">
          <p>© 2026 Amar Ain. All rights reserved.</p>
          <p>Made for Bangladesh 🇧🇩</p>
        </div>
      </div>
    </footer>
  );
}
