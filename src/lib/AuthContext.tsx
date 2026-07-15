import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, type Profile } from './supabase';

type Session = {
  user: { id: string; email: string | null; phone: string | null };
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUpEmail: (email: string, password: string, fullName: string, phone: string, role: Profile['role']) => Promise<{ error: string | null }>;
  signInEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (error) {
      // Profile might not exist yet — create a minimal one
      return;
    }
    if (data) {
      setProfile(data as Profile);
    } else {
      // Insert a default profile
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: uid, full_name: '', role: 'client' })
        .select('*')
        .maybeSingle();
      if (created) setProfile(created as Profile);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (!mounted) return;
      if (data.session) {
        setSession({
          user: {
            id: data.session.user.id,
            email: data.session.user.email ?? null,
            phone: data.session.user.phone ?? null,
          },
        });
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, sess: any) => {
      (async () => {
        if (sess) {
          setSession({
            user: {
              id: sess.user.id,
              email: sess.user.email ?? null,
              phone: sess.user.phone ?? null,
            },
          });
          await loadProfile(sess.user.id);
        } else {
          setSession(null);
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUpEmail = useCallback<AuthContextValue['signUpEmail']>(async (email, password, fullName, phone, role) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone, role } },
    });
    if (error) return { error: error.message };
    // The database trigger (handle_new_user) creates the profile automatically.
    // If the session is established, load the profile; otherwise it'll load on next auth event.
    if (data.user) {
      await loadProfile(data.user.id);
    }
    return { error: null };
  }, [loadProfile]);

  const signInEmail = useCallback<AuthContextValue['signInEmail']>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signInPhone = useCallback<AuthContextValue['signInPhone']>(async (phone) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const verifyOtp = useCallback<AuthContextValue['verifyOtp']>(async (phone, token) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signUpEmail, signInEmail, signInPhone, verifyOtp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
