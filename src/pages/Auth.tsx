import { useState } from 'react';
import { Scale, Mail, Phone, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function AuthPage({ mode, navigate }: { mode: 'login' | 'register'; navigate: (to: string) => void }) {
  const { signInEmail, signUpEmail, signInPhone, verifyOtp } = useAuth();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'client' | 'lawyer'>('client');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submitEmail = async () => {
    setError(null);
    setLoading(true);
    if (isRegister) {
      const { error } = await signUpEmail(email, password, fullName, phone, role);
      if (error) setError(error);
      else navigate(`/dashboard/${role}`);
    } else {
      const { error } = await signInEmail(email, password);
      if (error) setError(error);
      else navigate('/dashboard/client');
    }
    setLoading(false);
  };

  const sendOtp = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInPhone(phone);
    if (error) setError(error);
    else setOtpSent(true);
    setLoading(false);
  };

  const verifyCode = async () => {
    setError(null);
    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    if (error) setError(error);
    else navigate('/dashboard/client');
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-gold shadow-soft">
              <Scale size={22} strokeWidth={2.5} className="text-ink-950" />
            </div>
          </button>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isRegister ? 'Join Amar Ain to access verified legal help.' : 'Log in to manage your legal matters.'}
          </p>
        </div>

        <div className="card p-6">
          {/* Method tabs */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
            <button
              onClick={() => setMethod('email')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                method === 'email' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600'
              }`}
            >
              <Mail size={15} /> Email
            </button>
            <button
              onClick={() => setMethod('phone')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                method === 'phone' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600'
              }`}
            >
              <Phone size={15} /> Phone OTP
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          {method === 'email' ? (
            <div className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="label">Full name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone (optional)</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="label">I am a</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setRole('client')}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                          role === 'client' ? 'border-gold-500 bg-gold-50 text-ink-900' : 'border-ink-200 bg-white text-ink-600'
                        }`}
                      >
                        Client
                      </button>
                      <button
                        onClick={() => setRole('lawyer')}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                          role === 'lawyer' ? 'border-gold-500 bg-gold-50 text-ink-900' : 'border-ink-200 bg-white text-ink-600'
                        }`}
                      >
                        Lawyer
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-10" />
                </div>
              </div>
              <button onClick={submitEmail} disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'} <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="label">Phone number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="input pl-10" />
                    </div>
                  </div>
                  <button onClick={sendOtp} disabled={loading} className="btn-primary w-full py-3">
                    {loading ? 'Sending...' : 'Send OTP'} <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    OTP sent to {phone}. Enter the code below.
                  </div>
                  <div>
                    <label className="label">OTP Code</label>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="input text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <button onClick={verifyCode} disabled={loading} className="btn-primary w-full py-3">
                    {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={18} />
                  </button>
                  <button onClick={() => setOtpSent(false)} className="btn-ghost w-full">
                    Change phone number
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-5 text-center text-sm text-ink-500">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="font-semibold text-ink-900 hover:underline">
                  Log in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => navigate('/register')} className="font-semibold text-ink-900 hover:underline">
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-400">
          <ShieldCheck size={14} /> Your data is protected with bank-grade encryption.
        </div>
      </div>
    </div>
  );
}
