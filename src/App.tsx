import { AuthProvider, useAuth } from './lib/AuthContext';
import { useHashRoute, matchPath } from './lib/useHashRoute';
import { Navbar, Footer } from './components/Navbar';
import { Landing } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { AdminLoginPage } from './pages/AdminLogin';
import { LawyersPage } from './pages/Lawyers';
import { LawyerDetailPage } from './pages/LawyerDetail';
import { ClientDashboard } from './pages/ClientDashboard';
import { LawyerDashboard } from './pages/LawyerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LegalInfoPage, HowItWorksPage, ForLawyersPage } from './pages/InfoPages';
import { HelpCenterPage, SafetyPage, DisputesPage, ContactPage } from './pages/Support';
import { PrivacyPolicyPage, TermsOfServicePage, BarCouncilCompliancePage } from './pages/Legal';
import { Spinner } from './components/ui';
import { LanguageProvider } from './lib/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';

function Router() {
  const { route, navigate } = useHashRoute();
  const { loading, session, profile } = useAuth();
  const path = route.path;

  // Auth pages (no nav/footer)
  if (path === '/login') return <><div className="fixed right-4 top-4 z-50"><LanguageSwitcher /></div><AuthPage mode="login" navigate={navigate} /></>;
  if (path === '/admin/login') return <AdminLoginPage navigate={navigate} />;
  if (path === '/register') return <><div className="fixed right-4 top-4 z-50"><LanguageSwitcher /></div><AuthPage mode="register" navigate={navigate} /></>;

  // Dashboard routes (no footer, custom nav)
  const dashMatch = matchPath('/dashboard/:role', path);
  if (dashMatch) {
    if (loading) return <div className="flex min-h-screen items-center justify-center"><Spinner size={32} /></div>;
    if (!session || !profile) {
      queueMicrotask(() => navigate(dashMatch.role === 'admin' ? '/admin/login' : '/login'));
      return <div className="flex min-h-screen items-center justify-center"><Spinner size={32} /></div>;
    }
    const role = profile.role;
    if (dashMatch.role !== role) {
      queueMicrotask(() => navigate(`/dashboard/${role}`));
      return <div className="flex min-h-screen items-center justify-center"><Spinner size={32} /></div>;
    }
    if (role === 'lawyer') return <LawyerDashboard navigate={navigate} initialTab={route.query.get('tab') || undefined} />;
    if (role === 'admin') return <AdminDashboard navigate={navigate} initialTab={route.query.get('tab') || undefined} />;
    return <ClientDashboard navigate={navigate} initialTab={route.query.get('tab') || undefined} />;
  }

  // Public pages with nav + footer
  const lawyerDetailMatch = matchPath('/lawyers/:id', path);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar navigate={navigate} currentPath={path} />
      <div className="flex-1">
        {path === '/' || path === '' ? <Landing navigate={navigate} /> :
         path === '/lawyers' ? <LawyersPage navigate={navigate} initialCategory={route.query.get('category') || undefined} /> :
         lawyerDetailMatch ? <LawyerDetailPage lawyerId={lawyerDetailMatch.id} navigate={navigate} /> :
         path === '/legal-info' ? <LegalInfoPage navigate={navigate} /> :
         path === '/how-it-works' ? <HowItWorksPage navigate={navigate} /> :
         path === '/for-lawyers' ? <ForLawyersPage navigate={navigate} /> :
         path === '/help' ? <HelpCenterPage navigate={navigate} /> :
         path === '/safety' ? <SafetyPage navigate={navigate} /> :
         path === '/disputes' ? <DisputesPage navigate={navigate} /> :
         path === '/contact' ? <ContactPage navigate={navigate} /> :
         path === '/privacy' ? <PrivacyPolicyPage navigate={navigate} /> :
         path === '/terms' ? <TermsOfServicePage navigate={navigate} /> :
         path === '/compliance' ? <BarCouncilCompliancePage navigate={navigate} /> :
         <div className="mx-auto max-w-3xl px-4 py-20 text-center">
           <h1 className="font-display text-3xl font-bold text-ink-900">Page not found</h1>
           <p className="mt-2 text-ink-500">The page you're looking for doesn't exist.</p>
           <button onClick={() => navigate('/')} className="btn-primary mt-6">Go home</button>
         </div>}
      </div>
      <Footer navigate={navigate} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
